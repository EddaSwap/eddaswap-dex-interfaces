import {
  generateLpTokenContract,
  generateRouterContract,
  generateTokenContract,
} from "lib/sdk/contract";
import { TradeType, ETHER } from "@eddaswap/sdk";
import { BUSD, WBNB } from "constants/tokens";
import ConfirmModal from "./components/ConfirmModal";
import ConfirmRemoveModal from "./components/ConfirmRemoveModal";
import WaitingConfirmModal from "./components/WaitingForConfirmModal";
import CreatePoolModal from "./components/CreatePoolModal";
import {
  dividedBy,
  times,
  calculateTokenDesired,
  toWei,
  formattedAmount,
} from "lib/numberHelper";
import { calculateAmountLiquidity } from "lib/sdkHelper";
import _ from "lodash";
import { ROUTER_ADDRESS } from "constants/address";
import { generatePair } from "lib/sdk/pair";

export function onSelectToken(type, item) {
  const { history } = this.props;
  const { amountIn, amountOut, fromToken, toToken } = this.state;
  const { address1, address2 } = this.props.match?.params;
  const defaultToken = BUSD;

  //if this item is BNB, push BNB instead of address
  const params = item.symbol === "BNB" ? "BNB" : item.address;

  //close select token modal
  this.props.closeModal();

  if (type === "from") {
    if (item?.symbol !== toToken?.symbol) {
      this.setState({ fromToken: item }, () =>
        this.calculateToAmount(amountIn)
      );
      history.push(address2 ? `/add/${params}/${address2}` : `/add/${params}`);
    }
    //when user chose fromToken duplicate with toToken, change toToken
    if (item?.symbol === toToken?.symbol) {
      //if item is default symbol, change toToken to wbnb
      if (item.symbol === defaultToken.symbol) {
        this.setState({ toToken: ETHER, amountIn: amountOut }, () =>
          this.calculateToAmount(this.state.amountIn)
        );
        history.push(`/add/${params}/BNB`);
      } else {
        history.push(`/add/${params}/${defaultToken.address}`);
        this.setState({ toToken: defaultToken, amountIn: amountOut }, () =>
          this.calculateToAmount(this.state.amountIn)
        );
      }
    }
  }
  if (type === "to") {
    if (item?.symbol !== fromToken?.symbol) {
      this.setState({ toToken: item }, () =>
        this.calculateFromAmount(amountOut)
      );
      history.push(`/add/${address1}/${params}`);
    }
    //when user choose toToken duplicate with fromToken, change fromToken
    if (item?.symbol === fromToken?.symbol) {
      //if item is edda, change fromToken to wbnb
      if (item.symbol === defaultToken.symbol) {
        history.push(`/add/BNB/${params}`);
        this.setState({ fromToken: ETHER, amountOut: amountIn }, () =>
          this.calculateFromAmount(this.state.amountOut)
        );
      } else {
        history.push(`/add/${defaultToken.address}/${params}`);
        this.setState({ fromToken: defaultToken, amountOut: amountIn }, () =>
          this.calculateFromAmount(this.state.amountOut)
        );
      }
    }
  }
}

export function onMaxFromBtnClick(balance) {
  this.setState({ amountIn: balance });
  if (balance > 0) {
    this.calculateToAmount(balance);
  }
}

export function onMaxToBtnClick(balance) {
  this.setState({ amountOut: balance });
  if (balance > 0) {
    this.calculateFromAmount(balance);
  }
}

