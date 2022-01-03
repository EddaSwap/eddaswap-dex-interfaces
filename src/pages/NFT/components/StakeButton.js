import React, { useEffect, useState } from "react";
import Button from "components/Button";
import { useTranslation } from "react-i18next";
import { greaterThan } from "lib/numberHelper";
import { fetchTokenAllowance } from "lib/sendTransaction/allowance";
import { NFT_STAKING_ADDRESS } from "constants/address";
import { useSelector } from "react-redux";
import { AiOutlineArrowRight } from "react-icons/ai";
import ConnectWallet from "components/ConnectWallet";
import { useStyles } from "../style";
import { useWeb3React } from "@web3-react/core";
import { useWrongNetwork } from "hooks/useWrongNetwork";

function ConnectedButton(props) {
  const { loading, onApproveClicked, onStakeClicked, approving, lpToken } =
    props;
  const { t } = useTranslation();
  const classes = useStyles();

  const { account } = useWeb3React();
  const wrongNetwork = useWrongNetwork();
  const [approvedToken, setApprovedToken] = useState();
  const [showApproveBtn, setShowApproveBtn] = useState(true);

  const checkTokenAllowance = async () => {
    try {
      if (lpToken) {
        const allowance = await fetchTokenAllowance(
          lpToken,
          account,
          NFT_STAKING_ADDRESS
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
        >
          {t("exchange.approveButton")}
        </Button>
        <AiOutlineArrowRight />
        <Button
          disabled={!approvedToken}
          className={classes.actionButton}
          loading={loading}
          onClick={onStakeClicked}
        >
          {t("nft.stake.modal.stake")}
        </Button>
      </div>
    );
  }
  return (
    <div>
      <Button
        className={classes.actionButton}
        loading={loading}
        onClick={onStakeClicked}
      >
        {t("nft.stake.modal.stake")}
      </Button>
    </div>
  );
}

export default ConnectedButton;
