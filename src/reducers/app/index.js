import { combineReducers } from "redux";
import snackbar from './snackbar';
import modal from "./modal";
import settings from "./settings";
import storage from "./storage";

export const app = combineReducers({
  snackbar,
  modal,
  settings,
  storage
});