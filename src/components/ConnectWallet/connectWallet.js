import { useWeb3React } from '@web3-react/core';
import { useNativeToken } from 'hooks/useNativeToken';
import Grid from '@material-ui/core/Grid';
import { closeModal, openModal } from 'actions/app/modal';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import { BiWalletAlt } from 'react-icons/bi';
import { getIcon } from 'lib/imageHelper';
import { truncateAddress } from 'lib/stringHelper';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import ConnectedModal from './components/connectedModal';
import WalletProviderModal from './components/walletProviderList';
import { getCurrencyBalance } from 'lib/sdk/contract';
import { truncate } from 'lib/numberHelper';
import { ETHER } from 'constants/tokens';
import { useDispatch } from 'react-redux';
import SelectNetworkModal from '../SelectNetwork/SelectNetworkModal';

const ConnectWallet = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { openModal, closeModal, showIcon } = props;

  const wrongNetwork = useWrongNetwork();
  const { account, deactivate, chainId } = useWeb3React();
  const nativeETHER = ETHER[chainId];

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    dispatch({
      type: 'SET_WEB3',
      chainId,
    });
  }, [chainId]);

  useEffect(async () => {
    if (account) {
      const balance = await getCurrencyBalance(nativeETHER, account);
      setBalance(balance);
    }
  }, [account, chainId]);

  const onClickConnect = () => {
    openModal(<WalletProviderModal {...props} />, 'wallet-connect-modal');
  };

  const onClickSelectNetwork = () => {
    openModal(
      <SelectNetworkModal handleClose={closeModal} />,
      'select-network-modal'
    );
  };

  const onClickAccount = () => {
    openModal(
      <ConnectedModal
        onDisconnect={() => {
          deactivate();
          closeModal();
        }}
      />,
      'wallet-connect-modal'
    );
  };

  return (
    <>
      {account && !wrongNetwork ? (
        <div onClick={() => onClickAccount()} className='connect-wallet'>
          <div className='account-container'>
            <span className='balance'>{`${truncate(balance, 3)} ${
              nativeETHER.symbol
            }`}</span>
            <span className='text-contrast account'>
              {truncateAddress(account)}
            </span>
            <div className='active-icon' />
          </div>
        </div>
      ) : (
        <>
          {wrongNetwork ? (
            <div onClick={onClickSelectNetwork} className='connect-wallet'>
              <div className='wrong-network-container'>
                {getIcon('icon-sound')}
                <span className='bolder'>
                  {t('header.connectWallet.wrongNetwork')}
                </span>
              </div>
            </div>
          ) : (
            <>
              {showIcon ? (
                <BiWalletAlt
                  size={30}
                  onClick={onClickConnect}
                  color='#777e90'
                  className='wallet-icon'
                />
              ) : (
                <div onClick={onClickConnect} className='connect-wallet'>
                  <span className='text-highlight bolder'>
                    {t('header.menu.connectWallet')}
                  </span>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default connect(null, {
  openModal,
  closeModal,
})(ConnectWallet);
