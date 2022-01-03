import * as EDDA_BSC_SDK from '@eddaswap/sdk';
import { TokenAmount } from '@eddaswap/sdk';
import * as EDDA_POLYGON_SDK from '@eddaswap/sdk-polygon';
import { ChainId } from '@sushiswap/sdk';
import { EDDA_VESTING_BY_CHAIN } from 'constants/address';
import { ROUTER_VERSION } from 'constants/constants';
import { ETHER, SDKs, WETH } from 'constants/tokens';
import { dividedBy, fromWei, toWei } from 'lib/numberHelper';
import { generateToken, getAmountFromTokenAmount } from 'lib/sdk/token';
import _ from 'lodash';
import {
  generateLpTokenContract,
  getBalanceOf,
  singleCallResult,
} from './contract';

export const PairState = {
  LOADING: 'LOADING',
  NOT_EXISTS: 'NOT_EXISTS',
  EXISTS: 'EXISTS',
  INVALID: 'INVALID',
};

//tokens: [Token, Token];
export async function generatePair(
  tokens,
  chainId,
  version = ROUTER_VERSION.v1
) {
  let SDK;
  if (chainId === ChainId.MATIC) {
    SDK = SDKs[version][ChainId.MATIC];
  } else SDK = SDKs[version][ChainId.BSC];

  const { WETH, ETHER, Pair, TokenAmount, Token } = SDK;
  const nativeETH = ETHER;
  // console.l
  const nativeWETH = WETH[chainId];

  const tokenInput = tokens[0];
  const tokenOutput = tokens[1];
  try {
    const tokenA =
      tokenInput?.symbol === nativeETH?.symbol
        ? nativeWETH
        : new Token(
            chainId,
            tokenInput.address,
            tokenInput.decimals,
            tokenInput.symbol,
            tokenInput.name
          );
    const tokenB =
      tokenOutput?.symbol === nativeETH?.symbol
        ? nativeWETH
        : new Token(
            chainId,
            tokenOutput.address,
            tokenOutput.decimals,
            tokenOutput.symbol,
            tokenOutput.name
          );
    const pairAddress = Pair.getAddress(tokenA, tokenB);
    const contract = generateLpTokenContract(pairAddress);

    const reserves = await singleCallResult(contract, 'getReserves');
    const reserve0 = reserves[0];
    const reserve1 = reserves[1];
    const [token0, token1] = tokenA.sortsBefore(tokenB)
      ? [tokenA, tokenB]
      : [tokenB, tokenA];
    const pair = new Pair(
      new TokenAmount(token0, reserve0.toString()),
      new TokenAmount(token1, reserve1.toString())
    );
    return pair;
  } catch (error) {}
}

//Calculates the exact amount of all token0 and all token1 for account
export async function getLiquidityValue(pair, account) {
  try {
    const lpTokenContract = generateLpTokenContract(
      pair.liquidityToken.address
    );
    const totalSupply = await lpTokenContract.methods.totalSupply().call();
    const balance = await lpTokenContract.methods.balanceOf(account).call();
    const amountA = pair.getLiquidityValue(
      pair.token0,
      new TokenAmount(pair.liquidityToken, totalSupply.toString()),
      new TokenAmount(pair.liquidityToken, balance)
    );
    const amountB = pair.getLiquidityValue(
      pair.token1,
      new TokenAmount(pair.liquidityToken, totalSupply.toString()),
      new TokenAmount(pair.liquidityToken, balance)
    );
    return {
      amountA: fromWei(amountA.raw.toString(), pair.token0.decimals),
      amountB: fromWei(amountB.raw.toString(), pair.token1.decimals),
      totalSupply: fromWei(totalSupply, 18),
    };
  } catch (error) {
    console.error('Fail to get liquidity value', error);
  }
}

export async function getLiquidityBalance(pair) {
  try {
    const lpTokenContract = generateLpTokenContract(
      pair.liquidityToken.address
    );
    const totalSupply = await lpTokenContract.methods.totalSupply().call();
    const amountA = pair.getLiquidityValue(
      pair.token0,
      new TokenAmount(pair.liquidityToken, totalSupply.toString()),
      new TokenAmount(pair.liquidityToken, totalSupply.toString())
    );
    const amountB = pair.getLiquidityValue(
      pair.token1,
      new TokenAmount(pair.liquidityToken, totalSupply.toString()),
      new TokenAmount(pair.liquidityToken, totalSupply.toString())
    );

    return {
      amountA: fromWei(amountA.raw.toString(), pair.token0.decimals),
      amountB: fromWei(amountB.raw.toString(), pair.token1.decimals),
      totalSupply: fromWei(totalSupply, 18),
    };
  } catch (error) {
    console.error('Fail to get liquidity value', error);
  }
}

