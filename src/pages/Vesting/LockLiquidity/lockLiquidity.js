import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useWeb3React } from '@web3-react/core';
import CurrencyLogo from 'components/CurrencyLogo';
import DropDown from 'components/DropDown/v2';
import LockLPInput from 'components/LockLpInput';
import PercentSelection from 'components/PercentSelection';
import { EDDA_VESTING_BY_CHAIN } from 'constants/address';
import {
  dividedBy,
  formattedAmount,
  greaterThan,
  greaterThanEqual,
  times,
  toWei,
} from 'lib/numberHelper';
import {
  generateLpTokenContract,
  generateVestingContract,
} from 'lib/sdk/contract';
import { generatePairFromLpAddress, getTokensFromPair } from 'lib/sdk/pair';
import { toV1LiquidityToken, toV2LiquidityToken } from 'lib/sdk/token';
import { sendApprove, sendTransaction } from 'lib/sendTransaction/v2';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import LockButton from './LockButton';
import { useStyles } from './style';
import { ROUTER_VERSION } from 'constants/constants';

const LOCKUP_PERIOD = [3, 6, 9, 12, 24];

function LockLP() {
  const web3Context = useWeb3React();
  const { account, chainId } = web3Context;
  const { address, version = ROUTER_VERSION.v1 } = useParams();
  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [token0, setToken0] = useState();
  const [token1, setToken1] = useState();
  const [lpToken, setLpToken] = useState({});
  const [lockInputAmount, setLockInputAmount] = useState();
  const [lpTokenBalance, setLpTokenBalance] = useState();
  const [lockupMonths, setLockupMonths] = useState(3);
  const [approving, setApproving] = useState(false);
  const [locking, setLocking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputAmountError, setInputAmountError] = useState(false);

  useEffect(() => {
    const loadSelectedPair = async () => {
      setLoading(true);
      if (!address) {
        setLoading(false);
        return;
      }
      const pair = await generatePairFromLpAddress(address, chainId, version);
      if (!pair) {
        setLoading(false);
        return;
      }
      const { currency0, currency1, token0, token1 } = getTokensFromPair(
        pair,
        chainId
      );
      const generateLiquidityTokenFunc = {
        [ROUTER_VERSION.v1]: toV1LiquidityToken,
        [ROUTER_VERSION.v2]: toV2LiquidityToken,
      };
      setToken0(currency0);
      setToken1(currency1);
      setLpToken(
        generateLiquidityTokenFunc[version]([token0, token1], chainId)
      );
      setLoading(false);
    };
    loadSelectedPair();
  }, [account, chainId]);

  const onSelectPercent = (e) => {
    const percent = e?.currentTarget?.value;
    setLockInputAmount(times(lpTokenBalance, dividedBy(percent, 100)));
  };

  const onSelectLockupMonths = (e) => {
    setLockupMonths(e.target.value);
  };

  const onChangeAmount = (amount) => {
    setLockInputAmount(amount);
    if (greaterThan(amount, lpTokenBalance)) {
      setInputAmountError('Please input valid amount');
    } else {
      setInputAmountError('');
    }
  };

  const onApproveClicked = () => {
    sendApprove({
      tokenAddress: lpToken?.address,
      tokenContract: generateLpTokenContract(lpToken?.address),
      spender: EDDA_VESTING_BY_CHAIN[chainId],
      setLoading: setApproving,
      successMessage: 'Approve EDDA LP',
      dispatch,
      web3Context,
    });
  };

  const onLockClicked = () => {
    if (!lpToken?.address || !lockInputAmount || !lockupMonths) return;

    const lockOption = LOCKUP_PERIOD.findIndex((item) => item === lockupMonths);
    sendTransaction({
      contract: generateVestingContract(chainId),
      contractAddress: EDDA_VESTING_BY_CHAIN[chainId],
      methods: 'userDeposit',
      params: [
        lpToken?.address,
        toWei(lockInputAmount, lpToken.decimals),
        lockOption,
      ],
      setLoading: setLocking,
      successMessage: `Lock ${formattedAmount(lockInputAmount)} EDDA-LP`,
      dispatch,
      web3Context,
    });
  };

  if (!address) {
    history.push('/lockLiquidity');
  }

  return (
    <Grid container justify="center">
      <Grid item xs={12} md={12} lg={6}>
        <Card className={classes.card}>
          <Box className={classes.lockLiquidityCardHeader}>
            <Link to="/lockLiquidity">
              <AiOutlineArrowLeft className="icons" size={20} />
            </Link>
            <Typography className={classes.lockLiquidityCardTitle} variant="h5">
              {t('nft.vesting.lock.title')}
            </Typography>
          </Box>

          <br />
          {loading ? (
            <CircularProgress size={25} />
          ) : (
            <div className={classes.lockLiquidityTokensContainer}>
              <CurrencyLogo
                currency={token0}
                className={classes.lockLiquidityTokensIcon}
              />
              <Typography variant="h6">
                {token0?.symbol} / {token1?.symbol}
              </Typography>
              <CurrencyLogo
                currency={token1}
                className={classes.lockLiquidityTokensIcon}
              />
            </div>
          )}
          <br />
          <Typography className={classes.greyTextBold}>
            {t('nft.vesting.lock.howMany')}
          </Typography>
          <br />
          <Grid container justify="center">
            <Grid item xs={12} lg={8}>
              <LockLPInput
                token={lpToken}
                value={lockInputAmount}
                onSetTokenBalance={setLpTokenBalance}
                onChangeAmount={onChangeAmount}
                FooterComponent={
                  <PercentSelection onChange={onSelectPercent} unit="%" />
                }
              />
              <Typography variant="body1" color="error">
                {inputAmountError}
              </Typography>
            </Grid>
          </Grid>
          <br />
          <Grid container justify="center">
            <Grid
              item
              xs={12}
              lg={12}
              className={classes.lockupMonthsContainer}
            >
              <Typography variant="h6" className={classes.greyTextBold}>
                {t('nft.vesting.lock.period')}:{' '}
              </Typography>
              <DropDown
                options={LOCKUP_PERIOD.map((item, index) => {
                  return {
                    label: `${item} ${t('nft.vesting.lock.months')}`,
                    value: item,
                  };
                })}
                onChange={onSelectLockupMonths}
                defaultValue={lockupMonths}
                itemClassName={classes.greyTextBold}
              />
            </Grid>
            <br />
          </Grid>
          <br />
          <LockButton
            approving={approving}
            loading={locking}
            onApproveClicked={onApproveClicked}
            onLockClicked={onLockClicked}
            lpToken={lpToken}
            disabledLockButton={
              !greaterThan(lockInputAmount, 0) ||
              greaterThanEqual(lockInputAmount, lpTokenBalance)
            }
          />
        </Card>
      </Grid>
    </Grid>
  );
}

export default LockLP;
