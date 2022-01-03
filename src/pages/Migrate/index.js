import React, { useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import MigrateCard from "./MigrateCard";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import Button from "@material-ui/core/Button";
import { useApiStore } from "hooks/useStore";
import LpTokenCard from "./LpTokenCard";
import { ROUTER_VERSION } from "constants/constants";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { Link, useHistory } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { ChainId } from "@sushiswap/sdk";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
  },
  noLiquidityContainer: {
    display: "flex",
    justifyContent: "center",
    padding: 20,
  },
  desc: {
    marginTop: 8,
    color: "#777e90",
  },
}));

function MigrateLiquidity() {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const apiStore = useApiStore();
  const liquidityv1 = apiStore.liquidity;

  const { chainId } = useWeb3React();

  useEffect(() => {
    if (chainId !== ChainId.BSC) {
      history.push("/exchange");
    }
  }, [chainId]);

  return (
    <Grid container justify="center">
      <Grid item xs={12} md={8} lg={4}>
        <Box>
          <h2 className="text-error">{t("migration.title")}</h2>
          <p className={`text-gray ${classes.desc}`}>{t("migration.desc")}</p>

          <MigrateCard
            title="Remove Liquidity"
            description="Unstake your old LP tokens from the old liquidity pools"
          >
            <Typography>{t("migration.v1token")}</Typography>
            {liquidityv1 &&
            liquidityv1.userLpTokensBalance &&
            liquidityv1.userLpTokensBalance.length ? (
              liquidityv1.userLpTokensBalance.map((pair) => {
                return (
                  <div className="pointer" key={pair.liquidityToken.address}>
                    <LpTokenCard pair={pair} version={ROUTER_VERSION.v1} />
                  </div>
                );
              })
            ) : (
              <Box className={classes.noLiquidityContainer}>
                <Typography variant="body2">
                  {t("liquidity.noLiquidityFound")}
                </Typography>
              </Box>
            )}
            <span style={{ marginTop: "2rem" }}>
              {t("liquidity.remove.donttSeePool")}{" "}
              <Link
                to={{
                  pathname: "/find",
                  query: { previousLink: "/migrate" },
                }}
                className="text-error"
              >
                {t("liquidity.remove.importPool")}
              </Link>
            </span>
          </MigrateCard>

          <Box className={classes.container}>
            <ArrowDownwardIcon />
          </Box>

          <MigrateCard
            title={t("migration.add.title")}
            description={t("migration.add.desc")}
          >
            <Button variant="contained" href="/addLiquid">
              {t("liquidity.add.addLiquidity")}
            </Button>
          </MigrateCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default MigrateLiquidity;
