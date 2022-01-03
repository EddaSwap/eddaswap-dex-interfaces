import { useWeb3React } from '@web3-react/core';
import { openModal } from 'actions/app/modal';
import {
  removeLiquidity,
  removeLiquidityETH,
} from 'actions/contracts/addLiquidity';
import Button from 'components/Button';
import Card from 'components/Card';
import ConnectWallet from 'components/ConnectWallet';
import CurrencyLogo from 'components/CurrencyLogo';
import Settings from 'components/Settings';
import { useNativeToken } from 'hooks/useNativeToken';
import { useApiStore } from 'hooks/useStore';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import {
  calculateTokenDesired,
  dividedBy,
  formattedAmount,
  times,
  toWei,
  truncate,
} from 'lib/numberHelper';
import {
  generateLpTokenContract,
  generateRouterContract,
  getLpTokenBalance,
} from 'lib/sdk/contract';
import { generatePairFromLpAddress, getLiquidityValue } from 'lib/sdk/pair';
import { getAmountFromTokenAmount } from 'lib/sdk/token';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { IoSettingsOutline } from 'react-icons/io5';
import { HiOutlineArrowNarrowDown } from 'react-icons/hi';
import { connect, useDispatch } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import ConfirmRemoveModal from './ConfirmRemoveModal';
import WaitingConfirmModal from './WaitingForConfirmModal';

