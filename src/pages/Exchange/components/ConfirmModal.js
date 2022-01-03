import React from 'react';
import { connect } from 'react-redux';
import ExchangeInfo from './ExchangeInfo';
import CurrencyLogo from 'components/CurrencyLogo';
import { formattedAmount } from 'lib/numberHelper';
import Button from 'components/Button';
import { FaLongArrowAltDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function ConfirmModal(props) {
  const {
    className = '',
    amountIn = 0,
    amountOut = 0,
    fromToken = {},
    toToken = {},
    onConfirm = () => {},
    showPrice,
    amountOutMin,
  } = props;
  const { t } = useTranslation();

  return (
    <div className={`confirm-modal ${className}`}>
      <p className='confirm-modal-title'>{t('exchange.modal.confirmSwap')}</p>
      <div className='token-amount-row'>
        <div className='token-amount-logo-container'>
          <CurrencyLogo
            currency={fromToken}
            style={{ height: '30px', width: '30px' }}
          />
          <span>
            {formattedAmount(amountIn)} {fromToken.symbol}
          </span>
        </div>
      </div>

      <div
        style={{
          width: '30px',
          display: 'flex',
          justifyContent: 'center',
          margin: '8px 0',
        }}
      >
        <FaLongArrowAltDown className='icons' />
      </div>

      <div className='token-amount-row'>
        <div className='token-amount-logo-container'>
          <CurrencyLogo
            currency={toToken}
            style={{ height: '30px', width: '30px' }}
          />
          <span>
            {formattedAmount(amountOut)} {toToken.symbol}
          </span>
        </div>
      </div>
      <br />
      <span className='confirm-warning text-gray'>
        {t('exchange.modal.confirm.warning1')}{' '}
        <b className='text-error' style={{ fontSize: 14 }}>
          {formattedAmount(amountOutMin)} {toToken?.symbol}
        </b>{' '}
        {t('exchange.modal.confirm.warning2')}
      </span>
      <br />
      <hr
        style={{
          borderTop: '1px solid #777e90',
        }}
      />
      <ExchangeInfo {...props} showPrice={showPrice} />
      <hr
        style={{
          borderTop: '1px solid #777e90',
        }}
      />
      <div className='confirm-btn-container'>
        <Button
          label={t('exchange.modal.confirm')}
          onClick={onConfirm}
          className='btn-gradient'
        />
      </div>
    </div>
  );
}

export default ConfirmModal;
