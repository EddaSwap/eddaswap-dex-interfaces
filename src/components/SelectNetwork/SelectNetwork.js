import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { closeModal, openModal } from 'actions/app/modal';
import { NETWORK_ICON, NETWORK_LABEL } from 'constants/network';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import SelectNetworkModal from './SelectNetworkModal';

export const useStyles = makeStyles((theme) => ({
  networkIcon: {
    width: 20,
    marginRight: theme.spacing(1),
    borderRadius: '50%',
  },
}));

function SelectNetwork(props) {
  const classes = useStyles();
  const { openModal, closeModal } = props;

  const web3Context = useWeb3React();

  const { chainId, library, connector } = web3Context;
  const wrongNetwork = useWrongNetwork();

  const onClickSelectNetwork = () => {
    openModal(
      <SelectNetworkModal handleClose={closeModal} />,
      'select-network-modal'
    );
  };

  useEffect(() => {
    if (wrongNetwork && connector instanceof InjectedConnector) {
      openModal(
        <SelectNetworkModal handleClose={closeModal} />,
        'select-network-modal'
      );
    }
  }, [wrongNetwork]);

  //check wrong network on top because if wrongnetwork, chainId and library is undefined
  //then !chainId || !library.provider.isMetaMask will return true
  if (wrongNetwork) {
    return null;
  }

  if (!chainId || !library.provider.isMetaMask) {
    return null;
  }

  return (
    <React.Fragment>
      <Box className="select-network" onClick={onClickSelectNetwork}>
        <img
          src={NETWORK_ICON[chainId]}
          alt={chainId}
          className={classes.networkIcon}
        />
        <span>{NETWORK_LABEL[chainId]}</span>
      </Box>
    </React.Fragment>
  );
}

export default connect(null, {
  openModal,
  closeModal,
})(SelectNetwork);
