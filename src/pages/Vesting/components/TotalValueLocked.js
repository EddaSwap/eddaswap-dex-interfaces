import React from "react";
import CurrencyLogo from "components/CurrencyLogo";
import { formattedAmount } from "lib/numberHelper";
import Box from "@material-ui/core/Box";
import { useStyles } from "./style";
import { Typography } from "@material-ui/core";

function TotalValueLocked({ info, title }) {
  const classes = useStyles();
  if (!info || !info?.amountA) return null;

  const { amountA, amountB, tokenAValue, tokenBValue, currency0, currency1 } =
    info;

  return (
    <Box className={classes.tvlAmountBox}>
      <Typography className={classes.tvlTitle} variant="h6">
        {title}:{" "}
      </Typography>

      <Box alignContent="left" className={classes.vestingValueContainer}>
        <CurrencyLogo
          currency={currency0}
          className={classes.vestingPairTokenLogo}
        />
        <Typography variant="h6">{formattedAmount(amountA)}</Typography>
        <Typography variant="h6"> ~ ${formattedAmount(tokenAValue)}</Typography>
      </Box>

      <Box alignContent="left" className={classes.vestingValueContainer}>
        <CurrencyLogo
          currency={currency1}
          className={classes.vestingPairTokenLogo}
        />
        <Typography variant="h6">{formattedAmount(amountB)}</Typography>
        <Typography variant="h6"> ~ ${formattedAmount(tokenBValue)}</Typography>
      </Box>
    </Box>
  );
}

export default TotalValueLocked;
