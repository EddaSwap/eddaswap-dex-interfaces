import { TradeType } from '@eddaswap/sdk';
import { makeStyles } from '@material-ui/core/styles';
import { ChainId } from '@sushiswap/sdk';
import { useWeb3React } from '@web3-react/core';
import { loadBalanceData } from 'actions/app/init';
import { closeModal, openModal } from 'actions/app/modal';
import {
  swapExactETHForTokens,
  swapExactTokensForETH,
  swapExactTokensForTokens,
  unwrap,
  wrap,
} from 'actions/contracts/swap';
import Card from 'components/Card';
import ConnectWallet from 'components/ConnectWallet';
import SelectTokenModal from 'components/Dialogs/SelectToken';
import Settings from 'components/Settings';
import SwapCurrencyInput from 'components/swapCurrencyInput/swapCurrencyInput';
import VersionAlert from 'components/VersionAlert';
import VersionSelection from 'components/VersionSelection';
import { ROUTER_VERSION } from 'constants/constants';
import { DefaultToken, ETHER as EtherByChain } from 'constants/tokens';
import { useNativeToken } from 'hooks/useNativeToken';
import { useApiStore } from 'hooks/useStore';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import {
  dividedBy,
  formattedAmount,
  minus,
  times,
  toWei,
} from 'lib/numberHelper';
import { generateTokenContract } from 'lib/sdk/contract';
import { generateToken } from 'lib/sdk/token';
import { calculateAmount } from 'lib/sdk/trade';
import { sendApprove } from 'lib/sendTransaction/v2';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CgSwapVertical } from 'react-icons/cg';
import { IoSettingsOutline } from 'react-icons/io5';
import { connect, useDispatch } from 'react-redux';
import ConfirmModal from './components/ConfirmModal';
import ConnectedButton from './components/ConnectedButton';
import ExchangeInfo from './components/ExchangeInfo';
import ImportCurrencyModal from './components/ImportCurrencyModal';
import PercentLiquidityLocked from './components/PercentLiquidityLocked';
import Price from './components/Price';
import WaitingConfirmModal from './components/WaitingForConfirmModal';

const useStyles = makeStyles({
  slippage: {
    color: '#e6007a !important',
  },
});

