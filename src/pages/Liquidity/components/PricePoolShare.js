import {
  dividedBy,
  formattedAmount,
  fromWei,
  plus,
  times,
} from 'lib/numberHelper';
import { getLiquidityMinted } from 'lib/sdk/pair';
import { getAmountFromTokenAmount } from 'lib/sdk/token';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';

function PricePoolShare(props) {
  const { t } = useTranslation();
  const { chainId } = useWeb3React();

  const { fromToken, toToken, amountIn, amountOut, noLiquidity } = props;

  const [loadingMintedAmount, setLoadingMintedAmount] = useState(false);
  const [poolSharePercent, setPoolSharePercent] = useState(0);

  const loadMintedAmount = async () => {
    try {
      if (fromToken && toToken && amountIn && amountOut && !noLiquidity) {
        setLoadingMintedAmount(true);
        const { liquidityMinted, totalSupply } = await getLiquidityMinted(
          fromToken,
          toToken,
          amountIn,
          amountOut,
          chainId
        );
        if (liquidityMinted) {
          const convertedMintedAmount =
            getAmountFromTokenAmount(liquidityMinted);
          const convertedTotalSupply = fromWei(totalSupply, 18);
          setPoolSharePercent(
            times(
              dividedBy(
                convertedMintedAmount,
                plus(convertedTotalSupply, convertedMintedAmount)
              ),
              100
            )
          );
        }
        setLoadingMintedAmount(false);
      }
    } catch (error) {
      setLoadingMintedAmount(false);
      console.error('Failed to load minted amount', error);
    }
  };

  useEffect(() => {
    loadMintedAmount();
  }, [fromToken, toToken, amountIn, amountOut]);
  if (fromToken && toToken && amountIn && amountOut) {
    return (
      <div className='price-share-container'>
        <hr style={{ marginTop: 10, borderTop: '1px solid #e6e8ec' }} />

        <div className='title'>
          <span className='bold' style={{ fontSize: '20px' }}>
            {t('exchange.price')}
          </span>
        </div>

        <div className='price-share-container'>
          <div className='value-container child'>
            <div className='value-col'>
              <span className='bolder'>
                {formattedAmount(
                  amountOut == 0 ? 0 : dividedBy(amountIn, amountOut)
                )}
              </span>
              <span className='small value-desc'>
                {fromToken.symbol} {t('exchange.per')} {toToken.symbol}
              </span>
            </div>
            <div className='value-col'>
              <span className='bolder'>
                {formattedAmount(
                  amountIn == 0 ? 0 : dividedBy(amountOut, amountIn)
                )}
              </span>
              <span className='small value-desc'>
                {toToken.symbol} {t('exchange.per')} {fromToken.symbol}
              </span>
            </div>
            <div className='value-col'>
              {loadingMintedAmount ? (
                <div className='loader' />
              ) : (
                <span className='bolder'>
                  {noLiquidity
                    ? '100'
                    : poolSharePercent < 0.01
                    ? '<0.01'
                    : formattedAmount(poolSharePercent) ?? '0'}
                  %
                </span>
              )}
              <span className='small value-desc'>
                {t('liquidity.add.percentPoolShare')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default PricePoolShare;
