import React from 'react';
import { connect } from 'react-redux';
import { formattedAmount } from 'lib/numberHelper';
import { useTranslation } from 'react-i18next';

function WaitingConfirmModal(props) {
  const {
    className = '',
    amountIn = 0,
    amountOut = 0,
    fromToken = {},
    toToken = {},
    actionText = '',
  } = props;
  const { t } = useTranslation();
  return (
    <div className={`waiting-confirm-modal ${className}`}>
      <div className='loader'></div>
      <p className='waiting-text'>{t('exchange.modal.waitingConfirm')}</p>
      <p className='amount-text'>
        {actionText}{' '}
        <span className='text-error'>
          {formattedAmount(amountIn)} {fromToken.symbol}
        </span>{' '}
        {t('exchange.modal.for')}{' '}
        <span className='text-error'>
          {formattedAmount(amountOut)} {toToken.symbol}
        </span>
      </p>
      <p className='desc-text'>{t('exchange.modal.confirmInWallet')}</p>
    </div>
  );
}

export default connect((state) => {
  return {};
}, {})(WaitingConfirmModal);
