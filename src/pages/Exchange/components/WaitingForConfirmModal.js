import React from "react";
import { connect } from "react-redux";
import { formattedAmount } from "lib/numberHelper";
import { useTranslation } from "react-i18next";

function WaitingConfirmModal(props) {
  const {
    className = "",
    amountIn = 0,
    amountOut = 0,
    fromToken = {},
    toToken = {},
  } = props;
  const { t } = useTranslation();
  return (
    <div className={`waiting-confirm-modal ${className}`}>
      <div className="loader"></div>
      <p className="waiting-text">{t("exchange.modal.waitingConfirm")}</p>
      <p className="amount-text">
        {t("exchange.modal.swap")} {formattedAmount(amountIn)}{" "}
        {fromToken.symbol} {t("exchange.modal.for")}{" "}
        {formattedAmount(amountOut)} {toToken.symbol}
      </p>
      <p className="desc-text">{t("exchange.modal.confirmInWallet")}</p>
    </div>
  );
}

export default connect((state) => {
  return {};
}, {})(WaitingConfirmModal);
