import { formatEther, parseUnits, formatUnits } from "@ethersproject/units";

import { BigNumber } from "@ethersproject/bignumber";

export const parseToEther = (digits, bigInt) =>
  bigInt ? parseFloat(formatEther(bigInt)).toFixed(digits || 3) : 0;

export const parseByDecimals = (bigInt, decimals) => {
  return bigInt ? formatUnits(bigInt, decimals) : 0;
};

export const toWei = (amount, decimals) =>
  parseUnits(amount, decimals || "ether");

export const toPrice = (value, symbol) =>
  `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(value)} ${symbol}`;

// add 30%
export function calculateGasMargin(value) {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(3000)))
    .div(BigNumber.from(10000));
}
