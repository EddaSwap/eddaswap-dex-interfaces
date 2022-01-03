import { useWeb3React } from '@web3-react/core';
import { closeModal, openModal } from 'actions/app/modal';
import { userImportPool } from 'actions/exchange/userPool';
import Button from 'components/Button';
import Card from 'components/Card';
import ConnectWallet from 'components/ConnectWallet';
import CurrencyLogo from 'components/CurrencyLogo';
import SelectTokenModal from 'components/Dialogs/SelectToken';
import DoubleLogo from 'components/DoubleLogo';
import SelectToken from 'components/SelectToken';
import Settings from 'components/Settings';
import VersionSelection from 'components/VersionSelection';
import { ROUTER_VERSION } from 'constants/constants';
import { WBNB } from 'constants/tokens';
import { useNativeToken } from 'hooks/useNativeToken';
import { useApiStore } from 'hooks/useStore';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import { formattedAmount, greaterThan } from 'lib/numberHelper';
import { objectIsEmpty } from 'lib/objectHelper';
import { getLpTokenBalance } from 'lib/sdk/contract';
import { generatePair } from 'lib/sdk/pair';
import {
  generateAllTokensWithETH,
  getAmountFromTokenAmount,
} from 'lib/sdk/token';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { BsChevronDown } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

