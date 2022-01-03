import React from 'react';
import { useTranslation } from 'react-i18next';
import { IoArrowUpCircleOutline } from 'react-icons/io5';
import { useWeb3React } from '@web3-react/core';
import {
  EXPLORER_NAME_BY_CHAIN,
  EXPLORER_LINK_BY_CHAIN,
} from 'constants/address';

function TxHash(props) {
  const { t } = useTranslation();

  const { chainId } = useWeb3React();

  const { txHash = '', className = '', networkId } = props;

  return (
    <div className={`txHash-modal ${className}`}>
      <div className='sentTxHash'>
        <IoArrowUpCircleOutline className='icons' />
        <p>
          <span style={{ fontSize: 18 }}>
            {t('component.modal.transactionSubmitted')}
          </span>
        </p>
        <a
          href={`${EXPLORER_LINK_BY_CHAIN[chainId]}/tx/${txHash}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('component.modal.viewBSCscan')} {EXPLORER_NAME_BY_CHAIN[chainId]}
        </a>
      </div>
    </div>
  );
}

export default TxHash;
