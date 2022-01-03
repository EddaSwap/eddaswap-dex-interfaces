import React from 'react';
import { connect } from 'react-redux';
import CurrencyLogo from 'components/CurrencyLogo';
import { formattedAmount, dividedBy } from 'lib/numberHelper';
import Button from 'components/Button';
import DoubleLogo from 'components/DoubleLogo';
import { useTranslation } from 'react-i18next';

function CreatePoolModal(props) {
  const {
    className = '',
    amountIn = 0,
    amountOut = 0,
    fromToken = {},
    toToken = {},
    onConfirm = () => {},
  } = props;
  const { t } = useTranslation();

  return (
    <div className={`add-confirm-modal ${className}`}>
      <p className='confirm-modal-title'>
        {t('liquidity.add.modal.creatingPool')}
      </p>
      <div>
        <div className='liquidity-amount-row'>
          <span>
            {fromToken?.symbol}/{toToken?.symbol}
          </span>
          <DoubleLogo currency0={fromToken} currency1={toToken} />
        </div>
      </div>
      <div className='token-amount-row'>
        <span className='token-amount-value text-gray'>
          {fromToken?.symbol} {t('liquidity.add.modal.deposited')}
        </span>
        <div className='token-amount-logo-container'>
          <span className='token-amount-value'>
            {formattedAmount(amountIn)}
          </span>
          <CurrencyLogo currency={fromToken} style={{ marginLeft: '8px' }} />
        </div>
      </div>
      <div className='token-amount-row'>
        <span className='token-amount-value text-gray'>
          {toToken?.symbol} {t('liquidity.add.modal.deposited')}
        </span>
        <div className='token-amount-logo-container'>
          <span className='token-amount-value'>
            {formattedAmount(amountOut)}
          </span>
          <CurrencyLogo currency={toToken} style={{ marginLeft: '8px' }} />
        </div>
      </div>
      <div className='token-amount-row'>
        <span className='token-amount-value text-gray'>
          {t('liquidity.add.modal.rates')}
        </span>
        <div>
          <span className='token-amount-value'>
            1 {fromToken.symbol} ={' '}
            {formattedAmount(dividedBy(amountIn, amountOut))} {toToken.symbol}
          </span>
          <br />
          <span className='token-amount-value'>
            1 {toToken.symbol} ={' '}
            {formattedAmount(dividedBy(amountOut, amountIn))} {fromToken.symbol}
          </span>
        </div>
      </div>
      <div className='token-amount-row'>
        <span className='token-amount-value text-gray'>
          {t('liquidity.add.modal.shareOfPool')}
        </span>
        <div className='token-amount-logo-container'>
          <span className='token-amount-value'>100%</span>
        </div>
      </div>
      <hr
        style={{
          marginTop: 30,
          marginBottom: 20,
          borderTop: '1px solid #e6e8ec',
        }}
      />
      <div className='confirm-btn-container'>
        <Button
          label={t('liquidity.add.modal.createPoolSupply')}
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
}, {})(CreatePoolModal);
