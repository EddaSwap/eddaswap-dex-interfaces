import React, { useState } from "react";
import { useDispatch } from "react-redux";
import CurrencyLogo from "components/CurrencyLogo";
import { formattedAmount, greaterThan } from "lib/numberHelper";
import Button from "components/Button/v2";
import Grid from "@material-ui/core/Grid";
import { useStyles } from "./style";
import { Typography } from "@material-ui/core";
import UnlockModal from "./UnlockModal";
import { openModal } from "actions/app/modal";
import ToolTip from "components/Tooltip";
import { getIcon } from "lib/imageHelper";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { getUnixTimestamp } from "lib/timeHelper";
import Box from "@material-ui/core/Box";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";

function LockedInfo({ info }) {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [unlocking, setUnlocking] = useState(false);

  if (!info || !info?.amountA) return null;

  const {
    amountA,
    amountB,
    tokenAValue,
    tokenBValue,
    currency0,
    currency1,
    isUnlocked,
  } = info;
  const disableUnlockBtn = greaterThan(info?.withdrawnTime, getUnixTimestamp());

  const onUnlockClick = () => {
    dispatch(
      openModal(
        <UnlockModal
          unlocking={unlocking}
          setUnlocking={setUnlocking}
          userLockInfo={info}
        />
      )
    );
  };
  if (isUnlocked) {
    return null;
  }
  return (
    <Grid container alignItems="center">
      <Grid xs={12} sm={6}>
        <Box alignContent="left" className={classes.vestingValueContainer}>
          <CurrencyLogo
            currency={currency0}
            className={classes.vestingPairTokenLogo}
          />
          <Typography variant="h6">{formattedAmount(amountA)}</Typography>
          <Typography variant="h6">
            {" "}
            ~ ${formattedAmount(tokenAValue)}
          </Typography>
        </Box>

        <Box alignContent="left" className={classes.vestingValueContainer}>
          <CurrencyLogo
            currency={currency1}
            className={classes.vestingPairTokenLogo}
          />
          <Typography variant="h6">{formattedAmount(amountB)}</Typography>
          <Typography variant="h6">
            {" "}
            ~ ${formattedAmount(tokenBValue)}
          </Typography>
        </Box>
      </Grid>

      <Grid xs={12} sm={6} className={classes.vestingCollapseBodyRow}>
        <div className={classes.unlockContainer}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.vestingButton}
            onClick={onUnlockClick}
            disabled={disableUnlockBtn}
            loading={unlocking}
          >
            {t("nft.vesting.modal.unlock")}
          </Button>
          {disableUnlockBtn && (
            <ToolTip
              direction="right"
              content={
                <span className="bolder">
                  {t("nft.vesting.card.willUnlockAt")}{" "}
                  {moment(parseInt(info?.withdrawnTime) * 1000).format(
                    "DD MMM YYYY HH:mm a"
                  )}
                </span>
              }
            >
              <HelpOutlineIcon className={`icons ${classes.questionIcon}`} />
            </ToolTip>
          )}
        </div>
      </Grid>
    </Grid>
  );
}
function UserValueLocked({ userLocked, title }) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.tvlAmountBox}>
        <Typography className={classes.tvlTitle} variant="h6">
          {title}:{" "}
        </Typography>
        {userLocked.map((item) => (
          <LockedInfo key={item.token} info={item} />
        ))}
      </div>
    </React.Fragment>
  );
}

export default UserValueLocked;
