import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { Toolbar } from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import CasinoIcon from '@material-ui/icons/Casino';
import SettingsIcon from '@material-ui/icons/Settings';
import { PATHS } from '../Router';

const useStyles = makeStyles((theme) => ({
  root: {
    ...theme.mixins.toolbar,
    position: 'fixed',
    width: '100%',
    bottom: 0,
    zIndex: 1100,
  },
}));

const BottomNav = () => {
  const history = useHistory();
  const classes = useStyles();
  const [value, setValue] = React.useState(history.location.pathname);

  useEffect(() => {
    const unregister = history.listen((location) => {
      setValue(location.pathname);
    });

    return () => {
      unregister();
    };
  }, [history]);

  return (
    <>
      <Toolbar />
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          history.push(newValue);
        }}
        showLabels
        className={classes.root}
      >
        <BottomNavigationAction label="シート" icon={<DescriptionIcon />} value={PATHS.SHEETS} />
        <BottomNavigationAction label="ダイス" icon={<CasinoIcon />} value={PATHS.DICE} />
        <BottomNavigationAction label="設定" icon={<SettingsIcon />} value={PATHS.SETTINGS} />
      </BottomNavigation>
    </>
  );
};

export default BottomNav;
