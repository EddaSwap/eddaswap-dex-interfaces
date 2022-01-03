import * as ABI from 'constants/abi';
import { ETHEREUM_MAINNET } from 'constants/address';
import { singleCallResult, generateLpTokenContract } from 'lib/sdk/contract';
import { web3 } from './web3';
import { fromWei } from 'lib/numberHelper';

export function getContract(address, ABI) {
  try {
    return new web3.eth.Contract(ABI, address);
  } catch (err) {
    return `Invalid 'address' parameter '${address}'.`;
  }
}

export async function loadEDDAStaking() {
  try {
    const eddaPoolContract = getContract(
      ETHEREUM_MAINNET.EDDA_POOL,
      ABI.EDDA_POOL
    );
    const eddaPoolTotalSupply = await singleCallResult(
      eddaPoolContract,
      'totalSupply'
    );
    return fromWei(eddaPoolTotalSupply, 18);
  } catch (error) {
    return '0';
  }
}

export async function loadEDDANFTStaking() {
  try {
    const eddaPoolContract = getContract(
      ETHEREUM_MAINNET.EDDA_NFT_POOL,
      ABI.EDDA_NFT_POOL
    );
    const eddaPoolTotalSupply = await singleCallResult(
      eddaPoolContract,
      'totalSupply'
    );
    return fromWei(eddaPoolTotalSupply, 18);
  } catch (error) {
    return '0';
  }
}

export async function loadEDDALPNFT() {
  try {
    const eddaPoolContract = getContract(
      ETHEREUM_MAINNET.EDDA_LP_NFT,
      ABI.EDDA_LP_NFT_ABI
    );
    const eddaPoolTotalSupply = await singleCallResult(
      eddaPoolContract,
      'totalSupply'
    );
    return fromWei(eddaPoolTotalSupply, 18);
  } catch (error) {
    return '0';
  }
}

export async function loadEDDAUNIReward() {
  try {
    const eddaPoolContract = getContract(
      ETHEREUM_MAINNET.EDDA_UNI_REWARD,
      ABI.EDDA_UNI_REWARD_ABI
    );
    const eddaPoolTotalSupply = await singleCallResult(
      eddaPoolContract,
      'totalSupply'
    );
    return fromWei(eddaPoolTotalSupply, 18);
  } catch (error) {
    return '0';
  }
}

export async function loadEDDALPTokenTotalSupply() {
  try {
    const eddaLpTokenContract = getContract(
      ETHEREUM_MAINNET.EDDA_LP_TOKEN,
      ABI.EDDA_ETH_LP_TOKEN
    );
    const eddaLpTokenTotalSupply = await singleCallResult(
      eddaLpTokenContract,
      'totalSupply'
    );
    return fromWei(eddaLpTokenTotalSupply, 18);
  } catch (error) {
    return '0';
  }
}

export async function loadEDDALPTokenResevers() {
  try {
    const eddaLpTokenContract = getContract(
      ETHEREUM_MAINNET.EDDA_LP_TOKEN,
      ABI.EDDA_ETH_LP_TOKEN
    );
    const reserves = await singleCallResult(eddaLpTokenContract, 'getReserves');
    // console.log('reserves', reserves);
    return reserves;
    // return fromWei(eddaLpTokenTotalSupply, 18);
  } catch (error) {
    return '0';
  }
}
