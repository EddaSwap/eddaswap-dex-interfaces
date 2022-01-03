import { withStyles } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Typography from "@material-ui/core/Typography";
import { ChainId } from "@sushiswap/sdk";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { ROUTER_VERSION } from "constants/constants";

const useStyles = makeStyles((theme) => ({
  bottomNavContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing(2),
  },
  tabs: {
    marginLeft: theme.spacing(2),
  },
}));

const StyledTabs = withStyles({
  root: {
    borderWidth: 0.5,
    borderRadius: 30,
    borderColor: "#aeaeae",
    borderStyle: "solid",
    padding: 2,
    minHeight: 30,
  },
  indicator: {
    height: 0,
  },
})(Tabs);
const StyledTab = withStyles({
  root: {
    minHeight: 30,
    minWidth: 70,
    "&.Mui-selected": {
      borderRadius: 30,
    },
  },
})(Tab);

function VersionSelection({ value, onChange }) {
  const classes = useStyles();

  const web3Context = useWeb3React();
  const { chainId } = web3Context;

  if (chainId !== ChainId.BSC) return null;

  return (
    <Box className={classes.bottomNavContainer}>
      <Typography>Versions</Typography>
      <StyledTabs
        className={classes.tabs}
        value={value}
        onChange={(event, newValue) => {
          onChange(newValue);
        }}
      >
        <StyledTab label="v2" value={ROUTER_VERSION.v2} />
        <StyledTab label="v1" value={ROUTER_VERSION.v1} />
      </StyledTabs>
    </Box>
  );
}
export default VersionSelection;
