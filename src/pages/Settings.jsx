import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Slide,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  IconButton,
} from '@material-ui/core';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import FaceIcon from '@material-ui/icons/Face';
import DescriptionIcon from '@material-ui/icons/Description';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import firebase from '../firebase';

const auth = firebase.auth();
const database = firebase.database();

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  closeHeader: {
    flexGrow: 1,
  },
  category: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  categoryCloseButton: {
    marginLeft: 'auto',
    padding: theme.spacing(1),
  },
}));

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const Settings = () => {
  const classes = useStyles();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGM, setIsGM] = useState(false);
  const [isNameChangeDialogOpen, setIsNameChangeDialogOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [template, setTemplate] = useState({});
  const [target, setTarget] = useState({ key: '', name: '' });

  const toggleIsGM = useCallback(() => {
    if (auth.currentUser?.uid) {
      database.ref(`settings/${auth.currentUser?.uid}/isGM`).set(!isGM);
    }
  }, [isGM, auth.currentUser?.uid]);

  const templateElement = useMemo(() => {
    const categories = Object.entries(template).map(([key, { categoryName, fields = {} }]) => {
      return (
        <Paper className={classes.category} key={key} variant="outlined">
          <Toolbar>
            <TextField
              label="カテゴリ名"
              variant="outlined"
              size="small"
              value={categoryName}
              onChange={(event) =>
                database.ref().update({ [`settings/template/${key}/categoryName`]: event.target.value })
              }
            />
            <IconButton
              className={classes.categoryCloseButton}
              onClick={() => {
                setIsCategoryDeleteModalOpen(true);
                setTarget({ key, name: categoryName });
              }}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
          {Object.values(fields).map((fieldName) => (
            <TextField
              label="項目名"
              value={fieldName}
              onChange={(event) =>
                database.ref(`settings/template/${categoryName}/${fieldName}`).set(event.target.value)
              }
            />
          ))}
        </Paper>
      );
    });
    return (
      <>
        {categories}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => {
            database.ref(`settings/template`).push({ categoryName: '' });
          }}
        >
          <AddIcon />
        </Button>
      </>
    );
  }, [template]);

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

      database.ref(`settings/template`).on('value', (snapshot) => {
        const template = snapshot.val() || {};
        setTemplate(template);
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
        <ListItem button onClick={() => setIsTemplateOpen(true)}>
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary="シートテンプレート" />
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
      <Dialog
        fullScreen
        open={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        TransitionComponent={Transition}
      >
        <AppBar>
          <Toolbar>
            <Typography variant="h6" className={classes.closeHeader}>
              シートテンプレート
            </Typography>
            <Button color="inherit" onClick={() => setIsTemplateOpen(false)}>
              完了
            </Button>
          </Toolbar>
        </AppBar>
        <Toolbar />
        {templateElement}
      </Dialog>
      <Dialog open={isCategoryDeleteModalOpen} onClose={() => setIsCategoryDeleteModalOpen(false)}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await database.ref(`settings/template/${target.key}`).remove();
            // const snapshot = await database.ref(`sheets`).once('value');
            // シートからも削除
            setIsCategoryDeleteModalOpen(false);
          }}
        >
          <DialogTitle>削除</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              カテゴリ削除により全プレイヤーのシートからも同名のカテゴリとその値が削除されます。
            </Typography>
            <Typography variant="body1">本当にカテゴリ「{target.name || '無名のカテゴリ'}」を削除しますか？</Typography>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={() => setIsCategoryDeleteModalOpen(false)} color="primary">
              キャンセル
            </Button>
            <Button type="submit" color="primary">
              削除
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default Settings;
