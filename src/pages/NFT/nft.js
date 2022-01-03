import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Card from "components/Card";
import Collapsible from "components/Collapsible";
import { formattedAmount, greaterThan } from "lib/numberHelper";
import NFTCard from "./components/NFTCard";
import Button from "components/Button";
import DoubleLogo from "components/DoubleLogo";
import { useTranslation } from "react-i18next";
import { fetchNFTsByPoolId } from "actions/nft/fetchNFT";
import {
  generateNFTStakingContract,
  getEarned,
  getStakedBalance,
} from "lib/sdk/contract";
import { NFT_STAKING_ADDRESS } from "constants/address";
import { loadStakingPairs } from "lib/sdk/token";
import { getTokensFromCreatedPair } from "lib/sdk/pair";
import Stake from "./Stake";
import Unstake from "./Unstake";
import { useWeb3React } from "@web3-react/core";
import { useWrongNetwork } from "hooks/useWrongNetwork";

function NFT() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { nftList } = useSelector((reducer) => reducer.api.nft);
  const web3Context = useWeb3React();
  const { account, chainId } = web3Context;
  const wrongNetwork = useWrongNetwork();

  const [earnedAmount, setEarnedAmount] = useState(0);
  const [showStake, setShowStake] = useState(false);
  const [showUnstake, setShowUnstake] = useState(false);
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [stakedPairs, setStakedPairs] = useState([]);

  useEffect(() => {
    dispatch(fetchNFTsByPoolId());
    loadUserStakedNFTData();
  }, [account, wrongNetwork, unstaking, staking]);

  const loadUserStakedNFTData = async () => {
    try {
      const contract = generateNFTStakingContract(NFT_STAKING_ADDRESS);
      //load user earned
      const earned = await getEarned(contract, account);
      setEarnedAmount(earned);
      //load staked balance
      const stakingPairs = await loadStakingPairs(chainId);
      const stakedParsBalance = await Promise.all(
        stakingPairs.map(async (pair) => {
          return {
            ...pair,
            stakedBalance: await getStakedBalance(
              contract,
              account,
              pair?.liquidityToken?.address
            ),
          };
        })
      );
      const haveStakedBalancePairs = stakedParsBalance.filter((item) =>
        greaterThan(item?.stakedBalance, 0)
      );
      setStakedPairs(haveStakedBalancePairs);
    } catch {}
  };

  const renderStakedBalance = (pair) => {
    const currencies = getTokensFromCreatedPair(pair, chainId);
    const currency0 = currencies?.currency0;
    const currency1 = currencies?.currency1;
    return (
      <div className="flex">
        <span className="stake-card-staked-value">
          {formattedAmount(pair?.stakedBalance)}
        </span>
        <DoubleLogo currency0={currency0} currency1={currency1} />
      </div>
    );
  };
  const renderStakeCardHeader = () => {
    return (
      <div className="stake-card-header">
        <div className="stake-card-earned-container">
          <span className="stake-card-earned-title">
            {t("nft.stake.earned")} Samurai
          </span>
          <br />
          <span className="stake-card-earned-value">
            {formattedAmount(earnedAmount)}
          </span>
        </div>
        <div className="stake-card-staked-container">
          <span className="stake-card-staked-title">
            {t("nft.stake.stakedBalance")}
          </span>
          {stakedPairs && stakedPairs.length
            ? stakedPairs.map((item) => {
                return renderStakedBalance(item);
              })
            : null}
          <br />
        </div>
      </div>
    );
  };

  return (
    <div className="nft">
      <h1 className="text-highlight">Coming soon</h1>
      <div className="col-xl-5 col-md-12">
        {/* <Card className="stake-card-container">
          <Collapsible title={renderStakeCardHeader()}>
            {showStake && (
              <Stake
                setShowStake={setShowStake}
                setShowUnstake={setShowUnstake}
                staking={staking}
                setStaking={setStaking}
              />
            )}
            {showUnstake && (
              <Unstake
                setShowStake={setShowStake}
                setShowUnstake={setShowUnstake}
                stakedPairs={stakedPairs}
                unstaking={unstaking}
                setUnstaking={setUnstaking}
              />
            )}
            {!showStake && !showUnstake && (
              <div className="flex justify-content-between">
                <Button
                  className="stake-card-button"
                  label="Stake"
                  onClick={() => {
                    setShowStake(true);
                    setShowUnstake(false);
                  }}
                />
                <Button
                  className="stake-card-button"
                  label="Unstake"
                  onClick={() => {
                    setShowStake(false);
                    setShowUnstake(true);
                  }}
                />
              </div>
            )}
          </Collapsible>
        </Card> */}
        <br />
      </div>
      <div className="col-xl-12 col-lg-12 col-md-12 flex column align-center">
        {/* <div className="text-align-center">
          <span className="text-align-center">
            {t("nft.nftCollection.desc")}
          </span>
        </div> */}
        <br />
        <div className="nft-list-container">
          {nftList.map((nft, colIndex) => (
            <NFTCard
              card={nft}
              key={colIndex}
              rewardsAvailable={earnedAmount}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NFT;
