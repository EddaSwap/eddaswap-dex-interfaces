import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { useWeb3React } from '@web3-react/core';
import { loadInitAppData, loadLocalStorage } from 'actions/app/init';
import { initUserPoolList } from 'actions/exchange/userPool';
import {
  initUserTokenList,
  loadTokenListWithAddedToken,
} from 'actions/exchange/userToken';
import {
  loadLpTokenList,
  loadLpTokenListv2,
} from 'actions/liquidity/liquidityPool';
import { loadConnectedWallet } from 'actions/wallet';
import Footer from 'components/Footer';
import Header from 'components/Header';
import { createBrowserHistory } from 'history';
import { useWrongNetwork } from 'hooks/useWrongNetwork';
import Loading from 'pages/Loading';
import React, { useEffect, useState, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { useFetchListCallback } from 'hooks/useFetchListCallback';
import { connect, useDispatch, useSelector } from 'react-redux';
import './App.scss';
import './assets/styles/app.scss';
import './i18n';
import MuiDarkTheme from './theme/dark';
import MuiLightTheme from './theme/light';
import Theme from './theme/theme';

const ExchangePage = React.lazy(() => import('pages/Exchange'));
const AddLiquidPage = React.lazy(() => import('pages/Liquidity/liquidity'));
const AddLiquidity = React.lazy(() => import('pages/Liquidity/components/add'));
const RemoveLiquidity = React.lazy(() =>
  import('pages/Liquidity/components/remove')
);
const ImportLiquidity = React.lazy(() =>
  import('pages/Liquidity/components/import')
);
const Vesting = React.lazy(() => import('pages/Vesting'));
const NFT = React.lazy(() => import('pages/NFT'));
const LockLiquidity = React.lazy(() =>
  import('pages/Vesting/LockLiquidity/lockLiquidity')
);
const MigrateLiquidity = React.lazy(() => import('pages/Migrate'));
const Stats = React.lazy(() => import('pages/Stats'));
const Snackbar = React.lazy(() => import('components/Snackbar'));
const Modal = React.lazy(() => import('components/Modal'));
const DetailNFT = React.lazy(() => import('pages/NFT/detailNFT'));

const browserHistory = createBrowserHistory();

const App = (props) => {
  const { theme } = props;

  const web3Context = useWeb3React();
  const { account, chainId } = web3Context;
  const wrongNetwork = useWrongNetwork();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { userAddedTokens } = useSelector((state) => state.api.token);

  const lists = useSelector((state) => state.lists.byUrl);

  const fetchList = useFetchListCallback();

  const fetchAllListsCallback = useCallback(() => {
    if (!lists) return;
    Object.keys(lists).forEach((url) =>
      fetchList(url).catch((error) =>
        console.debug('interval list fetching error', error)
      )
    );
  }, [fetchList, lists]);

  useEffect(() => {
    dispatch({
      type: 'SET_WEB3',
      chainId,
    });
    fetchAllListsCallback();
  }, [chainId]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
    loadConnectedWallet(web3Context);
    props.loadInitAppData(web3Context);
    props.loadLocalStorage();
  }, []);

  useEffect(() => {
    props.initUserTokenList(chainId);
    props.initUserPoolList(chainId);
    props.loadLpTokenList(account, chainId);
    props.loadLpTokenListv2(account, chainId);
  }, [account, wrongNetwork, chainId]);

  useEffect(() => {
    props.loadTokenListWithAddedToken(chainId);
  }, [account, wrongNetwork, userAddedTokens]);

  const MuiTheme =
    theme === 'dark'
      ? createMuiTheme(MuiDarkTheme, Theme)
      : createMuiTheme(MuiLightTheme, Theme);

  return loading === false ? (
    <React.Suspense fallback={<Loading />}>
      <ThemeProvider theme={MuiTheme}>
        <Router history={browserHistory}>
          <div className={`App theme--${theme}`} id="App">
            <Header />
            <div className="bg page">
              <Switch>
                <Route exact path="/">
                  <Redirect to="/exchange" />
                </Route>

                <Route path="/exchange" component={ExchangePage} />
                <Route path="/addLiquid" component={AddLiquidPage} />
                <Route
                  path="/add/:address1?/:address2?"
                  component={AddLiquidity}
                />
                <Route path="/remove/:lpAddress?" component={RemoveLiquidity} />
                <Route exact path="/find" component={ImportLiquidity} />
                <Route path="/lockLiquidity" component={Vesting} />
                <Route path="/migrate" component={MigrateLiquidity} />
                <Route
                  path="/lock/:address/:version?"
                  component={LockLiquidity}
                />
                <Route path="/nft" component={NFT} />
                <Route path="/stats" component={Stats} />
                <Route path="/nft-detail">
                  <DetailNFT />
                </Route>
                <Redirect to="/exchange" />
              </Switch>
              <Snackbar />
              <Modal />
            </div>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </React.Suspense>
  ) : (
    <Loading />
  );
};

export default connect(
  (state) => {
    return {
      theme: state.app.storage.theme,
    };
  },
  {
    loadInitAppData,
    initUserTokenList,
    initUserPoolList,
    loadLocalStorage,
    loadLpTokenList,
    loadTokenListWithAddedToken,
    loadLpTokenListv2,
  }
)(App);
