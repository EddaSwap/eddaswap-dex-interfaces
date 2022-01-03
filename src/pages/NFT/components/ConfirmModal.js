import Button from "components/Button";
import DoubleLogo from "components/DoubleLogo";
import { formattedAmount } from "lib/numberHelper";
import React from "react";
import { connect } from "react-redux";

function ConfirmModal(props) {
  const {
    className = "",
    amount = 0,
    onConfirm = () => {},
    currencies = {},
    title = "",
    buttonTitle = "",
  } = props;

  const currency0 = currencies?.currency0 || {};
  const currency1 = currencies?.currency1 || {};

  return (
    <div className={`confirm-modal ${className}`}>
      <p className="confirm-modal-title">{title}</p>
      <div className="token-amount-row">
        <div className="token-amount-logo-container">
          <DoubleLogo currency0={currency0} currency1={currency1} />
          <span>{formattedAmount(amount)}</span>
        </div>
        <span>
          {currency0?.symbol}/{currency1?.symbol}
        </span>
      </div>
      <div className="confirm-btn-container">
        <Button label={buttonTitle} onClick={onConfirm} />
      </div>
    </div>
  );
}

export default connect((state) => {
  return {};
}, {})(ConfirmModal);