//Calculates the exact amount of token0 or token1 that the given amount of liquidity tokens represent.
export async function getLiquidityAmount(pair, amount) {
  try {
    const lpTokenContract = await generateLpTokenContract(
      pair.liquidityToken.address
    );
    const totalSupply = await lpTokenContract.methods.totalSupply().call();
    const balance = toWei(amount, 18);
    const amountA = pair.getLiquidityValue(
      pair.token0,
      new TokenAmount(pair.liquidityToken, totalSupply.toString()),
      new TokenAmount(pair.liquidityToken, balance)
    );
    const amountB = pair.getLiquidityValue(
      pair.token1,
      new TokenAmount(pair.liquidityToken, totalSupply.toString()),
      new TokenAmount(pair.liquidityToken, balance)
    );
    return {
      amountA: fromWei(amountA.raw.toString(), pair.token0.decimals),
      amountB: fromWei(amountB.raw.toString(), pair.token0.decimals),
      pair: pair,
    };
  } catch (error) {
    console.error('Failed to get liquidity amount', error);
  }
}

export async function getReserves(pair) {
  try {
    const reserve0 = getAmountFromTokenAmount(pair.reserve0);
    const reserve1 = getAmountFromTokenAmount(pair.reserve1);
    return { reserve0, reserve1 };
  } catch (error) {
    console.error('Fail to get pair reserve', error);
  }
}

export async function generatePairFromLpAddress(
  lpTokenAddress,
  chainId,
  version = ROUTER_VERSION.v1
) {
  try {
    const lpContract = generateLpTokenContract(lpTokenAddress);
    const token0Address = await singleCallResult(lpContract, 'token0');
    const token1Address = await singleCallResult(lpContract, 'token1');
    const token0 = await generateToken(token0Address);
    const token1 = await generateToken(token1Address);
    const pair = await generatePair([token0, token1], chainId, version);
    return pair;
  } catch (error) {
    console.error('Fail to get pair reserve', error);
  }
}

//to show on the UI
export function getTokensFromPair(pair, chainId) {
  const nativeETH =
    chainId === ChainId.MATIC ? ETHER[chainId] : ETHER[ChainId.BSC];
  const nativeWETH =
    chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];
  try {
    const token0 = pair?.tokenAmounts ? pair?.tokenAmounts[0]?.token : null;
    const token1 = pair?.tokenAmounts ? pair?.tokenAmounts[1]?.token : null;
    const currency0 = _.isEqual(token0, nativeWETH) ? nativeETH : token0;
    const currency1 = _.isEqual(token1, nativeWETH) ? nativeETH : token1;
    return { currency0, currency1, token0, token1 };
  } catch (error) {
    return {};
  }
}

//get tokens from pair, pair created manually, not from sdk
export function getTokensFromCreatedPair(pair, chainId) {
  const nativeETH =
    chainId === ChainId.MATIC ? ETHER[chainId] : ETHER[ChainId.BSC];
  const nativeWETH =
    chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];
  try {
    const token0 = pair?.tokens ? pair?.tokens[0] : null;
    const token1 = pair?.tokens ? pair?.tokens[1] : null;
    const currency0 = _.isEqual(token0, nativeWETH) ? nativeETH : token0;
    const currency1 = _.isEqual(token1, nativeWETH) ? nativeETH : token1;
    return { currency0, currency1, token0, token1 };
  } catch (error) {
    return {};
  }
}

export async function getLiquidityMinted(
  tokenA,
  tokenB,
  amountA,
  amountB,
  chainId
) {
  try {
    const SDK = chainId === ChainId.MATIC ? EDDA_POLYGON_SDK : EDDA_BSC_SDK;
    const { ETHER, WETH, TokenAmount } = SDK;

    const nativeETH = ETHER;
    const nativeWETH = WETH[chainId];

    const pair = await generatePair([tokenA, tokenB], chainId);
    const lpTokenContract = await generateLpTokenContract(
      pair.liquidityToken.address
    );
    const totalSupply = await lpTokenContract.methods.totalSupply().call();
    const weiAmountA = toWei(amountA, tokenA?.decimals);
    const weiAmountB = toWei(amountB, tokenB?.decimals);
    const tokenAIsETH = _.isEqual(tokenA, nativeETH);
    const tokenBIsETH = _.isEqual(tokenB, nativeETH);
    const liquidityMinted = pair.getLiquidityMinted(
      new TokenAmount(pair.liquidityToken, totalSupply.toString()),
      new TokenAmount(tokenAIsETH ? nativeWETH : tokenA, weiAmountA),
      new TokenAmount(tokenBIsETH ? nativeWETH : tokenB, weiAmountB)
    );
    return {
      liquidityMinted,
      pair: pair,
      totalSupply,
    };
  } catch (error) {
    console.error('Failed to get liquidity minted', error);
  }
}

export async function getPercentLocked(pair, chainId = ChainId.BSC) {
  try {
    if (!pair || !pair.liquidityToken) return 0;
    //get lp token address total supply
    const lpTokenAddress = pair.liquidityToken.address;
    const lpTokenContract = generateLpTokenContract(lpTokenAddress);
    const weiLpTokenTotalSupply = await singleCallResult(
      lpTokenContract,
      'totalSupply'
    );
    const lpTokenTotalSupply = fromWei(weiLpTokenTotalSupply, 18);
    //get amount lp token locked
    const lockedBalance = await getBalanceOf(
      lpTokenContract,
      EDDA_VESTING_BY_CHAIN[chainId]
    );

    //percent locked = amount lp locked / lp token total supply
    return dividedBy(lockedBalance, lpTokenTotalSupply);
  } catch (error) {
    return 0;
  }
}
