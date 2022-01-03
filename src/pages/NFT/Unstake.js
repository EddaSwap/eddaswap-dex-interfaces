import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { formattedAmount, truncate, toWei } from "lib/numberHelper";
import AmountUnstakeInput from "./components/AmountUnstakeInput";
import Button from "components/Button";
import SelectStakedLPToken from "components/SelectLpTokens/SelectStakedLpTokens";
import { openModal, closeModal } from "actions/app/modal";
import { useTranslation } from "react-i18next";
import { generateNFTStakingContract } from "lib/sdk/contract";
import { getTokensFromCreatedPair } from "lib/sdk/pair";
import { NFT_STAKING_ADDRESS } from "constants/address";
import { sendTransaction } from "lib/sendTransaction/v2";
import ConfirmModal from "./components/ConfirmModal";
import { useWeb3React } from "@web3-react/core";

function Unstake({
  setShowStake,
  setShowUnstake,
  stakedPairs,
  unstaking,
  setUnstaking,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const web3Context = useWeb3React();
  const { account, chainId } = web3Context;
  const [unstakeInputAmount, setUnstakeInputAmount] = useState(0);
  const [selectedPair, setSelectedPair] = useState({});

  const onUnstakeTokenClick = () => {
    dispatch(openModal(renderSelectStakedTokenModal()));
  };
  const onSelectUnstakeToken = (pair) => {
    setSelectedPair(pair);
    dispatch(closeModal());
  };

  const renderSelectStakedTokenModal = () => {
    return (
      <SelectStakedLPToken
        onSelectToken={onSelectUnstakeToken}
        lpTokenPairs={stakedPairs}
      />
    );
  };

  const onUnstakeBtnClicked = () => {
    dispatch(
      openModal(
        <ConfirmModal
          amount={unstakeInputAmount}
          pair={selectedPair}
          currencies={getTokensFromCreatedPair(selectedPair, chainId)}
          title={t("nft.unstake.modal.title")}
          buttonTitle={t("nft.unstake.modal.unstake")}
          onConfirm={onConfirmUnstakeBtnClicked}
        />
      )
    );
  };

  const onConfirmUnstakeBtnClicked = () => {
    try {
      const lpToken = selectedPair.liquidityToken;
      if (!lpToken || !lpToken.address) return;
      sendTransaction({
        contract: generateNFTStakingContract(NFT_STAKING_ADDRESS),
        contractAddress: NFT_STAKING_ADDRESS,
        methods: "withdraw",
        params: [lpToken?.address, toWei(unstakeInputAmount, lpToken.decimals)],
        setLoading: setUnstaking,
        successMessage: `Unstake ${formattedAmount(
          unstakeInputAmount
        )} EDDA-LP`,
        dispatch,
      });
    } catch {}
  };

  return (
    <div>
      <AmountUnstakeInput
        label={t("liquidity.remove.amount")}
        onTokenClick={onUnstakeTokenClick}
        pair={selectedPair}
        amountValue={truncate(unstakeInputAmount, 10)}
        onChangeAmount={(e) => setUnstakeInputAmount(e.target.value)}
        onMaxBtnClick={(balance) => setUnstakeInputAmount(balance)}
      />
      <div className="flex justify-content-between">
        <Button
          className="stake-card-button-secondary"
          label={t("nft.stake.return")}
          onClick={() => {
            setShowStake(false);
            setShowUnstake(false);
          }}
        />
        <Button
          className="stake-card-button-secondary"
          label={t("nft.unstake.modal.unstake")}
          onClick={onUnstakeBtnClicked}
          loading={unstaking}
        />
      </div>
    </div>
  );
}

export default Unstake;
