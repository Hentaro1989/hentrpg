import React from 'react';
import { Button, Container, makeStyles, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',
  },
}));

const NotFound = () => {
  const history = useHistory();
  const classes = useStyles();

  return (
    <Container component="main" className={classes.root}>
      <Typography variant="h1">404</Typography>
      <Typography variant="h2">Page Not Found</Typography>
      <Button variant="contained" color="primary" onClick={() => history.goBack()}>
        戻る
      </Button>
    </Container>
  );
};

export default NotFound;
