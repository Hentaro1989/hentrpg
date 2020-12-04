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
  InputAdornment,
  Divider,
  Grid,
  ListSubheader,
} from '@material-ui/core';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import FaceIcon from '@material-ui/icons/Face';
import DescriptionIcon from '@material-ui/icons/Description';
import CloseIcon from '@material-ui/icons/Close';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import firebase from '../firebase';

const auth = firebase.auth();
const database = firebase.database();

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  header: {
    flexGrow: 1,
  },
  category: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
  field: {
    padding: theme.spacing(1),
  },
  addFieldButton: {
    margin: theme.spacing(2),
  },
  categoryCloseButton: {
    marginLeft: theme.spacing(5),
  },
}));

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const Settings = () => {
  const classes = useStyles();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGM, setIsGM] = useState(false);
  const [isNameChangeDialogOpen, setIsNameChangeDialogOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [categories, setCategories] = useState({});
  const [sheets, setSheets] = useState({});
  const [fields, setFields] = useState({});
  const [target, setTarget] = useState({ type: '', key: '', name: '' });

  const toggleIsGM = useCallback(async () => {
    if (auth.currentUser?.uid) {
      const uids = Object.keys(sheets);
      await database.ref().update({
        ...uids.reduce((prev, uid) => {
          prev[`settings/${uid}/isGM`] = uid === auth.currentUser?.uid ? !isGM : false;
          return prev;
        }, {}),
      });
      setIsGM(!isGM);
    }
  }, [isGM, auth.currentUser?.uid]);

  const targetType = useMemo(() => {
    if (target.type === 'category') {
      return { label: 'カテゴリ', pathName: 'categories' };
    } else {
      return { label: 'フィールド', pathName: 'fields' };
    }
  }, [target]);

  const categoryElement = useMemo(() => {
    const sheetTemplate = Object.entries(categories || {}).map(([categoryKey, categoryName]) => {
      return (
        <Paper className={classes.category} key={categoryKey} variant="outlined">
          <Toolbar>
            <TextField
              className={classes.header}
              label="カテゴリ名"
              variant="outlined"
              size="small"
              value={categoryName}
              onChange={async (event) => {
                const newCategoryName = event.target.value;
                const uids = Object.keys(sheets);
                await database.ref().update({
                  [`settings/template/categories/${categoryKey}`]: newCategoryName,
                  ...uids.reduce((prev, uid) => {
                    prev[`categories/${uid}/${categoryKey}/name`] = newCategoryName;
                    return prev;
                  }, {}),
                });
              }}
            />
            <IconButton
              size="small"
              className={classes.categoryCloseButton}
              onClick={() => {
                setIsDeleteModalOpen(true);
                setTarget({ type: 'category', key: categoryKey, name: categoryName });
              }}
            >
              <DeleteForeverIcon />
            </IconButton>
          </Toolbar>
          <Divider className={classes.divider} />
          <Grid container>
            {Object.entries(fields[categoryKey] || {}).map(([fieldKey, fieldName]) => (
              <Grid item sm={12} md={6} lg={3} key={fieldKey} className={classes.field}>
                <TextField
                  label="フィールド名"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={fieldName}
                  onChange={async (event) => {
                    const newFieldName = event.target.value;
                    const uids = Object.keys(sheets);
                    await database.ref().update({
                      [`settings/template/fields/${categoryKey}/${fieldKey}`]: newFieldName,
                      ...uids.reduce((prev, uid) => {
                        prev[`fields/${uid}/${categoryKey}/${fieldKey}/name`] = newFieldName;
                        return prev;
                      }, {}),
                    });
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setTarget({ type: 'field', key: `${categoryKey}/${fieldKey}`, name: fieldName });
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            ))}
            <Button
              className={classes.addFieldButton}
              variant="contained"
              color="primary"
              fullWidth
              onClick={async () => {
                const newFieldKey = database.ref(`settings/template/fields`).push().key;
                const uids = Object.keys(sheets);
                await database.ref().update({
                  [`settings/template/fields/${categoryKey}/${newFieldKey}`]: '',
                  ...uids.reduce((prev, uid) => {
                    prev[`fields/${uid}/${categoryKey}/${newFieldKey}/name`] = '';
                    return prev;
                  }, {}),
                });
              }}
            >
              フィールドを追加
            </Button>
          </Grid>
        </Paper>
      );
    });
    return (
      <>
        {sheetTemplate}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={async () => {
            const newCategoryKey = database.ref(`settings/template/categories`).push().key;
            const uids = Object.keys(sheets);
            await database.ref().update({
              [`settings/template/categories/${newCategoryKey}`]: '',
              ...uids.reduce((prev, uid) => {
                prev[`categories/${uid}/${newCategoryKey}/name`] = '';
                return prev;
              }, {}),
            });
          }}
        >
          カテゴリを追加
        </Button>
      </>
    );
  }, [categories, fields]);

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

      database.ref(`sheets`).on('value', (snapshot) => {
        setSheets(snapshot.val() || {});
      });

      database.ref(`settings/template/categories`).on('value', (snapshot) => {
        setCategories(snapshot.val() || {});
      });

      database.ref(`settings/template/fields`).on('value', (snapshot) => {
        setFields(snapshot.val() || {});
      });
    }

    return async () => {
      database.ref(`settings/${auth.currentUser?.uid}`).off('value');
      database.ref(`settings/template/categories`).off('value');
      database.ref(`settings/template/fields`).off('value');
    };
  }, [auth.currentUser?.uid]);

  if (!isLoaded) {
    return <></>;
  }

  return (
    <>
      <List className={classes.root}>
        <ListItem>
          <ListSubheader component="div">個人オプション</ListSubheader>
        </ListItem>
        <ListItem button onClick={() => setIsNameChangeDialogOpen(true)}>
          <ListItemIcon>
            <FaceIcon />
          </ListItemIcon>
          <ListItemText primary="キャラクター名" />
          {auth.currentUser?.displayName}
        </ListItem>
        <ListItem>
          <ListSubheader component="div">共通オプション</ListSubheader>
        </ListItem>
        <ListItem button onClick={toggleIsGM}>
          <ListItemIcon>
            <SupervisorAccountIcon />
          </ListItemIcon>
          <ListItemText primary="GM権限" />
          <ListItemSecondaryAction>
            <Switch edge="end" checked={isGM} onClick={toggleIsGM} />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button onClick={() => setIsTemplateOpen(true)}>
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary="キャラクターシート" />
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
            <Typography variant="h6" className={classes.header}>
              シートテンプレート
            </Typography>
            <Button color="inherit" onClick={() => setIsTemplateOpen(false)}>
              完了
            </Button>
          </Toolbar>
        </AppBar>
        <Toolbar />
        {categoryElement}
      </Dialog>
      <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const uids = Object.keys(sheets);
            const request = {
              [`settings/template/${targetType.pathName}/${target.key}`]: null,
              ...uids.reduce((prev, uid) => {
                prev[`${targetType.pathName}/${uid}/${target.key}`] = null;
                if (targetType.pathName === 'categories') {
                  prev[`fields/${uid}/${target.key}`] = null;
                }
                return prev;
              }, {}),
            };

            if (targetType.pathName === 'categories') {
              request[`settings/template/fields/${target.key}`] = null;
            }

            await database.ref().update(request);
            setTarget({ type: '', key: '', name: '' });
            setIsDeleteModalOpen(false);
          }}
        >
          <DialogTitle>{targetType.label}の削除</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              {targetType.label}削除により全プレイヤーのシートからも同名の{targetType.label}が削除されます。
            </Typography>
            <Typography variant="body1">
              本当に{targetType.label}「{target.name || `無名の${targetType.label}`}」を削除しますか？
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={() => setIsDeleteModalOpen(false)} color="primary">
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
