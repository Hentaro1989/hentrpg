import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import firebase from '../firebase';

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
}));

const AppBar = () => {
  const classes = useStyles();

  return (
    <>
      <MuiAppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" align="left" className={classes.title}>
            HenTRPG
          </Typography>
          <Button
            color="inherit"
            onClick={async () => {
              await firebase.auth().signOut();
            }}
          >
            ログアウト
          </Button>
        </Toolbar>
      </MuiAppBar>
      <Toolbar />
    </>
  );
};

export default AppBar;
