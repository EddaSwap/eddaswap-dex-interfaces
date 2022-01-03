import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setSlippage, setTransactionDeadline } from 'actions/exchange/settings';
import { secondsToMinutes, minutesToSeconds } from 'lib/timeHelper';
import {
  lessThan,
  greaterThan,
  lessThanEqual,
  greaterThanEqual,
} from 'lib/numberHelper';
import { useTranslation } from 'react-i18next';
import TextInput from 'components/TextInput';
import { useApiStore } from 'hooks/useStore';
import { withStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import { ChainId } from '@sushiswap/sdk';
import { useWeb3React } from '@web3-react/core';
import { ROUTER_VERSION } from 'constants/constants';

const useStyles = makeStyles((theme) => ({
  tabs: {
    marginLeft: theme.spacing(2),
  },
  hr: {
    borderTop: '1px solid #e6e8ec',
  },
  error: {
    fontSize: 14,
  },
}));

const StyledTabs = withStyles({
  root: {
    borderRadius: 100,
    border: '1px solid #777e90',
    padding: 1,
    margin: 0,
    alignItems: 'center',
    minHeight: 32,
  },
  indicator: {
    height: 0,
  },
})(Tabs);

const StyledTab = withStyles({
  root: {
    minHeight: 30,
    minWidth: 60,
    '&.Mui-selected': {
      borderRadius: 30,
    },
  },
})(Tab);

function Settings(props) {
  const { setSlippage, setTransactionDeadline } = props;

  const apiStore = useApiStore();
  const slippage = apiStore.settings.slippage;
  const secondsTxDeadline = apiStore.settings.secondsTxDeadline;

  const [state, setState] = useState({
    slippageError: '',
    txDeadlineError: '',
  });
  const [localSlippage, setLocalSlippage] = useState(slippage | 0.5);
  const [txDeadline, setTxDeadline] = useState(
    secondsToMinutes(secondsTxDeadline) | 2
  );

  const setStateField = (fieldObj) => {
    setState({ ...state, ...fieldObj });
  };

  const { t } = useTranslation();
  const classes = useStyles();

  const onSlippageClick = (value) => {
    setLocalSlippage(value);

    if (greaterThan(value, 5) && lessThan(value, 50)) {
      setSlippage(value);
      setStateField({ slippageError: t('component.settings.txFrontrun') });
    } else if (greaterThan(value, 0) && lessThan(value, 50)) {
      setSlippage(value);
      setStateField({ slippageError: '' });
    } else
      setStateField({ slippageError: t('component.settings.invalidSlippage') });
  };

  const onChangeTransactionDeadline = (minDeadline) => {
    setTxDeadline(minDeadline);

    if (greaterThanEqual(minDeadline, 1) && lessThanEqual(minDeadline, 5)) {
      setStateField({ txDeadlineError: '' });
      setTransactionDeadline(minutesToSeconds(minDeadline));
    } else
      setStateField({
        txDeadlineError: t('component.settings.invalidDeadline'),
      });
  };

  return (
    <div className="settings-modal">
      <span className="bold slippage-title">
        {t('component.settings.settings')}
      </span>
      <hr className={classes.hr} />

      <h6 className="bold">{t('component.settings.slippage')}</h6>
      <div className="slippage-row">
        <StyledTabs
          className={classes.tabs}
          value={Number(localSlippage)}
          onChange={(event, newValue) => {
            onSlippageClick(newValue);
          }}
        >
          <StyledTab label="0.1%" value={0.1} />
          <StyledTab label="0.5%" value={0.5} />
          <StyledTab label="1%" value={1} />
        </StyledTabs>
        <div className="align-center">
          <TextInput
            type="number"
            placeholder={localSlippage}
            value={localSlippage}
            className="slippage-input"
            onChange={onSlippageClick}
          />
          <span>%</span>
        </div>
      </div>
      <span className={`text-error ${classes.error}`}>
        {state.slippageError}
      </span>

      <br />

      <h6 className="bold">{t('component.settings.transactionDeadline')}</h6>
      <div className="align-center">
        <TextInput
          type="number"
          placeholder={txDeadline}
          value={txDeadline}
          className="deadline-input"
          onChange={onChangeTransactionDeadline}
          min={1}
        />
        <span>{t('component.settings.minutes')}</span>
      </div>
      <span className={`text-error ${classes.error}`}>
        {state.txDeadlineError}
      </span>
    </div>
  );
}

export default connect(null, { setSlippage, setTransactionDeadline })(Settings);
