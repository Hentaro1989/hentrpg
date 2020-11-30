import React from 'react';
import AppBar from './AppBar';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  return (
    <>
      <AppBar />
      {children}
      <BottomNav />
    </>
  );
};

export default Layout;
