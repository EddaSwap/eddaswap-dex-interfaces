import React, { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { NETWORK_LABEL, NETWORK_ICON } from 'constants/network';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { connect } from 'react-redux';
import SelectNetworkModal from './SelectNetworkModal';
import { closeModal, openModal } from 'actions/app/modal';

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

  const { chainId, library } = web3Context;
  const wrongNetwork = useWrongNetwork();

  const onClickSelectNetwork = () => {
    openModal(
      <SelectNetworkModal handleClose={closeModal} />,
      'select-network-modal'
    );
  };

  useEffect(() => {
    if (wrongNetwork) {
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
      <Box className='select-network' onClick={onClickSelectNetwork}>
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
