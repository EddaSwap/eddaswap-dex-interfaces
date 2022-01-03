import { splitSignature } from '@ethersproject/bytes';
import { EDDA_ROUTER_BY_CHAIN } from 'constants/address';
import { toWei } from 'lib/numberHelper';
import store from 'stores';

export const sendTxViaWalletConnect = async (
  connector,
  tx,
  onSuccess,
  onError,
  onGetTxHash = () => {}
) => {
  const state = store.getState();
  const web3 = state.api.common.web3;
  try {
    connector
      .sendTransaction(tx)
      .then(async (result) => {
        // Returns transaction id (hash)
        onGetTxHash(result);
        let receipt = null;
        do {
          receipt = await web3.eth.getTransactionReceipt(result);
        } while (receipt === null);
        if (receipt.status) {
          onSuccess(receipt);
        } else onError({ message: 'Transaction failed' });
      })
      .catch((error) => {
        console.log('error', error);
        // Error returned when rejected
        onError(error);
      });
  } catch {}
};

export const signTxViaWalletConnect = async (connector, tx, account) => {
  const msgParams = [
    account, // Required
    tx, // Required
  ];
  try {
    return connector
      .signTypedData(msgParams)
      .then((result) => {
        // Returns signed transaction
        // onSuccess(result);
        return result;
      })
      .catch((error) => {
        // Error returned when rejected
        // onError(error);
        console.error(error);
      });
  } catch (error) {
    console.log('sign error', error);
  }
};

export async function sendTxWalletConnect({
  contractMethods,
  params = '',
  amount = 0,
  spenderAddress,
  onTransactionHash = () => {},
  onSendSuccess = () => {},
  onSendFailed = () => {},
  account,
  provider,
  chainId,
}) {
  return new Promise((resolve, reject) => {
    let amountBN = '0';
    if (amount > 0) {
      amountBN = toWei(amount, 18);
    }

    const methodsData = contractMethods(...params).encodeABI();
    const txData = {
      from: account,
      to: spenderAddress || EDDA_ROUTER_BY_CHAIN[chainId],
      data: methodsData,
      value: amountBN,
      gas: '0x4C4B40',
    };
    sendTxViaWalletConnect(
      provider,
      txData,
      onSendSuccess,
      onSendFailed,
      onTransactionHash
    );
  });
}

export async function sendSignTxWalletConnect({
  contractMethods,
  params = '',
  amount = 0,
  data,
  onTransactionHash = () => {},
  onSendSuccess = () => {},
  onSendFailed = () => {},
  account,
  provider,
  chainId,
  spender,
}) {
  return new Promise(async (resolve, reject) => {
    let amountBN = '0';
    if (amount > 0) {
      amountBN = toWei(amount, 18);
    }
    try {
      const signedData = await signTxViaWalletConnect(provider, data, account);
      const { v, r, s } = splitSignature(signedData);
      const newParams = [...params, v, r, s];
      const methodsData = contractMethods(...newParams).encodeABI();
      const transaction = {
        from: account,
        to: spender ? spender : EDDA_ROUTER_BY_CHAIN[chainId],
        data: methodsData,
        value: amountBN,
      };
      sendTxViaWalletConnect(
        provider,
        transaction,
        onSendSuccess,
        onSendFailed,
        onTransactionHash
      );
    } catch (error) {
      console.log('error', error);
      if (onSendFailed) {
        onSendFailed(error);
      }
    }
  });
}
