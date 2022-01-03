import { Decimal } from 'decimal.js';
import Web3 from 'web3';

import { formatEther, parseUnits, formatUnits } from '@ethersproject/units';

import { BigNumber } from '@ethersproject/bignumber';

const web3 = new Web3();

const DECIMALS_UNIT = {
  // 0: 'noether',
  // 1: 'wei',
  // 3: 'kwei',
  6: 'Mwei',
  // 8: ''
  18: 'ether',
};

export const parseByDecimals = (number, decimals) => {
  try {
    const bigInt = BigNumber.from(number);
    if (bigInt) {
      return formatUnits(bigInt, decimals);
    }
    return BigNumber.from(0);
    // bigInt ? formatUnits(bigInt, decimals) : 0
  } catch (e) {
    console.log('failed to parse by decimals', e);
    return BigNumber.from(0);
  }
};

export const parseToWei = (ammount, decimals) => {
  try {
    // const bigInt = BigNumber.from(ammount);

    if (ammount) {
      return parseUnits(truncate(ammount, decimals - 2), decimals || 'ether');
    }
    return BigNumber.from(0);
  } catch (e) {
    console.log('failed to parse to wei', e);
    return BigNumber.from(0);
  }
};

export function truncate(value, places) {
  try {
    //get places decimals
    const parsedNumber = parseFloat(value).toFixed(places + 1);
    const str = parsedNumber?.toString() || '';
    const re = new RegExp('(\\d+\\.\\d{' + places + '})(\\d)');
    const m = str.match(re);
    return m ? m[1] : str;
  } catch (error) {
    console.error('Fail to formatted amount', error);
    return value;
  }
}

export function formattedAmount(value, digits) {
  try {
    const numberFixed = parseFloat(value);
    if (!greaterThan(value, 0)) {
      return value;
    }
    if (lessThan(value, '1e-7')) {
      return truncate(value, 10);
    }
    if (lessThan(value, '1e-5')) {
      return truncate(value, 7);
    }
    return truncate(numberFixed, digits || 5);
  } catch (error) {
    console.error('Fail to formatted amount', error);
    return value;
  }
}

export function toWei(number, decimals = 18) {
  const precision = decimals > 2 ? decimals - 2 : decimals;
  try {
    const parsedNumber = parseToWei(
      truncate(number.toString(), precision),
      decimals
    );
    return parsedNumber.toString() || '0';
  } catch (err) {
    console.log('towei error', err);
    return '0';
  }
}

export function fromWei(number, decimals) {
  try {
    const parsedNumber = parseByDecimals(number.toString(), decimals);
    return parsedNumber || '0';
  } catch (err) {
    console.log('fromwei error', err);
    return '0';
  }
}

export function calculateTokenDesired(slippage, amount, decimals) {
  try {
    return toWei(
      times(minus(1, dividedBy(slippage, 100)), formattedAmount(amount)),
      decimals
    );
  } catch (err) {
    return '0';
  }
}

//check if number0 is less than number1
export function isLessThan(number0, number1) {
  try {
    return parseFloat(number0) < parseFloat(number1);
  } catch (err) {}
}

export function lessThan(valueA, valueB) {
  try {
    const valA = new Decimal(valueA);
    const valB = new Decimal(valueB);
    return valA.lt(valB);
  } catch (e) {
    return false;
  }
}

export function lessThanEqual(valueA, valueB) {
  try {
    const valA = new Decimal(valueA);
    const valB = new Decimal(valueB);
    return valA.lte(valB);
  } catch (e) {
    return false;
  }
}

export function greaterThan(valueA, valueB) {
  try {
    const valA = new Decimal(valueA);
    const valB = new Decimal(valueB);
    return valA.gt(valB);
  } catch (e) {
    return false;
  }
}

export function greaterThanEqual(valueA, valueB) {
  try {
    const valA = new Decimal(valueA);
    const valB = new Decimal(valueB);
    return valA.gte(valB);
  } catch (e) {
    return false;
  }
}

export function times(valueA, valueB) {
  try {
    const x = new Decimal(valueA);
    const y = new Decimal(valueB);
    return x.times(y).toNumber();
  } catch (e) {
    return '';
  }
}

export function plus(valueA, valueB) {
  try {
    const x = new Decimal(valueA);
    const y = new Decimal(valueB);
    return x.plus(y).toNumber();
  } catch (e) {
    return '';
  }
}

export function minus(valueA, valueB) {
  try {
    const x = new Decimal(valueA);
    const y = new Decimal(valueB);
    return x.minus(y).toNumber();
  } catch (e) {
    return '';
  }
}

export function dividedBy(valueA, valueB) {
  try {
    const x = new Decimal(valueA);
    const y = new Decimal(valueB);
    return x.dividedBy(y).toNumber();
  } catch (e) {
    return '';
  }
}

export function equal(valueA, valueB) {
  try {
    const valA = new Decimal(valueA);
    const valB = new Decimal(valueB);
    return valA.eq(valB);
  } catch (e) {
    return false;
  }
}