function Remove(props) {
  const { t } = useTranslation();
  const history = useHistory();
  const apiStore = useApiStore();
  const dispatch = useDispatch();

  const location = useLocation();

  const web3Context = useWeb3React();
  const { account, active, chainId } = web3Context;
  const wrongNetwork = useWrongNetwork();
  const { ETHER, WETH } = useNativeToken();

  const query = new URLSearchParams(location.search);
  const version = query.get('version');
  const { lpAddress } = props.match?.params;

  const [state, setState] = useState({
    loading: false,
    amountA: 0,
    amountB: 0,
    pair: '',
    removeAmount: 0,
    percentAmount: 100,
    receiveETH: true,
  });

  const setStateField = (fieldObj) => {
    setState({ ...state, ...fieldObj });
  };

  const loadedData = apiStore.common.loadedData;
  const slippage = apiStore.settings.slippage;

  const { openModal } = props;

  useEffect(() => {
    loadLiquidityfromUrl();
  }, [loadedData]);

  const loadLiquidityfromUrl = async () => {
    if (!lpAddress) {
      history.push('/addLiquid');
    }
    try {
      if (!!lpAddress && loadedData) {
        const pair = await generatePairFromLpAddress(
          lpAddress,
          chainId,
          version
        );
        setStateField({ pair });
        const balance = await getLpTokenBalance(
          pair.liquidityToken.address,
          account,
          chainId
        );
        const value = await getLiquidityValue(pair, account);
        setStateField({
          ...value,
          removeAmount: getAmountFromTokenAmount(balance),
          pair,
        });
      }
    } catch (error) {}
  };

  const onChangePercent = (amount) => {
    setStateField({ percentAmount: amount });
  };

  const onSettingClick = () => {
    openModal(<Settings />);
  };

  const onRemoveBtnClicked = () => {
    openModal(
      <ConfirmRemoveModal {...state} onConfirm={onConfirmRemoveBtnClicked} />
    );
  };

  const onConfirmRemoveBtnClicked = () => {
    if (active && !wrongNetwork) {
      try {
        const {
          pair,
          removeAmount,
          percentAmount,
          receiveETH,
          amountA,
          amountB,
        } = state;

        const token0IsWETH = WETH.symbol === pair?.token0?.symbol;
        const token1IsWETH = WETH.symbol === pair?.token1?.symbol;

        const fromContract = generateLpTokenContract(
          pair.liquidityToken.address
        );

        const formatedPercentAmount = dividedBy(percentAmount, 100);
        const removeAmountFixed = truncate(removeAmount, 12);

        const amountETH = times(removeAmountFixed, formatedPercentAmount);
        const amount = toWei(truncate(amountETH, 12), 18);

        const percentAmountA = times(amountA, formatedPercentAmount);
        const percentAmountB = times(amountB, formatedPercentAmount);

        const amountAMin = calculateTokenDesired(
          slippage,
          percentAmountA,
          pair?.token0?.decimals
        );
        const amountBMin = calculateTokenDesired(
          slippage,
          percentAmountB,
          pair?.token1?.decimals
        );

        const onSendSuccess = () => {
          loadLiquidityfromUrl && loadLiquidityfromUrl();
          history.goBack();
        };
        const successMessage = `Remove ${formattedAmount(percentAmountA)} ${
          pair?.token0?.symbol
        } and ${formattedAmount(percentAmountB)} ${pair?.token1?.symbol}`;

        if (receiveETH && (token0IsWETH || token1IsWETH)) {
          removeLiquidityETH({
            fromContract: fromContract,
            lpTokenAddress: pair.liquidityToken.address,
            toContract: generateRouterContract(chainId, version),
            tokenAddress: token0IsWETH
              ? pair.token1.address
              : pair.token0.address,
            amountTokenMin: token0IsWETH ? amountBMin : amountAMin,
            amountETHMin: token0IsWETH ? amountAMin : amountBMin,
            amount,
            onSendSuccess,
            successMessage,
            setLoading: (loading) => setStateField({ loading }),
            dispatch,
            web3Context,
            version,
          });
        } else {
          removeLiquidity({
            fromContract: fromContract,
            toContract: generateRouterContract(chainId, version),
            lpTokenAddress: pair.liquidityToken.address,
            tokenAddressA: pair.token0.address,
            tokenAddressB: pair.token1.address,
            amountTokenAMin: amountAMin,
            amountTokenBMin: amountBMin,
            amount: amount,
            onSendSuccess,
            successMessage,
            setLoading: (loading) => setStateField({ loading }),
            dispatch,
            web3Context,
            version,
          });
        }

        const { token0, token1 } = pair;
        openModal(
          <WaitingConfirmModal
            {...state}
            actionText="Removing"
            fromToken={token0}
            toToken={token1}
            amountIn={dividedBy(times(percentAmount, amountA), 100)}
            amountOut={dividedBy(times(percentAmount, amountB), 100)}
          />
        );
      } catch (error) {
        console.error('Failed to remove', error);
      }
    }
  };

  const renderConnectedButton = () => {
    return (
      <div>
        <Button loading={state.loading} onClick={() => onRemoveBtnClicked()}>
          {t('liquidity.remove.removeButton')}
        </Button>
      </div>
    );
  };

  const { amountA, amountB, percentAmount, receiveETH } = state;
  const pair = state?.pair;

  const currency0 =
    WETH.symbol === pair?.token0?.symbol && receiveETH ? ETHER : pair?.token0;
  const currency1 =
    WETH.symbol === pair?.token1?.symbol && receiveETH ? ETHER : pair?.token1;

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
                <h4 className="text-error">{t('liquidity.remove.title')}</h4>
              </div>
              <div className="pointer" onClick={onSettingClick}>
                <IoSettingsOutline className="icons" size={25} />
              </div>
            </div>
            <br />
            {!loadedData ? (
              <div className="no-connect-view">
                <span className="note">{t('component.dropdown.loading')}</span>
              </div>
            ) : pair ? (
              <div>
                <div className="tip-container">
                  {t('liquidity.remove.desc')}
                </div>
                <p className="percent-amount-title">
                  {t('liquidity.remove.amount')}
                </p>
                <p className="percent-amount-value">{percentAmount}%</p>
                <input
                  type="range"
                  value={percentAmount}
                  onChange={(e) => onChangePercent(e.target.value)}
                />
                <div className="remove-liquidity-action-container">
                  <Button label="25%" onClick={() => onChangePercent(25)} />
                  <Button label="50%" onClick={() => onChangePercent(50)} />
                  <Button label="75%" onClick={() => onChangePercent(75)} />
                  <Button label="100%" onClick={() => onChangePercent(100)} />
                </div>
                <div
                  style={{
                    margin: '16px 0',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <span>
                    <HiOutlineArrowNarrowDown size={25} color="#777e90" />
                  </span>
                </div>
                <div className="remove-liquidity-token-row">
                  <span>
                    {formattedAmount(
                      dividedBy(times(percentAmount, amountA), 100)
                    )}
                  </span>
                  <div className="logo-name-container">
                    <span className="remove-liquidity-curreny-symbol">
                      {currency0?.symbol}
                    </span>
                    <CurrencyLogo currency={currency0} />
                  </div>
                </div>
                <div className="remove-liquidity-token-row">
                  <span>
                    {formattedAmount(
                      dividedBy(times(percentAmount, amountB), 100)
                    )}
                  </span>
                  <div className="logo-name-container">
                    <span className="remove-liquidity-curreny-symbol">
                      {currency1?.symbol}
                    </span>
                    <CurrencyLogo currency={currency1} />
                  </div>
                </div>
                <div className="remove-liquidity-receive-token">
                  {(_.isEqual(WETH, pair?.token0) ||
                    _.isEqual(WETH, pair?.token1)) && (
                    <Button
                      text
                      onClick={() => setStateField({ receiveETH: !receiveETH })}
                    >
                      {t('liquidity.remove.receive')}{' '}
                      {!receiveETH ? ETHER.symbol : WETH.symbol}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '2rem' }}>
                <p>{t('liquidity.remove.plsSelectPool')}</p>
              </div>
            )}
            {account && !wrongNetwork ? (
              renderConnectedButton()
            ) : (
              <div>
                <ConnectWallet />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default connect(null, {
  openModal,
})(Remove);
