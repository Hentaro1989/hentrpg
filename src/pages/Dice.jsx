import React, { forwardRef } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@material-ui/core';
import firebase from '../firebase';

const database = firebase.database();

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Dice = ({ isDiceDialogOpen, close = () => undefined }) => {
  return (
    <Dialog open={isDiceDialogOpen} onClose={close} TransitionComponent={Transition}>
      <DialogTitle>ダイス</DialogTitle>
      <DialogContent>
        <DialogContentText>something will be here.</DialogContentText>
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
