import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
// import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Link, useParams } from'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { Collapse, FormControl } from '@mui/material';
import { Alert } from '@mui/material';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function ConfirmEmail() {

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmed, setConfirmed] = useState(false)

  const { token } = useParams();

  useEffect(() => {
    fetch('/api/confirm-email/' + token)
    .then((response) => response.json())
    .then((data) => {
      if ('error' in data) {
        setError(data.error);
        return;
      }
      if ('data' in data) {
        setSuccess(data.data);
      }
      setConfirmed(true);
    });
  }, []);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <Collapse in={error != ''}>
          <Alert 
            severity="error"
              onClose={() => setError('')}
          >
            { error }
          </Alert>
        </Collapse>
        <Collapse in={success != ''}>
          <Alert 
            severity="success"
              onClose={() => setSuccess('')}
          >
            { success }
          </Alert>
        </Collapse>
        { confirmed ? 
          <div> 
            <Typography variant="body2" component="p">
              Thanks for the verification!
            </Typography>
            <Link to='/login'>
              <Button> Login </Button>
            </Link>
          </div>
        : null}
        <Link to='/login'/>
      </Container>
    </ThemeProvider>
  );
}