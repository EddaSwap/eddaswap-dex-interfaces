import React from "react";
import { connect } from "react-redux";
import { AiOutlineWarning } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import CurrencyLogo from "components/CurrencyLogo";
import { truncateAddress } from "lib/stringHelper";
import Button from "components/Button";
import {
  EXPLORER_NAME_BY_CHAIN,
  EXPLORER_LINK_BY_CHAIN,
} from "constants/address";
import { useWeb3React } from "@web3-react/core";

function ImportCurrencyModal(props) {
  const { token = {}, onConfirm = () => {} } = props;
  const { t } = useTranslation();

  const { chainId } = useWeb3React();

  return (
    <div className={`import-currency-modal`}>
      <div className="import-currency-title-container">
        <AiOutlineWarning color="#e6007a" />
        <span className="import-currency-title text-error">Token imported</span>
      </div>
      <br />
      <span className="warning-text text-error">
        Anyone can create an BSC20 token on Binance Smart Chain with any name,
        including creating fake versions of existing tokens and tokens that
        claim to represent projects that do not have a token.This interface can
        load arbitrary tokens by token addresses. Please take extra caution and
        do your research when interacting with arbitrary BSC20 tokens.
      </span>
      <br />
      <span className="warning-text text-error">
        If you purchase an arbitrary token, you may be unable to sell it back.
      </span>
      <br />
      <div className="import-currency-title-container">
        <CurrencyLogo currency={token} />
        <span className="import-currency-title">
          {token?.name} ({token?.symbol})
        </span>
      </div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`${EXPLORER_LINK_BY_CHAIN[chainId]}/token/${token.address}`}
      >
        {truncateAddress(token?.address)} ({t("component.modal.viewBSCscan")}{" "}
        {EXPLORER_NAME_BY_CHAIN[chainId]})
      </a>
      <div className="continue-btn-container">
        <Button label="Continue" onClick={onConfirm} />
      </div>
    </div>
  );
}

export default connect((state) => {
  return {};
}, {})(ImportCurrencyModal);
