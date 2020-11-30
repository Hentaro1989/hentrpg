import React, { useCallback, useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  makeStyles,
} from '@material-ui/core';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import FaceIcon from '@material-ui/icons/Face';
import firebase from '../firebase';

const auth = firebase.auth();
const database = firebase.database();

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
}));

const Settings = () => {
  const classes = useStyles();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGM, setIsGM] = useState(false);
  const [isNameChangeDialogOpen, setIsNameChangeDialogOpen] = useState(false);
  const [name, setName] = useState('');

  const toggleIsGM = useCallback(() => {
    if (auth.currentUser?.uid) {
      database.ref(`settings/${auth.currentUser?.uid}/isGM`).set(!isGM);
    }
  }, [isGM, auth.currentUser?.uid]);

  useEffect(() => {
    if (auth.currentUser?.uid) {
      database.ref(`settings/${auth.currentUser?.uid}`).on('value', (snapshot) => {
        const settings = snapshot.val();
        if (!settings) {
          setIsGM(false);
          return;
        }
        setIsGM(!!settings.isGM);

        if (!isLoaded) {
          setIsLoaded(true);
        }
      });
    }

    return async () => {
      await database.ref(`settings/${auth.currentUser?.uid}`).off('value');
    };
  }, [auth.currentUser?.uid]);

  if (!isLoaded) {
    return <></>;
  }

  return (
    <>
      <List className={classes.root}>
        <ListItem button onClick={toggleIsGM}>
          <ListItemIcon>
            <SupervisorAccountIcon />
          </ListItemIcon>
          <ListItemText primary="GM権限" />
          <ListItemSecondaryAction>
            <Switch edge="end" checked={isGM} onClick={toggleIsGM} />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button onClick={() => setIsNameChangeDialogOpen(true)}>
          <ListItemIcon>
            <FaceIcon />
          </ListItemIcon>
          <ListItemText primary="キャラクター名" />
          {auth.currentUser?.displayName}
        </ListItem>
      </List>
      <Dialog open={isNameChangeDialogOpen} onClose={() => setIsNameChangeDialogOpen(false)}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            // シートがあるならシートの名前も更新する
            const snapshot = await database.ref(`sheets/${auth.currentUser.uid}`).once('value');
            const characterName = snapshot.val();
            if (characterName) {
              await database.ref(`sheets/${auth.currentUser.uid}`).set(name);
            }

            await auth.currentUser?.updateProfile({ displayName: name });
            setIsNameChangeDialogOpen(false);
          }}
        >
          <DialogTitle>キャラクター名</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="新しい名前"
              fullWidth
              value={name}
              onChange={({ target: { value } }) => setName(value)}
            />
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={() => setIsNameChangeDialogOpen(false)} color="primary">
              キャンセル
            </Button>
            <Button type="submit" disabled={!name} color="primary">
              登録
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default Settings;
