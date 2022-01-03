import React from "react";
import { connect } from "react-redux";
import Button from "components/Button";
import { formattedAmount, greaterThanEqual } from "lib/numberHelper";
import { objectIsEmpty } from "lib/objectHelper";
import { BsChevronDown } from "react-icons/bs";
import DoubleLogo from "components/DoubleLogo";
import { useTranslation } from "react-i18next";
import { getTokensFromCreatedPair } from "lib/sdk/pair";
import { useWeb3React } from "@web3-react/core";

function AmountUnstakeInput(props) {
  const {
    label = "",
    pair = {},
    onTokenClick = () => {},
    onChangeAmount = () => {},
    amountValue = "",
    disabled = false,
    onMaxBtnClick = () => {},
  } = props;

  const { t } = useTranslation();
  const { chainId } = useWeb3React();
  const { currency0 = {}, currency1 = {} } = getTokensFromCreatedPair(
    pair,
    chainId
  );
  const balance = pair?.stakedBalance;

  return (
    <div className="swap-currency-input pointer">
      <div className="row">
        <div className="col-6">
          <h3 className="text-error token-selection-desc">{label}</h3>
        </div>
        <div className="col-6 content-end">
          <span className="note bold">
            {greaterThanEqual(balance, 0) &&
            !objectIsEmpty(pair?.liquidityToken)
              ? `${t("component.swapInput.balance")}: ${formattedAmount(
                  balance
                )}`
              : null}
          </span>
        </div>
      </div>
      <div className="row">
        <div className="col-4">
          <input
            type="number"
            placeholder="0.0"
            value={amountValue}
            step="0.01"
            min="0"
            onChange={(e) => onChangeAmount(e)}
            disabled={disabled}
            onWheel={(e) => e.target.blur()}
          />
        </div>
        <div className="col-8 content-end">
          {pair?.liquidityToken ? (
            <Button onClick={() => onMaxBtnClick(balance)} className="max-btn">
              {t("component.swapInput.max")}
            </Button>
          ) : null}
          <div className="token-selection" onClick={() => onTokenClick()}>
            {pair?.tokens && pair?.tokens[0] ? (
              <DoubleLogo currency0={currency0} currency1={currency1} />
            ) : null}
            <div className="token-symbol-name">
              <h3 className="text-error token-selection-desc">
                {pair?.tokens && pair?.tokens[0]
                  ? `${currency0?.symbol}/${currency1?.symbol}`
                  : t("component.swapInput.selectToken")}
              </h3>
            </div>
            <BsChevronDown className="icons" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect((state) => {
  return {
    snackbarToggle: state.app.snackbar.snackbarToggle,
  };
}, {})(AmountUnstakeInput);
