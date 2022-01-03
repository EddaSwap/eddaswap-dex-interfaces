import { JSBI } from '@eddaswap/sdk';
import _ from 'lodash';
import { BIPS_BASE, ROUTER_VERSION } from 'constants/constants';
import { toWei, parseByDecimals } from 'lib/numberHelper';
import * as EDDA_SDK from '@eddaswap/sdk';
import { TradeType } from '@eddaswap/sdk';
import * as PANCAKE_SDK from '@pancakeswap/sdk';
import * as EDDA_POLYGON_SDK from '@eddaswap/sdk-polygon';
import * as QUICK_SDK from 'quickswap-sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { ROUTER_ADDRESSES, EDDA_ROUTERS } from 'constants/address';
import { ChainId } from '@sushiswap/sdk';
import { RPC } from 'constants/supportWallet';
import { JsonRpcProvider } from '@ethersproject/providers';
import { SDKs } from 'constants/tokens';
import { truncate, lessThanEqual } from 'lib/numberHelper';

const MAX_PRICE_IMPACT = 20;

//value: currencyAmount,
export function calculateSlippageAmount(value, slippage) {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(
      JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)),
      JSBI.BigInt(10000)
    ),
    JSBI.divide(
      JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)),
      JSBI.BigInt(10000)
    ),
  ];
}

//tradeType: input or output
export async function calculateAmount({
  chainId,
  tokenInput,
  tokenOutput,
  tradeType,
  amount,
  slippage = 0.5,
  version = ROUTER_VERSION.v1,
}) {
  try {
    let SDK;
    let routerAddress;
    if (chainId === ChainId.MATIC) {
      SDK = SDKs[version][ChainId.MATIC];
      routerAddress = EDDA_ROUTERS[version][ChainId.MATIC];
    } else {
      SDK = SDKs[version][ChainId.BSC];
      routerAddress = EDDA_ROUTERS[version][ChainId.BSC];
    }

    if (chainId === ChainId.MATIC) {
      const eddaPolygonPair = await getTradeAmount({
        chainId,
        tokenInput,
        tokenOutput,
        tradeType,
        amount,
        slippage,
        SDK: SDK,
      });
      if (
        eddaPolygonPair &&
        !eddaPolygonPair.noLiquidity &&
        lessThanEqual(eddaPolygonPair?.priceImpact, MAX_PRICE_IMPACT)
      ) {
        return {
          ...eddaPolygonPair,
          router_address: routerAddress,
        };
      }
      const quickPair = await getTradeAmount({
        chainId,
        tokenInput,
        tokenOutput,
        tradeType,
        amount,
        slippage,
        SDK: QUICK_SDK,
      });
      if (quickPair && !quickPair.noLiquidity) {
        return { ...quickPair, router_address: ROUTER_ADDRESSES.QUICK };
      }
      return { noLiquidity: true };
    } else {
      const eddaPair = await getTradeAmount({
        chainId,
        tokenInput,
        tokenOutput,
        tradeType,
        amount,
        slippage,
        SDK: SDK,
      });
      if (
        eddaPair &&
        !eddaPair.noLiquidity &&
        lessThanEqual(eddaPair?.priceImpact, MAX_PRICE_IMPACT)
      ) {
        return { ...eddaPair, router_address: routerAddress };
      }

      const pancakePair = await getTradeAmount({
        chainId,
        tokenInput,
        tokenOutput,
        tradeType,
        amount,
        slippage,
        SDK: PANCAKE_SDK,
      });
      if (pancakePair && !pancakePair.noLiquidity) {
        return { ...pancakePair, router_address: ROUTER_ADDRESSES.PANCAKE };
      }

      return { noLiquidity: true };
    }
  } catch (error) {
    console.error('Failed to calculate amount', error);
    return { noLiquidity: false };
  }
}

