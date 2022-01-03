import { splitSignature } from "@ethersproject/bytes";
import { toWei } from "lib/numberHelper";
import store from "stores";
import { EDDA_ROUTER_BY_CHAIN } from "constants/address";

export async function sendTxMetamask({
  contractMethods,
  params = "",
  amount = 0, //value eth
  contractAddress,
  onTransactionHash = () => {},
  onSendSuccess = () => {},
  onSendFailed = () => {},
  account,
}) {
  const state = store.getState();
  const web3 = state.api.common.web3;

  return new Promise((resolve, reject) => {
    let amountBN = "0";
    if (amount > 0) {
      amountBN = toWei(amount, 18);
    }

    const methodsData = contractMethods(...params).encodeABI();

    const txData = {
      from: account,
      to: contractAddress,
      data: methodsData,
      value: "0x" + parseInt(amountBN).toString(16),
    };

    window.ethereum
      ?.request({
        method: "eth_sendTransaction",
        params: [txData],
      })
      .then(async (result) => {
        onTransactionHash(result);
        let receipt = null;
        do {
          receipt = await web3.eth.getTransactionReceipt(result);
        } while (receipt === null);
        if (receipt.status) {
          resolve(receipt);
          if (onSendSuccess) {
            onSendSuccess(receipt);
          }
        } else {
          reject({ message: "Transaction failed" });
          if (onSendFailed) {
            onSendFailed({ message: "Transaction failed" });
          }
        }
      })
      .catch((err) => {
        reject(err);
        onSendFailed(err);
      });
  });
}

export async function sendSignTxMetamask({
  contractMethods,
  params = "",
  amount = 0,
  data,
  onTransactionHash = () => {},
  onSendSuccess = () => {},
  onSendFailed = () => {},
  account,
  chainId,
  spender,
}) {
  const state = store.getState();
  const web3 = state.api.common.web3;

  return new Promise(async (resolve, reject) => {
    let amountBN = "0";
    if (amount > 0) {
      amountBN = toWei(amount, 18);
    }
    try {
      const ethereum = window.ethereum;
      const signedData = await ethereum.request({
        method: "eth_signTypedData_v4",
        params: [account, data],
        from: account,
        value: amountBN,
      });
      const { v, r, s } = splitSignature(signedData);

      const newParams = [...params, v, r, s];
      const methodsData = contractMethods(...newParams).encodeABI();
      const txData = {
        from: account,
        to: spender ? spender : EDDA_ROUTER_BY_CHAIN[chainId],
        data: methodsData,
        value: amountBN,
      };

      window.ethereum
        ?.request({
          method: "eth_sendTransaction",
          params: [txData],
        })
        .then(async (result) => {
          onTransactionHash(result);
          let receipt = null;
          do {
            receipt = await web3.eth.getTransactionReceipt(result);
          } while (receipt === null);
          if (receipt.status) {
            resolve(receipt);
            if (onSendSuccess) {
              onSendSuccess(receipt);
            }
          } else {
            reject({ message: "Transaction failed" });
            if (onSendFailed) {
              onSendFailed({ message: "Transaction failed" });
            }
          }
        })
        .catch((err) => {
          reject(err);
          onSendFailed(err);
        });
    } catch (error) {
      if (onSendFailed) {
        onSendFailed(error);
      }
    }
  });
}
