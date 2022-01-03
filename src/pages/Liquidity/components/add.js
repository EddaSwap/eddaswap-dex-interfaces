import { TradeType } from '@eddaswap/sdk';
import { useWeb3React } from '@web3-react/core';
import { loadBalanceData } from 'actions/app/init';
import { closeModal, openModal } from 'actions/app/modal';
import { addLiquidity, addLiquidityETH } from 'actions/contracts/addLiquidity';
import { userImportPool } from 'actions/exchange/userPool';
import Card from 'components/Card';
import ConnectWallet from 'components/ConnectWallet';
import SelectTokenModal from 'components/Dialogs/SelectToken';
import SelectToken from 'components/SelectToken';
import Settings from 'components/Settings';
import SwapCurrencyInput from 'components/swapCurrencyInput/swapCurrencyInput';
import { EDDA_ROUTERS } from 'constants/address';
import { ROUTER_VERSION } from 'constants/constants';
import { DefaultToken, ETHER as EtherByChain } from 'constants/tokens';
import { useNativeToken } from 'hooks/useNativeToken';
import { useApiStore } from 'hooks/useStore';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import {
  calculateTokenDesired,
  formattedAmount,
  toWei,
  truncate,
} from 'lib/numberHelper';
import {
  generateRouterContract,
  generateTokenContract,
} from 'lib/sdk/contract';
import { generatePair } from 'lib/sdk/pair';
import { generateAllTokensWithETH, generateToken } from 'lib/sdk/token';
import { calculateAmountLiquidity } from 'lib/sdkHelper';
import { sendApprove } from 'lib/sendTransaction/v2';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineArrowLeft, AiOutlinePlusCircle } from 'react-icons/ai';
import { IoSettingsOutline } from 'react-icons/io5';
import { connect, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import ConnectedButton from './AddLiquidityConnectedButton';
import ConfirmModal from './ConfirmModal';
import CreatePoolModal from './CreatePoolModal';
import PricePoolShare from './PricePoolShare';
import WaitingConfirmModal from './WaitingForConfirmModal';

function Add(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const apiStore = useApiStore();
  const web3Context = useWeb3React();
  const { account, active, chainId } = web3Context;
  const wrongNetwork = useWrongNetwork();
  const { ETHER } = useNativeToken();

  const [state, setState] = useState({
    tradeType: TradeType.EXACT_INPUT,
    fromToken: {},
    toToken: {},
    loading: false,
    tokenAPoolBalance: 0,
    tokenBPoolBalance: 0,
    selectTokenState: '', //from or to
  });
  const [noLiquidity, setNoLiquidity] = useState(false);
  const [version, setVersion] = useState(ROUTER_VERSION.v2);
  const [amountOut, setAmountOut] = useState();
  const [amountIn, setAmountIn] = useState();
  const [fromTokenBalance, setFromTokenBalance] = useState(0);
  const [toTokenBalance, setToTokenBalance] = useState(0);
  const [showSelectTokenModal, setShowSelectTokenModal] = useState(false);

  const setStateField = (fieldObj) => {
    setState({ ...state, ...fieldObj });
  };

  useEffect(() => {
    setStateField({ fromToken: EtherByChain[chainId], toToken: {} });
  }, [chainId]);

  const getExtendState = () => ({
    ...state,
    amountIn,
    amountOut,
    fromTokenBalance,
    toTokenBalance,
    noLiquidity,
  });

  const topToken = apiStore.token.topToken;
  const loadedData = apiStore.common.loadedData;
  const slippage = apiStore.settings.slippage;

  const { openModal, closeModal, userImportPool } = props;

  const loadTokenfromUrl = async () => {
    const allTokens = await generateAllTokensWithETH(chainId);
    setStateField({ allTokens });
    const { address1, address2 } = props.match?.params;

    if (!!address1) {
      let fromToken = {};
      if (address1 === EtherByChain[chainId]?.symbol) {
        fromToken = EtherByChain[chainId];
      } else fromToken = await generateToken(address1, chainId);
      setStateField({ fromToken });
    }
    if (!!address2) {
      let toToken = {};
      if (address2 === EtherByChain[chainId]?.symbol) {
        toToken = EtherByChain[chainId];
      } else toToken = await generateToken(address2, chainId);
      setStateField({ toToken });
    }
  };

  useEffect(() => {
    loadTokenfromUrl();
  }, [topToken]);

  useEffect(() => {
    if (!_.isEmpty(state.fromToken) && !_.isEmpty(state.toToken)) {
      getCurrentPair();
    }
  }, [state.fromToken, state.toToken, state.loading, version]);

  const getCurrentPair = async () => {
    const { fromToken, toToken } = state;
    const pair = await generatePair([fromToken, toToken], chainId, version);
    setNoLiquidity(!pair);
  };

  useEffect(() => {
    calculateToAmount();
  }, [amountIn, state.fromToken, state.toToken, version, noLiquidity]);

  useEffect(() => {
    calculateFromAmount();
  }, [amountOut, state.fromToken, state.toToken, version, noLiquidity]);

  const onMaxFromBtnClick = (balance) => {
    setStateField({ tradeType: TradeType.EXACT_INPUT });
    setAmountIn(balance);
  };

  const onMaxToBtnClick = (balance) => {
    setStateField({ tradeType: TradeType.EXACT_OUTPUT });
    setAmountOut(balance);
  };

  const onSelectToken = (type, item) => {
    const { fromToken, toToken } = state;
    setShowSelectTokenModal(false);
    const { address1, address2 } = props.match?.params;
    const defaultToken = DefaultToken[chainId];

    //if this item is ETHER, push ETHER instead of address
    const params = item.symbol === ETHER.symbol ? ETHER.symbol : item.address;

    //close select token modal
    closeModal();

    if (type === 'from') {
      if (item?.symbol !== toToken?.symbol) {
        setStateField({ fromToken: item });
        history.push(
          address2 ? `/add/${params}/${address2}` : `/add/${params}`
        );
      }
      //when user chose fromToken duplicate with toToken, change toToken
      else if (item?.symbol === toToken?.symbol) {
        //if item is default symbol, change toToken to wbnb
        setAmountIn(amountOut);
        setStateField({
          fromToken: item,
          toToken: item.symbol === defaultToken.symbol ? ETHER : defaultToken,
        });

        const secondAddress =
          item.symbol === defaultToken.symbol
            ? ETHER.symbol
            : defaultToken.address;
        history.push(`/add/${params}/${secondAddress}`);
      }
    }
    if (type === 'to') {
      if (item?.symbol !== fromToken?.symbol) {
        setStateField({ toToken: item });
        history.push(`/add/${address1}/${params}`);
      }
      //when user choose toToken duplicate with fromToken, change fromToken
      else if (item?.symbol === fromToken?.symbol) {
        //if item is edda, change fromToken to wbnb
        setAmountOut(amountIn);
        setStateField({
          fromToken: item.symbol === defaultToken.symbol ? ETHER : defaultToken,
          toToken: item,
        });

        const firstAddress =
          item.symbol === defaultToken.symbol
            ? ETHER.symbol
            : defaultToken.address;
        history.push(`/add/${firstAddress}/${params}`);
      }
    }
  };

  const onConfirmAddBtnClicked = () => {
    const { fromToken, toToken } = state;

    const onSendSuccess = async () => {
      const pair = await generatePair([fromToken, toToken], chainId, version);
      userImportPool(pair, chainId);
      history.push('/addLiquid');
    };
    const successMessage = `Added ${formattedAmount(amountIn)} ${
      fromToken?.symbol
    } and ${formattedAmount(amountOut)} ${toToken?.symbol}`;

    if (fromToken.symbol !== ETHER.symbol && toToken.symbol !== ETHER.symbol) {
      addLiquidity({
        toContract: generateRouterContract(chainId, version),
        fromAddress: fromToken.address,
        toAddress: toToken.address,
        setLoading: (loading) => setStateField({ loading }),
        dispatch,
        amountADesired: toWei(amountIn, fromToken.decimals),
        amountBDesired: toWei(amountOut, toToken.decimals),
        amountAMin: noLiquidity
          ? '0'
          : calculateTokenDesired(slippage, amountIn, fromToken.decimals),
        amountBMin: noLiquidity
          ? '0'
          : calculateTokenDesired(slippage, amountOut, toToken.decimals),
        onSendSuccess,
        successMessage,
        web3Context,
        version,
      });
    } else {
      const token = fromToken.symbol === ETHER.symbol ? toToken : fromToken;
      const tokenAmount =
        fromToken.symbol === ETHER.symbol ? amountOut : amountIn;
      const etherAmount =
        fromToken.symbol === ETHER.symbol ? amountIn : amountOut;

      addLiquidityETH({
        toContract: generateRouterContract(chainId),
        tokenAddress: token.address,
        setLoading: (loading) => setStateField({ loading }),
        dispatch,
        amountTokenDesired: toWei(tokenAmount, token.decimals),
        amountTokenMin: noLiquidity
          ? '0'
          : calculateTokenDesired(slippage, tokenAmount, token.decimals),
        amountETHMin: noLiquidity
          ? '0'
          : calculateTokenDesired(slippage, etherAmount, 18),
        value: etherAmount,
        onSendSuccess,
        successMessage,
        web3Context,
        version,
      });
    }
    openModal(
      <WaitingConfirmModal {...getExtendState()} actionText="Supplying" />
    );
  };

  const onChangeFromAmount = (value) => {
    setStateField({ tradeType: TradeType.EXACT_INPUT });
    setAmountIn(value);
  };

  const onChangeToAmount = (value) => {
    setStateField({ tradeType: TradeType.EXACT_OUTPUT });
    setAmountOut(value);
  };

  const calculateFromAmount = async () => {
    const { fromToken, toToken, tradeType } = state;
    // if noLiquidity, use can set the rate
    if (!noLiquidity && tradeType === TradeType.EXACT_OUTPUT) {
      if (amountOut && amountOut > 0) {
        if (loadedData && !_.isEmpty(fromToken) && !_.isEmpty(toToken)) {
          try {
            const data = await calculateAmountLiquidity({
              chainId,
              tokenInput: fromToken,
              tokenOutput: toToken,
              tradeType: TradeType.EXACT_OUTPUT,
              amount: amountOut,
              slippage,
              version,
            });

            setStateField(data);
            setAmountIn(formattedAmount(data.amountIn, 7));
          } catch (error) {}
        }
      } else {
        setAmountIn('');
      }
    }
  };

  const calculateToAmount = async () => {
    const { fromToken, toToken, tradeType } = state;

    // if noLiquidity, use can set the rate
    if (!noLiquidity && tradeType === TradeType.EXACT_INPUT) {
      if (amountIn && amountIn > 0) {
        if (loadedData && !_.isEmpty(fromToken) && !_.isEmpty(toToken)) {
          try {
            const data = await calculateAmountLiquidity({
              chainId,
              tokenInput: fromToken,
              tokenOutput: toToken,
              tradeType: TradeType.EXACT_INPUT,
              amount: amountIn,
              slippage,
              version,
            });

            setStateField(data);
            setAmountOut(formattedAmount(data.amountOut, 7));
          } catch {}
        }
      } else {
        setAmountOut('');
      }
    }
  };

  const onApproveAClicked = () => {
    const { fromToken } = state;
    const fromContract = generateTokenContract(fromToken?.address);

    if (active && !wrongNetwork) {
      sendApprove({
        tokenAddress: fromToken.address,
        tokenContract: fromContract,
        spender: EDDA_ROUTERS[version][chainId],
        owner: account,
        setLoading: (loading) => setStateField({ approvingA: loading }),
        dispatch,
        successMessage: `Approved ${fromToken?.symbol}`,
        web3Context,
      });
    }
  };

  const onApproveBClicked = () => {
    const { toToken } = state;
    const fromContract = generateTokenContract(toToken?.address);

    if (active && !wrongNetwork) {
      sendApprove({
        tokenAddress: toToken.address,
        tokenContract: fromContract,
        spender: EDDA_ROUTERS[version][chainId],
        owner: account,
        setLoading: (loading) => setStateField({ approvingB: loading }),
        dispatch,
        successMessage: `Approved ${toToken?.symbol}`,
        web3Context,
      });
    }
  };

  const onAddBtnClicked = () => {
    openModal(
      <ConfirmModal {...getExtendState()} onConfirm={onConfirmAddBtnClicked} />
    );
  };

  const onCreatePoolBtnClicked = () => {
    openModal(
      <CreatePoolModal
        {...getExtendState()}
        onConfirm={onConfirmAddBtnClicked}
      />
    );
  };

  const onSettingClick = () => {
    openModal(renderSettingsModal());
  };

  const renderSelectTokenModal = (type) => {
    return (
      <SelectToken
        tokenList={state.allTokens}
        onSelectToken={(item) => onSelectToken(type, item)}
      />
    );
  };

  const renderSettingsModal = () => {
    return <Settings />;
  };

  const { fromToken, toToken } = state;
  const noLiquidityDesc = t('liquidity.add.noLiquidityDesc');
  const isLiquidityDesc = t('liquidity.add.isLiquidityDesc');

  return (
    <div className="add-liquidity">
      <div className="row flex justify-content-center">
        <div className="col-lg-5 col-md-12">
          <Card>
            <div className="add-card-header">
              <Link to="/addLiquid" className="pointer">
                <AiOutlineArrowLeft className="icons" />
              </Link>
              <div>
                <h4 className="text-error">
                  {t('liquidity.add.addLiquidity')}
                </h4>
              </div>
              <div className="pointer" onClick={onSettingClick}>
                <IoSettingsOutline className="icons" size={25} />
              </div>
            </div>
            <br />
            <div className="tip-container">
              <p
                style={{
                  whiteSpace: 'pre-line',
                  color: '#777e90',
                  textAlign: 'center',
                }}
                className="bolder"
              >
                {noLiquidity ? noLiquidityDesc : isLiquidityDesc}
              </p>
            </div>
            <SwapCurrencyInput
              label={t('liquidity.add.input')}
              token={fromToken}
              onTokenClick={() => {
                setShowSelectTokenModal(true);
                setStateField({ selectTokenState: 'from' });
              }}
              onChangeAmount={(e) => onChangeFromAmount(e)}
              amountValue={truncate(amountIn, 10)}
              showMaxBtn={!!fromToken?.symbol}
              onMaxBtnClick={onMaxFromBtnClick}
              balance={fromTokenBalance}
              onSetTokenBalance={setFromTokenBalance}
            />
            <div
              className="flex justify-content-center"
              style={{ marginTop: '-20px' }}
            >
              <AiOutlinePlusCircle
                className="icons icon-down-arrow pointer"
                size={30}
              />
            </div>
            <SwapCurrencyInput
              label={t('liquidity.add.input')}
              token={toToken}
              onTokenClick={() => {
                setShowSelectTokenModal(true);
                setStateField({ selectTokenState: 'to' });
              }}
              onChangeAmount={(e) => onChangeToAmount(e)}
              amountValue={truncate(amountOut, 10)}
              showMaxBtn={!!toToken?.symbol}
              onMaxBtnClick={onMaxToBtnClick}
              balance={toTokenBalance}
              onSetTokenBalance={setToTokenBalance}
            />

            <PricePoolShare {...getExtendState()} />

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
                version={version}
                onAddBtnClicked={() => onAddBtnClicked()}
                onCreatePoolBtnClicked={() => onCreatePoolBtnClicked()}
                onApproveAClicked={() => onApproveAClicked()}
                onApproveBClicked={() => onApproveBClicked()}
              />
            ) : (
              <div>
                <ConnectWallet />
              </div>
            )}
          </Card>

          {/* Do not let user choose version, only add liquidity in v2 */}
          {/* <VersionSelection value={version} onChange={setVersion} /> */}
        </div>
      </div>
    </div>
  );
}

export default connect(null, {
  openModal,
  closeModal,
  loadBalanceData,
  userImportPool,
})(Add);
