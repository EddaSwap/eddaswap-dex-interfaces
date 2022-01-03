import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

import {
  loadEDDALPNFT,
  loadEDDALPTokenTotalSupply,
  loadEDDANFTStaking,
  loadEDDAStaking,
  loadEDDAUNIReward,
} from "lib/ethNetwork/eddaStaked";
import { dividedBy, plus, times, truncate } from "lib/numberHelper";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const useStyles = makeStyles((theme) => ({
  supportNetworkContainer: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    borderColor: theme.palette.common.grey,
    cursor: "pointer",
    marginLeft: 20,
    marginRight: 20,
    width: "fit-content",
  },
  networkIcon: {
    width: 30,
    height: "auto",
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    borderRadius: "50%",
  },
}));

const EDDA_ADDRESS = "0xFbbE9b1142C699512545f47937Ee6fae0e4B0aA9";

function EddaStatistic() {
  const { t } = useTranslation();
  const classes = useStyles();

  const [eddaPrice, setEddaPrice] = useState(0);
  const [eddaStaked, setEddaStaked] = useState(0);
  const [eddaUniLP, setEddaUniLP] = useState(0);

  useEffect(() => {
    fetchEddaPrice();
    fetchStakingData();
  });

  const fetchStakingData = async () => {
    const eddaTotalSupply = await loadEDDAStaking();
    const eddaNFTTotalSupply = await loadEDDANFTStaking();
    const eddaStaked = dividedBy(
      plus(eddaTotalSupply, eddaNFTTotalSupply),
      5000
    );
    setEddaStaked(eddaStaked);

    const eddaLPTotalSupply = await loadEDDALPNFT();
    const eddaUNITotalSupply = await loadEDDAUNIReward();
    const eddaLpTokenTotalSupply = await loadEDDALPTokenTotalSupply();

    setEddaUniLP(
      dividedBy(
        plus(eddaLPTotalSupply, eddaUNITotalSupply),
        eddaLpTokenTotalSupply
      )
    );
  };
  const fetchEddaPrice = async () => {
    try {
      const priceResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${EDDA_ADDRESS}&vs_currencies=usd`
      );
      if (priceResponse && priceResponse.status === 200) {
        const data = priceResponse.data;
        const price = data[EDDA_ADDRESS.toLowerCase()]?.usd;
        price && setEddaPrice(price);
      }
    } catch (error) {
      console.error("Failed to fetch edda price", error);
    }
  };
  return (
    <div className="footer-container flex">
      <div className="col-lg-8 col-md-4 footer-edda-details-container">
        <div className="footer-edda-details-row flex justify-content-space-between">
          <span className="footer-edda-details-key">
            {t("footer.info.price")}:{" "}
          </span>
          <span className="footer-edda-details-value">${eddaPrice}</span>
        </div>
        <div className="footer-edda-details-row flex justify-content-space-between">
          <span className="footer-edda-details-key">
            {t("footer.info.staking")}:{" "}
          </span>
          <span className="footer-edda-details-value">
            {truncate(times(eddaStaked, 100), 2)}%
          </span>
        </div>
        <div className="footer-edda-details-row flex justify-content-space-between">
          <span className="footer-edda-details-key">
            Uniswap EDDA LP Staked:{" "}
          </span>
          <span className="footer-edda-details-value">
            {truncate(times(eddaUniLP, 100), 2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default EddaStatistic;
