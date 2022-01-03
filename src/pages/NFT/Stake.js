import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { formattedAmount, truncate, toWei } from "lib/numberHelper";
import AmountInput from "./components/AmountInput";
import Button from "components/Button";
import SelectLPTokens from "components/SelectLpTokens";
import { openModal, closeModal } from "actions/app/modal";
import { useTranslation } from "react-i18next";
import {
  generateNFTStakingContract,
  generateLpTokenContract,
} from "lib/sdk/contract";
import { NFT_STAKING_ADDRESS } from "constants/address";
import ConfirmModal from "./components/ConfirmModal";
import { getTokensFromPair } from "lib/sdk/pair";
import { sendApprove, sendTransaction } from "lib/sendTransaction/v2";
import StakeButton from "./components/StakeButton";
import { useStyles } from "./style";
import { useWeb3React } from "@web3-react/core";

function Stake({ setShowStake, setShowUnstake, staking, setStaking }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { chainId } = useWeb3React();
  const classes = useStyles();

  const [approving, setApproving] = useState(false);
  const [stakeInputAmount, setStakeInputAmount] = useState(0);
  const [selectedPair, setSelectedPair] = useState({});

  const onTokenClick = () => {
    dispatch(openModal(renderSelectTokenModal()));
  };
  const onSelectToken = (pair) => {
    setSelectedPair(pair);
    dispatch(closeModal());
  };

  const renderSelectTokenModal = () => {
    return <SelectLPTokens onSelectToken={onSelectToken} />;
  };

  const onStakeBtnClicked = () => {
    dispatch(
      openModal(
        <ConfirmModal
          amount={stakeInputAmount}
          pair={selectedPair}
          currencies={getTokensFromPair(selectedPair, chainId)}
          title={t("nft.stake.modal.title")}
          buttonTitle={t("nft.stake.modal.stake")}
          onConfirm={() => onConfirmStakeBtnClicked()}
        />
      )
    );
  };

  const onApproveClicked = () => {
    const lpToken = selectedPair.liquidityToken;
    if (!lpToken) return;

    sendApprove({
      tokenAddress: lpToken?.address,
      tokenContract: generateLpTokenContract(lpToken?.address),
      spender: NFT_STAKING_ADDRESS,
      setLoading: setApproving,
      successMessage: "Approve EDDA LP",
      dispatch,
    });
  };

  const onConfirmStakeBtnClicked = () => {
    try {
      const lpToken = selectedPair.liquidityToken;
      if (!lpToken || !lpToken.address) return;
      sendTransaction({
        contract: generateNFTStakingContract(NFT_STAKING_ADDRESS),
        contractAddress: NFT_STAKING_ADDRESS,
        methods: "stake",
        params: [lpToken?.address, toWei(stakeInputAmount, lpToken.decimals)],
        setLoading: setStaking,
        successMessage: `Stake ${formattedAmount(stakeInputAmount)}  EDDA-LP`,
        dispatch,
      });
    } catch {}
  };

  return (
    <div>
      <AmountInput
        label={t("liquidity.remove.amount")}
        onTokenClick={onTokenClick}
        lpToken={selectedPair}
        amountValue={truncate(stakeInputAmount, 10)}
        onChangeAmount={(e) => {
          setStakeInputAmount(e.target.value);
        }}
        onMaxBtnClick={(balance) => setStakeInputAmount(balance)}
      />
      <div className="flex justify-content-between">
        <Button
          className={classes.actionButton}
          label={t("nft.stake.return")}
          onClick={() => {
            setShowStake(false);
            setShowUnstake(false);
          }}
        />
        <StakeButton
          approving={approving}
          loading={staking}
          onApproveClicked={onApproveClicked}
          onStakeClicked={onStakeBtnClicked}
          lpToken={selectedPair.liquidityToken}
        />
      </div>
    </div>
  );
}

export default Stake;
