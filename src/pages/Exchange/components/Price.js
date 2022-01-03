import React, { useState } from 'react';
import { getIcon } from 'lib/imageHelper';
import { formattedAmount } from 'lib/numberHelper';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

function Price(props) {
  const { t } = useTranslation();
  const { fromToken, toToken, amountIn, amountOut } = props;
  const [priceSwap, setPriceSwap] = useState(false);

  if (!_.isEmpty(fromToken) && !_.isEmpty(toToken) && amountIn && amountOut) {
    const priceStr = `${formattedAmount(amountIn / amountOut)} ${
      fromToken.symbol
    } ${t('exchange.per')} ${toToken.symbol}`;
    const priceSwapStr = `${formattedAmount(amountOut / amountIn)} ${
      toToken.symbol
    } ${t('exchange.per')} ${fromToken.symbol}`;
    return (
      <div className='detail-row'>
        <span className='text-gray'>{t('exchange.price')}</span>
        <div className='flex align-items-center'>
          <span className='bolder text-error'>
            {priceSwap ? priceSwapStr : priceStr}
          </span>
          <div
            className='icon-swap-container pointer'
            onClick={() => setPriceSwap(!priceSwap)}
          >
            {getIcon('icon-swap')}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default Price;
