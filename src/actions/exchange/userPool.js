import { userPoolStorageKey } from 'constants/constants';
import { getUserImportPool } from 'lib/sdk/token';
import _ from 'lodash';

export function initUserPoolList(chainId) {
  try {
    const userTokenListInStorage = getUserImportPool(chainId);

    if (userTokenListInStorage && userTokenListInStorage.length) {
      return (dispatch) => {
        dispatch({
          type: 'INIT_USER_IMPORTED_POOL',
          importedPoolList: userTokenListInStorage,
        });
      };
    } else {
      // TODO: multichain
      // let initUserTokens = { 56: {} };
      // localStorage.setItem(userPoolStorageKey, JSON.stringify(initUserTokens));
      return (dispatch) => {
        //the first time call this action, the pool list is null array
        //if null, dispatch no action
        dispatch({
          type: 'RANDOM_ACTION',
        });
      };
    }

    // return (dispatch) => {
    //   dispatch({
    //     type: 'INIT_USER_IMPORTED_POOL',
    //     importedPoolList: [],
    //   });
  } catch (error) {
    console.error('Failed to add token to storage', error);
  }
}

export function userImportPool(pair, chainId) {
  try {
    const { token0, token1 } = pair;
    const stringPools = localStorage.getItem(userPoolStorageKey);

    const pools = JSON.parse(stringPools) || {};

    if (pools) {
      const importedPoolsByNetwork = pools[chainId];
      let newImportPoolList = {
        ...pools,
        [chainId]: {
          ...importedPoolsByNetwork,
          [`${token0.address};${token1.address}`]: { token0, token1 },
        },
      };

      const stringifyNewUserPools = JSON.stringify(newImportPoolList);
      localStorage.setItem(userPoolStorageKey, stringifyNewUserPools);

      return (dispatch) => {
        dispatch({
          type: 'LOADED_USER_IMPORTED_POOL',
          importedPoolList: Object.values(newImportPoolList[chainId]),
        });
      };
    } else return (dispatch) => {};
  } catch (error) {
    console.error('Failed to add token to storage', error);
    return (dispatch) => {};
  }
}
