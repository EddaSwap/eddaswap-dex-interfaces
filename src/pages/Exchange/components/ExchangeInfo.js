import React from 'react';
import { getIcon } from 'lib/imageHelper';
import {
  formattedAmount,
  times,
  greaterThanEqual,
  minus,
} from 'lib/numberHelper';
import ToolTip from 'components/Tooltip';
import { useTranslation } from 'react-i18next';
import { FaRegQuestionCircle } from 'react-icons/fa';
import Price from './Price';

function ExchangeInfo(props) {
  const { t } = useTranslation();
  const {
    fromToken,
    toToken,
    amountIn,
    amountOut,
    priceImpact,
    amountOutMin,
    showPrice = false,
    route,
  } = props;

  const show =
    fromToken &&
    toToken &&
    (amountIn > 0 || amountOut > 0) &&
    !Number.isNaN(amountIn) &&
    !Number.isNaN(amountOut);
  const renderDesc = (label, content) => {
    return (
      <div className='detail-row-desc'>
        <span className='text-gray' style={{ marginRight: 8 }}>
          {label}
        </span>
        <ToolTip
          direction='right'
          content={<span className='bolder'>{content}</span>}
        >
          <FaRegQuestionCircle className='text-error' />
        </ToolTip>
      </div>
    );
  };

  const lpFeePercent =
    route?.path && greaterThanEqual(route?.path?.length, 3) ? 0.0064 : 0.004;
  return show ? (
    <React.Fragment>
      <div className='pair-detail'>
        {showPrice && <Price {...props} />}
        <div className='detail-row'>
          {renderDesc(
            t('exchange.priceDetails.minimumReceived'),
            t('exchange.priceDetails.minimumReceived.desc')
          )}
          <span className='bolder text-error'>
            {formattedAmount(amountOutMin)} {toToken?.symbol}
          </span>
        </div>
        <div className='detail-row'>
          {renderDesc(
            t('exchange.priceDetails.priceImpact'),
            t('exchange.priceDetails.priceImpact.desc')
          )}
          <span className='bolder text-error'>{priceImpact}%</span>
        </div>
        <div className='detail-row'>
          {renderDesc(
            t('exchange.priceDetails.lpFee'),
            t('exchange.priceDetails.lpFee.desc')
          )}
          <span className='bolder text-error'>
            {formattedAmount(times(amountIn, lpFeePercent))} {fromToken.symbol}
          </span>
        </div>
        {route?.path && greaterThanEqual(route?.path?.length, 3) && (
          <div className='detail-row'>
            <span>{t('exchange.priceDetails.route')}</span>
            <span className='bolder text-error'>
              {route?.path &&
                route.path.map((item, index) => (
                  <span>
                    {item.symbol}
                    {index !== minus(route?.path.length, 1) && ` > `}
                  </span>
                ))}
            </span>
          </div>
        )}
      </div>
    </React.Fragment>
  ) : null;
}

export default ExchangeInfo;
