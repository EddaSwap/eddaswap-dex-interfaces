import { generateNFTStakingContract } from "lib/sdk/contract";
import { NFT_STAKING_ADDRESS } from "constants/address";
import { sendTransaction } from "lib/sendTransaction/v2";

export function onRedeemBtnClicked({
  amount = "",
  cardId = "",
  dispatch = () => {},
  setLoading,
  account,
  t,
}) {
  // dispatch(
  //   openModal(
  //     <ConfirmModal
  //       amount={amount}
  //       title={t("nft.unstake.modal.title")}
  //       buttonTitle={t("nft.unstake.modal.unstake")}
  //       onConfirm={() =>
  //         onConfirmRedeemBtnClicked({
  //           amount,
  //           cardId,
  //           dispatch,
  //           setLoading,
  //           account,
  //         })
  //       }
  //     />
  //   )
  // );
  onConfirmRedeemBtnClicked({
    amount,
    cardId,
    dispatch,
    setLoading,
    account,
  });
}

export function onConfirmRedeemBtnClicked({
  amount,
  cardId,
  dispatch,
  setLoading,
  account,
}) {
  try {
    sendTransaction({
      contract: generateNFTStakingContract(NFT_STAKING_ADDRESS),
      contractAddress: NFT_STAKING_ADDRESS,
      methods: "redeem",
      params: [cardId],
      value: amount,
      setLoading,
      dispatch,
    });
  } catch {}
}
