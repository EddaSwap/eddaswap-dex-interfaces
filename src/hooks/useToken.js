import { Token, JSBI } from "@eddaswap/sdk";
import { userTokenStorageKey } from "constants/constants";
import { getLocalStorageItem } from "lib/storageHelper";
import { useMemo } from "react";
// import { useSelector } from "react-redux";
// import sortByListPriority from "utils/listSort";
// import { createTokenFilterFunction } from "components/SelectToken/functions";
import { useSDK } from "./useSDK";
import { SupportedTokens } from "constants/tokens";
import { useWeb3React } from "@web3-react/core";
import { ChainId } from "@sushiswap/sdk";
import { useNativeToken } from "./useNativeToken";
import { isAddress } from "lib/utils";
import { Interface } from "@ethersproject/abi";
import _ from "lodash";
import { useSelector } from "react-redux";

const EMPTY_LIST = {
  56: {},
  137: {},
};

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  constructor(tokenInfo, tags) {
    super(
      tokenInfo.chainId,
      tokenInfo.address,
      tokenInfo.decimals,
      tokenInfo.symbol,
      tokenInfo.name
    );
    this.tokenInfo = tokenInfo;
    this.tags = tags;
  }
  get logoURI() {
    return this.tokenInfo.logoURI;
  }

  equals(other) {
    return (
      other.chainId === this.chainId &&
      other.isToken &&
      other.address.toLowerCase() === this.address.toLowerCase()
    );
  }

  sortsBefore(other) {
    if (this.equals(other)) throw new Error("Addresses should not be equal");
    return this.address.toLowerCase() < other.address.toLowerCase();
  }

  get wrapped() {
    return this;
  }
}

// const listCache = typeof WeakMap !== "undefined" ? new WeakMap() : null;

// export function combineMaps(map1, map2) {
//   const chainIds = Object.keys(
//     Object.keys(map1)
//       .concat(Object.keys(map2))
//       .reduce((memo, value) => {
//         memo[value] = true;
//         return memo;
//       }, {})
//   ).map((id) => parseInt(id));

//   return chainIds.reduce((memo, chainId) => {
//     memo[chainId] = {
//       ...map2[chainId],
//       // map1 takes precedence
//       ...map1[chainId],
//     };

//     return memo;
//   }, {});
// }

// export function listToTokenMap(list) {
//   const result = listCache?.get(list);

//   if (result) return result;

//   const map = list.tokens.reduce(
//     (tokenMap, tokenInfo) => {
//       const tags =
//         tokenInfo.tags
//           ?.map((tagId) => {
//             if (!list.tags?.[tagId]) return undefined;
//             return { ...list.tags[tagId], id: tagId };
//           })
//           ?.filter((x) => Boolean(x)) ?? [];
//       const token = new WrappedTokenInfo(tokenInfo, tags);

//       if (tokenMap[token.chainId][token.address] !== undefined)
//         throw Error("Duplicate tokens.");
//       return {
//         ...tokenMap,
//         [token.chainId]: {
//           ...tokenMap[token.chainId],
//           [token.address]: token,
//         },
//       };
//     },
//     { ...EMPTY_LIST }
//   );
//   listCache?.set(list, map);
//   return map;
// }

// export function useTokenList(url) {
//   const lists = useSelector((state) => state.lists.byUrl);

//   return useMemo(() => {
//     if (!url) return EMPTY_LIST;
//     const current = lists[url]?.current;
//     if (!current) return EMPTY_LIST;
//     try {
//       return listToTokenMap(current);
//     } catch (error) {
//       console.error("Could not show token list due to error", error);
//       return EMPTY_LIST;
//     }
//   }, [lists, url]);
// }

// export function useSelectedListUrl() {
//   return useSelector((state) => state.lists.selectedListUrl);
// }

// export function useSelectedTokenList() {
//   return useTokenList(useSelectedListUrl());
// }

// export function useSelectedListInfo() {
//   const selectedUrl = useSelectedListUrl();
//   const listsByUrl = useSelector((state) => state.lists.byUrl);
//   const list = selectedUrl ? listsByUrl[selectedUrl] : undefined;
//   return {
//     current: list?.current ?? null,
//     pending: list?.pendingUpdate ?? null,
//     loading: list?.loadingRequestId !== null,
//   };
// }

// // returns all downloaded current lists
// export function useAllLists() {
//   return useSelector((state) => state.lists.byUrl);
// }

// // merge tokens contained within lists from urls
// function useCombinedTokenMapFromUrls(urls) {
//   const lists = useAllLists();

//   return useMemo(() => {
//     if (!urls) return {};
//     return (
//       urls
//         .slice()
//         // sort by priority so top priority goes last
//         .sort(sortByListPriority)
//         .reduce((allTokens, currentUrl) => {
//           const current = lists[currentUrl]?.current;
//           if (!current) return allTokens;
//           try {
//             return combineMaps(allTokens, listToTokenMap(current));
//           } catch (error) {
//             console.error("Could not show token list due to error", error);
//             return allTokens;
//           }
//         }, {})
//     );
//   }, [lists, urls]);
// }

// // filter out unsupported lists
// export function useActiveListUrls() {
//   return useSelector((state) => state.lists.activeListUrls);
//   // ?.filter((url) => !UNSUPPORTED_LIST_URLS.includes(url))
// }

