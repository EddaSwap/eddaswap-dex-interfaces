import { TokenAmount } from '@eddaswap/sdk';
import { ChainId } from '@sushiswap/sdk';
import {
  EDDA_ROUTERS,
  EDDA_VESTING_BY_CHAIN,
  NFT_ADDRESS,
} from 'constants/address';
import { SDK, WETH } from 'constants/tokens';
import { fromWei } from 'lib/numberHelper';
import { getContract } from 'lib/utils';
import store from 'stores';
import { ABI, ROUTER_VERSION } from '../../constants';
import { EDDA_ROUTER_ABI } from '../../constants/abi';

export function generateTokenContract(address) {
  try {
    return getContract(address, ABI.ERC20_ABI);
  } catch (error) {
    console.error('Failed to get contract', error);
    return null;
  }
}

export function generateRouterContract(
  chainId = ChainId.BSC,
  version = ROUTER_VERSION.v1
) {
  try {
    const routerAddress = EDDA_ROUTERS[version][chainId];
    return getContract(routerAddress, EDDA_ROUTER_ABI[version]);
  } catch (error) {
    console.error('Failed to get contract', error);
    return null;
  }
}

export function generateVestingContract(chainId = ChainId.BSC) {
  try {
    const vestingAddress = EDDA_VESTING_BY_CHAIN[chainId];
    return getContract(vestingAddress, ABI.EDDA_VESTING);
  } catch (error) {
    console.error('Failed to get contract', error);
    return null;
  }
}

export function generateNFTsContract() {
  try {
    return getContract(NFT_ADDRESS, ABI.EDDA_NFT);
  } catch (error) {
    console.error('Failed to get contract', error);
    return null;
  }
}

export function generateLpTokenContract(address) {
  try {
    return getContract(address, ABI.EDDA_LP_TOKEN_ABI);
  } catch (error) {
    console.error('Failed to get contract', error);
    return null;
  }
}

export function generateWETHContract(chainId) {
  const abi = chainId === ChainId.MATIC ? ABI.WMATIC_ABI : ABI.WBNB_ABI;
  try {
    return getContract(WETH[chainId].address, abi);
  } catch (error) {
    console.error('Failed to get contract', error);
    return null;
  }
}

export function generateNFTStakingContract(address) {
  try {
    return getContract(address, ABI.EDDA_STAKING_NFT_ABI);
  } catch (error) {
    console.error('Failed to get contract', error);
    return null;
  }
}

export async function singleCallResult(contract, method, inputs) {
  try {
    const contractMethods = contract.methods[method];
    const result =
      inputs && Array.isArray(inputs)
        ? await contractMethods(...inputs).call()
        : inputs
        ? await contractMethods(inputs).call()
        : await contractMethods().call();
    return result;
  } catch (error) {
    // console.error('Failed to call contract', error)
    return null;
  }
}

export async function getBalanceOf(contract, address) {
  if (address) {
    const balance = await singleCallResult(contract, 'balanceOf', address);
    const decimals = await singleCallResult(contract, 'decimals');

    return fromWei(balance, decimals);
  } else return '0';
}

//get earned samurai nft
export async function getEarned(contract, address) {
  try {
    if (address) {
      const earned = await singleCallResult(contract, 'earned', address);
      return fromWei(earned, 18);
    } else return '0';
  } catch {
    return '0';
  }
}

//get balance staked nft
export async function getStakedBalance(contract, address, lpTokenAddress) {
  try {
    if (address) {
      const balance = await singleCallResult(contract, 'balance', [
        address,
        lpTokenAddress,
      ]);
      return fromWei(balance, 18);
    } else return '0';
  } catch {
    return '0';
  }
}

export async function getBalanceWithDecimals(contract, address) {
  const balance = await singleCallResult(contract, 'balanceOf', address);
  return balance || '0';
}

export async function getTokenBalance(address, account) {
  const contract = generateTokenContract(address);
  const balance = await getBalanceOf(contract, account);
  return balance;
}

export async function getLpTokenBalance(address, account, chainId = 56) {
  try {
    const state = store.getState();
    const web3 = state.api.common.web3;
    const contract = new web3.eth.Contract(ABI.EDDA_LP_TOKEN_ABI, address);

    const { Token } = SDK[chainId];
    // const contract = generateLpTokenContract(address);
    // const token = await generateLpToken(address, chainId);
    const decimals = await singleCallResult(contract, 'decimals');
    const name = await singleCallResult(contract, 'name');
    const symbol = await singleCallResult(contract, 'symbol');

    const token = new Token(
      chainId,
      address,
      decimals ? decimals : 18,
      symbol,
      name
    );

    const balance = await contract.methods.balanceOf(account).call();
    // const parsedBalance = fromWei(balance, 18);
    return new TokenAmount(token, balance);
  } catch (err) {
    console.error('Fail to get LP Token balance', err);
  }
}

export async function getCurrencyBalance(currency, account) {
  const state = store.getState();
  const web3 = state.api.common.web3;
  try {
    if (!currency.address) {
      const balanceInWei = await web3.eth.getBalance(account);
      const balance = fromWei(balanceInWei);
      return balance;
    } else {
      const balance = await getTokenBalance(currency.address, account);
      return balance;
    }
  } catch (error) {
    console.error('Fail to get currency balance', error);
  }
}

//vesting contract
export async function getUserLockInfor(account, chainId) {
  try {
    const vestingContract = generateVestingContract(chainId);

    const userLockCounts = await singleCallResult(
      vestingContract,
      'userLockCounts',
      account
    );
    let userLockInfor = [];
    for (let i = 0; i < parseInt(userLockCounts); i++) {
      const lockInfo = await singleCallResult(
        vestingContract,
        'userLockInfor',
        [account, i]
      );

      userLockInfor.push({
        amount: fromWei(lockInfo._amount, 18),
        lockTime: lockInfo._lockTime,
        token: lockInfo._token,
        withdrawnTime: lockInfo._withDrawnTime,
        id: i,
        isUnlocked: lockInfo.isUnlocked,
      });
    }
    return {
      userLockCounts,
      userLockInfor,
    };
  } catch {}
}
