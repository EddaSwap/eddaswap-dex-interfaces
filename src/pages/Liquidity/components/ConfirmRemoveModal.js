import React from "react";
import { connect } from "react-redux";
import CurrencyLogo from "components/CurrencyLogo";
import Button from "components/Button";
import { dividedBy, times, formattedAmount } from "lib/numberHelper";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useNativeToken } from "hooks/useNativeToken";
import { FaLongArrowAltDown } from "react-icons/fa";

function ConfirmRemoveModal(props) {
  const {
    className = "",
    amountA = 0,
    amountB = 0,
    percentAmount = 0,
    pair = {},
    onConfirm = () => {},
    slippage = 0,
    receiveETH = false,
  } = props;
  const { token0, token1 } = pair;

  const { ETHER, WETH } = useNativeToken();

  const token0IsWBNB = _.isEqual(token0, WETH);
  const token1IsWBNB = _.isEqual(token1, WETH);

  const { t } = useTranslation();

  return (
    <div className={`add-confirm-modal ${className}`}>
      <p className="confirm-modal-title">
        {t("liquidity.add.modal.confirm.title")}
      </p>
      <br />
      <div className="token-amount-row">
        <div className="token-amount-logo-container">
          <CurrencyLogo
            currency={token0}
            style={{ height: "30px", width: "30px" }}
          />
          <span>
            {formattedAmount(dividedBy(times(percentAmount, amountA), 100))}
          </span>
        </div>
        <span>
          {receiveETH && token0IsWBNB ? ETHER.symbol : token0?.symbol}
        </span>
      </div>

      <div
        style={{
          width: "30px",
          display: "flex",
          justifyContent: "center",
          margin: "8px 0",
        }}
      >
        <FaLongArrowAltDown className="icons" />
      </div>

      <div className="token-amount-row">
        <div className="token-amount-logo-container">
          <CurrencyLogo
            currency={token1}
            style={{ height: "30px", width: "30px" }}
          />
          <span>
            {formattedAmount(dividedBy(times(percentAmount, amountB), 100))}
          </span>
        </div>
        <span>
          {receiveETH && token1IsWBNB ? ETHER.symbol : token1?.symbol}
        </span>
      </div>
      <br />
      <span className="bold small text-gray">
        {t("liquidity.add.modal.confirm.outputIsEstimated", {
          slippage: slippage,
        })}
      </span>
      <div className="confirm-btn-container">
        <Button
          label={t("liquidity.remove.modal.confirmRemove")}
          onClick={onConfirm}
          className="btn-gradient"
        />
      </div>
    </div>
  );
}

export default connect((state) => {
  return {
    slippage: state.api.settings.slippage,
  };
}, {})(ConfirmRemoveModal);
