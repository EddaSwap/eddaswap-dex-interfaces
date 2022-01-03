import { TradeType, ETHER } from "@eddaswap/sdk";
import { calculateAmount } from "lib/sdkHelper";
import { WBNB } from "constants/tokens";
import { times, minus, dividedBy, formattedAmount } from "lib/numberHelper";
import _ from "lodash";

export function onTokenClick(tokenState) {
  this.props.openModal(this.renderSelectTokenModal(tokenState));
}

export function onSettingClick() {
  this.props.openModal(this.renderSettingsModal());
}

export async function onChangeFromAmount(value) {
  const amountIn = value;
  this.setState({ amountIn });
  if (amountIn > 0) {
    this.calculateToAmount(value);
  } else {
    this.setState({ amountOut: 0 });
  }
}

export function onChangeToAmount(value) {
  const amountOut = value;
  this.setState({ amountOut });
  if (amountOut > 0) {
    this.calculateFromAmount(value);
  } else {
    this.setState({ amountIn: 0 });
  }
}

export async function calculateFromAmount(amountOut) {
  const { fromToken, toToken } = this.state;
  const { loadedData, slippage } = this.props;
  if (loadedData && amountOut && !_.isEmpty(fromToken) && !_.isEmpty(toToken)) {
    try {
      const data = await calculateAmount({
        tokenInput: fromToken,
        tokenOutput: toToken,
        tradeType: TradeType.EXACT_OUTPUT,
        amount: amountOut,
        slippage,
      });

      this.setState({
        ...data,
        amountIn: formattedAmount(data.amountIn, 7),
        amountOutMin: times(amountOut, minus(1, dividedBy(slippage, 100))),
      });
    } catch (error) {
      this.setState({
        amountIn: 0,
        amountInMax: 0,
        priceImpact: 0,
        tokenAPoolBalance: 0,
        tokenBPoolBalance: 0,
      });
    }
  }
}

export async function calculateToAmount(amountIn) {
  const { fromToken, toToken } = this.state;
  const { loadedData, slippage } = this.props;
  if (loadedData && amountIn && !_.isEmpty(fromToken) && !_.isEmpty(toToken)) {
    try {
      const data = await calculateAmount({
        tokenInput: fromToken,
        tokenOutput: toToken,
        tradeType: TradeType.EXACT_INPUT,
        amount: amountIn,
        slippage,
      });
      this.setState({
        ...data,
        amountOut: formattedAmount(data.amountOut, 7),
      });
    } catch {
      this.setState({
        amountOut: 0,
        amountOutMin: 0,
        priceImpact: 0,
        tokenAPoolBalance: 0,
        tokenBPoolBalance: 0,
      });
    }
  }
}

export function onMaxBtnClick(balance) {
  this.setState({ amountIn: balance });
  if (balance > 0) {
    this.calculateToAmount(balance);
  }
}

//is either wrap or unwrap: return true
export function isWrapUnwrap(tokenA, tokenB) {
  const isWrap = _.isEqual(tokenA, ETHER) && _.isEqual(tokenB, WBNB);
  const isUnwrap = _.isEqual(tokenA, WBNB) && _.isEqual(tokenB, ETHER);
  return isUnwrap || isWrap;
}
