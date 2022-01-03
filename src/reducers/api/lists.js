import {
  DEFAULT_LIST_OF_LISTS,
  DEFAULT_ACTIVE_LIST_URLS,
} from 'constants/lists';
import { createReducer } from '@reduxjs/toolkit';
import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists';

import {
  acceptListUpdate,
  addList,
  fetchTokenList,
  removeList,
  selectList,
  enableList,
  disableList,
  loadTokenList,
} from 'actions/lists';

const NEW_LIST_STATE = {
  error: null,
  current: null,
  loadingRequestId: null,
  pendingUpdate: null,
};

const initialState = {
  lastInitializedDefaultListOfLists: DEFAULT_LIST_OF_LISTS,
  byUrl: {
    ...DEFAULT_LIST_OF_LISTS.reduce((memo, listUrl) => {
      memo[listUrl] = NEW_LIST_STATE;
      return memo;
    }, {}),
  },
  activeListUrls: DEFAULT_ACTIVE_LIST_URLS,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(loadTokenList, (state, { payload: { list } }) => {
      state.byUrl = list;
    })
    .addCase(
      fetchTokenList.pending,
      (state, { payload: { requestId, url } }) => {
        state.byUrl[url] = {
          current: null,
          pendingUpdate: null,
          ...state.byUrl[url],
          loadingRequestId: requestId,
          error: null,
        };
      }
    )
    .addCase(
      fetchTokenList.fulfilled,
      (state, { payload: { requestId, tokenList, url } }) => {
        const current = state.byUrl[url]?.current;
        const loadingRequestId = state.byUrl[url]?.loadingRequestId;

        // no-op if update does nothing
        if (current) {
          const upgradeType = getVersionUpgrade(
            current.version,
            tokenList.version
          );
          if (upgradeType === VersionUpgrade.NONE) return;
          if (loadingRequestId === null || loadingRequestId === requestId) {
            state.byUrl[url] = {
              ...state.byUrl[url],
              loadingRequestId: null,
              error: null,
              current: current,
              pendingUpdate: tokenList,
            };
          }
        } else {
          state.byUrl[url] = {
            ...state.byUrl[url],
            loadingRequestId: null,
            error: null,
            current: tokenList,
            pendingUpdate: null,
          };
        }
      }
    )
    .addCase(
      fetchTokenList.rejected,
      (state, { payload: { url, requestId, errorMessage } }) => {
        if (state.byUrl[url]?.loadingRequestId !== requestId) {
          // no-op since it's not the latest request
          return;
        }

        state.byUrl[url] = {
          ...state.byUrl[url],
          loadingRequestId: null,
          error: errorMessage,
          current: null,
          pendingUpdate: null,
        };
      }
    )
    .addCase(selectList, (state, { payload: url }) => {
      state.selectedListUrl = url;
      // automatically adds list
      if (!state.byUrl[url]) {
        state.byUrl[url] = NEW_LIST_STATE;
      }
    })
    .addCase(addList, (state, { payload: url }) => {
      if (!state.byUrl[url]) {
        state.byUrl[url] = NEW_LIST_STATE;
      }
    })
    .addCase(removeList, (state, { payload: url }) => {
      if (state.byUrl[url]) {
        delete state.byUrl[url];
      }
      // remove list from active urls if needed
      if (state.activeListUrls && state.activeListUrls.includes(url)) {
        state.activeListUrls = state.activeListUrls.filter((u) => u !== url);
      }
    })
    .addCase(acceptListUpdate, (state, { payload: url }) => {
      if (!state.byUrl[url]?.pendingUpdate) {
        throw new Error('accept list update called without pending update');
      }
      state.byUrl[url] = {
        ...state.byUrl[url],
        pendingUpdate: null,
        current: state.byUrl[url].pendingUpdate,
      };
    })
    .addCase(enableList, (state, { payload: url }) => {
      if (!state.byUrl[url]) {
        state.byUrl[url] = NEW_LIST_STATE;
      }

      if (state.activeListUrls && !state.activeListUrls.includes(url)) {
        state.activeListUrls.push(url);
      }

      if (!state.activeListUrls) {
        state.activeListUrls = [url];
      }
    })
    .addCase(disableList, (state, { payload: url }) => {
      if (state.activeListUrls && state.activeListUrls.includes(url)) {
        state.activeListUrls = state.activeListUrls.filter((u) => u !== url);
      }
    })
);
