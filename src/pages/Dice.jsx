import React, { forwardRef, useEffect, useReducer, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  Slider,
  makeStyles,
  Typography,
  IconButton,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import firebase from '../firebase';

const auth = firebase.auth();
const database = firebase.database();

const useStyles = makeStyles((theme) => ({
  diceConfig: {
    textAlign: 'center',
  },
  slider: {
    padding: theme.spacing(1),
  },
  result: {
    margin: theme.spacing(3),
  },
}));

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Dice = ({ isDiceDialogOpen, close = () => undefined }) => {
  const classes = useStyles();
  const [diceConfig, setDiceConfig] = useReducer((_, value) => {
    window.localStorage.setItem('diceConfig', JSON.stringify(value));
    return value;
  }, JSON.parse(window.localStorage.getItem('diceConfig') || '{ "number": 1, "faces": 6 }'));
  const [result, setResult] = useState(0);
  const [isThrowButtonDisabled, setIsThrowButtonDisabled] = useState(false);
  const [diceLog, setDiceLog] = useState([]);

  useEffect(() => {
    database.ref(`dice/${auth.currentUser.uid}`).on('value', (snapshot) => {
      setDiceLog(snapshot.val() || []);
    });

    return () => {
      database.ref(`dice/${auth.currentUser.uid}`).off();
    };
  }, []);

  return (
    <Dialog open={isDiceDialogOpen} onClose={close} TransitionComponent={Transition}>
      <DialogTitle>ダイス</DialogTitle>
      <DialogContent>
        <Grid container className={classes.diceConfig}>
          <Grid item xs={12}>
            <Typography variant="h5">{`${diceConfig.number}D${diceConfig.faces}`}</Typography>
          </Grid>
          <Grid item xs={6} className={classes.slider}>
            <Slider
              style={{ marginTop: '1.5rem' }}
              min={1}
              max={24}
              value={diceConfig.number}
              onChange={(_, value) => setDiceConfig({ ...diceConfig, number: value })}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={6} className={classes.slider}>
            <Slider
              style={{ marginTop: '1.5rem' }}
              min={1}
              max={100}
              value={diceConfig.faces}
              onChange={(_, value) => setDiceConfig({ ...diceConfig, faces: value })}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={3}>
            <IconButton
              color="primary"
              disabled={diceConfig.number < 2}
              onClick={() => setDiceConfig({ ...diceConfig, number: diceConfig.number - 1 })}
            >
              <ArrowBackIcon />
            </IconButton>
          </Grid>
          <Grid item xs={3}>
            <IconButton
              color="primary"
              disabled={diceConfig.number > 23}
              onClick={() => setDiceConfig({ ...diceConfig, number: diceConfig.number + 1 })}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Grid>
          <Grid item xs={3}>
            <IconButton
              color="primary"
              disabled={diceConfig.faces < 2}
              onClick={() => setDiceConfig({ ...diceConfig, faces: diceConfig.faces - 1 })}
            >
              <ArrowBackIcon />
            </IconButton>
          </Grid>
          <Grid item xs={3}>
            <IconButton
              color="primary"
              disabled={diceConfig.faces > 99}
              onClick={() => setDiceConfig({ ...diceConfig, faces: diceConfig.faces + 1 })}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Grid>
          <Grid item xs={12} className={classes.result}>
            <Typography variant="h4">{result}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                setIsThrowButtonDisabled(true);
                const result = Math.ceil(Math.random() * diceConfig.number * diceConfig.faces);
                const newLog = [...diceLog, { result, time: Date.now() }];
                if (newLog.length > 10) {
                  newLog.shift();
                }
                await database.ref().update({ [`dice/${auth.currentUser.uid}`]: newLog });
                setResult(result);
                setIsThrowButtonDisabled(false);
              }}
              disabled={isThrowButtonDisabled}
            >
              ダイスロール
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="primary">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Dice;
