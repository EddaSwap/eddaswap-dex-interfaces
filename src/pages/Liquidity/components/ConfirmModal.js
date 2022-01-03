import Button from 'components/Button';
import DoubleLogo from 'components/DoubleLogo';
import { formattedAmount } from 'lib/numberHelper';
import { getAmountFromTokenAmount } from 'lib/sdk/token';
import { getLiquidityMinted } from 'lib/sdkHelper';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useWeb3React } from '@web3-react/core';

function ConfirmModal(props) {
  const {
    className = '',
    amountIn = 0,
    amountOut = 0,
    fromToken = {},
    toToken = {},
    onConfirm = () => {},
    slippage = 0,
  } = props;
  const { t } = useTranslation();
  const { chainId } = useWeb3React();

  const [mintedAmount, setMountedAmount] = useState(0);
  const [loadingMintedAmount, setLoadingMintedAmount] = useState(false);
  const loadMintedAmount = async () => {
    try {
      const { liquidityMinted } = await getLiquidityMinted(
        fromToken,
        toToken,
        amountIn,
        amountOut,
        chainId
      );
      setLoadingMintedAmount(false);
      if (liquidityMinted) {
        setMountedAmount(getAmountFromTokenAmount(liquidityMinted));
      }
    } catch (error) {
      setLoadingMintedAmount(false);
      console.error('Failed to load minted amount', error);
    }
  };
  useEffect(() => {
    setLoadingMintedAmount(true);
    loadMintedAmount();
  }, []);
  return (
    <div className={`add-confirm-modal ${className}`}>
      <p className='confirm-modal-title'>
        {t('liquidity.add.modal.confirm.title')}
      </p>
      {loadingMintedAmount ? (
        <div className='loader-container'>
          <div className='loader'></div>
        </div>
      ) : (
        <div>
          <div className='liquidity-amount-row'>
            <span>{formattedAmount(mintedAmount)}</span>
            <DoubleLogo currency0={fromToken} currency1={toToken} />
          </div>
          <p className='pool-token-pair-name'>
            {fromToken.symbol}/{toToken.symbol}{' '}
            {t('liquidity.add.modal.confirm.poolTokens')}
          </p>
        </div>
      )}
      <i className='add-liquidity-note'>
        {t('liquidity.add.modal.confirm.outputIsEstimated', {
          slippage: slippage,
        })}
      </i>
      <hr
        style={{
          marginTop: 10,
          borderTop: '1px solid #e6e8ec',
          marginBottom: 0,
        }}
      />
      <div className='confirm-btn-container'>
        <Button
          label={t('liquidity.add.supply')}
          onClick={onConfirm}
          className='btn-gradient'
        />
      </div>
    </div>
  );
}

export default connect((state) => {
  return {
    slippage: state.api.settings.slippage,
  };
}, {})(ConfirmModal);
