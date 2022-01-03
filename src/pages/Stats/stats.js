import React, { useState, useEffect } from "react";
import { toV1LiquidityToken } from "lib/sdk/token";
import { useSelector, useDispatch } from "react-redux";
import { uniqueArrayOfObject } from "lib/arrayHelper";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import { getTrackedTokenPairs } from "lib/sdk/token";
import {
  generatePair,
  getLiquidityBalance,
  getTokensFromPair,
} from "lib/sdk/pair";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { useStyles } from "./style";
import DoubleLogo from "components/DoubleLogo";
import CurrencyLogo from "components/CurrencyLogo";
import { formattedAmount, times, plus } from "lib/numberHelper";
import { getTotalTradingVoloumn } from "./tvlCalculation";
import { fetchTokenPrice } from "actions/vesting/price";
import { useWeb3React } from "@web3-react/core";

function PairCard({ pair }) {
  const classes = useStyles();
  const { chainId } = useWeb3React();
  if (!pair?.liquidityToken) return null;
  const { currency0, currency1 } = getTokensFromPair(pair, chainId);

  return (
    <Card>
      <CardContent>
        <div className={classes.currencyRowContaner}>
          <div className="flex">
            <DoubleLogo currency0={currency0} currency1={currency1} />
            <Typography>EDDA-LP: </Typography>
          </div>
          <Typography className="bold text-highlight">
            {formattedAmount(pair.totalSupply)} ~$
            {formattedAmount(plus(pair.valueA, pair.valueB))}
          </Typography>
        </div>
        <div className={classes.currencyRowContaner}>
          <div className="flex">
            <CurrencyLogo currency={currency0} />
            <Typography>{currency0?.symbol}</Typography>
          </div>

          <Typography>
            {formattedAmount(pair.amountA)} ~${formattedAmount(pair.valueA)}
          </Typography>
        </div>
        <div className={classes.currencyRowContaner}>
          <div className="flex">
            <CurrencyLogo currency={currency1} />
            <Typography>{currency1?.symbol}</Typography>
          </div>
          <Typography>
            {formattedAmount(pair.amountB)} ~${formattedAmount(pair.valueB)}
          </Typography>
        </div>

        <div className={classes.currencyNameContaner}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://bscscan.com/address/${pair?.liquidityToken.address}`}
          >
            View on BSC
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
function Stats() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { chainId } = useWeb3React();
  const [pairs, setPairs] = useState([]);
  const [totalTradingVolumn, setTotalTradingVolumn] = useState(0);
  const [totalLiquidity, setTotalLiquidity] = useState(0);

  const { prices } = useSelector((reducer) => reducer.api.token);

  useEffect(() => {
    const loadDefaultPair = async () => {
      try {
        const trackedTokenPairs = await getTrackedTokenPairs(chainId);
        const tokenPairsWithLiquidityTokens = trackedTokenPairs
          .map((tokens) => {
            return {
              tokens,
              liquidityToken: toV1LiquidityToken(tokens, chainId),
            };
          })
          .filter((item) => item.liquidityToken);
        const uniqueLpTokenList = uniqueArrayOfObject(
          tokenPairsWithLiquidityTokens,
          "liquidityToken",
          "address"
        );
        const v2Pair = await Promise.all(
          uniqueLpTokenList.map(async ({ tokens }) => {
            return await generatePair(tokens);
          })
        );
        const filteredV2Pair = v2Pair.filter((pair) => pair?.liquidityToken);

        const pairsWithBalance = await Promise.all(
          filteredV2Pair.map(async (pair) => {
            const pairBalance = await getLiquidityBalance(pair);
            const { currency0, currency1 } = getTokensFromPair(pair, chainId);
            const { amountA, amountB } = pairBalance;
            const valueA = times(amountA, prices[currency0.symbol]);
            const valueB = times(amountB, prices[currency1.symbol]);
            return {
              ...pair,
              ...pairBalance,
              valueA,
              valueB,
            };
          })
        );
        setPairs(pairsWithBalance);
        const liquidityValue = pairsWithBalance.reduce(function (prev, cur) {
          return prev + cur.valueA + cur.valueB;
        }, 0);
        setTotalLiquidity(liquidityValue);
      } catch {}
    };

    loadDefaultPair();
  }, [prices]);

  useEffect(() => {
    const fetchTotalTradingVolumn = async () => {
      setTotalTradingVolumn(await getTotalTradingVoloumn());
    };

    dispatch(fetchTokenPrice());
    fetchTotalTradingVolumn();
  }, []);

  return (
    <Grid container justify="center">
      <Grid xs={12} md={8} lg={5}>
        <Typography variant="h6">
          Total Trading Volumn: {formattedAmount(totalTradingVolumn)} BNB ~ $
          {formattedAmount(times(totalTradingVolumn, prices["BNB"]))}
        </Typography>
        <Typography variant="h6">
          Total Liquidity: ${formattedAmount(totalLiquidity)}
        </Typography>
        <br />
        {pairs.map((pair, index) => (
          <React.Fragment key={index}>
            <PairCard pair={pair} />
            <br />
          </React.Fragment>
        ))}
      </Grid>
    </Grid>
  );
}

export default Stats;
