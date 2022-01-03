import React from 'react';
import CurrencyLogo from 'components/CurrencyLogo';

function DoubleLogo(props) {
  const { currency0, currency1 } = props;

  return (
    <div className="double-logo">
      <CurrencyLogo
        currency={currency0}
        style={{ marginRight: '6px', borderRadius: '25px' }}
      />
      <CurrencyLogo currency={currency1} />
    </div>
  );
}

export default DoubleLogo;
