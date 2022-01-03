import { JSBI } from "@eddaswap/sdk";

export const maxUint =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const userTokenStorageKey = "edda-user-tokens";
export const userPoolStorageKey = "edda-user-pair";
export const userWalletStorageKey = "edda-user-wallet";

export const BIPS_BASE = JSBI.BigInt(10000);

export const ROUTER_VERSION = {
  v1: "v1",
  v2: "v2",
};
