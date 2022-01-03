import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import { greaterThan, isLessThan } from 'lib/numberHelper';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { fetchTokenAllowance } from 'lib/sendTransaction/allowance';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { useWeb3React } from '@web3-react/core';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import { useNativeToken } from 'hooks/useNativeToken';

const useStyles = makeStyles({});

function ConnectedButton(props) {
  const {
    fromToken,
    toToken,
    amountIn,
    amountOut,
    loading,
    tokenAPoolBalance,
    noLiquidity,
    fromTokenBalance,
    onExchangeBtnClicked,
    onWrapBtnClicked,
    onUnwrapBtnClicked,
    onApproveClicked,
    approving,
    router_address,
    disabled = false,
  } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  const wrongNetwork = useWrongNetwork();
  const { account } = useWeb3React();
  const [approvedToken, setApprovedToken] = useState();
  const [showApproveBtn, setShowApproveBtn] = useState(true);
  const { ETHER, WETH } = useNativeToken();

  const checkTokenAllowance = async () => {
    try {
      if (fromToken && !_.isEqual(fromToken, ETHER)) {
        const allowance = await fetchTokenAllowance(
          fromToken,
          account,
          router_address
        );
        return greaterThan(allowance, 0);
      }
      return true;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const loadAllowance = async () => {
      const approved = await checkTokenAllowance();
      setApprovedToken(approved);
      setShowApproveBtn(approved);
    };
    loadAllowance();
  }, [fromToken, account, wrongNetwork, loading, router_address]);

  //when approving change, it means the approve tx confirm, set approved is true but still show approved button
  useEffect(() => {
    const loadAllowance = async () => {
      const approved = await checkTokenAllowance();
      setApprovedToken(approved);
    };
    loadAllowance();
  }, [approving]);

  //need to enter input/output amount
  const notEntered =
    Number.isNaN(amountIn) ||
    amountIn <= 0 ||
    Number.isNaN(amountOut) ||
    amountOut <= 0 ||
    !fromToken?.symbol ||
    !toToken?.symbol;
  //not enough input balance
  const notEnoughFromBalance =
    fromToken?.symbol && isLessThan(fromTokenBalance, amountIn);
  //input amount more than balance in pool
  const priceImpactTooHigh =
    fromToken?.symbol &&
    toToken?.symbol &&
    isLessThan(tokenAPoolBalance, amountIn);

  const fromTokenIsBNB = _.isEqual(fromToken, ETHER);
  const toTokenIsBNB = _.isEqual(toToken, ETHER);

  const isWrap =
    fromToken?.symbol === ETHER.symbol && toToken?.symbol === WETH.symbol;
  const isUnwrap =
    fromToken?.symbol === WETH.symbol && toToken?.symbol === ETHER.symbol;

  if (noLiquidity) {
    return (
      <div className="text-align-center bold">
        <span>{t('exchange.poolNotExist')}</span>
        <Link
          to={`/add/${fromTokenIsBNB ? ETHER.symbol : fromToken?.address}/${
            toTokenIsBNB ? ETHER.symbol : toToken?.address
          }`}
        >
          {' '}
          {t('exchange.createPool')}{' '}
        </Link>
        <span>{t('exchange.createPool.desc')}</span>
      </div>
    );
  }
  if (isWrap) {
    return (
      <Button onClick={onWrapBtnClicked} className="connect-button">
        {t('exchange.wrap')}
      </Button>
    );
  }
  if (isUnwrap) {
    return (
      <Button onClick={onUnwrapBtnClicked} className="connect-button">
        {t('exchange.unwrap')}
      </Button>
    );
  }
  if (notEnoughFromBalance) {
    return (
      <Button disabled className="connect-button">
        {t('exchange.insufficientBalance', { symbol: fromToken?.symbol })}
      </Button>
    );
  }
  if (priceImpactTooHigh) {
    return (
      <Button disabled className="connect-button">
        {t('exchange.priceImpactHigh')}
      </Button>
    );
  }
  if (notEntered) {
    return (
      <Button disabled className={'connect-button'}>
        {t('exchange.enterAmount')}
      </Button>
    );
  }
  if (!showApproveBtn) {
    return (
      <div className="approve-exchange-container">
        <div className="approve-button-container">
          <Button
            className="approve-button connect-button"
            loading={approving}
            onClick={onApproveClicked}
            disabled={approvedToken}
          >
            {t('exchange.approveButton')} {fromToken?.symbol}
          </Button>
          <HiArrowNarrowRight color="#777e90" />
          <Button
            disabled={!approvedToken}
            className="approve-button connect-button"
            loading={loading}
            onClick={onExchangeBtnClicked}
          >
            {t('exchange.exchangeButton')}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Button
        loading={loading}
        onClick={onExchangeBtnClicked}
        className="connect-button"
        disabled={disabled}
      >
        {t('exchange.exchangeButton')}
      </Button>
    </div>
  );
}

export default ConnectedButton;
