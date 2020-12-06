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
  withStyles,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import firebase from '../firebase';

const auth = firebase.auth();
const database = firebase.database();

const useStyle = makeStyles((theme) => ({
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
  divider: {
    marginBottom: theme.spacing(1),
  },
}));

const Sheet = ({ username, uid, isMine, isGM, focusFields }) => {
  const classes = useStyle();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categories, setCategories] = useState({});
  const [fields, setFields] = useState({});
  const [expandedState, setExpandedState] = useReducer((state, value) => {
    const { uid, isExpanded } = value;
    const newState = { ...state, [uid]: isExpanded };
    window.sessionStorage.setItem('sheetExpandingStatus', JSON.stringify(newState));
    return newState;
  }, JSON.parse(window.sessionStorage.getItem('sheetExpandingStatus') || '{}'));

  const contents = useMemo(() => {
    return Object.entries(categories).map(([categoryId, category]) => {
      return (
        <Paper key={categoryId} className={classes.category} variant="outlined">
          <Typography variant="subtitle1" className={classes.categoryHeader}>
            {category.name}
          </Typography>
          <Divider className={classes.divider} />
          <Grid container>
            {Object.entries(fields[categoryId] || {}).map(([fieldId, field]) => {
              const focusingUsernames = Object.entries(focusFields)
                .filter(([_, f]) => f.focusedSheetUid === uid && f.categoryId === categoryId && f.fieldId === fieldId)
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
                        focusedSheetUid: uid,
                        categoryId,
                        fieldId,
                      });
                    }}
                    // onBlur={async () => {
                    //   await database.ref(`focus/${auth.currentUser.uid}`).remove();
                    // }}
                    onChange={async (event) => {
                      await database.ref(`fields/${uid}/${categoryId}/${fieldId}/value`).set(event.target.value);
                    }}
                    disabled={!isMine && !isGM}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      );
    });
  }, [categories, fields, focusFields, uid, isMine, isGM, classes]);

  useEffect(() => {
    database.ref(`categories/${uid}`).on('value', (snapshot) => {
      setCategories(snapshot.val() || {});
    });

    database.ref(`fields/${uid}`).on('value', (snapshot) => {
      setFields(snapshot.val() || {});
    });

    return () => {
      database.ref(`categories/${uid}`).off('value');
      database.ref(`fields/${uid}`).off('value');
    };
  }, [uid]);

  return (
    <>
      <Accordion
        expanded={!!expandedState[uid]}
        onChange={(_, expanded) => setExpandedState({ uid, isExpanded: expanded })}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{username}</Typography>
        </AccordionSummary>
        <AccordionDetails>{contents}</AccordionDetails>
        <Divider />
        <AccordionActions>
          <Button
            color="secondary"
            variant="contained"
            size="small"
            disabled={!isMine && !isGM}
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
            disabled={!isMine && !isGM}
            onClick={async () => {
              setIsDeleteDialogOpen(false);
              await database.ref(`sheets/${username}`).remove();
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
