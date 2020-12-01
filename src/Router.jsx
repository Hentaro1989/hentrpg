import React, { useEffect, useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Sheets from './pages/Sheets';
import SignIn from './pages/SignIn';
import firebase from './firebase';
import { CircularProgress, makeStyles } from '@material-ui/core';

const auth = firebase.auth();

export const PATHS = {
  ROOT: '/',
  SIGNIN: '/signin',
  REGISTER: '/register',
  SHEETS: '/sheets',
  SETTINGS: '/sheets/settings',
};

const useStyle = makeStyles((theme) => ({
  loading: {
    position: 'fixed',
    left: '50%',
    top: '50%',
    width: '100%',
    height: 'auto',
    textAlign: 'center',
    transform: 'translate(-50%, -50%)',
  },
}));

const PrivateRoute = ({ exact, path, isLoggedIn, children }) => {
  const classes = useStyle();

  switch (isLoggedIn) {
    case true:
      return (
        <Route exact={exact} path={path}>
          {children}
        </Route>
      );
    case false:
      return <Redirect to={PATHS.SIGNIN} />;
    default:
      return (
        <Route exact={exact} path={path}>
          <div className={classes.loading}>
            <CircularProgress size="30%" />
          </div>
        </Route>
      );
  }
};

const Router = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
  });

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path={PATHS.ROOT}>
          {isLoggedIn ? <Redirect to={PATHS.SHEETS} /> : <Redirect to={PATHS.SIGNIN} />}
        </Route>
        <Route exact path={PATHS.SIGNIN}>
          {isLoggedIn ? <Redirect to={PATHS.SHEETS} /> : <SignIn />}
        </Route>
        <Route exact path={PATHS.REGISTER}>
          <Register />
        </Route>
        <PrivateRoute path={PATHS.SHEETS} isLoggedIn={isLoggedIn}>
          <Layout>
            <Switch>
              <Route exact path={PATHS.SHEETS}>
                <Sheets />
              </Route>
              <Route exact path={PATHS.SETTINGS}>
                <Settings />
              </Route>
            </Switch>
          </Layout>
        </PrivateRoute>
        <Route exact path="*">
          <NotFound />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