export async function getTradeAmount({
  chainId,
  tokenInput,
  tokenOutput,
  tradeType,
  amount,
  slippage = 0.5,
  SDK,
}) {
  const providerURI =
    chainId === ChainId.MATIC ? RPC[ChainId.MATIC] : RPC[ChainId.BSC];
  const provider = new JsonRpcProvider(providerURI);

  try {
    const {
      Fetcher,
      Percent,
      Route,
      TokenAmount,
      Trade,
      JSBI,
      Token,
      ETHER,
      WETH,
    } = SDK;

    const nativeWETH = WETH[chainId];

    //if neither are ETH, it's token-to-token (if they both exist)
    const slippageTolerance = new Percent(
      JSBI.BigInt(Math.floor(slippage)),
      BIPS_BASE
    );
    const inputIsBNB = tokenInput.symbol === ETHER.symbol;
    const outputIsBNB = tokenOutput.symbol === ETHER.symbol;
    const oneTokenIsBNB = inputIsBNB || outputIsBNB;

    //have to generate new token, because token proto will is related to each sdk
    const InputToken = inputIsBNB
      ? nativeWETH
      : new Token(
          // tokenInput.chainId,
          chainId,
          tokenInput.address,
          tokenInput.decimals,
          tokenInput.symbol,
          tokenInput.name
        );
    const OutputToken = outputIsBNB
      ? nativeWETH
      : new Token(
          // tokenOutput.chainId,
          chainId,
          tokenOutput.address,
          tokenOutput.decimals,
          tokenOutput.symbol,
          tokenOutput.name
        );
    let priceImpact;

    const isWrap = inputIsBNB && tokenOutput.symbol === nativeWETH.symbol;
    const isUnwrap = tokenInput.symbol === nativeWETH.symbol && outputIsBNB;
    if (isWrap || isUnwrap) {
      return tradeType == TradeType.EXACT_INPUT
        ? {
            amountOut: amount,
            amountOutMin: amount,
          }
        : {
            amountIn: amount,
            amountInMax: amount,
          };
    }

    //is others
    let route = {};
    let reserve0 = {};
    let reserve1 = {};
    let noLiquidity = false;
    if (!oneTokenIsBNB) {
      //single hop
      let pair = {};
      //double hop
      let pair12 = {};
      let pair23 = {};
      //find directly route
      await Fetcher.fetchPairData(InputToken, OutputToken, provider)
        .then((pair) => {
          route = new Route([pair], InputToken);

          reserve0 = pair.reserveOf(InputToken);
          reserve1 = pair.reserveOf(OutputToken);
        })
        .catch(async (error) => {
          console.log('can not fetch pair', error);
          //if directly route doesn't exist, find through nativeWETH
          try {
            pair12 = await Fetcher.fetchPairData(
              InputToken,
              nativeWETH,
              provider
            );
            pair23 = await Fetcher.fetchPairData(
              OutputToken,
              nativeWETH,
              provider
            );

            reserve0 =
              pair12.reserve0.token.symbol === InputToken.symbol
                ? pair12.reserve0
                : pair12.reserve1;

            reserve1 =
              pair12.reserve1.token.symbol === OutputToken.symbol
                ? pair12.reserve1
                : pair12.reserve0;
            route = new Route([pair12, pair23], InputToken);
          } catch (error) {
            //if double hop route doesn't exist, require create pool
            noLiquidity = true;
            return { noLiquidity: true };
          }
        });
    } else {
      await Fetcher.fetchPairData(InputToken, OutputToken, provider)
        .then((pair) => {
          route = new Route([pair], InputToken);
          reserve0 = pair.reserveOf(InputToken);
          reserve1 = pair.reserveOf(OutputToken);
        })
        .catch((error) => {
          console.log('can not fetch pair', error);
          noLiquidity = true;
          return { noLiquidity: true };
        });
    }

    if (tradeType === TradeType.EXACT_INPUT) {
      // const amountIn = toWei(amount.toString(), tokenInput.decimals); // ether -> wei

      const bufferDownAmount = truncate(amount * 0.98, tokenInput.decimals - 2);

      const amountIn = toWei(bufferDownAmount, tokenInput.decimals); // ether -> wei
      console.log(
        'amountIn',
        amountIn,
        route,
        new TokenAmount(InputToken, amountIn)
      );
      const trade = new Trade(
        route,
        new TokenAmount(InputToken, amountIn),
        TradeType.EXACT_INPUT
      );

      priceImpact = trade.priceImpact.toSignificant(6);
      // const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. he
      const amountOutMin = parseByDecimals(
        BigNumber.from(
          trade.minimumAmountOut(slippageTolerance).raw.toString()
        ),
        OutputToken.decimals
      );
      const amountOut = parseByDecimals(
        BigNumber.from(trade.outputAmount.raw.toString()),
        OutputToken.decimals
      );
      return {
        amountOut: amountOut,
        amountOutMin: amountOutMin,
        priceImpact,
        tokenAPoolBalance: reserve0,
        tokenBPoolBalance: reserve1,
        route,
        noLiquidity: false,
      };
    } else {
      const amountOut = toWei(amount, tokenOutput.decimals); // ether -> wei

      const trade = new Trade(route, new TokenAmount(OutputToken, amountOut));
      priceImpact = trade.priceImpact.toSignificant(6);
      // const amountInMax = trade.maximumAmountIn(slippageTolerance).raw;
      const amountInMax = parseByDecimals(
        BigNumber.from(trade.maximumAmountIn(slippageTolerance).raw.toString()),
        OutputToken.decimals
      );
      const amountIn = parseByDecimals(
        BigNumber.from(trade.inputAmount.raw.toString()),
        InputToken.decimals
      );
      return {
        amountIn: amountIn,
        amountInMax: amountInMax,
        priceImpact,
        tokenAPoolBalance: reserve0,
        tokenBPoolBalance: reserve1,
        route,
        noLiquidity: false,
      };
    }
  } catch (error) {
    console.log('get amount', error);
  }
}
