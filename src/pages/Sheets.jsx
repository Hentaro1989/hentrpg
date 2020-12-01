import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Snackbar } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import firebase from '../firebase';
import { Alert } from '@material-ui/lab';
import Sheet from '../components/sheet/Sheet';

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

  useEffect(() => {
    if (auth.currentUser.uid) {
      setMyUid(auth.currentUser.uid);
      database.ref('sheets').on('value', (snapshot) => {
        const sheetList = snapshot.val();
        if (!sheetList) {
          setSheets([]);
          return;
        }

        const sheetElements = Object.entries(sheetList).map(([uid, username], i) => (
          <Sheet username={username} isMine={uid === myUid} isGM={isGM} key={i} />
        ));
        setSheets(sheetElements);
      });

      database.ref(`settings/${myUid}/isGM`).on('value', (snapshot) => {
        setIsGM(!!snapshot.val());
      });
    }

    return () => {
      database.ref('sheets').off('value');
      database.ref(`settings/${myUid}/isGM`).off('value');
      setMyUid('');
    };
  }, [auth.currentUser?.uid]);

  return (
    <div className={classes.root}>
      {sheets}
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
