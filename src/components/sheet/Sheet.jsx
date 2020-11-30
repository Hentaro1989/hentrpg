import React, { useState } from 'react';
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
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import firebase from '../../firebase';

const database = firebase.database();

const Sheet = ({ username, isMine }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{username}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            ここにコンテンツが来る
            {/* <Category title="プロフィール">
        <Grid container>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="名前" variant="outlined" size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="性別" variant="outlined" size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="職業" variant="outlined" size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="筋肉量" variant="outlined" size="small" fullWidth />
          </Grid>
        </Grid>
      </Category>
      <Category title="ステータス">
        <Grid container>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="STR" variant="outlined" size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="DEX" variant="outlined" size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="INT" variant="outlined" size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="CON" variant="outlined" size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="APP" variant="outlined" size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="POW" variant="outlined" size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="SIZ" variant="outlined" size="small" fullWidth />
          </Grid>
          <Grid item xs={12} md={6} lg={3} className={classes.inputGrid}>
            <TextField label="EDU" variant="outlined" size="small" fullWidth />
          </Grid>
        </Grid>
      </Category> */}
          </Typography>
        </AccordionDetails>
        <Divider />
        <AccordionActions>
          <Button
            color="secondary"
            variant="contained"
            size="small"
            disabled={!isMine}
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
            disabled={!isMine}
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
