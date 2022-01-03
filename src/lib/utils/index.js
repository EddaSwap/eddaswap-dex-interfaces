import { getAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";
import store from "stores";

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value) {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export function getContract(address, ABI) {
  const state = store.getState();
  const web3 = state.api.common.web3;
  try {
    if (isAddress(address) || address !== AddressZero) {
      return new web3.eth.Contract(ABI, address);
    }
  } catch (err) {
    return `Invalid 'address' parameter '${address}'.`;
  }
}
