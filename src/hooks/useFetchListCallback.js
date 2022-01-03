import { nanoid } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTokenList } from 'actions/lists';
import getTokenList from '../utils/getTokenList';
import { useWeb3React } from '@web3-react/core';

export function useFetchListCallback() {
  const { chainId, library } = useWeb3React();
  const dispatch = useDispatch();

  //   const chainId = 56;

  //   const ensResolver = useCallback(
  //     (ensName) => {
  //       if (!library || chainId !== ChainId.MAINNET) {
  //         if (NETWORK_CHAIN_ID === ChainId.MAINNET) {
  //           const networkLibrary = getNetworkLibrary();
  //           if (networkLibrary) {
  //             return resolveENSContentHash(ensName, networkLibrary);
  //           }
  //         }
  //         throw new Error("Could not construct mainnet ENS resolver");
  //       }
  //       return resolveENSContentHash(ensName, library);
  //     },
  //     [chainId, library]
  //   );

  return useCallback(
    async (listUrl) => {
      const requestId = nanoid();
      dispatch(fetchTokenList.pending({ requestId, url: listUrl }));
      return getTokenList(listUrl)
        .then((tokenList) => {
          dispatch(
            fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId })
          );

          return tokenList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          dispatch(
            fetchTokenList.rejected({
              url: listUrl,
              requestId,
              errorMessage: error.message,
            })
          );
          throw error;
        });
    },
    [dispatch]
  );
}