function Import(props) {
  const { t } = useTranslation();
  const web3Context = useWeb3React();
  const { account, chainId } = web3Context;
  const location = useLocation();

  const wrongNetwork = useWrongNetwork();
  const { ETHER } = useNativeToken();

  const apiStore = useApiStore();

  const [version, setVersion] = useState(ROUTER_VERSION.v2);
  const [state, setState] = useState({
    tokenA: {},
    tokenB: {},
    importLpUserBalance: '',
    pair: {},
    noLiquidity: false,
    selectTokenState: '',
  });
  const [showSelectTokenModal, setShowSelectTokenModal] = useState(false);

  const setStateField = (fieldObj) => {
    setState({ ...state, ...fieldObj });
  };

  const loadedData = apiStore.common.loadedData;

  const { openModal, closeModal, userImportPool } = props;

  useEffect(() => {
    loadTokens();
  }, [loadedData, account]);

  useEffect(() => {
    loadUserImportPair();
  }, [loadedData, account, state.tokenA, state.tokenB]);

  const loadTokens = async () => {
    const allTokens = await generateAllTokensWithETH(chainId);
    setStateField({
      allTokens: allTokens,
    });
  };

  const loadUserImportPair = async () => {
    const { tokenA, tokenB } = state;

    try {
      if (!objectIsEmpty(tokenA) && !objectIsEmpty(tokenB)) {
        const pair = await generatePair([tokenA, tokenB], chainId, version);

        const LpTokenAmount = await getLpTokenBalance(
          pair.liquidityToken.address,
          account,
          chainId
        );
        const userBalance = getAmountFromTokenAmount(LpTokenAmount);

        setStateField({
          importLpUserBalance: userBalance,
          pair: pair,
          noLiquidity: false,
        });
        const validLpBalance = greaterThan(
          LpTokenAmount?.raw?.toString(),
          1000000000
        );

        if (pair && LpTokenAmount && validLpBalance) {
          userImportPool(pair, chainId);
        }
      }
    } catch (error) {
      setStateField({ importLpUserBalance: '0', pair: {}, noLiquidity: true });
    }
  };

  const onSettingClick = () => {
    openModal(<Settings />);
  };

  const renderSelectTokenModal = (tokenState) => {
    const allTokens = state.allTokens;
    return (
      <SelectToken
        tokenList={allTokens}
        onSelectToken={(item) => {
          setStateField({ [tokenState]: item });
          closeModal();
        }}
      />
    );
  };

  const onSelectTokenClick = (tokenState) => {
    setShowSelectTokenModal(true);
    setStateField({ selectTokenState: tokenState });
  };

  const renderSelectToken = (tokenState = 'tokenA') => {
    const token = state[tokenState];
    return (
      <div
        className="import-select-token-container"
        onClick={() => onSelectTokenClick(tokenState)}
      >
        <div className="flex align-center">
          {token?.symbol && <CurrencyLogo currency={token} />}
          <p className="import-token-symbol">
            {token?.symbol || t('component.swapInput.selectToken')}
          </p>
        </div>
        <BsChevronDown
          className="icons"
          size={25}
          style={{ border: '1px solid #777e90', borderRadius: 50, padding: 4 }}
        />
      </div>
    );
  };

  const renderUserLpTokensBalance = () => {
    const { pair } = state;
    const { token0, token1, tokenAmounts = [] } = pair;
    const tokenA = _.isEqual(token0, WBNB) ? ETHER : token0;
    const tokenB = _.isEqual(token1, WBNB) ? ETHER : token1;

    return (
      <div className="import-lptokens-amount-container">
        <p className="import-lptokens-title text-gray">
          {t('liquidity.import.desc')}
        </p>
        <div className="import-lptokens-logo-container">
          <DoubleLogo currency0={tokenA} currency1={tokenB} />
          <span className="import-lptokens-symbol">
            {tokenA?.symbol}/{tokenB?.symbol}
          </span>
        </div>
        <div className="import-lptokens-amount-row">
          <span className="import-lptokens-token-symbol">{tokenA?.symbol}</span>
          <span className="import-lptokens-token-symbol text-error">
            {formattedAmount(getAmountFromTokenAmount(tokenAmounts[0]))}
          </span>
        </div>
        <div className="import-lptokens-amount-row">
          <span className="import-lptokens-token-symbol">{tokenB?.symbol}</span>
          <span className="import-lptokens-token-symbol text-error">
            {formattedAmount(getAmountFromTokenAmount(tokenAmounts[1]))}
          </span>
        </div>
      </div>
    );
  };

  const previousLink = location.query?.previousLink;
  const { importLpUserBalance, noLiquidity } = state;

  return (
    <div className="add-liquidity">
      <div className="row flex justify-content-center">
        <div className="col-lg-5 col-md-12">
          <Card>
            <div className="add-card-header">
              <Link
                to={previousLink ? previousLink : '/addLiquid'}
                className="pointer"
              >
                <AiOutlineArrowLeft className="icons" />
              </Link>
              <div>
                <h4 className="text-error">{t('liquidity.import.title')}</h4>
              </div>
              <div className="pointer" onClick={onSettingClick}>
                <IoSettingsOutline className="icons" size={25} />
              </div>
            </div>
            <br />
            {renderSelectToken('tokenA')}
            {renderSelectToken('tokenB')}
            {!importLpUserBalance && !noLiquidity && (
              <span className="text-align-center text-gray">
                {t('liquidity.import.selectToken')}
              </span>
            )}
            {greaterThan(importLpUserBalance, '0') &&
              renderUserLpTokensBalance()}
            {noLiquidity && (
              <div className="text-align-center">
                <p className="small text-gray">
                  {t('liquidity.import.noPool')}
                </p>
                <br />
                <Link to={`/add/`}>
                  <Button className="add-btn">
                    {t('liquidity.import.create')}
                  </Button>
                </Link>
              </div>
            )}
            <SelectTokenModal
              // disabledToken={disabledToken}
              show={showSelectTokenModal}
              onSelectToken={(item) => {
                setStateField({ [state.selectTokenState]: item });
                setShowSelectTokenModal(false);
              }}
              handleClose={() => setShowSelectTokenModal(false)}
            />
            {importLpUserBalance &&
              !noLiquidity &&
              !greaterThan(importLpUserBalance, '0') && (
                <div className="text-align-center">
                  <p className="small text-gray">
                    {t('liquidity.import.dontHaveLp')}
                  </p>
                  <br />
                  <Link to={`/add/`}>
                    <Button className="add-btn">
                      {t('liquidity.add.addLiquidity')}
                    </Button>
                  </Link>
                </div>
              )}
            {account || !wrongNetwork ? null : (
              <div>
                <ConnectWallet />
              </div>
            )}
          </Card>
          <VersionSelection value={version} onChange={setVersion} />
        </div>
      </div>
    </div>
  );
}

export default connect(null, {
  openModal,
  closeModal,
  userImportPool,
})(Import);
