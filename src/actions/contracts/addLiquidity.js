import { getTxDeadline } from 'lib/timeHelper';
import { EDDA_ROUTERS } from 'constants/address';
import { sendTransaction, sendSignTx } from 'lib/sendTransaction/v2';

export async function addLiquidity({
  toContract,
  toAddress,
  fromAddress,
  amountADesired,
  amountBDesired,
  amountAMin = 0,
  amountBMin = 0,
  setLoading,
  successMessage,
  onSendSuccess = () => {},
  dispatch,
  web3Context,
  version,
}) {
  const { account, chainId } = web3Context;
  const sendTxAddLiquidity = () => {
    sendTransaction({
      contract: toContract,
      contractAddress: EDDA_ROUTERS[version][chainId],
      methods: 'addLiquidity',
      params: [
        fromAddress,
        toAddress,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        account,
        getTxDeadline(chainId),
      ],
      onSendSuccess,
      setLoading,
      dispatch,
      successMessage:
        successMessage ||
        `Congrats! You have successfully added token to liquidity`,
      web3Context,
    });
  };

  sendTxAddLiquidity();
}

export async function addLiquidityETH({
  toContract,
  toAddress,
  tokenAddress,
  amountTokenDesired,
  amountTokenMin,
  amountETHMin,
  setLoading,
  dispatch,
  value,
  successMessage,
  onSendSuccess = () => {},
  web3Context,
  version,
}) {
  const { account, chainId } = web3Context;
  const sendTxAddLiquidityETH = () => {
    sendTransaction({
      contract: toContract,
      contractAddress: EDDA_ROUTERS[version][chainId],
      methods: 'addLiquidityETH',
      params: [
        tokenAddress,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        account,
        getTxDeadline(chainId),
      ],
      setLoading,
      dispatch,
      value,
      successMessage:
        successMessage ||
        `Congrats! You have successfully added token to liquidity`,
      onSendSuccess,
      web3Context,
    });
  };

  sendTxAddLiquidityETH();
}

export async function removeLiquidityETH({
  fromContract,
  toContract,
  tokenAddress,
  lpTokenAddress,
  amount,
  amountTokenMin = 0,
  amountETHMin = 0,
  approveMax = false,
  setLoading,
  dispatch,
  value,
  successMessage,
  onSendSuccess = () => {},
  web3Context,
  version,
}) {
  const { account, chainId } = web3Context;

  const sendTxRemoveLiquidityETH = () => {
    sendSignTx({
      fromContract,
      toContract,
      methods: 'removeLiquidityETHWithPermit',
      params: [
        tokenAddress,
        amount,
        amountTokenMin,
        amountETHMin,
        account,
        getTxDeadline(chainId),
        approveMax,
      ],
      deadline: getTxDeadline(chainId),
      setLoading,
      dispatch,
      lpTokenAddress,
      value,
      amount,
      successMessage:
        successMessage ||
        `Congrats! You have successfully remove lp token from liquidity`,
      onSendSuccess,
      web3Context,
      spender: EDDA_ROUTERS[version][chainId],
    });
  };
  sendTxRemoveLiquidityETH();
}

export async function removeLiquidity({
  fromContract,
  toContract,
  tokenAddressA,
  tokenAddressB,
  lpTokenAddress,
  amount,
  amountTokenAMin = 0,
  amountTokenBMin = 0,
  approveMax = false,
  setLoading,
  dispatch,
  value,
  successMessage,
  onSendSuccess,
  web3Context,
  version,
}) {
  const { account, chainId } = web3Context;
  const sendTxRemoveLiquidity = () => {
    sendSignTx({
      fromContract,
      toContract,
      methods: 'removeLiquidityWithPermit',
      params: [
        tokenAddressA,
        tokenAddressB,
        amount,
        amountTokenAMin,
        amountTokenBMin,
        account,
        getTxDeadline(chainId),
        approveMax,
      ],
      deadline: getTxDeadline(chainId),
      setLoading,
      dispatch,
      lpTokenAddress,
      value,
      amount,
      successMessage:
        successMessage ||
        `Congrats! You have successfully remove lp token from liquidity`,
      needCheckAllowance: false,
      onSendSuccess,
      web3Context,
      spender: EDDA_ROUTERS[version][chainId],
    });
  };
  sendTxRemoveLiquidity();
}
