import { fromWei } from "lib/numberHelper";
import store from "stores";

export const getToken = (tokenAddress) => {
  try {
    const state = store.getState();
    const tokenList = state.api.token.topToken;
    const token = tokenList.find((item) => item.address === tokenAddress);
    return token;
  } catch {
    return {};
  }
};

export const checkAllowance = ({ fromContract, toAddress, account }) => {
  return new Promise(async (resolve, reject) => {
    const allowance = await fromContract.methods
      .allowance(account, toAddress)
      .call();
    resolve(allowance);
  });
};

export async function getBalanceOf(contract, decimals, address) {
  return new Promise(async (resolve, reject) => {
    try {
      const balanceWithDecimal = await contract.methods
        .balanceOf(address)
        .call();
      const balance = fromWei(balanceWithDecimal, decimals);
      resolve(balance);
    } catch (err) {
      console.log("err", err);
      resolve(0); //if can not get balance, return balance = 0
    }
  });
}
