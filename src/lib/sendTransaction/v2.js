import { closeModal, openModal } from 'actions/app/modal';
import { openSnackbar } from 'actions/app/snackbar';
import { sendTxMetamask } from 'actions/contracts/metamask';
import { sendTxWalletConnect } from 'actions/contracts/walletConnect';
import TxHash from 'components/Modal/components/txHash';
import { sendSignTxMetamask } from 'actions/contracts/metamask';
import { sendSignTxWalletConnect } from 'actions/contracts/walletConnect';
import { EIP712Domain, Permit } from 'constants/contract';
import { EDDA_ROUTER_BY_CHAIN } from 'constants/address';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import store from 'stores';
import { toWei } from 'lib/numberHelper';

export function sendTransaction({
  contract,
  contractAddress,
  methods,
  params,
  value,
  setLoading,
  successMessage,
  onSendSuccess = () => {},
  dispatch = () => {},
  web3Context,
}) {
  const { library, chainId, account, connector } = web3Context;
  const contractMethods = contract.methods[methods];
  const state = store.getState();
  const web3 = state.api.common.web3;
  setLoading(true);

  const onTransactionHash = (txHash) => {
    setTimeout(() => {
      dispatch(closeModal());
    }, 3000);
    dispatch(openModal(<TxHash txHash={txHash} networkId={chainId} />));
  };

  const onSuccess = (receipe) => {
    onSendSuccess(receipe);

    setLoading(false);
    dispatch(
      openSnackbar(
        'success',
        successMessage || 'Successfully',
        receipe?.transactionHash
      )
    );
  };

  const onFailed = (err) => {
    setLoading(false);
    dispatch(closeModal());
    dispatch(openSnackbar('error', err.message, ''));
  };

  if (library.provider.isMetaMask) {
    sendTxMetamask({
      contractMethods: contractMethods,
      params,
      amount: value,
      contractAddress: contractAddress,
      onTransactionHash: onTransactionHash,
      onSendSuccess: onSuccess,
      account,
      chainId,
    })
      .then(onSuccess)
      .catch(onFailed);
  } else if (
    !(connector instanceof WalletConnectConnector) &&
    !(connector instanceof InjectedConnector) &&
    library
  ) {
    const methodData = contract.methods[methods](...params).encodeABI();
    let amountBN = '0';
    if (value > 0) {
      amountBN = toWei(value, 18);
    }
    const txData = {
      from: account,
      to: contractAddress,
      data: methodData,
      value: '0x' + parseInt(amountBN).toString(16),
    };
    library
      .getSigner(account)
      .sendTransaction({
        ...txData,
        // gasLimit: 500000,
      })
      .then(async (result) => {
        console.log('result', result);
        onTransactionHash(result);

        let receipt = null;
        do {
          receipt = await web3.eth.getTransactionReceipt(result.hash);
          console.log('receipt', receipt);
        } while (receipt === null);
        if (receipt) {
          onSuccess();
        } else {
          onFailed(result);
        }
      })
      .catch((error) => {
        console.log('error', error);
        onFailed(error);
      });
  } else {
    sendTxWalletConnect({
      contractMethods: contractMethods,
      params,
      amount: value,
      spenderAddress: contractAddress,
      onTransactionHash: onTransactionHash,
      onSendSuccess: onSuccess,
      onSendFailed: onFailed,
      account,
      provider: library.provider,
      chainId,
    });
  }
}

export function sendApprove({
  tokenAddress,
  tokenContract,
  spender,
  setLoading = '',
  successMessage = '',
  onSendSuccess = () => {},
  onSendFailed = () => {},
  dispatch,
  web3Context,
}) {
  try {
    sendTransaction({
      contract: tokenContract,
      contractAddress: tokenAddress,
      methods: 'approve',
      params: [
        spender,
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      ],
      setLoading,
      successMessage,
      onSendSuccess,
      onSendFailed,
      dispatch,
      web3Context,
    });
  } catch (error) {
    onSendFailed && onSendFailed(error);
  }
}

export async function sendSignTx({
  fromContract,
  toContract,
  methods,
  params,
  value = 0,
  amount,
  deadline,
  setLoading,
  dispatch = () => {},
  successMessage,
  onSendSuccess,
  lpTokenAddress,
  web3Context,
  spender,
}) {
  setLoading(true);
  const { library, account, chainId, connector } = web3Context;
  const contractMethods = toContract.methods[methods];

  const state = store.getState();
  const web3 = state.api.common.web3;

  const nonce = await fromContract.methods.nonces(account).call();

  const message = {
    owner: account,
    spender: spender ? spender : EDDA_ROUTER_BY_CHAIN[chainId],
    value: amount,
    nonce: '0x' + parseInt(nonce).toString(16),
    deadline,
  };

  const domain = {
    name: 'Edda LPs',
    version: '1',
    chainId,
    verifyingContract: lpTokenAddress,
  };

  const data = JSON.stringify({
    types: {
      EIP712Domain,
      Permit,
    },
    domain,
    primaryType: 'Permit',
    message,
  });

  const onTransactionHash = (txHash) => {
    setTimeout(() => {
      dispatch(closeModal());
    }, 3000);
    dispatch(openModal(<TxHash txHash={txHash} networkId={chainId} />));
  };

  const onSuccess = (receipe) => {
    onSendSuccess(receipe);
    //default: when tx confirmed, set loading state to false
    setLoading(false);
    dispatch(
      openSnackbar(
        'success',
        successMessage || 'Successfully',
        receipe?.transactionHash
      )
    );
  };

  const onFailed = (err) => {
    setLoading(false);
    dispatch(closeModal());
    dispatch(openSnackbar('error', err.message, ''));
  };

  if (library.provider.isMetaMask) {
    sendSignTxMetamask({
      contractMethods: contractMethods,
      params,
      amount: value,
      data,
      onTransactionHash: onTransactionHash,
      account,
      chainId,
      spender,
    })
      .then(onSuccess)
      .catch(onFailed);
  } else if (
    !(connector instanceof WalletConnectConnector) &&
    !(connector instanceof InjectedConnector) &&
    library
  ) {
    const methodData = toContract.methods[methods](...params).encodeABI();
    const txData = {
      from: account,
      to: toContract.address,
      data: methodData,
      value: value,
    };
    library
      .getSigner(account)
      .sendTransaction({
        ...txData,
        // gasLimit: 500000,
      })
      .then(async (result) => {
        onTransactionHash(result);

        let receipt = null;
        do {
          receipt = await web3.eth.getTransactionReceipt(result.hash);
          console.log('receipt', receipt);
        } while (receipt === null);
        if (receipt) {
          onSuccess();
        } else {
          onFailed(result);
        }
      })
      .catch((error) => {
        onFailed(error);
      });
  } else {
    sendSignTxWalletConnect({
      contractMethods: contractMethods,
      params,
      amount: value,
      data,
      onTransactionHash: onTransactionHash,
      onSendSuccess: onSuccess,
      onSendFailed: onFailed,
      account,
      provider: library.provider,
      chainId,
      spender,
    });
  }
}
