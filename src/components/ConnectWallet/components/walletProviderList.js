import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { openModal, closeModal } from 'actions/app/modal';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_WALLETS } from 'constants/supportWallet';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
};

const useStyles = makeStyles({
  walletIcon: {
    marginLeft: 7,
    marginRight: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  activeWallet: {
    background: '-webkit-linear-gradient(135deg, #FAA0D1, #9F1BFF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    borderColor: '#9F1BFF !important',
  },
  hr: {
    borderTop: '1px solid #e6e8ec',
    width: '100%',
  },
  activeButton: {
    background: '-webkit-linear-gradient(135deg, #FAA0D1, #9F1BFF)',
    color: 'white !important',
    cursor: 'pointer !important',
    border: 'none !important',
  },
});

const WalletProviderModal = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { closeModal } = props;

  const { connector, activate, deactivate, error, account } = useWeb3React();

  const [selectWallet, setSelectWallet] = useState(null);

  const WalletList = Object.values(SUPPORTED_WALLETS);

  const tryActivation = async (walletItem) => {
    let conn =
      typeof walletItem.connector === 'function'
        ? await connector()
        : walletItem.connector;

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (
      conn instanceof WalletConnectConnector &&
      conn.walletConnectProvider?.wc?.uri
    ) {
      conn.walletConnectProvider = undefined;
    }
    if (conn) {
      try {
        await activate(conn, undefined, true);
        localStorage.setItem('edda-user-wallet', walletItem.name);
        closeModal();
      } catch (error) {
        closeModal();
        if (error instanceof UnsupportedChainIdError) {
          activate(conn); // a little janky...can't use setError because the connector isn't set
        } else {
          console.log('connect error', error);
        }
      }
    }
  };

  const connectWallet = () => {
    if (selectWallet && selectWallet.connector === connector && !error) {
      return closeModal();
    }
    if (selectWallet) {
      tryActivation(selectWallet);
    }
  };

  return (
    <div className={`wallet-provider`}>
      <div className={classes.title}>
        <span>{t('header.menu.connectWallet')}</span>
      </div>
      {WalletList.map((item) => {
        return (
          <div
            key={item.name}
            className={`wallet-card ${
              selectWallet && selectWallet.name === item.name
                ? classes.activeWallet
                : ''
            }`}
            onClick={() => {
              setSelectWallet(item);
            }}
          >
            <div className='wallet-name'>
              <img
                src={item.logo}
                alt={item.logo}
                className={classes.walletIcon}
              />
              {item.name}
            </div>
          </div>
        );
      })}
      <hr className={classes.hr} />
      <div className='flex justify-center'>
        <div
          className={`wallet-connect-btn ${selectWallet ? 'btn-gradient' : ''}`}
          onClick={connectWallet}
        >
          {t('button.connect')}
        </div>
      </div>
    </div>
  );
};

export default connect(null, {
  openModal,
  closeModal,
})(WalletProviderModal);
