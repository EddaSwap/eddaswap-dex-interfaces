import { ChainId } from '@sushiswap/sdk';
import { useWeb3React } from '@web3-react/core';
import { getTokenLogoURL } from 'constants/tokens';
import { useNativeToken } from 'hooks/useNativeToken';
import React, { useMemo } from 'react';
import Logo from './Logo';

const currencyLogo = {
  [ChainId.BSC]:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/logo.png',
  [ChainId.MATIC]:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png',
};

function CurrencyLogo({ currency = {}, style, ...props }) {
  const { chainId } = useWeb3React();

  const { ETHER } = useNativeToken();

  const srcs = useMemo(() => {
    if (!currency) return [];
    if (currency.symbol === ETHER.symbol) {
      const logo =
        chainId === ChainId.MATIC
          ? currencyLogo[ChainId.MATIC]
          : currencyLogo[ChainId.BSC];
      return [logo];
    }
    const tokenURL = getTokenLogoURL(currency.address);
    if (tokenURL) {
      return [tokenURL];
    }
    if (currency.logoURI) {
      return [currency.logoURI];
    }
    return [];
  }, [currency, chainId, ETHER]);

  return (
    <Logo srcs={srcs} {...props} style={{ ...style, borderRadius: '50%' }} />
  );
}

export default CurrencyLogo;
