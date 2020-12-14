import React, { forwardRef, useReducer, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Slide,
  Slider,
  makeStyles,
  Typography,
} from '@material-ui/core';
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

  return (
    <Dialog open={isDiceDialogOpen} onClose={close} TransitionComponent={Transition}>
      <DialogTitle>ダイス</DialogTitle>
      <DialogContent>
        <Grid container className={classes.diceConfig}>
          <Grid item xs={6} className={classes.slider}>
            <Slider
              style={{ marginTop: '1.8rem' }}
              min={1}
              max={24}
              value={diceConfig.number}
              onChange={(_, value) => setDiceConfig({ ...diceConfig, number: value })}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={6} className={classes.slider}>
            <Slider
              style={{ marginTop: '1.8rem' }}
              min={1}
              max={100}
              value={diceConfig.faces}
              onChange={(_, value) => setDiceConfig({ ...diceConfig, faces: value })}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5">{`${diceConfig.number}D${diceConfig.faces}`}</Typography>
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
                const newRecord = database.ref(`dice/${auth.currentUser.uid}`).push();
                await newRecord.set({ result, time: Date.now() });
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
