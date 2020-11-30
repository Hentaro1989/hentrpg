import React from 'react';
import ReactDOM from 'react-dom';
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import App from './App.jsx';
import './firebase';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

ReactDOM.render(
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById('root'),
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
