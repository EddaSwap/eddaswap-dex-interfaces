import { getTxDeadline } from 'lib/timeHelper';
import { generateRouterContract, generateWETHContract } from 'lib/sdk/contract';
import { ETHER, WETH } from 'constants/tokens';
import { toWei } from 'lib/numberHelper';
import { sendTransaction } from 'lib/sendTransaction/v2';
import { ChainId } from '@sushiswap/sdk';

export function swapExactETHForTokens({
  toAddress,
  value,
  setLoading,
  amountOutMin,
  successMessage,
  router_address,
  dispatch,
  web3Context,
}) {
  const { chainId, account } = web3Context;
  const nativeWETH =
    chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];

  sendTransaction({
    contract: generateRouterContract(chainId),
    contractAddress: router_address,
    methods: 'swapExactETHForTokens',
    params: [
      amountOutMin,
      [nativeWETH.address, toAddress],
      account,
      getTxDeadline(chainId),
    ],
    value,
    setLoading,
    successMessage:
      successMessage || `Congrats! You have successfully swapped your token`,
    needCheckAllowance: false,
    dispatch,
    web3Context,
  });
}

export async function swapExactTokensForETH({
  fromAddress,
  setLoading,
  amountIn,
  amountOutMin,
  successMessage,
  router_address,
  dispatch,
  web3Context,
}) {
  const { chainId, account } = web3Context;
  const nativeWETH =
    chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];

  sendTransaction({
    contract: generateRouterContract(chainId),
    contractAddress: router_address,
    methods: 'swapExactTokensForETH',
    params: [
      amountIn,
      amountOutMin,
      [fromAddress, nativeWETH.address],
      account,
      getTxDeadline(chainId),
    ],
    value: 0,
    setLoading,
    successMessage:
      successMessage || `Congrats! You have successfully swapped your token`,
    dispatch,
    web3Context,
  });
}

export async function swapExactTokensForTokens({
  path = [],
  setLoading,
  amountIn,
  amountOutMin = 0,
  successMessage,
  router_address,
  dispatch,
  web3Context,
}) {
  const { account, chainId } = web3Context;
  sendTransaction({
    contract: generateRouterContract(chainId),
    contractAddress: router_address,
    methods: 'swapExactTokensForTokens',
    params: [amountIn, amountOutMin, path, account, getTxDeadline(chainId)],
    value: 0,
    setLoading,
    successMessage:
      successMessage || `Congrats! You have successfully swapped your token`,
    dispatch,
    web3Context,
  });
}

export function wrap({
  setLoading,
  amountIn,
  successMessage,
  dispatch,
  web3Context,
}) {
  const { chainId } = web3Context;
  const nativeWETH =
    chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];

  sendTransaction({
    contract: generateWETHContract(chainId),
    contractAddress: nativeWETH.address,
    methods: 'deposit',
    params: [],
    value: amountIn,
    setLoading,
    successMessage:
      successMessage || `Congrats! You have successfully wrapped your BNB`,
    needCheckAllowance: false,
    dispatch,
    web3Context,
  });
}

export function unwrap({
  setLoading,
  amountIn,
  successMessage,
  dispatch,
  web3Context,
}) {
  const { chainId } = web3Context;
  const nativeWETH =
    chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];

  sendTransaction({
    contract: generateWETHContract(chainId),
    contractAddress: nativeWETH.address,
    methods: 'withdraw',
    params: [toWei(amountIn, 18)],
    setLoading,
    successMessage:
      successMessage || `Congrats! You have successfully unwrapped your WBNB`,
    needCheckAllowance: false,
    dispatch,
    web3Context,
  });
}