function Exchange(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const web3Context = useWeb3React();
  const { account, active, chainId } = web3Context;
  const wrongNetwork = useWrongNetwork();
  const { ETHER, WETH } = useNativeToken();

  const [state, setState] = useState({
    fromToken: chainId ? ETHER : {},
    toToken: {},
    amountOutMin: 0,
    priceSwap: false,
    loading: false,
    minimumReceived: 0,
    priceImpact: 0,
    tokenAPoolBalance: 0,
    tokenBPoolBalance: 0,
    noLiquidity: false,
    route: {},
    approving: false,
    swapType: TradeType.EXACT_INPUT,
    selectTokenState: '', //fromToken or toToken
  });

  const [version, setVersion] = useState(ROUTER_VERSION.v2);
  const [amountOut, setAmountOut] = useState();
  const [amountIn, setAmountIn] = useState();
  const [fromTokenBalance, setFromTokenBalance] = useState(0);
  const [toTokenBalance, setToTokenBalance] = useState(0);
  const [disableSwapPosition, setDisableSwapPosition] = useState(false);

  const setStateField = (fieldObj) => {
    setState({ ...state, ...fieldObj });
  };

  useEffect(() => {
    setStateField({ fromToken: EtherByChain[chainId], toToken: {} });
  }, [chainId]);

  const setLoading = (field) => (loading) =>
    setStateField({ [field]: loading });

  const getExtendState = () => ({
    ...state,
    amountIn,
    amountOut,
    fromTokenBalance,
    toTokenBalance,
  });

  const location = props;
  const apiStore = useApiStore();
  const slippage = apiStore.settings.slippage;
  const loadedData = apiStore.common.loadedData;

  const { openModal, closeModal } = props;

  const [showSelectTokenModal, setShowSelectTokenModal] = useState(false);

  useEffect(() => {
    onGetOutputCurrencyFromURL();
  }, []);
  const onGetOutputCurrencyFromURL = async () => {
    try {
      //get output currency
      const outputCurrencyAddress = new URLSearchParams(location.search).get(
        'outputCurrency'
      );
      const token = await generateToken(outputCurrencyAddress, chainId);

      if (token) {
        const onConfirmImport = () => {
          setStateField({ toToken: token });
          closeModal();
        };
        openModal(
          <ImportCurrencyModal token={token} onConfirm={onConfirmImport} />
        );
      }
      //get input currency
      const inputCurrencyAddress = new URLSearchParams(location.search).get(
        'inputCurrency'
      );

      if (inputCurrencyAddress) {
        const inputToken = await generateToken(inputCurrencyAddress, chainId);
        inputToken && setStateField({ fromToken: inputToken });
      }
    } catch {}
  };

  const calculateFromAmount = async () => {
    const { fromToken, toToken } = state;
    if (Number(amountOut) > 0) {
      if (loadedData && !_.isEmpty(fromToken) && !_.isEmpty(toToken)) {
        try {
          const data = await calculateAmount({
            chainId,
            tokenInput: fromToken,
            tokenOutput: toToken,
            tradeType: TradeType.EXACT_OUTPUT,
            amount: amountOut,
            slippage,
            version,
          });

          setStateField({
            ...data,
            amountOutMin: times(amountOut, minus(1, dividedBy(slippage, 100))),
          });
          setAmountIn(formattedAmount(data.amountIn, 7));
        } catch (error) {
          setAmountIn(0);
          setStateField({
            amountInMax: 0,
            priceImpact: 0,
            tokenAPoolBalance: 0,
            tokenBPoolBalance: 0,
          });
        }
      }
    } else {
      setAmountIn('');
    }
  };

  const calculateToAmount = async () => {
    const { fromToken, toToken } = state;

    if (Number(amountIn) > 0) {
      if (loadedData && !_.isEmpty(fromToken) && !_.isEmpty(toToken)) {
        try {
          const data = await calculateAmount({
            chainId,
            tokenInput: fromToken,
            tokenOutput: toToken,
            tradeType: TradeType.EXACT_INPUT,
            amount: Number(amountIn),
            slippage,
            version,
          });
          setAmountOut(formattedAmount(data.amountOut, 7));
          setStateField({
            ...data,
          });
        } catch (error) {
          console.log('error', error);
          setAmountOut(0);
          setStateField({
            amountOutMin: 0,
            priceImpact: 0,
            tokenAPoolBalance: 0,
            tokenBPoolBalance: 0,
          });
        }
      }
    } else {
      setAmountOut('');
    }
  };

  useEffect(() => {
    calculateToAmount();
  }, [slippage]);

  useEffect(() => {
    if (state.swapType === TradeType.EXACT_OUTPUT) {
      calculateFromAmount();
    }
  }, [state.toToken, state.fromToken, amountOut, version]);

  useEffect(() => {
    if (state.swapType === TradeType.EXACT_INPUT) {
      calculateToAmount();
    }
  }, [state.toToken, state.fromToken, amountIn, version]);

  const onChangeFromAmount = (value) => {
    setStateField({ swapType: TradeType.EXACT_INPUT });
    setAmountIn(value);
  };

  const onChangeToAmount = (value) => {
    setStateField({ swapType: TradeType.EXACT_OUTPUT });
    setAmountOut(value);
  };

  const onMaxBtnClick = (balance) => {
    setAmountIn(balance);
    setStateField({ swapType: TradeType.EXACT_INPUT });
  };

  const onSelectToken = (tokenState, item) => {
    const { fromToken, toToken } = state;
    setShowSelectTokenModal(false);
    const defaultToken = DefaultToken[chainId];

    if (tokenState === 'fromToken') {
      //if from token duplicate with toToken, set from token = item, change to token to others
      if (item.symbol === toToken?.symbol) {
        const toTokenNew =
          item.symbol === defaultToken.symbol ? ETHER : defaultToken;
        setStateField({ fromToken: item, toToken: toTokenNew });
      }
      //calculate another input amount
      else {
        setStateField({ fromToken: item });
      }
    }
    if (tokenState === 'toToken') {
      if (item.symbol === fromToken?.symbol) {
        const fromTokenNew =
          item.symbol === defaultToken.symbol ? ETHER : defaultToken;
        setStateField({ toToken: item, fromToken: fromTokenNew });
      } else {
        setStateField({ toToken: item });
      }
    }
  };

  //from -> to, to -> from
  const onSwapArrowIconClicked = () => {
    const { fromToken, toToken } = state;

    // prevent use click to much frequently
    if (!disableSwapPosition) {
      setStateField({
        fromToken: toToken,
        toToken: fromToken,
      });
    }
    setDisableSwapPosition(true);
    setTimeout(() => {
      setDisableSwapPosition(false);
    }, 2000);
  };

  const onConfirmExchangeClicked = () => {
    const { fromToken, toToken, amountOutMin, route, router_address } = state;
    const fromContract = generateTokenContract(fromToken.address);

    if (active && !wrongNetwork) {
      const path = route?.path.map((item) => item.address);
      const commonParams = {
        router_address,
        fromContract,
        toAddress: toToken.address,
        fromAddress: fromToken.address,
        setLoading: setLoading('loading'),
        path,
        amountOutMin: toWei(0.95 * amountOutMin, toToken.decimals),
        successMessage: `Swapped ${formattedAmount(amountIn)} ${
          fromToken?.symbol
        } for ${formattedAmount(amountOut)} ${toToken?.symbol}`,
      };

      if (fromToken.symbol === ETHER.symbol) {
        swapExactETHForTokens({
          ...commonParams,
          value: amountIn,
          dispatch,
          web3Context,
        });
      } else if (toToken.symbol === ETHER.symbol) {
        swapExactTokensForETH({
          ...commonParams,
          amountIn: toWei(amountIn, fromToken.decimals),
          dispatch,
          web3Context,
        });
      } else {
        swapExactTokensForTokens({
          ...commonParams,
          amountIn: toWei(amountIn, fromToken.decimals),
          dispatch,
          web3Context,
        });
      }
      openModal(<WaitingConfirmModal {...getExtendState()} />);
    }
  };

  const onExchangeBtnClicked = () => {
    openModal(
      <ConfirmModal
        {...getExtendState()}
        onConfirm={onConfirmExchangeClicked}
        showPrice={true}
      />
    );
  };

  const onWrapBtnClicked = () => {
    setStateField({ loading: true });
    if (active && !wrongNetwork) {
      wrap({
        amountIn: amountIn,
        value: amountIn,
        dispatch,
        web3Context,
        setLoading: setLoading('loading'),
      });
    }
  };

  const onUnwrapBtnClicked = () => {
    setStateField({ loading: true });
    if (active && !wrongNetwork) {
      unwrap({
        amountIn: amountIn,
        value: amountIn,
        dispatch,
        web3Context,
        setLoading: setLoading('loading'),
      });
    }
  };

  const onApproveClicked = () => {
    const { fromToken, router_address } = state;
    const fromContract = generateTokenContract(fromToken.address);

    if (active && !wrongNetwork) {
      sendApprove({
        tokenAddress: fromToken.address,
        tokenContract: fromContract,
        spender: router_address,
        setLoading: setLoading('approving'),
        successMessage: `Approved ${fromToken?.symbol}`,
        dispatch,
        web3Context,
      });
    }
  };

  const onSettingClick = () => {
    openModal(<Settings />);
  };

  const { t } = useTranslation();
  const { fromToken, toToken, noLiquidity } = state;
  const isWrap =
    fromToken?.symbol === ETHER.symbol && toToken?.symbol === WETH.symbol;
  const isUnwrap =
    fromToken?.symbol === WETH.symbol && toToken?.symbol === ETHER.symbol;

  return (
    <div className="exchange">
      <div
        style={{
          display:
            version === ROUTER_VERSION.v1 && chainId === ChainId.BSC
              ? 'block'
              : 'none',
        }}
      >
        <VersionAlert />
      </div>
      <div className="row flex justify-content-center">
        <div className="col-lg-5 col-md-12">
          <Card className="exchange-card">
            <div className="exchange-card-header">
              <div>
                <h3 className="text-error">{t('exchange.title')}</h3>
                <span className="desc">{t('exchange.desc')}</span>
              </div>
              <div className="pointer" onClick={onSettingClick}>
                <IoSettingsOutline className="icons" size={25} />
              </div>
            </div>

            <div className="exchange-card-body">
              <SwapCurrencyInput
                label={t('exchange.from')}
                token={fromToken}
                onTokenClick={() => {
                  setShowSelectTokenModal(true);
                  setStateField({ selectTokenState: 'fromToken' });
                }}
                onChangeAmount={onChangeFromAmount}
                amountValue={amountIn}
                showMaxBtn={!!fromToken?.symbol}
                onMaxBtnClick={onMaxBtnClick}
                balance={fromTokenBalance}
                onSetTokenBalance={setFromTokenBalance}
              />
              <div className="flex justify-content-center">
                <CgSwapVertical
                  className="icons icon-down-arrow pointer"
                  size={30}
                  onClick={onSwapArrowIconClicked}
                />
              </div>
              <SwapCurrencyInput
                label={t('exchange.to')}
                token={toToken}
                onTokenClick={() => {
                  setShowSelectTokenModal(true);
                  setStateField({ selectTokenState: 'toToken' });
                }}
                onChangeAmount={onChangeToAmount}
                amountValue={amountOut}
                balance={toTokenBalance}
                onSetTokenBalance={setToTokenBalance}
              />
              <br />
              {isWrap || isUnwrap ? null : <Price {...getExtendState()} />}
              <div className="detail-row">
                <span className="bolder">
                  {t('component.settings.slippage')}
                </span>
                <span className={classes.slippage}>{slippage}%</span>
              </div>
              <PercentLiquidityLocked fromToken={fromToken} toToken={toToken} />
              <br />
            </div>

            <SelectTokenModal
              // disabledToken={disabledToken}
              show={showSelectTokenModal}
              onSelectToken={(item) =>
                onSelectToken(state.selectTokenState, item)
              }
              handleClose={() => setShowSelectTokenModal(false)}
            />

            {account ? (
              <ConnectedButton
                {...getExtendState()}
                account={account}
                onExchangeBtnClicked={onExchangeBtnClicked}
                onWrapBtnClicked={onWrapBtnClicked}
                onUnwrapBtnClicked={onUnwrapBtnClicked}
                onApproveClicked={onApproveClicked}
                disabled={version === ROUTER_VERSION.v1}
              />
            ) : (
              <div>
                <ConnectWallet />
              </div>
            )}
          </Card>
          {isWrap || isUnwrap || noLiquidity ? null : (
            <ExchangeInfo {...getExtendState()} />
          )}
          <VersionSelection value={version} onChange={setVersion} />
        </div>
      </div>
    </div>
  );
}

export default connect(null, {
  openModal,
  closeModal,
  loadBalanceData,
})(Exchange);
