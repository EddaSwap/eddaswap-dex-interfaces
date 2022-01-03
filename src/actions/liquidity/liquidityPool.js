import {
  getTrackedTokenPairs,
  toV1LiquidityToken,
  toV2LiquidityToken,
} from 'lib/sdk/token';
import { getLpTokenBalance } from 'lib/sdk/contract';
import { uniqueArrayOfObject } from 'lib/arrayHelper';
import { generatePair } from 'lib/sdk/pair';
import { greaterThan } from 'lib/numberHelper';
import { ROUTER_VERSION } from 'constants/constants';

export function loadLpTokenList(account, chainId) {
  return async (dispatch, getState) => {
    try {
      const trackedTokenPairs = await getTrackedTokenPairs(chainId);
      const tokenPairsWithLiquidityTokens = trackedTokenPairs
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
      const v1Pair = await Promise.all(
        uniqueLpTokenList.map(async ({ tokens }) => {
          return await generatePair(tokens, chainId, ROUTER_VERSION.v1);
        })
      );

      const filteredV1Pair = v1Pair.filter((pair) => pair?.liquidityToken);
      dispatch({
        type: 'LOADED_LP_TOKEN_PAIR',
        lpTokenPairs: filteredV1Pair,
      });
      //load user balances
      if (account) {
        let v2PairBalances = {};
        let userBalances = [];
        for (let lpToken of filteredV1Pair) {
          const balance = await getLpTokenBalance(
            lpToken.liquidityToken.address,
            account,
            chainId
          );
          userBalances.push({
            ...lpToken,
            balance,
          });
          v2PairBalances[lpToken.liquidityToken.address] = balance;
        }
        const liquidityTokensWithBalances = filteredV1Pair.filter(
          ({ liquidityToken }) => {
            // if lp balance less than 1e-9, no show
            return greaterThan(
              v2PairBalances[liquidityToken.address]?.raw?.toString(),
              1000000000
            );
          }
        );
        dispatch({
          type: 'LOADED_LP_TOKENS_BALANCE',
          lpTokensBalance: liquidityTokensWithBalances,
          userBalances: userBalances,
        });
      }
    } catch (error) {
      console.error('Failed to load lp token list', error);
      dispatch({
        type: 'LOADED_LP_TOKEN_PAIR',
        lpTokenPairs: [],
      });
    }
  };
}

export function loadLpTokenListv2(account, chainId) {
  return async (dispatch, getState) => {
    try {
      const trackedTokenPairs = await getTrackedTokenPairs(chainId);
      const tokenPairsWithLiquidityTokens = trackedTokenPairs
        .map((tokens) => {
          return {
            tokens,
            liquidityToken: toV2LiquidityToken(tokens, chainId),
          };
        })
        .filter((item) => item.liquidityToken);

      const uniqueLpTokenList = uniqueArrayOfObject(
        tokenPairsWithLiquidityTokens,
        'liquidityToken',
        'address'
      );

      const v2Pair = await Promise.all(
        uniqueLpTokenList.map(async ({ tokens }) => {
          return await generatePair(tokens, chainId, ROUTER_VERSION.v2);
        })
      );
      const filteredV2Pair = v2Pair.filter((pair) => pair?.liquidityToken);

      dispatch({
        type: 'LOADED_LPv2_TOKEN_PAIR',
        lpTokenPairs: filteredV2Pair,
      });
      //load user balances
      if (account) {
        let v2PairBalances = {};
        let userBalances = [];
        for (let lpToken of filteredV2Pair) {
          const balance = await getLpTokenBalance(
            lpToken.liquidityToken.address,
            account,
            chainId
          );
          userBalances.push({
            ...lpToken,
            balance,
          });
          v2PairBalances[lpToken.liquidityToken.address] = balance;
        }
        const liquidityTokensWithBalances = filteredV2Pair.filter(
          ({ liquidityToken }) => {
            // if lp balance less than 1e-9, no show
            return greaterThan(
              v2PairBalances[liquidityToken.address]?.raw?.toString(),
              1000000000
            );
          }
        );

        dispatch({
          type: 'LOADED_LPv2_TOKENS_BALANCE',
          lpTokensBalance: liquidityTokensWithBalances,
          userBalances: userBalances,
        });
      }
    } catch (error) {
      console.error('Failed to load lp token list', error);
      dispatch({
        type: 'LOADED_LPv2_TOKEN_PAIR',
        lpTokenPairs: [],
      });
    }
  };
}
