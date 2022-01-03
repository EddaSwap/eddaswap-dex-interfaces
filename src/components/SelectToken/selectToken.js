import React, { useState } from 'react';
import { connect } from 'react-redux';
import CurrencyLogo from 'components/CurrencyLogo';
import TextInput from 'components/TextInput';
import { generateToken } from 'lib/sdk/token';
import Button from 'components/Button';
import { userAddToken, userRemoveToken } from 'actions/exchange/userToken';
import { arrayofObjectToObject } from 'lib/objectHelper';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import { useAllTokens, useUserAddedTokensObject } from 'hooks/useToken';

function SelectToken(props) {
  const { onSelectToken = () => {} } = props;

  const { t } = useTranslation();
  const web3Context = useWeb3React();
  const { chainId } = web3Context;

  const [isSearchToken, setIsSearchToken] = useState(false);
  const [searchTokenList, setSearchTokenList] = useState([]);

  const allTokens = useAllTokens();

  const onChangeSearch = async (searchStr) => {
    try {
      if (searchStr) {
        const findTokenInAllTokens = allTokens.filter((item) => {
          const search = searchStr?.toLowerCase();
          const symbol = item?.symbol?.toLowerCase();
          return symbol?.includes(search);
        });

        if (findTokenInAllTokens && findTokenInAllTokens.length) {
          setIsSearchToken(true);
          setSearchTokenList(findTokenInAllTokens);
        } else {
          setIsSearchToken(true);
          const token = await generateToken(searchStr, chainId);
          if (token) {
            setSearchTokenList([token]);
          } else {
            setSearchTokenList([]);
          }
        }
      } else {
        setIsSearchToken(false);
        setSearchTokenList([]);
      }
    } catch {}
  };

  const userAddedTokenObject = useUserAddedTokensObject(chainId);
  const allTokensObject = arrayofObjectToObject(allTokens, 'address');

  const currencyRow = (currency = {}, searching = false) => {
    const address = currency?.address;

    return (
      <div
        className={`token-container`}
        key={currency?.symbol}
        onClick={() => onSelectToken(currency)}
      >
        <div className='border-circle'>
          <CurrencyLogo currency={currency} />
        </div>

        <div>
          <span className='token-symbol'>{currency?.symbol}</span>
          <br />
          {userAddedTokenObject[address] ? (
            <div className='add-custom-token-container'>
              <span className='token-name'>
                {t('component.selectToken.addedByUser')}{' '}
              </span>
              <Button
                onClick={(e) => {
                  props.userRemoveToken(currency, chainId);
                  e.stopPropagation();
                }}
                text
              >
                ({t('component.selectToken.remove')})
              </Button>
            </div>
          ) : searching && !allTokensObject[address] ? (
            <div className='add-custom-token-container'>
              <span className='token-name'>
                {t('component.selectToken.foundByAddress')}{' '}
              </span>
              <Button
                onClick={(e) => {
                  props.userAddToken(currency, chainId);
                  e.stopPropagation();
                }}
                text
              >
                ({t('component.selectToken.add')})
              </Button>
            </div>
          ) : (
            <span className='token-name'>{currency.name}</span>
          )}
        </div>
      </div>
    );
  };
  const renderSearchTokenList = () => {
    return (
      <div className='scroll-list'>
        {searchTokenList.map((item) => {
          return currencyRow(item, true);
        })}
      </div>
    );
  };

  const renderDefaultTokenList = () => {
    return (
      <div className='scroll-list'>
        {allTokens.map((item) => {
          return currencyRow(item);
        })}
      </div>
    );
  };
  return (
    <div className='select-token'>
      <div className='sticky-header'>
        <span className='bold'>{t('component.selectToken.selectAToken')}</span>
      </div>
      <TextInput
        placeholder={t('component.selectToken.searchAddress')}
        containerClassname='search-token-input'
        onChange={(value) => onChangeSearch(value)}
      />
      {isSearchToken ? renderSearchTokenList() : renderDefaultTokenList()}
    </div>
  );
}

export default connect(
  (state) => {
    return {};
  },
  {
    userAddToken,
    userRemoveToken,
  }
)(SelectToken);
