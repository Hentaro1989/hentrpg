import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Snackbar } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Alert } from '@material-ui/lab';
import Sheet from '../components/Sheet';
import Dice from './Dice';
import { PATHS } from '../Router';
import firebase from '../firebase';

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
  const [sheets, setSheets] = useState({});
  const [gmUid, setGmUid] = useState(null);
  const [focusFields, setFocusFields] = useState({});
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDiceDialogOpen, setIsDiceDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();

  const sheetElements = useMemo(() => {
    return Object.entries(sheets)
      .sort(([uid]) => (uid === auth.currentUser.uid ? -1 : 1))
      .map(([uid, username], i) => (
        <Sheet username={username} sheetUid={uid} gmUid={gmUid} focusFields={focusFields} key={i} />
      ));
  }, [sheets, focusFields, gmUid]);

  useEffect(() => {
    database.ref('sheets').on('value', (snapshot) => {
      setSheets(snapshot.val() || {});
    });

    database.ref(`focus`).on('value', (snapshot) => {
      setFocusFields(snapshot.val() || {});
    });

    database.ref(`settings/global/gm`).on('value', (snapshot) => {
      setGmUid(snapshot.val());
    });

    database.ref(`focus/${auth.currentUser.uid}`).remove();

    return () => {
      database.ref('sheets').off('value');
      database.ref(`focus`).off('value');
      database.ref(`settings/global/gm`).off('value');
    };
  }, []);

  useEffect(() => {
    const unregister = history.listen((location) => {
      setIsDiceDialogOpen(location.pathname === PATHS.DICE);
    });

    setIsDiceDialogOpen(history.location.pathname === PATHS.DICE);

    return () => {
      unregister();
    };
  }, [history]);

  return (
    <div className={classes.root}>
      <div>{sheetElements}</div>
      <Button
        className={classes.addSheetButton}
        variant="contained"
        color="primary"
        fullWidth
        onClick={async () => {
          const sheetSnapshot = await database.ref('sheets').once('value');
          const characterName = sheetSnapshot.val()?.[auth.currentUser.uid];
          if (characterName) {
            setErrorMessage('自身のシートを削除してから追加してください。');
            setIsAlertOpen(true);
            return;
          }

          const templateSnapshot = await database.ref(`settings/global/template`).once('value');
          const template = templateSnapshot.val() || {};

          const request = {
            [`sheets/${auth.currentUser.uid}`]: auth.currentUser.displayName,
            ...Object.entries(template['categories'] || {}).reduce((prev, [categoryId, categoryName]) => {
              prev[`categories/${auth.currentUser.uid}/${categoryId}/name`] = categoryName;
              return prev;
            }, {}),
            ...Object.entries(template['fields'] || {}).reduce((prev, [categoryId, fields]) => {
              Object.entries(fields || {}).forEach(
                ([fieldId, fieldName]) =>
                  (prev[`fields/${auth.currentUser.uid}/${categoryId}/${fieldId}/name`] = fieldName),
              );
              return prev;
            }, {}),
          };

          await database.ref().update(request);
        }}
      >
        <AddIcon />
      </Button>
      <Snackbar open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
      <Dice
        isDiceDialogOpen={isDiceDialogOpen}
        close={() => {
          setIsDiceDialogOpen(false);
          history.push(PATHS.SHEETS);
        }}
      />
    </div>
  );
};

export default Sheets;
