import React from 'react';
import { SnackbarProvider } from 'notistack';
import AppBar from './AppBar';
import BottomNav from './BottomNav';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    top: theme.spacing(8),
    left: 'auto !important',
    width: 'auto !important',
  },
}));

const Layout = ({ children }) => {
  const classes = useStyles();

  return (
    <SnackbarProvider maxSnack={3} dense classes={{ containerRoot: classes.containerRoot }}>
      <AppBar />
      {children}
      <BottomNav />
    </SnackbarProvider>
  );
};

export default Layout;
