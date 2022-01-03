import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import DoubleLogo from 'components/DoubleLogo';
import { WBNB } from 'constants/tokens';
import { useNativeToken } from 'hooks/useNativeToken';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: '20px',
  },
  token: {
    display: 'flex',
  },
  pairName: {
    marginLeft: 20,
  },
}));

function LpTokenCard({ pair, version }) {
  const { t } = useTranslation();
  const classes = useStyles();

  const { ETHER } = useNativeToken();
  const currency0 = _.isEqual(pair?.token0, WBNB) ? ETHER : pair?.token0;
  const currency1 = _.isEqual(pair?.token1, WBNB) ? ETHER : pair?.token1;

  return (
    <Box className={classes.container}>
      <Box className={classes.token}>
        <DoubleLogo currency0={currency0} currency1={currency1} />
        <span className={classes.pairName}>
          {currency0.symbol}/{currency1.symbol}
        </span>
      </Box>
      <Link
        to={{
          pathname: `/remove/${pair?.liquidityToken?.address}`,
          search: `?version=${version}`,
        }}
      >
        <Button>
          <span className='text-error'>
            {t('component.positionCard.remove')}
          </span>
        </Button>
      </Link>
    </Box>
  );
}

export default LpTokenCard;
