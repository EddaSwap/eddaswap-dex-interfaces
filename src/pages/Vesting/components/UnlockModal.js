import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Button from 'components/Button';
import CurrencyLogo from 'components/CurrencyLogo';
import { EDDA_VESTING_BY_CHAIN } from 'constants/address';
import { formattedAmount } from 'lib/numberHelper';
import { generateVestingContract } from 'lib/sdk/contract';
import { sendTransaction } from 'lib/sendTransaction/v2';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';

function UnlockModal({ userLockInfo, setUnlocking, unlocking }) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { t } = useTranslation();

  const web3Context = useWeb3React();
  const { chainId } = useWeb3React();

  const onUnlockClicked = () => {
    const vestingAddress = EDDA_VESTING_BY_CHAIN[chainId];
    sendTransaction({
      contract: generateVestingContract(chainId),
      contractAddress: vestingAddress,
      methods: 'userWithDrawn',
      params: [userLockInfo?.id],
      setLoading: setUnlocking,
      successMessage: `Unlock ${formattedAmount(userLockInfo?.amount)} EDDA-LP`,
      dispatch,
      web3Context,
    });
  };

  if (!userLockInfo?.amount || !userLockInfo?.amountA) {
    return (
      <Typography variant="h6">
        {t('nft.vesting.modal.noLiquidityLockDesc')}
      </Typography>
    );
  }
  const { currency0, currency1, amountA, amountB } = userLockInfo;

  return (
    <div>
      <Typography variant="h6" className={classes.title}>
        {t('nft.vesting.modal.confirmUnlock')}
      </Typography>
      <Typography variant="body2">
        {t('nft.vesting.modal.lockedValue')}
      </Typography>
      <br />
      <div className={classes.lockedValueRow}>
        <div className={classes.lockedTokenContainer}>
          <CurrencyLogo
            currency={currency0}
            className={classes.lockedValueIcon}
          />
          <Typography className={classes.lockedValueSymbol}>
            {formattedAmount(amountA)}
          </Typography>
        </div>

        <Typography className={classes.lockedValueSymbol}>
          {currency0?.symbol}
        </Typography>
      </div>
      <br />
      <div className={classes.lockedValueRow}>
        <div className={classes.lockedTokenContainer}>
          <CurrencyLogo
            currency={currency1}
            className={classes.lockedValueIcon}
          />
          <Typography className={classes.lockedValueSymbol}>
            {formattedAmount(amountB)}
          </Typography>
        </div>

        <Typography className={classes.lockedValueSymbol}>
          {currency1?.symbol}
        </Typography>
      </div>
      {/* <CgMathEqual className="icons" />
      <div className={classes.lockedValueRow}>
        <div className={classes.lockedTokenContainer}>
          <DoubleLogo currency0={currency0} currency1={currency1} />
          <Typography className={classes.lockedValueSymbol}>
            {formattedAmount(userLockInfo?.amount)}
          </Typography>
        </div>

        <Typography className={classes.lockedValueSymbol}>EDDA-LP</Typography>
      </div> */}
      <div className={classes.buttonContainer}>
        <Button
          loading={unlocking}
          label={t('nft.vesting.modal.unlock')}
          onClick={onUnlockClicked}
        />
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  title: {
    width: '100%',
    textAlign: 'center',
  },
  lockedValueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockedValueIcon: {
    height: 30,
    width: 'auto',
    marginRight: 20,
  },
  lockedValueSymbol: {
    fontSize: 25,
  },
  lockedTokenContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

export default UnlockModal;
