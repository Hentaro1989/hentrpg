import React, { useEffect, useMemo, useReducer, useState } from 'react';
import {
  Button,
  Divider,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Grid,
  TextField,
  makeStyles,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import firebase from '../firebase';

const auth = firebase.auth();
const database = firebase.database();

const getSheetExpandingStatus = () => JSON.parse(window.sessionStorage.getItem('sheetExpandingStatus') || '{}');

const useStyles = makeStyles((theme) => ({
  categoryGrid: {
    margin: theme.spacing(1),
  },
  category: {
    width: '100%',
    padding: theme.spacing(1),
  },
  categoryHeader: {
    margin: theme.spacing(1, 2),
  },
  field: {
    padding: theme.spacing(0, 1, 1, 0),
  },
  focusingUsername: {
    height: '0.5rem',
    lineHeight: '0.5rem',
    marginBottom: theme.spacing(1),
    color: 'greenyellow',
  },
  gmMark: {
    marginRight: theme.spacing(1),
    color: 'yellow',
  },
  divider: {
    marginBottom: theme.spacing(1),
  },
}));

const Sheet = ({ username, sheetUid, gmUid, focusFields }) => {
  const classes = useStyles();
  const [myUid, setMyUid] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteInfoDialogOpen, setIsDeleteInfoDialogOpen] = useState(false);
  const [categories, setCategories] = useState({});
  const [fields, setFields] = useState({});
  const [gmFields, setGmFields] = useState({});
  const [diceLog, setDiceLog] = useState({});
  const [expandedState, setExpandedState] = useReducer((_, value) => {
    const { uid, isExpanded } = value;
    const newState = { ...getSheetExpandingStatus(), [uid]: isExpanded };
    window.sessionStorage.setItem('sheetExpandingStatus', JSON.stringify(newState));
    return newState;
  }, getSheetExpandingStatus());
  const isMine = useMemo(() => sheetUid === auth.currentUser.uid, [sheetUid]);
  const contents = useMemo(() => {
    return (
      <Grid container>
        {sheetUid === gmUid ? (
          <Grid item xs={12} className={classes.categoryGrid}>
            <Paper className={classes.category} variant="outlined" key={0}>
              <Typography variant="subtitle1" className={classes.categoryHeader}>
                GMシート
              </Typography>
              <Divider className={classes.divider} />
              <Grid container>
                <Grid item xs={12} className={classes.field}>
                  <TextField
                    label="公開情報 [全体]"
                    value={gmFields.public || ''}
                    onChange={async (event) => {
                      await database.ref().update({ [`gm/public`]: event.target.value || null });
                    }}
                    disabled={myUid !== gmUid}
                    variant="outlined"
                    size="small"
                    fullWidth
                    multiline
                    rows={3}
                    rowsMax={Number.MAX_VALUE}
                  />
                </Grid>
                {myUid === gmUid ? (
                  <Grid item xs={12} className={classes.field}>
                    <TextField
                      label="非公開情報 [全体]"
                      value={gmFields.private || ''}
                      onChange={async (event) => {
                        await database.ref().update({ [`gm/private`]: event.target.value || null });
                      }}
                      disabled={myUid !== gmUid}
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      rowsMax={Number.MAX_VALUE}
                    />
                  </Grid>
                ) : (
                  <></>
                )}
              </Grid>
            </Paper>
          </Grid>
        ) : (
          <>
            {Object.entries(categories).map(([categoryId, category], i) => {
              return (
                <Grid item xs={12} className={classes.categoryGrid} key={i}>
                  <Paper key={categoryId} className={classes.category} variant="outlined">
                    <Typography variant="subtitle1" className={classes.categoryHeader}>
                      {category.name}
                    </Typography>
                    <Divider className={classes.divider} />
                    <Grid container>
                      {Object.entries(fields[categoryId] || {}).map(([fieldId, field]) => {
                        const focusingUsernames = Object.entries(focusFields)
                          .filter(
                            ([_, f]) =>
                              f.focusedSheetUid === sheetUid && f.categoryId === categoryId && f.fieldId === fieldId,
                          )
                          .map(([_, f]) => f.username);
                        return (
                          <Grid item xs={12} md={6} lg={3} className={classes.field} key={fieldId}>
                            <div className={classes.focusingUsername}>{focusingUsernames.join(', ')}</div>
                            <TextField
                              label={field.name}
                              value={field.value || ''}
                              onFocus={async () => {
                                await database.ref(`focus/${auth.currentUser.uid}`).set({
                                  username: auth.currentUser.displayName,
                                  focusedSheetUid: sheetUid,
                                  categoryId,
                                  fieldId,
                                });
                              }}
                              onBlur={async () => {
                                await database.ref(`focus/${auth.currentUser.uid}`).remove();
                              }}
                              onChange={async (event) => {
                                await database
                                  .ref(`fields/${sheetUid}/${categoryId}/${fieldId}/value`)
                                  .set(event.target.value);
                              }}
                              disabled={!isMine && gmUid !== auth.currentUser.uid}
                              variant="outlined"
                              size="small"
                              fullWidth
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                </Grid>
              );
            })}
            {myUid === sheetUid || myUid === gmUid ? (
              <Grid item xs={12} className={classes.categoryGrid}>
                <Paper className={classes.category} variant="outlined">
                  <Typography variant="subtitle1" className={classes.categoryHeader}>
                    {`手に入れた情報 [${username}]`}
                  </Typography>
                  <Divider className={classes.divider} />
                  <Grid container></Grid>
                  <Grid item xs={12} className={classes.field}>
                    <TextField
                      label="非公開情報"
                      value={gmFields.users?.[sheetUid] || ''}
                      onChange={async (event) => {
                        await database.ref().update({ [`gm/users/${sheetUid}`]: event.target.value || null });
                      }}
                      disabled={myUid !== gmUid}
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      rowsMax={Number.MAX_VALUE}
                    />
                  </Grid>
                </Paper>
              </Grid>
            ) : (
              <></>
            )}
          </>
        )}
        {
          <Grid item xs={12} className={classes.categoryGrid}>
            <Paper className={classes.category} variant="outlined">
              <Typography variant="subtitle1" className={classes.categoryHeader}>
                {`ダイスログ [${username}]`}
              </Typography>
              <Divider className={classes.divider} />
              <Grid container></Grid>
              <Grid item xs={12} className={classes.field}>
                <TextField
                  label="ダイスログ"
                  value={Object.values(diceLog)
                    .sort((a, b) => {
                      if (a.time < b.time) {
                        return 1;
                      } else if (a.time > b.time) {
                        return -1;
                      } else {
                        return 0;
                      }
                    })
                    .map(({ result, time }) => `${new Date(time).toLocaleString('ja-JP')}\t結果：${result}`)
                    .join('\n')}
                  disabled={true}
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  rowsMax={Number.MAX_VALUE}
                />
              </Grid>
            </Paper>
          </Grid>
        }
      </Grid>
    );
  }, [sheetUid, gmUid, classes, gmFields, myUid, categories, username, diceLog, fields, focusFields, isMine]);

  useEffect(() => {
    database.ref(`categories/${sheetUid}`).on('value', (snapshot) => {
      setCategories(snapshot.val() || {});
    });

    database.ref(`fields/${sheetUid}`).on('value', (snapshot) => {
      setFields(snapshot.val() || {});
    });

    database.ref(`gm`).on('value', (snapshot) => {
      setGmFields(snapshot.val() || {});
    });

    database.ref(`dice/${sheetUid}`).on('value', (snapshot) => {
      setDiceLog(snapshot.val() || {});
    });

    // When you logged out, "auth.currentUser" will be gone.
    // So you need to save uid as a state for unsubscribing.
    setMyUid(auth.currentUser.uid);

    return () => {
      database.ref(`categories/${sheetUid}`).off();
      database.ref(`fields/${sheetUid}`).off();
      database.ref(`gm`).off();
      database.ref(`dice/${sheetUid}`).off();
    };
  }, [sheetUid]);

  return (
    <>
      <Accordion
        expanded={!!expandedState[sheetUid]}
        onChange={(_, expanded) => setExpandedState({ uid: sheetUid, isExpanded: expanded })}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            {gmUid === sheetUid ? (
              <span>
                <span className={classes.gmMark}>GM</span>[{username}]
              </span>
            ) : (
              username
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>{contents}</AccordionDetails>
        <Divider />
        <AccordionActions>
          {myUid === gmUid && myUid === sheetUid ? (
            <Button
              color="secondary"
              variant="contained"
              size="small"
              disabled={!isMine && gmUid !== auth.currentUser.uid}
              onClick={() => setIsDeleteInfoDialogOpen(true)}
            >
              全ての情報を削除
            </Button>
          ) : (
            <></>
          )}
          <Button
            color="secondary"
            variant="contained"
            size="small"
            disabled={!isMine && gmUid !== auth.currentUser.uid}
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            シートを削除
          </Button>
        </AccordionActions>
      </Accordion>
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>シートの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>本当に {username} のシートを削除しますか？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)} color="primary" autoFocus>
            キャンセル
          </Button>
          <Button
            disabled={!isMine && gmUid !== auth.currentUser.uid}
            onClick={async () => {
              setIsDeleteDialogOpen(false);
              const templateSnapshot = await database.ref(`settings/global/template`).once('value');
              const template = templateSnapshot.val() || {};

              const request = {
                [`sheets/${auth.currentUser.uid}`]: null,
                ...Object.keys(template['categories'] || {}).reduce((prev, categoryId) => {
                  prev[`categories/${auth.currentUser.uid}/${categoryId}`] = null;
                  return prev;
                }, {}),
                ...Object.entries(template['fields'] || {}).reduce((prev, [categoryId, fields]) => {
                  Object.keys(fields || {}).forEach(
                    (fieldId) => (prev[`fields/${auth.currentUser.uid}/${categoryId}/${fieldId}`] = null),
                  );
                  return prev;
                }, {}),
              };
              if (gmUid === auth.currentUser.uid) {
                request[`settings/global/gm`] = null;
              }

              await database.ref().update(request);
            }}
            color="primary"
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDeleteInfoDialogOpen} onClose={() => setIsDeleteInfoDialogOpen(false)}>
        <DialogTitle>全て情報の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>GM, PL が所持する全ての情報・ダイスログが削除されます。</DialogContentText>
          <DialogContentText>本当に削除しますか？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteInfoDialogOpen(false)} color="primary" autoFocus>
            キャンセル
          </Button>
          <Button
            onClick={async () => {
              setIsDeleteInfoDialogOpen(false);
              await database.ref().update({
                [`dice`]: null,
                [`gm`]: null,
              });
            }}
            color="primary"
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sheet;
