import { Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useWeb3React } from '@web3-react/core';
import { fetchTokenPrice } from 'actions/vesting/price';
import SwitchLabels from 'components/SwitchButton';
import VersionSelection from 'components/VersionSelection';
import { EDDA_VESTING_BY_CHAIN } from 'constants/address';
import { ROUTER_VERSION } from 'constants/constants';
import { useApiStore } from 'hooks/useStore';
import { greaterThan, plus, times } from 'lib/numberHelper';
import {
  generateLpTokenContract,
  getBalanceOf,
  getUserLockInfor,
} from 'lib/sdk/contract';
import {
  generatePair,
  getLiquidityAmount,
  getTokensFromPair,
} from 'lib/sdk/pair';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PairCard from './components/VestingPairCard';

const useStyles = makeStyles({
  lockedOnlyContainer: {
    width: '100%',
    // padding: 20,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  bodyContainer: {
    textAlign: 'center',
  },
  switchLabel: {
    textTransform: 'uppercase',
  },
});

function Vesting() {
  const web3Context = useWeb3React();
  const { account, chainId } = web3Context;
  const { prices } = useSelector((state) => state.api.token);
  const { txHash } = useSelector((state) => state.app.snackbar);
  const apiStore = useApiStore();

  const [userLockedTokens, setUserLockedTokens] = useState([]);
  const [showLockedOnly, setShowLockedOnly] = useState(false);
  const [lockVestingPairs, setLockVestingPairs] = useState([]);
  const [filteredLockVestingPairs, setFilteredLockVestingPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState(ROUTER_VERSION.v2);
  // const vestingTokensPairs = useVestingTokenPairs();
  const liquidityv1 = apiStore.liquidity;
  const liquidityv2 = apiStore.liquidityv2;
  const importedPoolList = apiStore.liquidity.importedPoolList;
  const dispatch = useDispatch();
  const classes = useStyles();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchTokenPrice());
  }, []);

  useEffect(() => {
    fetchUserLocked();
  }, [account, chainId, txHash]);

  useEffect(() => {
    setLoading(true);
    loadVestingPairs();
  }, [
    account,
    chainId,
    prices,
    userLockedTokens,
    txHash,
    version,
    liquidityv1,
    liquidityv2,
  ]);

  useEffect(() => {
    filterLockedOnly(showLockedOnly);
  }, [showLockedOnly, lockVestingPairs, txHash, loading]);

  const fetchUserLocked = async () => {
    if (account) {
      const infos = await getUserLockInfor(account, chainId);
      if (!infos) return;
      const { userLockInfor } = infos;
      const userLockingList = userLockInfor.filter((item) => !item.isUnlocked);
      setUserLockedTokens(userLockingList);
    }
  };

  const loadLockedValue = async ({ pair, balance, prices }) => {
    try {
      if (pair?.liquidityToken) {
        const amount = await getLiquidityAmount(pair, balance);

        if (!amount?.amountA) return;
        const { amountA, amountB } = amount;

        const { currency0, currency1 } = getTokensFromPair(pair, chainId);

        const tokenAValue = times(amountA, prices[currency0?.symbol]);
        const tokenBValue = times(amountB, prices[currency1?.symbol]);
        return {
          amountA,
          amountB,
          tokenAValue,
          tokenBValue,
          currency0,
          currency1,
        };
      }
    } catch (error) {}
  };

  const loadVestingPairs = async () => {
    try {
      const importPairs = await Promise.all(
        importedPoolList.map(async ({ token0, token1 }) => {
          return await generatePair([token0, token1], chainId, version);
        })
      );

      const tokenPairsWithLiquidityTokens = [
        ...importPairs,
        ...(version === ROUTER_VERSION.v2
          ? liquidityv2.lpTokenPairs
          : liquidityv1.lpTokenPairs),
      ];

      const userLockedPairs = await Promise.all(
        tokenPairsWithLiquidityTokens.map(async (pair) => {
          return await loadPairData(pair);
        })
      );

      const sortTVLLockedPairs = _.orderBy(userLockedPairs, ['tvl'], ['desc']);

      setLockVestingPairs(sortTVLLockedPairs);
      setFilteredLockVestingPairs(sortTVLLockedPairs);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load vesting pairs', error);
    }
  };

  const loadPairData = async (pair) => {
    try {
      if (pair && pair?.tokenAmounts) {
        const lpTokenContract = generateLpTokenContract(
          pair?.liquidityToken?.address
        );
        const lockedBalance = await getBalanceOf(
          lpTokenContract,
          EDDA_VESTING_BY_CHAIN[chainId]
        );
        const totalLocked = await loadLockedValue({
          pair,
          balance: lockedBalance,
          prices,
        });

        const userLockInfo = userLockedTokens.filter(
          (item) => item.token === pair.liquidityToken.address
        );
        let userLocked = [];

        if (userLockInfo && userLockInfo.length) {
          userLocked = await Promise.all(
            userLockInfo.map(async (lock) => {
              const lockedData = await loadLockedValue({
                pair,
                balance: lock?.amount,
                prices,
              });
              return {
                ...lockedData,
                ...lock,
              };
            })
          );
        }

        return {
          pair,
          lockedBalance,
          totalLocked,
          userLocked,
          tvl: plus(totalLocked?.tokenAValue, totalLocked?.tokenBValue),
        };
      }
    } catch (error) {
      console.error('Failed to load vesting pairs', error);
    }
  };

  const filterLockedOnly = (lockedOnly) => {
    if (lockedOnly) {
      const lockedOnlyPairs = lockVestingPairs.filter((item) =>
        greaterThan(item?.userLocked?.length, 0)
      );
      setFilteredLockVestingPairs(lockedOnlyPairs);
    } else {
      setFilteredLockVestingPairs(lockVestingPairs);
    }
  };

  const onLockedOnlyChange = () => {
    const newShowLockedOnly = !showLockedOnly;

    setShowLockedOnly(newShowLockedOnly);

    filterLockedOnly(newShowLockedOnly);
  };

  return (
    <Grid container justify="center">
      <Grid
        item
        xs={12}
        md={10}
        lg={8}
        xl={8}
        xxl={7}
        className={classes.bodyContainer}
      >
        <div className={classes.lockedOnlyContainer}>
          <SwitchLabels
            label={t('nft.vesting.lockedOnly')}
            checked={showLockedOnly}
            onChange={onLockedOnlyChange}
            formClasses={{
              label: classes.switchLabel,
            }}
          />
        </div>
        {loading && <CircularProgress />}
        {filteredLockVestingPairs?.map((pair, index) => {
          return (
            <PairCard
              key={index}
              lockPairData={pair}
              version={version}
              userLockInfo={
                userLockedTokens[pair?.pair?.liquidityToken?.address]
              }
            />
          );
        })}
        {showLockedOnly && filteredLockVestingPairs.length === 0 && (
          <Typography variant="h5" style={{ padding: 20 }}>
            You haven't locked any liquidity yet
          </Typography>
        )}
        <Typography variant="h6" style={{ padding: 20 }}>
          {t('liquidity.remove.donttSeePool')}{' '}
          <Link to={{ pathname: '/find', query: { previousLink: '/vesting' } }}>
            {t('liquidity.remove.importPool')}
          </Link>
        </Typography>
        <VersionSelection value={version} onChange={setVersion} />
      </Grid>
    </Grid>
  );
}

export default Vesting;
