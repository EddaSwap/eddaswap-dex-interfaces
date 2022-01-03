import DoubleLogo from "components/DoubleLogo";
import { getTokensFromCreatedPair } from "lib/sdk/pair";
import { truncateAddress } from "lib/stringHelper";
import React from "react";
import { isMobile } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { useWeb3React } from "@web3-react/core";

function SelectStakedLPToken(props) {
  const { onSelectToken = () => {}, lpTokenPairs = [] } = props;
  const { t } = useTranslation();
  const { chainId } = useWeb3React();
  const pairRow = (pair = {}, searching = false) => {
    const address = pair?.liquidityToken?.address;
    if (pair && pair.liquidityToken && pair.tokens) {
      const { currency0 = {}, currency1 = {} } = getTokensFromCreatedPair(
        pair,
        chainId
      );
      return (
        <div
          className={`token-container`}
          key={address}
          onClick={() => onSelectToken(pair)}
        >
          <div className="border-circle">
            <DoubleLogo currency0={currency0} currency1={currency1} />
          </div>

          <div>
            <span className="token-symbol">
              {currency0?.symbol}/{currency1?.symbol}
            </span>
            <br />
            <span className="token-name">
              {isMobile
                ? truncateAddress(pair?.liquidityToken?.address)
                : pair?.liquidityToken?.address}
            </span>
          </div>
        </div>
      );
    } else return null;
  };

  const renderDefaultTokenList = () => {
    return (
      <div className="scroll-list">
        {lpTokenPairs.map((item) => {
          return pairRow(item);
        })}
      </div>
    );
  };
  return (
    <div className="select-token">
      <div className="sticky-header">
        <span className="bold">{t("component.selectToken.selectAToken")}</span>
      </div>
      {renderDefaultTokenList()}
    </div>
  );
}

export default connect(null, {})(SelectStakedLPToken);
