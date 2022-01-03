import { Divider, Typography } from '@material-ui/core';
import { userAddToken, userRemoveToken } from 'actions/exchange/userToken';
import Button from '@material-ui/core/Button';
import CurrencyLogo from 'components/CurrencyLogo';
import TextInput from 'components/TextInput';
import {
  useAllTokens,
  useUserAddedTokensObject,
  useSearchInactiveTokenLists,
} from 'hooks/useTokens';
import { generateToken } from 'lib/sdk/token';
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import ListSelect from 'components/ListSelect';
import ResponsiveDialog from 'components/ResponsiveDialog';
import { filterTokens } from 'components/SelectToken/functions';
import useDebounce from 'hooks/useDebounce';
import { isAddress } from 'lib/utils';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { useWeb3React } from '@web3-react/core';
import { useNativeToken } from 'hooks/useNativeToken';

export const useStyles = makeStyles((theme) => ({
  dialogActions: {
    justifyContent: 'center',
  },
  tokenContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    cursor: 'pointer',
  },
  tokenInfoContainer: {
    marginLeft: theme.spacing(2),
  },
  customTokenContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollList: {
    flex: '1 1 0%',
    position: 'relative',
  },
}));

const CurrencyModalView = {
  SEARCH: 'SEARCH',
  MANAGE: 'MANAGE',
  IMPORT_TOKEN: 'IMPORT_TOKEN',
  DEFAULT: 'DEFAULT',
};

function SelectToken({ onSelectToken, show, handleClose }) {
  const { t } = useTranslation();
  const { chainId } = useWeb3React();
  const { ETHER } = useNativeToken();

  const classes = useStyles();

  const [searchTokenList, setSearchTokenList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalView, setModalView] = useState(CurrencyModalView.DEFAULT);

  const allTokens = useAllTokens();

  const userAddedToken = useUserAddedTokensObject();
  const allTokensList = Object.values(allTokens);

  let allTokensWithEther = [ETHER, ...allTokensList];

  const debouncedQuery = useDebounce(searchQuery, 200);
  // if they input an address, use it
  const isAddressSearch = isAddress(debouncedQuery);

  const filteredTokens = useMemo(() => {
    return filterTokens(Object.values(allTokens), debouncedQuery);
  }, [allTokens, debouncedQuery]);

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(
    filteredTokens.length === 0 ||
      (debouncedQuery.length > 2 && !isAddressSearch)
      ? debouncedQuery
      : undefined
  );

  const dispatch = useDispatch();

  const onChangeSearch = async (searchStr) => {
    try {
      setSearchQuery(searchStr);
      if (searchStr) {
        const findTokenInAllTokens = allTokensWithEther?.filter((item) => {
          const search = searchStr?.toLowerCase();
          const symbol = item?.symbol?.toLowerCase();
          return symbol?.includes(search);
        });

        if (findTokenInAllTokens && findTokenInAllTokens.length) {
          setModalView(CurrencyModalView.SEARCH);
          setSearchTokenList(findTokenInAllTokens);
        } else {
          setModalView(CurrencyModalView.SEARCH);
          const token = await generateToken(searchStr);
          if (token) {
            setSearchTokenList([token]);
          } else {
            setSearchTokenList([]);
          }
        }
      } else {
        setModalView(CurrencyModalView.DEFAULT);
        setSearchTokenList([]);
      }
    } catch {}
  };

  const onManageListClick = () => {
    setModalView(CurrencyModalView.MANAGE);
  };

  const onBackListSelect = () => {
    setModalView(CurrencyModalView.DEFAULT);
  };

  const onClose = () => {
    handleClose();
    setModalView(CurrencyModalView.DEFAULT);
  };
  const currencyRow = (currency = {}, searching = false) => {
    const address = currency?.address;

    const onAddToken = (e) => {
      dispatch(userAddToken(currency, chainId));
      e.stopPropagation();
    };

    const onRemoveToken = (e) => {
      dispatch(userRemoveToken(currency, chainId));
      e.stopPropagation();
    };
    return (
      <Box
        className={classes.tokenContainer}
        key={currency?.symbol}
        onClick={() => onSelectToken(currency)}
      >
        <CurrencyLogo currency={currency} />

        <Box className={classes.tokenInfoContainer}>
          <Typography variant="subtitle2">{currency?.symbol}</Typography>
          {userAddedToken[address] ? (
            <Box className={classes.customTokenContainer}>
              <Typography variant="caption">
                {t('component.selectToken.addedByUser')}{' '}
              </Typography>
              <Button onClick={onRemoveToken} text>
                ({t('component.selectToken.remove')})
              </Button>
            </Box>
          ) : searching && !allTokens[address] ? (
            <Box className={classes.customTokenContainer}>
              <Typography variant="caption">
                {t('component.selectToken.foundByAddress')}{' '}
              </Typography>
              <Button onClick={onAddToken} text>
                ({t('component.selectToken.add')})
              </Button>
            </Box>
          ) : (
            <Typography variant="caption">{currency.name}</Typography>
          )}
        </Box>
      </Box>
    );
  };
  const renderSearchTokenList = () => {
    return (
      <Box className={classes.scrollList}>
        {searchTokenList.map((item) => {
          return currencyRow(item, true);
        })}
        {filteredInactiveTokens.length ? (
          <React.Fragment>
            <Divider />
            {filteredInactiveTokens.map((item) => {
              return currencyRow(item);
            })}
          </React.Fragment>
        ) : null}
      </Box>
    );
  };

  const renderDefaultTokenList = () => {
    return (
      <Box className={classes.scrollList}>
        {allTokensWithEther?.map((item) => {
          return currencyRow(item);
        })}
      </Box>
    );
  };

  if (modalView === CurrencyModalView.MANAGE) {
    return (
      <ResponsiveDialog
        open={show}
        closeButton
        maxWidth="sm"
        title={t('component.selectToken.manage')}
        goBackButton
        onGoBackClick={onBackListSelect}
        handleClose={onClose}
      >
        <ListSelect />
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog
      open={show}
      closeButton
      maxWidth="sm"
      title={t('component.selectToken.selectAToken')}
      handleClose={onClose}
    >
      <DialogContent>
        <TextInput
          placeholder={t('component.selectToken.searchAddress')}
          onChange={onChangeSearch}
        />
        {modalView === CurrencyModalView.SEARCH
          ? renderSearchTokenList()
          : renderDefaultTokenList()}
        <Divider style={{ marginTop: '1rem' }} />
      </DialogContent>
      {/* <div className="select-token"> */}

      <DialogActions className={classes.dialogActions}>
        <Button variant="text" onClick={onManageListClick}>
          ({t('component.selectToken.manageTokenLists')})
        </Button>
      </DialogActions>
      {/* </div> */}
    </ResponsiveDialog>
  );
}

export default SelectToken;
