import React from 'react';
import CurrencyLogo from 'components/CurrencyLogo';
import { getTokensFromPair } from 'lib/sdk/pair';
import { formattedAmount } from 'lib/numberHelper';
import Button from 'components/Button/v2';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import { useStyles } from './style';
import { useTranslation } from 'react-i18next';
import TotalValueLocked from './TotalValueLocked';
import UserValueLocked from './UserValueLocked';
import { useNativeToken } from 'hooks/useNativeToken';
import { useWeb3React } from '@web3-react/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

function VestingPairCard({ lockPairData, userLockInfo, version }) {
  const classes = useStyles();

  const { t } = useTranslation();
  const web3Context = useWeb3React();
  const { chainId } = web3Context;
  const { ETHER } = useNativeToken();

  if (!lockPairData || !lockPairData.pair) return null;
  const { pair, lockedBalance, totalLocked, tvl, userLocked } = lockPairData;

  if (pair && pair.tokenAmounts) {
    const { currency0, currency1 } = getTokensFromPair(pair, chainId);

    const addLiquidityLink = `/add/${
      _.isEqual(currency0, ETHER) ? ETHER.symbol : currency0?.address
    }/${_.isEqual(currency1, ETHER) ? ETHER.symbol : currency1?.address}`;

    return (
      <div className={classes.vestingCollapseContainer}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            className={classes.accordionSummary}
          >
            <Grid container>
              <Grid item xs={6} lg={4} className={classes.tokenContainer}>
                <CurrencyLogo
                  currency={currency0}
                  className={classes.vestingPairTokenLogo}
                />
                <Typography className={classes.tokenSymbol} variant="h6">
                  {currency0?.symbol}
                </Typography>
              </Grid>
              <Grid item xs={6} lg={4} className={classes.tokenContainer}>
                <CurrencyLogo
                  currency={currency1}
                  className={classes.vestingPairTokenLogo}
                />
                <Typography className={classes.tokenSymbol} variant="h6">
                  {currency1?.symbol}
                </Typography>
              </Grid>
              <Grid item xs={12} lg={4} className={classes.tvlAmountContainer}>
                <Typography variant="h6" style={{ textTransform: 'uppercase' }}>
                  {t('nft.vesting.card.lock')}: ${formattedAmount(tvl || 0)}
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails style={{ display: 'block' }}>
            <Grid container alignItems="center">
              <Grid item xs={12} lg={6}>
                <TotalValueLocked
                  pair={pair}
                  balance={lockedBalance}
                  title={t('nft.vesting.card.totalLocked')}
                  info={totalLocked}
                  isTotal={true}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                className={classes.vestingButtonContainer}
              >
                <Link
                  to={`/lock/${pair.liquidityToken.address}/${version}`}
                  par
                >
                  <Button variant="contained" className={classes.vestingButton}>
                    {t('nft.vesting.button.lock')}
                  </Button>
                </Link>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                className={classes.vestingButtonContainer}
              >
                <Link to={addLiquidityLink}>
                  <Button className={classes.vestingButton}>
                    {t('liquidity.add.addLiquidity')}
                  </Button>
                </Link>
              </Grid>
            </Grid>

            <Grid container justify="center">
              {userLocked && userLocked.length ? (
                <Grid item xs={12} lg={12}>
                  <Divider />
                  <UserValueLocked
                    pair={pair}
                    key={pair?.liquidityToken?.address}
                    title={t('nft.vesting.card.yourLocked')}
                    userLocked={userLocked}
                  />
                </Grid>
              ) : null}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  } else return <p>{t('nft.vesting.card.cannotLoad')}</p>;
}

export default VestingPairCard;
