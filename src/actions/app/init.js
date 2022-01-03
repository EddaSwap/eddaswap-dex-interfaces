import { loadLanguage } from "./language";
import { loadConnectedWallet } from "actions/wallet";

export function loadInitAppData(web3Context) {
  return (dispatch, getState) => {
    return new Promise(async function (resolve, reject) {
      // await loadConnectedWallet(web3Context);
      dispatch({
        type: "LOADED_DATA",
        success: true,
      });
    });
  };
}

export function loadBalanceData() {
  return (dispatch, getState) => {
    return new Promise(async function (resolve, reject) {
      dispatch({
        type: "LOADED_DATA",
        success: true,
      });
    });
  };
}

export function loadLocalStorage() {
  const theme = localStorage.getItem("edda-theme");
  const slippage = localStorage.getItem("edda-slippage");
  const txDeadline = localStorage.getItem("edda-deadline");

  return (dispatch) => {
    dispatch({
      type: "UPDATE_LOCAL_STORAGE",
      theme: theme || "default",
      slippage: !!slippage ? slippage : 0.5,
      txDeadline: !!txDeadline ? txDeadline : 120,
    });
    dispatch(loadLanguage());
  };
}
