import { ETHER } from '@eddaswap/sdk';
import { ROUTER_ADDRESS } from 'constants/address';
import { BUSD } from 'constants/tokens';
import { formattedAmount, toWei } from 'lib/numberHelper';
import { generateTokenContract } from 'lib/sdk/contract';
import ConfirmModal from './components/ConfirmModal';
import WaitingConfirmModal from './components/WaitingForConfirmModal';

export function onSelectToken(tokenState, item) {
  const { amountIn, amountOut, fromToken, toToken } = this.state;
  const defaultToken = BUSD;
  this.props.closeModal();
  // this.setState({ [tokenState]: item }, () => {
  if (tokenState === 'fromToken') {
    //if from token duplicate with toToken, set from token = item, change to token to others
    if (item?.symbol === toToken?.symbol) {
      if (item?.symbol === defaultToken?.symbol) {
        this.setState({ toToken: ETHER, fromToken: item }, () =>
          this.calculateFromAmount(amountOut)
        );
      } else
        this.setState({ toToken: defaultToken, fromToken: item }, () =>
          this.calculateFromAmount(amountOut)
        );
    }
    //calculate another input amount
    if (item?.symbol !== toToken?.symbol) {
      this.setState({ fromToken: item }, () =>
        this.calculateFromAmount(amountOut)
      );
    }
  }
  if (tokenState === 'toToken') {
    if (item.symbol === fromToken.symbol) {
      if (item.symbol === defaultToken.symbol) {
        this.setState({ fromToken: ETHER, toToken: item }, () =>
          this.calculateToAmount(amountIn)
        );
      } else
        this.setState({ fromToken: defaultToken, toToken: item }, () =>
          this.calculateToAmount(amountIn)
        );
    }
    if (item?.symbol !== fromToken?.symbol) {
      this.setState({ toToken: item }, () => this.calculateToAmount(amountIn));
    }
  }
  // });
}

//from -> to, to -> from
export function onSwapArrowIconClicked() {
  //swap from and to token
  const { fromToken, toToken, amountOut } = this.state;
  this.setState(
    {
      fromToken: toToken,
      toToken: fromToken,
      amountIn: amountOut,
    },
    () => {
      //calculate to amount
      this.calculateToAmount(amountOut);
    }
  );
}

export function onConfirmExchangeClicked() {
  const { amountIn, fromToken, toToken, amountOutMin, amountOut, route } =
    this.state;
  const { isConnected } = this.props;

  const fromContract = generateTokenContract(fromToken.address);

  if (isConnected) {
    const path = route?.path.map((item) => item.address);

    const commonParams = {
      fromContract,
      toAddress: toToken.address,
      fromAddress: fromToken.address,
      loadingState: 'loading',
      path,
      amountOutMin: toWei(0.95 * amountOutMin, toToken.decimals),
      successMessage: `Swap ${formattedAmount(amountIn)} ${
        fromToken?.symbol
      } for ${formattedAmount(amountOut)} ${toToken?.symbol}`,
    };
    if (fromToken.symbol === 'BNB') {
      this.swapExactETHForTokens({
        ...commonParams,
        value: amountIn,
      });
    } else if (toToken.symbol === 'BNB') {
      this.swapExactTokensForETH({
        ...commonParams,
        amountIn: toWei(amountIn, fromToken.decimals),
      });
    } else {
      this.swapExactTokensForTokens({
        ...commonParams,
        amountIn: toWei(amountIn, fromToken.decimals),
      });
    }
    this.props.openModal(<WaitingConfirmModal {...this.state} />);
  }
}

export function onExchangeBtnClicked() {
  this.props.openModal(
    <ConfirmModal
      {...this.state}
      onConfirm={this.onConfirmExchangeClicked}
      showPrice={true}
    />
  );
}

export function onWrapBtnClicked() {
  const { amountIn } = this.state;
  this.setState({ loading: true });
  const { isConnected } = this.props;
  if (isConnected) {
    this.wrap({
      amountIn: amountIn,
      value: amountIn,
    });
  }
}

export function onUnwrapBtnClicked() {
  const { amountIn } = this.state;
  this.setState({ loading: true });
  const { isConnected } = this.props;
  if (isConnected) {
    this.unwrap({
      amountIn: amountIn,
      value: amountIn,
    });
  }
}

export function onApproveClicked() {
  const { fromToken } = this.state;
  const { isConnected, account } = this.props;
  const fromContract = generateTokenContract(fromToken.address);

  if (isConnected) {
    this.sendApprove({
      tokenAddress: fromToken.address,
      tokenContract: fromContract,
      spender: ROUTER_ADDRESS,
      owner: account,
      loadingState: 'approving',
      successMessage: `Approve ${fromToken?.symbol}`,
    });
  }
}
