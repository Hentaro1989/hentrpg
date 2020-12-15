import React from 'react';
import { SnackbarProvider } from 'notistack';
import AppBar from './AppBar';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  return (
    <SnackbarProvider maxSnack={3}>
      <AppBar />
      {children}
      <BottomNav />
    </SnackbarProvider>
  );
};

export default Layout;
