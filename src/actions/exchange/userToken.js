import { userTokenStorageKey } from 'constants/constants';
import {
  getUserAddedTokens,
  getUserAddedTokensList,
  generateAllTokensWithETH,
} from 'lib/sdk/token';
import _ from 'lodash';

export function initUserTokenList(chainId) {
  try {
    const userTokenListInStorage = getUserAddedTokens(chainId);

    if (userTokenListInStorage && userTokenListInStorage.length) {
      return (dispatch) => {
        dispatch({
          type: 'INIT_USER_ADDED_TOKEN',
          addedTokensList: userTokenListInStorage,
        });
      };
    } else {
      return (dispatch) => {
        dispatch({
          type: 'INIT_USER_ADDED_TOKEN',
          addedTokensList: [],
        });
      };
    }
    // else {
    //   // TODO: multichain
    //   let initUserTokens = { 56: {}, 137: {} };
    //   localStorage.setItem(userTokenStorageKey, JSON.stringify(initUserTokens));
    //   return (dispatch) => {
    //     dispatch({
    //       type: "INIT_USER_ADDED_TOKEN",
    //       addedTokensList: [],
    //     });
    //   };
    // }
  } catch (error) {
    console.error('Failed to add token to storage', error);
  }
}

export function userAddToken(token, chainId) {
  try {
    const stringTokens = localStorage.getItem(userTokenStorageKey);

    const tokens = JSON.parse(stringTokens) || {};
    const addedTokensByNetwork = tokens[chainId];

    let newTokenList = {
      ...tokens,
      [chainId]: {
        ...addedTokensByNetwork,
        [token.address]: token,
      },
    };

    const stringifyNewUserTokens = JSON.stringify(newTokenList);
    localStorage.setItem(userTokenStorageKey, stringifyNewUserTokens);

    return (dispatch) => {
      dispatch({
        type: 'USER_ADDED_TOKEN',
        newTokenList: Object.values(newTokenList[chainId]),
      });
    };
  } catch (error) {
    console.error('Failed to add token to storage', error);
    return (dispatch) => {};
  }
}

export function userRemoveToken(token, chainId) {
  try {
    const stringTokens = localStorage.getItem(userTokenStorageKey);
    const tokens = JSON.parse(stringTokens);
    const addedTokensByNetwork = tokens[chainId];
    const newTokensByNetwork = _.omit(addedTokensByNetwork, token?.address);

    let newTokenList = {
      ...tokens,
      [chainId]: newTokensByNetwork,
    };

    const stringifyNewUserTokens = JSON.stringify(newTokenList);
    localStorage.setItem(userTokenStorageKey, stringifyNewUserTokens);

    return (dispatch) => {
      dispatch({
        type: 'USER_REMOVE_TOKEN',
        newTokenList: Object.values(newTokenList[chainId]),
      });
    };
  } catch (error) {
    console.error('Failed to remove token from storage', error);
    return (dispatch) => {};
  }
}

export function loadTokenListWithAddedToken(chainId) {
  try {
    return async (dispatch) => {
      const addedTokens = await getUserAddedTokensList(chainId);
      const allDefaultTokens = await generateAllTokensWithETH(chainId);
      const allTokens = [...allDefaultTokens, ...addedTokens];
      const sortedAllTokens = _.orderBy(allTokens, ['symbol'], ['asc']);
      dispatch({
        type: 'LOAD_ALL_TOKENS',
        tokens: sortedAllTokens,
      });
    };
  } catch (error) {
    console.error('Failed to remove token from storage', error);
    return (dispatch) => {};
  }
}
