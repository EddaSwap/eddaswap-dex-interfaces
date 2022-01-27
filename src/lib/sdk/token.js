import { Token } from '@eddaswap/sdk';
import { ChainId } from '@sushiswap/sdk';
import { userPoolStorageKey, userTokenStorageKey } from 'constants/constants';
import {
  BASES_TO_TRACK_LIQUIDITY_FOR,
  ETHER,
  SDK,
  SDK_v2,
  SupportedTokens,
  WETH,
} from 'constants/tokens';
import { uniqueArrayOfObject } from 'lib/arrayHelper';
import { fromWei } from 'lib/numberHelper';
import { arrayofObjectToObject } from 'lib/objectHelper';
import { getLocalStorageItem } from 'lib/storageHelper';
import { isAddress } from 'lib/utils';
import _ from 'lodash';
import {
  generateLpTokenContract,
  generateTokenContract,
  singleCallResult,
} from './contract';

export async function generateToken(tokenAddress, chainId) {
  try {
    if (isAddress(tokenAddress)) {
      const tokenContract = generateTokenContract(tokenAddress);
      const decimals = await singleCallResult(tokenContract, 'decimals');
      const name = await singleCallResult(tokenContract, 'name');
      const symbol = await singleCallResult(tokenContract, 'symbol');
      const token = new Token(
        chainId,
        tokenAddress,
        parseInt(decimals),
        symbol,
        name
      );
      return token;
    }
  } catch (error) {
    console.error('Failed to generate token', error);
  }
}

export async function generateLpToken(tokenAddress, chainId) {
  try {
    const tokenContract = generateLpTokenContract(tokenAddress);
    const decimals = await singleCallResult(tokenContract, 'decimals');
    const name = await singleCallResult(tokenContract, 'name');
    const symbol = await singleCallResult(tokenContract, 'symbol');
    const token = new Token(chainId, tokenAddress, decimals, symbol, name);
    return token;
  } catch (error) {}
}

export async function generateAllTokens(chainId) {
  if (chainId === ChainId.MATIC) {
    return SupportedTokens[chainId];
  }
  return SupportedTokens[ChainId.BSC];
}

export async function generateAllTokensWithETH(chainId) {
  try {
    const allTokens = await generateAllTokens(chainId);
    return [ETHER[chainId], ...allTokens];
  } catch (error) {}
}

export function getUserAddedTokens(chainId) {
  try {
    const stringifyAddedTokens = getLocalStorageItem(userTokenStorageKey);
    const userAddedTokens = JSON.parse(stringifyAddedTokens);

    if (userAddedTokens && userAddedTokens[chainId]) {
      return Object.values(userAddedTokens[chainId]);
    } else return [];
  } catch (error) {
    console.error('Failed to get user added tokens from local storage', error);
    return [];
  }
}

export async function getUserAddedTokensList(chainId) {
  try {
    const stringifyAddedTokens = getLocalStorageItem(userTokenStorageKey);
    const userAddedTokens = JSON.parse(stringifyAddedTokens);

    if (userAddedTokens && userAddedTokens[chainId]) {
      const addressList = Object.keys(userAddedTokens[chainId]);
      const userAddedTokenList = await Promise.all(
        addressList.map(async (item) => await generateToken(item))
      );
      //remove duplicate added tokens with default tokens
      const allTokens = arrayofObjectToObject(
        SupportedTokens[chainId],
        'address'
      );
      const filteredAddedTokensList = userAddedTokenList.filter(
        (item) => !!item && !allTokens[item.address]
      );
      return filteredAddedTokensList;
    } else return [];
  } catch (error) {
    console.error('Failed to get user added tokens from local storage', error);
    return [];
  }
}

export async function generateAllTokensWithAddedTokens(chainId) {
  try {
    const userAddedTokens = await getUserAddedTokensList(chainId);
    const allTokens = await generateAllTokens(chainId);

    // return [ETHER[chainId], ...allTokens, ...userAddedTokens];
    return [...allTokens];
  } catch (error) {}
}

export function getUserImportPool(chainId) {
  try {
    const stringifyAddedPair = getLocalStorageItem(userPoolStorageKey);
    const userAddedTokens = JSON.parse(stringifyAddedPair);
    if (userAddedTokens && userAddedTokens[chainId]) {
      return Object.values(userAddedTokens[chainId]);
    } else return [];
  } catch (error) {
    console.error('Failed to get user added tokens from local storage', error);
    return [];
  }
}

export async function generateAllImportPool() {
  try {
    const userImportedPool = getUserImportPool();
    const userAddedPoolList = await Promise.all(
      userImportedPool.map(async (tokens) => {
        return [
          await generateToken(tokens.token0.address),
          await generateToken(tokens.token1.address),
        ];
      })
    );
    return userAddedPoolList;
  } catch (error) {
    return [];
  }
}

