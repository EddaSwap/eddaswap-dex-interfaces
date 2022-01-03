import React from 'react';
import { Link, withRouter, useLocation, useHistory } from 'react-router-dom';
import ConnectWallet from 'components/ConnectWallet';
import ToggleSwitch from 'components/ToggleSwitch';
import { changeTheme } from 'actions/app/theme';
import { connect } from 'react-redux';
import { getImagePath } from 'lib/imageHelper';
import LanguageDropdown from 'components/LanguageDropdown';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import MobileHeader from './MobileHeader';
import { isMobile } from 'react-device-detect';
import { useWeb3React } from '@web3-react/core';
import SelectNetwork from 'components/SelectNetwork';
import { ChainId } from '@sushiswap/sdk';

export const useStyles = makeStyles((theme) => ({
  menuItem: {
    textAlign: 'center',
  },
  logo: {
    height: 50,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  activeLink: {
    fontSize: 16,
    background: '-webkit-linear-gradient(135deg, #FAA0D1, #9F1BFF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLink: {
    padding: 12,
    marginLeft: 8,
    fontWeight: 600,
    '& p': {
      color: '#777e90',
    },
  },
  navItemContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  navLinkContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '3rem',
  },
}));

const Toolbar = (props) => {
  const pathname = useLocation().pathname;
  const { theme } = props;
  const history = useHistory();
  const classes = useStyles();
  const { t } = useTranslation();
  const { chainId } = useWeb3React();

  const navbarMenu = [
    {
      title: t('header.menu.exchange'),
      link: '/exchange',
      active: ['/exchange'],
    },
    {
      title: t('header.menu.liquidity'),
      link: '/addLiquid',
      active: ['/addLiquid', '/add', '/remove', '/find'],
    },
    {
      title: t('header.menu.lock'),
      link: '/lockLiquidity',
      active: ['/lockLiquidity', '/lock'],
    },
    // {
    //   title: 'NFT',
    //   link: '/nft',
    //   active: ['/nft'],
    // },
  ];

  if (chainId === ChainId.BSC) {
    navbarMenu.push({
      title: t('header.menu.migrate'),
      link: '/migrate',
      active: ['/migrate'],
    });
  }

  const goHome = () => {
    history.push('/');
  };

  if (isMobile) {
    return <MobileHeader />;
  }

  return (
    <header className="toolbar">
      <nav>
        <Grid container alignItems="center" justify="space-between">
          <div className={classes.navItemContainer}>
            <img
              src={getImagePath('edda-logo')}
              className={classes.logo}
              alt="logo"
              onClick={goHome}
            />
            <div className={classes.navLinkContainer}>
              {navbarMenu.map((item, index) => {
                const isActive = item.active.find((active) =>
                  pathname.includes(active)
                );
                return (
                  <Link to={item.link} key={index} className={classes.navLink}>
                    <p
                      className={`${
                        isActive ? 'active ' + classes.activeLink : ''
                      }`}
                    >
                      {item.title}
                    </p>
                  </Link>
                );
              })}
              <a
                href={
                  chainId === ChainId.BSC
                    ? 'https://dexinfo.eddaswap.com/'
                    : 'https://polygon-dexinfo.eddaswap.com/'
                }
                target="_blank"
                rel="noopener noreferrer"
                className={classes.navLink}
              >
                <p>{t('header.menu.info')}</p>
              </a>
            </div>
          </div>
          <div className="settings-container">
            <ToggleSwitch onChange={() => props.changeTheme(theme)} />
            <LanguageDropdown />
            <SelectNetwork />
            <ConnectWallet showIcon={true} />
          </div>
        </Grid>
      </nav>
    </header>
  );
};

export default connect(
  (state) => {
    return {
      theme: state.app.storage.theme,
    };
  },
  { changeTheme }
)(withRouter(Toolbar));
