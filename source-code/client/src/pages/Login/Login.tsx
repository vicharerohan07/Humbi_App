/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';

import DonutSmallTwoToneIcon from '@mui/icons-material/DonutSmallTwoTone';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  TextField,
} from '@mui/material';

import { ILoginForm } from '../../utils/models/login';
import './Login.scss';

const Login = () => {
  const [loginForm, setLoginForm] = useState<ILoginForm>({
    username: '',
    password: '',
  });

  return (
    <Container className="container">
      <Card className="card" variant="outlined">
        <CardHeader
          avatar={<DonutSmallTwoToneIcon />}
          title="HUMBI ANALYTICS"
          subheader="Enter your credentials to login"
          className="header"
        />
        <CardContent className="content">
          <TextField
            id="outlined-basic-username"
            label="User Name"
            name="username"
            required
            size="small"
            placeholder="Enter your user name"
            variant="outlined"
          />
          <div className="password">
            <TextField
              id="outlined-basic-password"
              label="Password"
              name="password"
              required
              size="small"
              placeholder="Enter your password"
              type="password"
              variant="outlined"
            />
            <div className="forgot-pass">Forgot password?</div>
          </div>
        </CardContent>
        <CardActions className="footer">
          <Button size="small" color="primary" variant="contained">
            Log In
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
};

export default Login;
