import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(6, 5),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  lockLiquidityCardHeader: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  lockLiquidityCardTitle: {
    width: "100%",
    textAlign: "center",
    color: theme.palette.common.pink,
    fontWeight: 600,
  },
  lockLiquidityTokensContainer: {
    display: "flex",
    alignItems: "center",
  },
  lockLiquidityTokensIcon: {
    margin: theme.spacing(0, 2),
  },
  greyTextBold: {
    color: `${theme.palette.common.raven} !important`,
    fontWeight: 500,
  },
  maxButtonContainer: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 10,
  },
  maxButton: {
    marginLeft: 10,
  },
  lockupMonthsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  feeOptions: {
    marginTop: 20,
  },
  actionContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  actionButton: {
    width: 150,
    margin: theme.spacing(1, 2),
  },
}));
