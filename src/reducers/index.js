import { combineReducers } from "redux";
import { app } from "./app";
import { api } from "./api";
import lists from "./api/lists";

export const reducer = combineReducers({
  app,
  api,
  lists,
});
