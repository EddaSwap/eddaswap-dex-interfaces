import React, { useEffect, useState } from 'react';
import { formattedAmount, times } from 'lib/numberHelper';
import { useTranslation } from 'react-i18next';
import { generatePair, getPercentLocked } from 'lib/sdk/pair';
import { useWeb3React } from '@web3-react/core';

function PercentLiquidityLocked({ fromToken, toToken }) {
  const { t } = useTranslation();

  const [pair, setPair] = useState();
  const [percentLocked, setPercentLocked] = useState();

  const { chainId } = useWeb3React();

  useEffect(() => {
    const loadPair = async () => {
      const generatedPair = await generatePair([fromToken, toToken]);
      setPair(generatedPair);
      if (generatedPair) {
        setPercentLocked(await getPercentLocked(generatedPair, chainId));
      }
    };
    loadPair();
  }, [fromToken, toToken]);

  if (!pair) return null;

  return (
    <div className="detail-row">
      <span className="bolder">{t('exchange.pair.locked')}</span>
      <span className="bold text-highlight">
        {formattedAmount(times(percentLocked, 100))}%
      </span>
    </div>
  );
}
export default PercentLiquidityLocked;