export async function getTrackedTokenPairs(chainId) {
  const nativeETH =
    chainId === ChainId.MATIC ? ETHER[chainId] : ETHER[ChainId.BSC];
  const nativeWETH =
    chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];
  try {
    const allTokens = await generateAllTokensWithAddedTokens(chainId);
    const allImportedPool = await generateAllImportPool();
    let pairList = [...allImportedPool];
    const allTokensWithoutBNBWBNB = allTokens.filter(
      (item) => !_.isEqual(item, nativeETH) && !_.isEqual(item, nativeWETH)
    );

    const basesToTrackLiquidityFor =
      chainId === ChainId.MATIC
        ? BASES_TO_TRACK_LIQUIDITY_FOR[chainId]
        : BASES_TO_TRACK_LIQUIDITY_FOR[ChainId.BSC];

    allTokensWithoutBNBWBNB.forEach((token) => {
      //for each token on the current chain (without BNB and WBNB)
      basesToTrackLiquidityFor.forEach((baseToken) => {
        //to construct pairs of the given token with each base (WBNB, EDDA,...)
        if (
          token.address !== baseToken.address &&
          !_.isEqual(token, nativeETH) &&
          !_.isEqual(baseToken, nativeETH)
        ) {
          //find if this pair exist in pairList already
          const tokenA = token.sortsBefore(baseToken) ? token : baseToken;
          const tokenB = token.sortsBefore(baseToken) ? baseToken : token;

          if (pairList.find((item) => _.isEqual(item, [tokenA, tokenB]))) {
          }
          //if non exist, push
          else pairList.push([tokenA, tokenB]);
        }
      });
    });
    return pairList;
  } catch (error) {
    console.error('Fail to get tracked token pairs', error);
    return [];
  }
}

export async function getVestingTokenPairs(chainId) {
  const nativeETH =
    chainId === ChainId.MATIC ? ETHER[chainId] : ETHER[ChainId.BSC];
  const nativeWETH =
    chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];
  try {
    const allTokens = await generateAllTokensWithETH(chainId);
    const allImportedPool = await generateAllImportPool();
    let pairList = [...allImportedPool];

    const allTokensWithoutBNBWBNB = allTokens.filter(
      (item) => !_.isEqual(item, nativeETH) && !_.isEqual(item, nativeWETH)
    );

    allTokensWithoutBNBWBNB.forEach((token) => {
      //for each token on the current chain (without BNB and WBNB)
      BASES_TO_TRACK_LIQUIDITY_FOR[chainId].forEach((baseToken) => {
        //to construct pairs of the given token with each base (WBNB, EDDA,...)
        if (
          token.address !== baseToken.address &&
          !_.isEqual(token, nativeETH) &&
          !_.isEqual(baseToken, nativeETH)
        ) {
          //find if this pair exist in pairList already
          const tokenA = token.sortsBefore(baseToken) ? token : baseToken;
          const tokenB = token.sortsBefore(baseToken) ? baseToken : token;

          if (pairList.find((item) => _.isEqual(item, [tokenA, tokenB]))) {
          }
          //if non exist, push
          else pairList.push([tokenA, tokenB]);
        }
      });
    });
    return pairList;
  } catch (error) {
    console.error('Fail to get tracked token pairs', error);
    return [];
  }
}

export async function loadStakingPairs(chainId) {
  try {
    const pairsList = await getVestingTokenPairs(chainId);
    const tokenPairsWithLiquidityTokens = pairsList
      .map((tokens) => {
        return {
          tokens,
          liquidityToken: toV1LiquidityToken(tokens, chainId),
        };
      })
      .filter((item) => item.liquidityToken);
    const uniqueLpTokenList = uniqueArrayOfObject(
      tokenPairsWithLiquidityTokens,
      'liquidityToken',
      'address'
    );
    return uniqueLpTokenList;
  } catch {}
}

export function toV1LiquidityToken([tokenA, tokenB], chainId) {
  const nativeETH =
    chainId === ChainId.MATIC ? ETHER[chainId] : ETHER[ChainId.BSC];
  const nativeWETH =
    chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];
  try {
    const token0 = _.isEqual(tokenA, nativeETH) ? nativeWETH : tokenA;
    const token1 = _.isEqual(tokenB, nativeETH) ? nativeWETH : tokenB;
    const { Pair, Token } = SDK[chainId];
    const TokenA = new Token(
      chainId,
      token0.address,
      token0.decimals,
      token0.symbol,
      token0.name
    );
    const TokenB = new Token(
      chainId,
      token1.address,
      token1.decimals,
      token1.symbol,
      token1.name
    );
    const pairAddress = Pair.getAddress(TokenA, TokenB);
    return new Token(chainId, pairAddress, 18, 'EDDA-LP', 'EDDA LPs');
  } catch (error) {}
}

export function toV2LiquidityToken([tokenA, tokenB], chainId) {
  const nativeETH =
    chainId === ChainId.MATIC ? ETHER[chainId] : ETHER[ChainId.BSC];
  const nativeWETH =
    chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];
  try {
    const token0 = _.isEqual(tokenA, nativeETH) ? nativeWETH : tokenA;
    const token1 = _.isEqual(tokenB, nativeETH) ? nativeWETH : tokenB;
    const { Pair, Token } = SDK_v2[chainId];
    const TokenA = new Token(
      chainId,
      token0.address,
      token0.decimals,
      token0.symbol,
      token0.name
    );
    const TokenB = new Token(
      chainId,
      token1.address,
      token1.decimals,
      token1.symbol,
      token1.name
    );
    const pairAddress = Pair.getAddress(TokenA, TokenB);

    return new Token(chainId, pairAddress, 18, 'EDDA-LP', 'EDDA LPs');
  } catch (error) {}
}

export function getAmountFromTokenAmount(tokenAmount) {
  try {
    const weiBalance = tokenAmount.raw.toString();
    const balance = fromWei(weiBalance, tokenAmount.token.decimals);
    return balance;
  } catch (error) {
    console.error('Failed to parse TokenAmount to raw amount', error);
    return '0';
  }
}
