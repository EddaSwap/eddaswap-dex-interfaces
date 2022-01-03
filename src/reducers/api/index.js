import { combineReducers } from "redux";
import token from "./token";
import liquidity from "./liquidity";
import settings from "./settings";
import contracts from "./contracts";
import common from "./common";
import address from "./address";
import nft from "./nft";
import liquidityv2 from "./liquidityv2";
// import lists from "./lists";

export const api = combineReducers({
  token,
  liquidity,
  settings,
  contracts,
  common,
  address,
  nft,
  liquidityv2,
  // lists,
});