// export function useInactiveListUrls() {
//   const lists = useAllLists();
//   const allActiveListUrls = useActiveListUrls();
//   console.log("allActiveListUrls", allActiveListUrls);
//   return Object.keys(lists).filter((url) => !allActiveListUrls?.includes(url));
//   // ?.includes(url) && !UNSUPPORTED_LIST_URLS.includes(url))
// }

// // const TRANSFORMED_DEFAULT_TOKEN_LIST = listToTokenMap(DEFAULT_TOKEN_LIST);

// // get all the tokens from active lists, combine with local default tokens
// export function useCombinedActiveList() {
//   const activeListUrls = useActiveListUrls();
//   console.log("activeListUrls", activeListUrls);
//   const activeTokens = useCombinedTokenMapFromUrls(activeListUrls);
//   console.log("activeTokens", activeTokens);
//   return combineMaps(activeTokens, { 56: {} });
// }

export function useUserAddedTokensObject() {
  // try {
  const { chainId } = useWeb3React();
  const stringifyAddedTokens = getLocalStorageItem(userTokenStorageKey);
  const userAddedTokens = JSON.parse(stringifyAddedTokens);
  if (!userAddedTokens || !userAddedTokens[chainId]) return {};
  return userAddedTokens[chainId];
  // } catch {}
}

export function useUserAddedTokens() {
  // try {
  const { chainId } = useWeb3React();
  const { userAddedTokens } = useSelector((state) => state.api.token);

  return useMemo(() => {
    if (!chainId) return [];
    if (!userAddedTokens) return [];
    return Object.values(userAddedTokens);
  }, [userAddedTokens, chainId]);

  // const stringifyAddedTokens = getLocalStorageItem(userTokenStorageKey);
  // const userAddedTokens = JSON.parse(stringifyAddedTokens);
  // if (!userAddedTokens[chainId]) return [];
  // return Object.values(userAddedTokens[chainId]);
  // } catch {}
}

// // reduce token map into standard address <-> Token mapping, optionally include user added tokens
// function useTokensFromMap(tokenMap, includeUserAdded) {
//   const chainId = 56;
//   const userAddedTokens = useUserAddedTokens();

//   return useMemo(() => {
//     if (!chainId) return {};

//     // reduce to just tokens
//     const mapWithoutUrls = Object.keys(tokenMap[chainId] ?? {}).reduce(
//       (newMap, address) => {
//         newMap[address] = tokenMap[chainId][address].tokenInfo;
//         return newMap;
//       },
//       {}
//     );

//     if (includeUserAdded) {
//       return (
//         userAddedTokens
//           // reduce into all ALL_TOKENS filtered by the current chain
//           .reduce(
//             (tokenMap, token) => {
//               tokenMap[token.address] = token;
//               return tokenMap;
//             },
//             // must make a copy because reduce modifies the map, and we do not
//             // want to make a copy in every iteration
//             { ...mapWithoutUrls }
//           )
//       );
//     }

//     return mapWithoutUrls;
//   }, [chainId, userAddedTokens, tokenMap, includeUserAdded]);
// }

export function useAllTokens() {
  const { chainId } = useWeb3React();
  const { ETHER } = useNativeToken();

  const userAddedTokens = useUserAddedTokens();

  const defaultChainId = ChainId.BSC;

  return useMemo(() => {
    return [
      ETHER,
      ..._.concat(SupportedTokens[chainId || defaultChainId], userAddedTokens),
    ];
  }, [userAddedTokens, chainId, ETHER]);
  // if (!chainId) {
  //   return [ETHER, ..._.merge(SupportedTokens[ChainId.BSC], userAddedTokens)];
  // }
  // return [ETHER, ..._.merge(SupportedTokens[chainId], userAddedTokens)];
  //   const allTokens = useCombinedActiveList();
  //   return useTokensFromMap(allTokens, true);
}

// export function useIsListActive(url) {
//   const activeListUrls = useActiveListUrls();
//   return Boolean(activeListUrls?.includes(url));
// }

// export function useSearchInactiveTokenLists(search, minResults = 10) {
//   const lists = useAllLists();

//   const inactiveUrls = useInactiveListUrls();

//   const chainId = 56;
//   const activeTokens = useAllTokens();
//   return useMemo(() => {
//     if (!search || search.trim().length === 0) return [];
//     const tokenFilter = createTokenFilterFunction(search);
//     const result = [];
//     const addressSet = {};
//     for (const url of inactiveUrls) {
//       const list = lists[url].current;
//       if (!list) continue;
//       for (const tokenInfo of list.tokens) {
//         if (tokenInfo.chainId === chainId && tokenFilter(tokenInfo)) {
//           const wrapped = new WrappedTokenInfo(tokenInfo, list);
//           if (
//             !(wrapped.address in activeTokens) &&
//             !addressSet[wrapped.address]
//           ) {
//             addressSet[wrapped.address] = true;
//             result.push(wrapped);
//             if (result.length >= minResults) return result;
//           }
//         }
//       }
//     }
//     return result;
//   }, [activeTokens, chainId, inactiveUrls, lists, minResults, search]);
// }
