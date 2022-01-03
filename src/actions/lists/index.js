import { createAction } from "@reduxjs/toolkit";

export const fetchTokenList = {
  pending: createAction("lists/fetchTokenList/pending"),
  fulfilled: createAction("lists/fetchTokenList/fulfilled"),
  rejected: createAction("lists/fetchTokenList/rejected"),
};

export const loadTokenList = createAction("lists/loadTokenList");
export const acceptListUpdate = createAction("lists/acceptListUpdate");
export const addList = createAction("lists/addList");
export const removeList = createAction("lists/removeList");
export const selectList = createAction("lists/selectList");
export const rejectVersionUpdate = createAction("lists/rejectVersionUpdate");
// select which lists to search across from loaded lists
export const enableList = createAction("lists/enableList");
export const disableList = createAction("lists/disableList");
