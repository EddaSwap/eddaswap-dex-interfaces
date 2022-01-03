import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';
import { getImagePath } from 'lib/imageHelper';
import { changeTheme } from 'actions/app/theme';
import LanguageDropdown from 'components/LanguageDropdown';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import SwitchButton from 'components/SwitchButton';

const useStyles = makeStyles({
  container: {
    margin: 20,
  },
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  icon: {
    left: 30,
    top: 25,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0 1rem',
  },
  logo: {
    width: 200,
    height: 'auto',
  },
});

export default function MobileDrawer({ menu, pathname }) {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.app.storage);

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const onChangeTheme = (checked, e) => {
    dispatch(changeTheme(theme));
    e.stopPropagation();
    e.preventDefault();
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list, classes.container, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role='presentation'
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <Link to='/'>
        <img
          src={getImagePath('edda-logo')}
          className={classes.logo}
          alt='logo'
        />
      </Link>
      <List>
        {menu.map((item, index) => {
          const isActive = item.active.find((active) =>
            pathname.includes(active)
          );
          return (
            <ListItem button key={index}>
              <Link to={item.link} key={index}>
                {/* <p className={isActive ? "active" : null}>{item.title}</p> */}
                <ListItemText
                  className={isActive ? 'active' : null}
                  primary={item.title}
                />
              </Link>
            </ListItem>
          );
        })}

        <ListItem button>
          <a
            href='https://staging-dexinfo.eddaswap.com/'
            target='_blank'
            rel='noopener noreferrer'
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <p>Info</p>
          </a>
        </ListItem>
      </List>
      <Box className={classes.footer}>
        <SwitchButton checked={theme === 'default'} onChange={onChangeTheme} />
        <div className='header-language-container'>
          <LanguageDropdown />
        </div>
      </Box>
    </div>
  );

  return (
    <Box>
      <React.Fragment key={'left'}>
        <div className={classes.icon} onClick={toggleDrawer('left', true)}>
          <MenuIcon />
        </div>
        <Drawer
          anchor={'left'}
          open={state['left']}
          onClose={toggleDrawer('left', false)}
        >
          {list('left')}
        </Drawer>
      </React.Fragment>
    </Box>
  );
}
