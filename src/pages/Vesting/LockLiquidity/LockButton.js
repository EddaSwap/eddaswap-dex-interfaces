import React, { useEffect, useState } from 'react';
import Button from 'components/Button/v2';
import { useTranslation } from 'react-i18next';
import { greaterThan } from 'lib/numberHelper';
import { fetchTokenAllowance } from 'lib/sendTransaction/allowance';
import { EDDA_VESTING_BY_CHAIN } from 'constants/address';
import ConnectWallet from 'components/ConnectWallet';
import { useStyles } from './style';
import { useWeb3React } from '@web3-react/core';
import { useWrongNetwork } from 'hooks/useWrongNetwork';

function ConnectedButton({
  loading,
  onApproveClicked,
  onLockClicked,
  approving,
  lpToken,
  disabledLockButton,
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  const web3Context = useWeb3React();
  const { account, chainId } = web3Context;
  const wrongNetwork = useWrongNetwork();
  const [approvedToken, setApprovedToken] = useState();
  const [showApproveBtn, setShowApproveBtn] = useState(true);

  const checkTokenAllowance = async () => {
    try {
      if (lpToken) {
        const allowance = await fetchTokenAllowance(
          lpToken,
          account,
          EDDA_VESTING_BY_CHAIN[chainId]
        );
        return greaterThan(allowance, 0);
      }
      return true;
    } catch {
      return true;
    }
  };
  useEffect(() => {
    const loadAllowance = async () => {
      const approved = await checkTokenAllowance();
      setApprovedToken(approved);
      setShowApproveBtn(!approved);
    };
    loadAllowance();
  }, [lpToken, account, wrongNetwork, loading]);

  //when approving change, it means the approve tx confirm, set approved is true but still show approved button
  useEffect(() => {
    const loadAllowance = async () => {
      const approved = await checkTokenAllowance();
      setApprovedToken(approved);
    };
    loadAllowance();
  }, [approving]);

  if (!account || wrongNetwork) {
    return <ConnectWallet />;
  }
  if (showApproveBtn) {
    return (
      <div className={classes.actionContainer}>
        <Button
          className={classes.actionButton}
          loading={approving}
          onClick={onApproveClicked}
          disabled={approvedToken}
          color="secondary"
        >
          {t('exchange.approveButton')}
        </Button>
        <Button
          disabled={!approvedToken || disabledLockButton}
          className={classes.actionButton}
          loading={loading}
          onClick={onLockClicked}
          color="secondary"
        >
          {t('nft.vesting.button.lock')}
        </Button>
      </div>
    );
  }
  return (
    <div>
      <Button
        className={classes.actionButton}
        loading={loading}
        onClick={onLockClicked}
        disabled={disabledLockButton}
        color="secondary"
      >
        {t('nft.vesting.button.lock')}
      </Button>
    </div>
  );
}

export default ConnectedButton;
