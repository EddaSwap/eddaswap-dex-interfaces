import { useWeb3React } from '@web3-react/core';
import Button from 'components/Button';
import { EDDA_ROUTERS } from 'constants/address';
import { useNativeToken } from 'hooks/useNativeToken';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import { greaterThan, lessThan } from 'lib/numberHelper';
import { fetchTokenAllowance } from 'lib/sendTransaction/allowance';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiArrowNarrowRight } from 'react-icons/hi';

function ConnectedButton(props) {
  const {
    fromToken,
    toToken,
    amountIn,
    amountOut,
    fromTokenBalance,
    toTokenBalance,
    noLiquidity,
    approvingA,
    approvingB,
    loading,
    onAddBtnClicked,
    onApproveAClicked,
    onApproveBClicked,
    onCreatePoolBtnClicked,
    version,
  } = props;
  const { t } = useTranslation();

  const web3Context = useWeb3React();
  const { account, chainId } = web3Context;
  const wrongNetwork = useWrongNetwork();
  const { ETHER, WETH } = useNativeToken();

  const [approvedTokenA, setApprovedTokenA] = useState();
  const [approvedTokenB, setApprovedTokenB] = useState();
  const [showApproveTokenA, setShowApproveTokenA] = useState('');
  const [showApproveTokenB, setShowApproveTokenB] = useState('');

  const isWrapUnwrap = (tokenA, tokenB) => {
    if (!tokenA || !tokenB) return false;
    const isWrap =
      tokenA.symbol === ETHER.symbol && tokenB.symbol === WETH.symbol;
    const isUnwrap =
      tokenA.symbol === WETH.symbol && tokenB.symbol === ETHER.symbol;
    return isUnwrap || isWrap;
  };

  const checkTokenAllowanceA = async () => {
    try {
      if (fromToken && fromToken.symbol !== ETHER.symbol) {
        const allowance = await fetchTokenAllowance(
          fromToken,
          account,
          EDDA_ROUTERS[version][chainId]
        );
        return greaterThan(allowance, 0);
      }
      return true;
    } catch {
      return true;
    }
  };

  const checkTokenAllowanceB = async () => {
    try {
      if (toToken && toToken.symbol !== ETHER.symbol) {
        const allowance = await fetchTokenAllowance(
          toToken,
          account,
          EDDA_ROUTERS[version][chainId]
        );
        return greaterThan(allowance, 0);
      }
      return true;
    } catch {
      return true;
    }
  };
  //check allowance when: from token, to token changes, or after sent the add lp tx
  //to show or hide approve btn
  useEffect(() => {
    const loadAllowance = async () => {
      const approvedA = await checkTokenAllowanceA();
      setApprovedTokenA(approvedA);
      setShowApproveTokenA(!approvedA);

      const approvedB = await checkTokenAllowanceB();
      setApprovedTokenB(approvedB);
      setShowApproveTokenB(!approvedB);
    };
    loadAllowance();
  }, [fromToken, toToken, account, wrongNetwork, loading, version]);

  //change the enable/disable button
  useEffect(() => {
    const loadAllowance = async () => {
      const approvedA = await checkTokenAllowanceA();
      setApprovedTokenA(approvedA);

      const approvedB = await checkTokenAllowanceB();
      setApprovedTokenB(approvedB);
    };
    loadAllowance();
  }, [approvingA, approvingB]);

  const invalidPair =
    !fromToken?.symbol || !toToken?.symbol || isWrapUnwrap(fromToken, toToken);
  const notEntered =
    Number.isNaN(amountIn) ||
    amountIn <= 0 ||
    Number.isNaN(amountOut) ||
    amountOut <= 0;
  const notEnoughFromBalance = lessThan(fromTokenBalance, amountIn);
  const notEnoughToBalance = lessThan(toTokenBalance, amountOut);

  if (invalidPair) {
    return <Button disabled>{t('liquidity.add.invalidPair')}</Button>;
  }
  if (notEntered) {
    return <Button disabled>{t('liquidity.add.enterAmount')}</Button>;
  }
  if (notEnoughFromBalance) {
    return (
      <Button disabled>
        {t('exchange.insufficientBalance', { symbol: fromToken.symbol })}
      </Button>
    );
  }
  if (notEnoughToBalance) {
    return (
      <Button disabled>
        {t('exchange.insufficientBalance', { symbol: toToken.symbol })}
      </Button>
    );
  }

  if (noLiquidity) {
    return (
      <div className="approve-exchange-container">
        <div className="approve-button-container">
          {showApproveTokenA && (
            <React.Fragment>
              <Button
                className="approve-button"
                loading={approvingA}
                onClick={onApproveAClicked}
                disabled={approvedTokenA}
              >
                {t('exchange.approveButton')} {fromToken?.symbol}
              </Button>
              <HiArrowNarrowRight color="#777e90" />
            </React.Fragment>
          )}

          {showApproveTokenB && (
            <React.Fragment>
              <Button
                className="approve-button"
                loading={approvingB}
                onClick={onApproveBClicked}
                disabled={approvedTokenB}
              >
                {t('exchange.approveButton')} {toToken?.symbol}
              </Button>
              <HiArrowNarrowRight color="#777e90" />
            </React.Fragment>
          )}
          <Button
            className={
              showApproveTokenA || showApproveTokenB
                ? 'approve-button'
                : 'supply-button'
            }
            disabled={!approvedTokenA || !approvedTokenB}
            loading={loading}
            onClick={() => onCreatePoolBtnClicked()}
          >
            {t('liquidity.add.supply')}
          </Button>
        </div>
      </div>
    );
  }
  if (showApproveTokenA || showApproveTokenB) {
    return (
      <div className="approve-exchange-container">
        <div className="approve-button-container">
          {showApproveTokenA && (
            <React.Fragment>
              <Button
                className="approve-button"
                loading={approvingA}
                onClick={onApproveAClicked}
                disabled={approvedTokenA}
              >
                {t('exchange.approveButton')} {fromToken?.symbol}
              </Button>
              <HiArrowNarrowRight color="#777e90" />
            </React.Fragment>
          )}

          {showApproveTokenB && (
            <React.Fragment>
              <Button
                className="approve-button"
                loading={approvingB}
                onClick={onApproveBClicked}
                disabled={approvedTokenB}
              >
                {t('exchange.approveButton')} {toToken?.symbol}
              </Button>
              <HiArrowNarrowRight color="#777e90" />
            </React.Fragment>
          )}

          <Button
            disabled={!approvedTokenA || !approvedTokenB}
            className="approve-button"
            loading={loading}
            onClick={onAddBtnClicked}
          >
            {t('liquidity.add.addLiquidity')}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Button loading={loading} onClick={onAddBtnClicked}>
        {t('liquidity.add.addLiquidity')}
      </Button>
    </div>
  );
}

export default ConnectedButton;
