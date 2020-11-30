import React from 'react';
import { Container, Link, Typography } from '@material-ui/core';
import { PATHS } from '../Router';

const NotFound = () => {
  return (
    <Container component="main">
      <Typography variant="h1">404</Typography>
      <Typography variant="h2">Page Not Found</Typography>
      <Link href={PATHS.ROOT} variant="body1">
        TOP
      </Link>
    </Container>
  );
};

export default NotFound;
