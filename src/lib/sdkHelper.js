import * as EDDA_BSC_SDK from '@eddaswap/sdk';
import { TradeType } from '@eddaswap/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import * as EDDA_POLYGON_SDK from '@eddaswap/sdk-polygon';
import { ChainId } from '@sushiswap/sdk';
import { ROUTER_VERSION } from 'constants/constants';
import { RPC } from 'constants/supportWallet';
import { SDKs } from 'constants/tokens';
import { dividedBy, fromWei, times, toWei } from 'lib/numberHelper';
import { generateLpTokenContract } from 'lib/sdk/contract';
import _ from 'lodash';

export async function calculateAmountLiquidity({
  chainId,
  tokenInput,
  tokenOutput,
  amount,
  tradeType,
  version = ROUTER_VERSION.v2,
}) {
  try {
    const providerURI =
      chainId === ChainId.MATIC ? RPC[ChainId.MATIC] : RPC[ChainId.BSC];
    const provider = new JsonRpcProvider(providerURI);
    let SDK;
    if (chainId === ChainId.MATIC) {
      SDK = SDKs[version][ChainId.MATIC];
    } else SDK = SDKs[version][ChainId.BSC];

    if (!SDK) return {};

    const { Fetcher, Token, ETHER, WETH } = SDK;

    const nativeETH = ETHER;
    const nativeWETH = WETH[chainId];

    const InputToken =
      tokenInput.symbol === nativeETH.symbol
        ? nativeWETH
        : new Token(
            tokenInput.chainId,
            tokenInput.address,
            tokenInput.decimals,
            tokenInput.symbol,
            tokenInput.name
          );

    const OutputToken =
      tokenOutput.symbol === nativeETH.symbol
        ? nativeWETH
        : new Token(
            tokenOutput.chainId,
            tokenOutput.address,
            tokenOutput.decimals,
            tokenOutput.symbol,
            tokenOutput.name
          );

    const pair = await Fetcher.fetchPairData(InputToken, OutputToken, provider);

    const reserve0 = pair.reserveOf(InputToken);
    const reserve1 = pair.reserveOf(OutputToken);
    const tokenAPoolBalance = fromWei(
      reserve0.raw.toString(),
      tokenInput.decimals
    );
    const tokenBPoolBalance = fromWei(
      reserve1.raw.toString(),
      tokenOutput.decimals
    );
    let returnData = {
      tokenAPoolBalance,
      tokenBPoolBalance,
    };
    if (tradeType == TradeType.EXACT_INPUT) {
      const amountOut = dividedBy(
        times(amount, tokenBPoolBalance),
        tokenAPoolBalance
      );
      return {
        amountOut,
        ...returnData,
      };
    } else if (tradeType == TradeType.EXACT_OUTPUT) {
      const amountIn = dividedBy(
        times(amount, tokenAPoolBalance),
        tokenBPoolBalance
      );
      return {
        amountIn,
        ...returnData,
      };
    }
  } catch (error) {
    console.log('error', error);
    return {};
  }
}

export async function generatePair({ chainId, tokenInput, tokenOutput }) {
  try {
    const providerURI =
      chainId === ChainId.MATIC ? RPC[ChainId.MATIC] : RPC[ChainId.BSC];
    const provider = new JsonRpcProvider(providerURI);

    const SDK = chainId === ChainId.MATIC ? EDDA_POLYGON_SDK : EDDA_BSC_SDK;
    const { Fetcher, Token, WETH } = SDK;

    const nativeWETH = WETH[chainId];

    const InputToken =
      tokenInput && tokenInput.address
        ? new Token(
            tokenInput.chainId,
            tokenInput.address,
            tokenInput.decimals,
            tokenInput.symbol
          )
        : nativeWETH;
    const OutputToken =
      tokenOutput && tokenOutput.address
        ? new Token(
            tokenOutput.chainId,
            tokenOutput.address,
            tokenOutput.decimals,
            tokenOutput.symbol
          )
        : nativeWETH;
    const pair = await Fetcher.fetchPairData(InputToken, OutputToken, provider);
    return pair;
  } catch (error) {}
}

export async function getLiquidityMinted(
  tokenA,
  tokenB,
  amountA,
  amountB,
  chainId
) {
  const SDK = chainId === ChainId.MATIC ? EDDA_POLYGON_SDK : EDDA_BSC_SDK;
  const { ETHER, WETH, TokenAmount, Token } = SDK;

  const nativeETH = ETHER;
  const nativeWETH = WETH[chainId];

  try {
    const pair = await generatePair({
      chainId,
      tokenInput: tokenA,
      tokenOutput: tokenB,
    });

    const lpTokenContract = await generateLpTokenContract(
      pair.liquidityToken.address
    );
    const totalSupply = await lpTokenContract.methods.totalSupply().call();
    const weiAmountA = toWei(amountA, tokenA?.decimals);
    const weiAmountB = toWei(amountB, tokenB?.decimals);
    const tokenAIsETH = _.isEqual(tokenA, nativeETH);
    const tokenBIsETH = _.isEqual(tokenB, nativeETH);

    const InputToken = tokenAIsETH
      ? nativeWETH
      : new Token(
          tokenA.chainId,
          tokenA.address,
          tokenA.decimals,
          tokenA.symbol
        );

    const OutputToken = tokenBIsETH
      ? nativeWETH
      : new Token(
          tokenB.chainId,
          tokenB.address,
          tokenB.decimals,
          tokenB.symbol
        );

    const liquidityMinted = pair.getLiquidityMinted(
      new TokenAmount(pair.liquidityToken, totalSupply.toString()),
      new TokenAmount(InputToken, weiAmountA),
      new TokenAmount(OutputToken, weiAmountB)
    );
    return {
      liquidityMinted,
      pair: pair,
    };
  } catch (error) {
    console.error('Failed to get liquidity minted', error);
  }
}
