import { dividedBy, times, plus } from 'lib/numberHelper';
import store from 'stores';
import { ChainId } from '@sushiswap/sdk';

export function getUnixTimestamp() {
  return Math.floor(Date.now() / 1000);
}

const BUFFER_SECS_POLYGON = 20 * 60;

export function getTxDeadline(chainId) {
  const unixTimeInSec = getUnixTimestamp();
  try {
    const state = store.getState();
    const secondsTxDeadline = state.api.settings.secondsTxDeadline;
    if (chainId === ChainId.MATIC) {
      return !!secondsTxDeadline
        ? plus(unixTimeInSec, secondsTxDeadline + BUFFER_SECS_POLYGON)
        : plus(unixTimeInSec, 120 + BUFFER_SECS_POLYGON);
    }
    return !!secondsTxDeadline
      ? plus(unixTimeInSec, secondsTxDeadline)
      : plus(unixTimeInSec, 120);
  } catch {
    return plus(unixTimeInSec, 120);
  }
}

export function secondsToMinutes(seconds = 0) {
  try {
    return dividedBy(seconds, 60);
  } catch {
    return 0;
  }
}

export function minutesToSeconds(minutes = 0) {
  try {
    return times(minutes, 60);
  } catch {
    return 0;
  }
}
