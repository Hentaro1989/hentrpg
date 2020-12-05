import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Snackbar } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import firebase from '../firebase';
import { Alert } from '@material-ui/lab';
import Sheet from '../components/Sheet';

const auth = firebase.auth();
const database = firebase.database();

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1),
  },
  inputGrid: {
    padding: theme.spacing(1),
  },
  addSheetButton: {
    marginTop: theme.spacing(1),
  },
}));

const Sheets = () => {
  const classes = useStyles();
  const [sheets, setSheets] = useState([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isGM, setIsGM] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [myUid, setMyUid] = useState('');

  const sheetElements = useMemo(() => {
    return Object.entries(sheets).map(([uid, username], i) => (
      <Sheet username={username} uid={uid} isMine={uid === myUid} isGM={isGM} key={i} />
    ));
  }, [sheets, isGM, myUid]);

  useEffect(() => {
    database.ref('sheets').on('value', (snapshot) => {
      setSheets(snapshot.val() || []);
    });

    database.ref(`settings/${auth.currentUser.uid}/isGM`).on('value', (snapshot) => {
      setIsGM(!!snapshot.val());
    });

    setMyUid(auth.currentUser.uid);

    return () => {
      database.ref('sheets').off('value');
      database.ref(`settings/${myUid}/isGM`).off('value');
    };
  }, [myUid]);

  return (
    <div className={classes.root}>
      {sheetElements}
      <Button
        className={classes.addSheetButton}
        variant="contained"
        color="primary"
        fullWidth
        onClick={async () => {
          const snapshot = await database.ref('sheets').once('value');
          const characterName = snapshot.val()?.[auth.currentUser.uid];
          if (characterName) {
            setErrorMessage('自身のシートを削除してから追加してください。');
            setIsAlertOpen(true);
            return;
          }

          await database.ref(`sheets/${auth.currentUser.uid}`).set(auth.currentUser.displayName);
        }}
      >
        <AddIcon />
      </Button>
      <Snackbar open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </div>
  );
};

export default Sheets;
