import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getLpTokenBalance } from "lib/sdk/contract";
import { formattedAmount, truncate } from "lib/numberHelper";
import { objectIsEmpty } from "lib/objectHelper";
import { useTranslation } from "react-i18next";
import TextInput from "components/TextInput";
import _ from "lodash";
import { getAmountFromTokenAmount } from "lib/sdk/token";
import { useWeb3React } from "@web3-react/core";
import Grid from "@material-ui/core/Grid";

import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  alignEnd: {
    textAlign: "end",
  },
}));
function LockLPInput({
  label = "",
  token = {},
  onChangeAmount = () => {},
  value = "",
  disabled = false,
  showSnackbar,
  onSetTokenBalance = () => {},
  FooterComponent,
  ...rest
}) {
  const [selectedCurrencyBalance, setSelectedCurrencyBalance] = useState(0);

  const classes = useStyles();
  const { t } = useTranslation();
  const { account, chainId } = useWeb3React();

  useEffect(() => {
    !_.isEmpty(token) && getSelectedCurrencyBalance();
  }, [token, account, showSnackbar]);

  const getSelectedCurrencyBalance = async () => {
    if (account && token && !objectIsEmpty(token)) {
      const balance = await getLpTokenBalance(token?.address, account, chainId);
      const rawBalance = getAmountFromTokenAmount(balance);
      onSetTokenBalance(rawBalance);
      setSelectedCurrencyBalance(rawBalance);
    } else {
      onSetTokenBalance(0);
      setSelectedCurrencyBalance(0);
    }
  };

  return (
    <div className="swap-currency-input pointer">
      <Grid container>
        <Grid item xs={4}>
          <h3 className="text-error token-selection-desc">{label}</h3>
        </Grid>
        <Grid item xs={8} className={classes.alignEnd}>
          <span className="note bold">
            {selectedCurrencyBalance >= 0 && !objectIsEmpty(token)
              ? `${t("component.swapInput.balance")}: ${formattedAmount(
                  selectedCurrencyBalance
                )}`
              : null}
          </span>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={4}>
          <TextInput
            type="number"
            placeholder="0.0"
            value={value}
            step="0.01"
            min="0"
            onChange={onChangeAmount}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={8} className={classes.alignEnd}>
          <h3 className="text-error token-selection-desc">
            {token?.symbol || "EDDA-LP"}
          </h3>
        </Grid>
      </Grid>
      {FooterComponent}
    </div>
  );
}

export default connect((state) => {
  return {
    showSnackbar: state.app.snackbar.show,
  };
}, {})(LockLPInput);
