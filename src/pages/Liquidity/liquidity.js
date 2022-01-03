import { useWeb3React } from '@web3-react/core';
import { openModal } from 'actions/app/modal';
import { loadLpTokenList } from 'actions/liquidity/liquidityPool';
import Button from 'components/Button';
import Card from 'components/Card';
import PositionCard from 'components/PositionCard';
import Settings from 'components/Settings';
import VersionSelection from 'components/VersionSelection';
import VersionAlert from 'components/VersionAlert';
import { ROUTER_VERSION } from 'constants/constants';
import { useApiStore } from 'hooks/useStore';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoSettingsOutline } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { ChainId } from '@sushiswap/sdk';
import { generatePair } from 'lib/sdk/pair';

function Liquidity(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const apiStore = useApiStore();
  const web3Context = useWeb3React();
  const { account, chainId } = web3Context;

  const wrongNetwork = useWrongNetwork();

  const loadedData = apiStore.common.loadedData;
  const liquidityv1 = apiStore.liquidity;
  const liquidityv2 = apiStore.liquidityv2;
  const importedPoolList = apiStore.liquidity.importedPoolList;

  const [state, setState] = useState({
    pairs: [],
    loading: true,
  });
  const [version, setVersion] = React.useState(ROUTER_VERSION.v2);

  const setStateField = (fieldObj) => {
    setState({ ...state, ...fieldObj });
  };

  useEffect(() => {
    if (account && chainId) {
      loadBalance();
    }
  }, [account, liquidityv1, liquidityv2, version]);

  useEffect(() => {
    if (account && chainId) {
      dispatch(loadLpTokenList(account, chainId));
    }
  }, [account, chainId, importedPoolList]);

  const onSettingClick = () => {
    dispatch(openModal(<Settings />));
  };

  const loadBalance = async () => {
    try {
      const importPairs = await Promise.all(
        importedPoolList.map(async ({ token0, token1 }) => {
          return await generatePair([token0, token1], chainId, version);
        })
      );

      setStateField({
        pairs: [
          ...importPairs,
          ...(version === ROUTER_VERSION.v2
            ? liquidityv2.userLpTokensBalance
            : liquidityv1.userLpTokensBalance),
        ],
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load tracked token pair balance', error);
      setStateField({ loading: false });
    }
  };

  const renderLiquidList = () => {
    const { pairs, loading } = state;

    return (
      <div className="liquid-list">
        {!loadedData || loading ? (
          <div className="no-connect-view">
            <span className="note">{t('component.dropdown.loading')}</span>
          </div>
        ) : pairs && pairs.length > 0 ? (
          <div>
            {pairs.map((pair) => {
              return (
                <div className="pointer" key={pair?.liquidityToken?.address}>
                  <PositionCard pair={pair} version={version} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-connect-view">
            <span className="note">{t('liquidity.noLiquidityFound')}</span>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span>{t('liquidity.remove.donttSeePool')} </span>
          <Link
            to={{ pathname: '/find', query: { previousLink: '/addLiquidity' } }}
            style={{ color: '#e6007a' }}
          >
            {t('liquidity.remove.importPool')}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="add-liquidity">
      <div
        style={{
          display:
            version === ROUTER_VERSION.v1 && chainId === ChainId.BSC
              ? 'block'
              : 'none',
        }}
      >
        <VersionAlert />
      </div>
      <div className="row flex justify-content-center">
        <div className="col-lg-5 col-md-12">
          <Card>
            <div className="add-card-header">
              <div>
                <h3 className="text-error">{t('liquidity.title')}</h3>
                <span className="desc">{t('liquidity.addLiquidity')}</span>
              </div>
              <div className="pointer" onClick={onSettingClick}>
                <IoSettingsOutline className="icons" size={25} />
              </div>
            </div>
            <br />
            <Link to="/add/">
              <Button
                className="add-btn"
                disabled={version !== ROUTER_VERSION.v2 ? true : false}
              >
                {t('liquidity.add.addLiquidity')}
              </Button>
            </Link>
            <hr />
            <div>
              <span className="bolder" style={{ color: '#777e90' }}>
                {t('liquidity.yourLiquidity')}
              </span>
              <div className="liquid-list">
                {account && !wrongNetwork ? (
                  <div>{renderLiquidList()}</div>
                ) : (
                  <div className="no-connect-view">
                    <span className="note">
                      {t('liquidity.remove.connectWallet')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <VersionSelection value={version} onChange={setVersion} />
    </div>
  );
}

export default Liquidity;
