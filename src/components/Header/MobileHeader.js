import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { changeTheme } from "actions/app/theme";
import ConnectWallet from "components/ConnectWallet";
import LanguageDropdown from "components/LanguageDropdown";
import React from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { withRouter, useLocation } from "react-router-dom";
import MobileDrawer from "./MobileDrawer";
import { useWeb3React } from "@web3-react/core";
import { ChainId } from "@sushiswap/sdk";

export const useStyles = makeStyles((theme) => ({
  menuItem: {
    textAlign: "center",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
  },
}));

const Toolbar = (props) => {
  const pathname = useLocation().pathname;
  const { theme } = props;
  const { t } = useTranslation();
  const { chainId } = useWeb3React();
  const classes = useStyles();

  const navbarMenu = [
    {
      title: t("header.menu.exchange"),
      link: "/exchange",
      active: ["/exchange"],
    },
    {
      title: t("header.menu.liquidity"),
      link: "/addLiquid",
      active: ["/addLiquid", "/add", "/remove", "/find"],
    },
    {
      title: t("header.menu.lock"),
      link: "/lockLiquidity",
      active: ["/lockLiquidity", "/lock"],
    },
    // {
    //   title: "NFT",
    //   link: "/nft",
    //   active: ["/nft"],
    // },
  ];
  if (chainId === ChainId.BSC) {
    navbarMenu.push({
      title: t("header.menu.migrate"),
      link: "/migrate",
      active: ["/migrate"],
    });
  }

  return (
    <header className="toolbar">
      <nav className="toolbar__navigation row">
        <Grid container>
          <Grid item xs={12} md={12} lg={3}>
            <div className={`toolbar__logo ${classes.logoContainer}`}>
              <MobileDrawer menu={navbarMenu} pathname={pathname} />
            </div>
          </Grid>

          <Grid item xs={12} md={12} lg={12} className="settings-container">
            <ConnectWallet />
          </Grid>
        </Grid>
      </nav>
    </header>
  );
};

export default connect(
  (state) => {
    return {
      theme: state.app.storage.theme,
    };
  },
  { changeTheme }
)(withRouter(Toolbar));
