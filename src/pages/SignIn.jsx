import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Avatar, Button, TextField, Box, Typography, Container, Snackbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import firebase from '../firebase';
import { PATHS } from '../Router';

const Copyright = () => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © Hentaro '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Signin() {
  const {
    register,
    handleSubmit,
    errors,
    formState: { isSubmitted },
  } = useForm({ defaultValues: { email: '', password: '', passwordConfirm: '' } });
  const history = useHistory();
  const classes = useStyles();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function showErrorAlert(msg) {
    setErrorMessage(msg);
    setIsAlertOpen(true);
  }

  async function login(email, password) {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      history.push(PATHS.SHEETS);
    } catch (error) {
      showErrorAlert(error.message);
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          HenTRPG
        </Typography>
        <form
          className={classes.form}
          noValidate
          onSubmit={handleSubmit(async ({ email, password }) => {
            await login(email, password);
          })}
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="email"
            type="email"
            label="メールアドレス"
            inputRef={register({ required: '必須です' })}
            helperText={errors.email?.message}
            error={isSubmitted && !!errors.email?.message}
            autoComplete="email"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            type="password"
            label="パスワード"
            inputRef={register({
              required: '必須です',
              minLength: { value: 6, message: '6文字以上の半角英数で入力してください' },
            })}
            helperText={errors.password?.message}
            error={isSubmitted && !!errors.password?.message}
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
            ログイン
          </Button>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
      <Snackbar open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Container>
  );
}
