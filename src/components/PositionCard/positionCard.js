import React, { useEffect, useState } from 'react';
import Collapsible from 'components/Collapsible';
import { getLiquidityValue } from 'lib/sdk/pair';
import { getLpTokenBalance } from 'lib/sdk/contract';
import { Link } from 'react-router-dom';
import Button from 'components/Button';
import { getAmountFromTokenAmount } from 'lib/sdk/token';
import DoubleLogo from 'components/DoubleLogo';
import { dividedBy, formattedAmount, times } from 'lib/numberHelper';
import { WBNB } from 'constants/tokens';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import { useNativeToken } from 'hooks/useNativeToken';

function PositionCard({ pair, version }) {
  const { t } = useTranslation();

  const { account, active, chainId } = useWeb3React();
  const { ETHER } = useNativeToken();
  const currency0 = _.isEqual(pair?.token0, WBNB) ? ETHER : pair?.token0;
  const currency1 = _.isEqual(pair?.token1, WBNB) ? ETHER : pair?.token1;

  const [amount, setAmount] = useState({});
  const [userBalance, setUserBalance] = useState(0);
  const [shareOfPool, setShareOfPool] = useState(0);

  useEffect(() => {
    async function getLqValue() {
      if (active && pair && pair.liquidityToken) {
        try {
          const balance = await getLpTokenBalance(
            pair.liquidityToken.address,
            account,
            chainId
          );
          const value = await getLiquidityValue(pair, account);
          const rawBalance = getAmountFromTokenAmount(balance);
          setUserBalance(rawBalance);
          setAmount(value);
          if (rawBalance === value?.totalSupply) {
            setShareOfPool(100);
          } else
            setShareOfPool(
              times(dividedBy(rawBalance, value?.totalSupply), 100)
            );
        } catch {}
      }
    }
    getLqValue();
  }, [pair]);

  if (!pair || !pair.liquidityToken || !pair.liquidityToken.address) {
    return null;
  }

  return (
    <Collapsible
      title={
        <div className="liquid-collapse-header flex align-center">
          <DoubleLogo currency0={currency0} currency1={currency1} />
          <span
            className="liquid-pair-name"
            style={{ fontWeight: 'normal', marginLeft: 8 }}
          >
            {currency0?.symbol}/{currency1?.symbol}
          </span>
        </div>
      }
      IconComponent={
        <Button text className="liquidity-manage-button" label="Manage" />
      }
    >
      <div className="liquid-collapse-content">
        <div className="liquid-collapse-content-row">
          <span>{t('component.positionCard.totalPoolTokens')}: </span>
          <span>{formattedAmount(userBalance)}</span>
        </div>
        <div className="liquid-collapse-content-row">
          <span className>{t('component.positionCard.yourShareOfPool')}: </span>
          <span>
            {shareOfPool < 0.01 ? '<0.01' : formattedAmount(shareOfPool, 2)}%
          </span>
        </div>
        <div className="liquid-collapse-content-row">
          <span>
            {t('component.positionCard.your', { symbol: currency0?.symbol })}:{' '}
          </span>
          <span>{formattedAmount(amount?.amountA)}</span>
        </div>
        <div className="liquid-collapse-content-row">
          <span>
            {t('component.positionCard.your', { symbol: currency1?.symbol })}:{' '}
          </span>
          <span>{formattedAmount(amount?.amountB)}</span>
        </div>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <Link
          to={{
            pathname: `/remove/${pair?.liquidityToken?.address}`,
            search: `?version=${version}`,
          }}
        >
          <Button label={t('component.positionCard.remove')} />
        </Link>
      </div>
    </Collapsible>
  );
}

export default PositionCard;
