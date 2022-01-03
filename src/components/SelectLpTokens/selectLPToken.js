import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import DoubleLogo from 'components/DoubleLogo';
import { userImportPool } from 'actions/exchange/userPool';
import { useTranslation } from 'react-i18next';
import TextInput from 'components/TextInput';
import { generatePairFromLpAddress, getTokensFromPair } from 'lib/sdk/pair';
import { arrayofObjectToObjectTwoKeys } from 'lib/objectHelper';
import Button from 'components/Button';
import { loadLpTokenList } from 'actions/liquidity/liquidityPool';
import { isMobile } from 'react-device-detect';
import { truncateAddress } from 'lib/stringHelper';
import { useWeb3React } from '@web3-react/core';

function SelectLPToken(props) {
  const { onSelectToken = () => {} } = props;
  const { lpTokenPairs } = useSelector((reducer) => reducer.api.liquidity);
  const { importedPoolList } = useSelector((reducer) => reducer.api.liquidity);
  const { t } = useTranslation();
  const { account, chainId } = useWeb3React();

  const [isSearchToken, setIsSearchToken] = useState(false);
  const [searchTokenList, setSearchTokenList] = useState([]);
  const [allPairsObject, setAllPairsObject] = useState([]);

  useEffect(() => {
    setAllPairsObject(
      arrayofObjectToObjectTwoKeys(lpTokenPairs, 'liquidityToken', 'address')
    );
    props.loadLpTokenList(account, chainId);
  }, [account, chainId, lpTokenPairs, importedPoolList]);

  const onChangeAddress = async (address) => {
    try {
      if (address) {
        setIsSearchToken(true);
        const pair = await generatePairFromLpAddress(address, chainId);
        if (pair) {
          setSearchTokenList([pair]);
        }
      } else setIsSearchToken(false);
    } catch (error) {}
  };

  const pairRow = (pair = {}, searching = false) => {
    const address = pair?.liquidityToken?.address;
    if (pair && pair.liquidityToken && pair.tokenAmounts) {
      const {
        currency0 = {},
        currency1 = {},
        token0 = {},
        token1 = {},
      } = getTokensFromPair(pair, chainId);
      return (
        <div
          className={`token-container`}
          key={address}
          onClick={() => onSelectToken(pair)}
        >
          <div className="border-circle">
            <DoubleLogo currency0={currency0} currency1={currency1} />
          </div>

          <div>
            <span className="token-symbol">
              {currency0?.symbol}/{currency1?.symbol}
            </span>
            <br />
            {searching && !allPairsObject[address] ? (
              <div className="add-custom-token-container">
                <span className="token-name">
                  {t('component.selectToken.foundByAddress')}{' '}
                </span>
                <Button
                  onClick={(e) => {
                    props.userImportPool(pair, chainId);
                    // e.stopPropagation();
                  }}
                  text
                >
                  ({t('component.selectToken.add')})
                </Button>
              </div>
            ) : (
              <span className="token-name">
                {isMobile
                  ? truncateAddress(pair?.liquidityToken?.address)
                  : pair?.liquidityToken?.address}
              </span>
            )}
          </div>
        </div>
      );
    } else return null;
  };
  const renderSearchTokenList = () => {
    return (
      <div className="scroll-list">
        {searchTokenList.map((item) => {
          return pairRow(item, true);
        })}
      </div>
    );
  };

  const renderDefaultTokenList = () => {
    return (
      <div className="scroll-list">
        {lpTokenPairs.map((item) => {
          return pairRow(item);
        })}
      </div>
    );
  };
  return (
    <div className="select-token">
      <div className="sticky-header">
        <span className="bold">{t('component.selectToken.selectAToken')}</span>
      </div>
      <TextInput
        placeholder={t('component.selectToken.pasteAddress')}
        containerClassname="search-token-input"
        onChange={(address) => onChangeAddress(address)}
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
    userImportPool,
    loadLpTokenList,
  }
)(SelectLPToken);