export function onConfirmAddBtnClicked() {
  const { amountIn, amountOut, fromToken, toToken, noLiquidity } = this.state;
  const { slippage } = this.props;
  this.setState({ loading: true });
  const fromContract = generateTokenContract(fromToken.address);
  const toContract = generateTokenContract(toToken.address);

  const onSendSuccess = async () => {
    const pair = await generatePair([fromToken, toToken]);
    this.props.userImportPool(pair);
    this.props.history?.push("/addLiquid");
  };
  const successMessage = `Add ${formattedAmount(amountIn)} ${
    fromToken?.symbol
  } and ${formattedAmount(amountOut)} ${toToken?.symbol}`;

  if (fromToken.symbol !== "BNB" && toToken.symbol !== "BNB") {
    this.addLiquidity({
      toContract: generateRouterContract(),
      fromAddress: fromToken.address,
      toAddress: toToken.address,
      loadingState: "loading",
      amountADesired: toWei(amountIn, fromToken.decimals),
      amountBDesired: toWei(amountOut, toToken.decimals),
      amountAMin: noLiquidity
        ? "0"
        : calculateTokenDesired(slippage, amountIn, fromToken.decimals),
      amountBMin: noLiquidity
        ? "0"
        : calculateTokenDesired(slippage, amountOut, toToken.decimals),
      onSendSuccess,
      successMessage,
    });
  } else if (fromToken.symbol === "BNB") {
    this.addLiquidityETH({
      toContract: generateRouterContract(),
      toAddress: toToken.address,
      fromAddress: toToken.address,
      loadingState: "loading",
      amountTokenDesired: toWei(amountOut, toToken.decimals),
      amountTokenMin: noLiquidity
        ? "0"
        : calculateTokenDesired(slippage, amountOut, toToken.decimals),
      amountETHMin: noLiquidity
        ? "0"
        : calculateTokenDesired(slippage, amountIn, 18),
      value: amountIn,
      onSendSuccess,
      successMessage,
    });
  } else if (toToken.symbol === "BNB") {
    this.addLiquidityETH({
      toContract: generateRouterContract(),
      toAddress: toToken.address,
      fromAddress: fromToken.address,
      loadingState: "loading",
      amountTokenDesired: toWei(amountIn, fromToken.decimals),
      amountTokenMin: noLiquidity
        ? "0"
        : calculateTokenDesired(slippage, amountIn, toToken.decimals),
      amountETHMin: noLiquidity
        ? "0"
        : calculateTokenDesired(slippage, amountOut, 18),
      value: amountOut,
      onSendSuccess,
      successMessage,
    });
  }
  this.props.openModal(
    <WaitingConfirmModal {...this.state} actionText="Supplying" />
  );
  // }
}

export function onAddBtnClicked() {
  this.props.openModal(
    <ConfirmModal {...this.state} onConfirm={this.onConfirmAddBtnClicked} />
  );
}

export function onCreatePoolBtnClicked() {
  this.props.openModal(
    <CreatePoolModal {...this.state} onConfirm={this.onConfirmAddBtnClicked} />
  );
}

export function onRemoveBtnClicked() {
  this.props.openModal(
    <ConfirmRemoveModal
      {...this.state}
      onConfirm={this.onConfirmRemoveBtnClicked}
    />
  );
}

