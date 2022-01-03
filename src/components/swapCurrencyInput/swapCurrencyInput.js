import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Button from 'components/Button';
import { getCurrencyBalance } from 'lib/sdk/contract';
import { formattedAmount, truncate } from 'lib/numberHelper';
import { objectIsEmpty } from 'lib/objectHelper';
import { BsChevronDown } from 'react-icons/bs';
import { FaChevronDown } from 'react-icons/fa';
import CurrencyLogo from 'components/CurrencyLogo';
import { useTranslation } from 'react-i18next';
import TextInput from 'components/TextInput';
import _ from 'lodash';
import { useWeb3React } from '@web3-react/core';

export const useStyles = makeStyles({
  tokenDropdownIcon: {
    marginLeft: 10,
  },
  tokenDropdownLabel: {
    fontWeight: 'bold',
  },
  maxBtn: {
    width: 60,
    height: 30,
    fontSize: 14,
    padding: '0 !important',
  },
});

function SwapCurrencyInput(props) {
  const {
    label = '',
    token = {},
    onTokenClick = () => {},
    onChangeAmount = () => {},
    amountValue = '',
    disabled = false,
    showMaxBtn = false,
    onMaxBtnClick = () => {},
    showSnackbar,
    balance,
    onSetTokenBalance = () => {},
  } = props;
  const classes = useStyles();

  const { t } = useTranslation();
  const { account, chainId } = useWeb3React();

  useEffect(() => {
    !_.isEmpty(token) && getSelectedCurrencyBalance();
  }, [token, account, showSnackbar, chainId]);
  const getSelectedCurrencyBalance = async () => {
    if (account && token && !objectIsEmpty(token)) {
      const balance = await getCurrencyBalance(token, account);
      onSetTokenBalance(balance);
    } else {
      onSetTokenBalance(0);
    }
  };
  return (
    <div className='swap-currency-input pointer'>
      <div className='row'>
        <div className='col-4'>
          <h5 className='bold text-contrast'>{label}</h5>
        </div>
        <div className='col-8 content-end'>
          <span className='note bold'>
            {balance >= 0 && !objectIsEmpty(token)
              ? `${t('component.swapInput.balance')}: ${formattedAmount(
                  balance
                )}`
              : null}
          </span>
        </div>
      </div>
      <div className='row'>
        <div className='col-4'>
          <TextInput
            type='number'
            placeholder='0.00'
            value={amountValue}
            step='0.01'
            min='0'
            onChange={onChangeAmount}
            disabled={disabled}
          />
        </div>
        <div className='col-8 content-end align-center'>
          {showMaxBtn ? (
            <Button
              onClick={() => onMaxBtnClick(balance)}
              className={`max-btn btn-tertiary ${classes.maxBtn}`}
            >
              {t('component.swapInput.max')}
            </Button>
          ) : null}
          <div className='token-selection' onClick={() => onTokenClick()}>
            <span style={{ marginRight: 5 }}>
              {token.symbol ? <CurrencyLogo currency={token} /> : null}
            </span>
            <div className='token-symbol-name'>
              <span
                className={`token-selection-desc ${classes.tokenDropdownLabel}`}
              >
                {token.symbol
                  ? token.symbol
                  : t('component.swapInput.selectToken')}
              </span>
            </div>
            <FaChevronDown className={`icons ${classes.tokenDropdownIcon}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect((state) => {
  return {
    showSnackbar: state.app.snackbar.show,
  };
}, {})(SwapCurrencyInput);
