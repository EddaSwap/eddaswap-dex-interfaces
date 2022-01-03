import React from 'react';
import ResponsiveDialog from 'components/ResponsiveDialog';
import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import { supportedChainIds } from 'constants/supportWallet';
import { NETWORK_ICON, NETWORK_LABEL } from 'constants/network';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { useWeb3React } from '@web3-react/core';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import { onSwitchBSCNetwork, onSwitchPolygonNetwork } from 'lib/walletHelper';
import Grid from '@material-ui/core/Grid';
import classnames from 'classnames';

export const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    borderColor: '#777e90',
    cursor: 'pointer',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    minWidth: 170,
    width: '100%',
    margin: theme.spacing(1),
  },
  networkIcon: {
    width: 25,
    marginRight: theme.spacing(1),
    borderRadius: '50%',
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  active: {
    borderColor: '#9f1bff',
  },
  descContainer: {
    marginTop: 10,
  },
  desc: {
    marginLeft: 8,
    fontSize: 12,
    color: '#777e90',
    '& span': {
      fontSize: 14,
      color: '#e6007a',
    },
  },
}));

function SelectModal({ handleClose }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const web3Context = useWeb3React();
  const { chainId } = web3Context;
  const wrongNetwork = useWrongNetwork();

  const onSelectNetwork = (network) => {
    const switchFunc = {
      56: onSwitchBSCNetwork,
      137: onSwitchPolygonNetwork,
    };

    switchFunc[network] && switchFunc[network]();
    handleClose && handleClose();
  };

  return (
    <div className={``}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 20 }}>{t('modal.title.selectNetwork')}</span>
      </div>
      {!wrongNetwork && (
        <span className={classes.desc}>
          You are currently browsing <span>EDDASwap</span> on the{' '}
          <span>{NETWORK_LABEL[chainId]}</span> network
        </span>
      )}
      <br />
      <Grid container style={{ marginTop: !wrongNetwork ? 0 : '-1rem' }}>
        {supportedChainIds.map((network) => (
          <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
            <Box className={classes.row} key={network}>
              <Box
                className={classnames(
                  classes.container,
                  network === chainId && classes.active
                )}
                onClick={() => onSelectNetwork(network)}
                border={2}
                borderRadius={10}
              >
                <img
                  src={NETWORK_ICON[network]}
                  alt={network}
                  className={classes.networkIcon}
                />
                <Typography variant='body2'>
                  {NETWORK_LABEL[network]}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default SelectModal;