export function onConfirmRemoveBtnClicked() {
  try {
    const { pair, removeAmount, percentAmount, receiveETH, amountA, amountB } =
      this.state;
    const { slippage } = this.props;

    const token0IsWBNB = _.isEqual(WBNB, pair?.token0);
    const token1IsWBNB = _.isEqual(WBNB, pair?.token1);
    this.setState({ loading: true });

    const fromContract = generateLpTokenContract(pair.liquidityToken.address);
    const amount =
      percentAmount === 100
        ? toWei(removeAmount, 18)
        : toWei(times(removeAmount, dividedBy(percentAmount, 100)), 18);
    const amountAMin = calculateTokenDesired(
      slippage,
      times(amountA, dividedBy(percentAmount, 100)),
      pair?.token0?.decimals
    );
    const amountBMin = calculateTokenDesired(
      slippage,
      times(amountB, dividedBy(percentAmount, 100)),
      pair?.token1?.decimals
    );
    const onSendSuccess = () => {
      this.loadLiquidityfromUrl && this.loadLiquidityfromUrl();
      this.props.history?.push("/addLiquid");
    };
    const successMessage = `Remove ${formattedAmount(
      times(amountA, dividedBy(percentAmount, 100))
    )} ${pair?.token0?.symbol} and ${formattedAmount(
      times(amountB, dividedBy(percentAmount, 100))
    )} ${pair?.token1?.symbol}`;

    if (receiveETH && (token0IsWBNB || token1IsWBNB)) {
      this.removeLiquidityETH({
        fromContract: fromContract,
        lpTokenAddress: pair.liquidityToken.address,
        toContract: generateRouterContract(),
        tokenAddress: token0IsWBNB ? pair.token1.address : pair.token0.address,
        amountTokenMin: token0IsWBNB ? amountBMin : amountAMin,
        amountETHMin: token0IsWBNB ? amountAMin : amountBMin,
        loadingState: "loading",
        amount: amount,
        onSendSuccess,
        successMessage,
      });
    } else {
      this.removeLiquidity({
        fromContract: fromContract,
        toContract: generateRouterContract(),
        lpTokenAddress: pair.liquidityToken.address,
        tokenAddressA: pair.token0.address,
        tokenAddressB: pair.token1.address,
        amountTokenAMin: amountAMin,
        amountTokenBMin: amountBMin,
        loadingState: "loading",
        amount: amount,
        onSendSuccess,
        successMessage,
      });
    }
    const { token0, token1 } = pair;
    this.props.openModal(
      <WaitingConfirmModal
        {...this.state}
        actionText="Removing"
        fromToken={token0}
        toToken={token1}
        amountIn={dividedBy(times(percentAmount, amountA), 100)}
        amountOut={dividedBy(times(percentAmount, amountB), 100)}
      />
    );
  } catch (error) {
    console.error("Failed to remove", error);
  }
}

export async function onChangeFromAmount(value) {
  const amountIn = value;
  const { noLiquidity } = this.state;
  this.setState({ amountIn });

  //if is no liquidity, user can set the rate => do nothing
  if (noLiquidity) {
  } else if (amountIn > 0) {
    this.calculateToAmount(value);
  } else {
    this.setState({ amountOut: 0 });
  }
}

export function onChangeToAmount(value) {
  const amountOut = value;
  const { noLiquidity } = this.state;
  this.setState({ amountOut });

  //if is no liquidity, user can set the rate => do nothing
  if (noLiquidity) {
  } else if (amountOut > 0) {
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
      const data = await calculateAmountLiquidity({
        tokenInput: fromToken,
        tokenOutput: toToken,
        tradeType: TradeType.EXACT_OUTPUT,
        amount: amountOut,
        slippage,
      });
      this.setState({
        ...data,
        amountIn: formattedAmount(data.amountIn, 7),
      });
      this.setState(data);
    } catch (error) {}
  }
}

export async function calculateToAmount(amountIn) {
  const { fromToken, toToken } = this.state;
  const { loadedData, slippage } = this.props;

  if (loadedData && amountIn && !_.isEmpty(fromToken) && !_.isEmpty(toToken)) {
    try {
      const data = await calculateAmountLiquidity({
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
    } catch {}
  }
}

export function onApproveAClicked() {
  const { fromToken } = this.state;
  const { isConnected, account } = this.props;
  const fromContract = generateTokenContract(fromToken?.address);

  if (isConnected) {
    this.sendApprove({
      tokenAddress: fromToken.address,
      tokenContract: fromContract,
      spender: ROUTER_ADDRESS,
      owner: account,
      loadingState: "approvingA",
      successMessage: `Approve ${fromToken?.symbol}`,
    });
  }
}

export function onApproveBClicked() {
  const { toToken } = this.state;
  const { isConnected, account } = this.props;
  const fromContract = generateTokenContract(toToken?.address);

  if (isConnected) {
    this.sendApprove({
      tokenAddress: toToken.address,
      tokenContract: fromContract,
      spender: ROUTER_ADDRESS,
      owner: account,
      loadingState: "approvingB",
      successMessage: `Approve ${toToken?.symbol}`,
    });
  }
}
