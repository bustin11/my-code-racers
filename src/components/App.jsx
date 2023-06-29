import "../css/App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import { useEffect, useState } from "react";
import Login from "./auth/Login"
import SignUp from "./auth/Sign-Up"
import PasswordReset from "./auth/PasswordReset";
import HomePage from "./main-ui/HomePage";
import ConfirmEmail from './auth/ConfirmEmail';
import Logout from "./auth/Logout";
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import { Collapse, Alert } from "@mui/material";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Room from "./main-ui/Room";

// https://stackoverflow.com/questions/69899736/props-are-not-accessible-in-the-function-component

function App() {

  const [token, setToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token !== "") {
      window.localStorage.setItem("token", token);
    }
    const storedToken = window.localStorage.getItem("token"); // refresh clears the token on render
    if (storedToken) setToken(storedToken);
    const requestOptions = {
      method: "GET",
      headers: { "Authorization": "Bearer " + storedToken },
    };
    fetch('/api/validate-token', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if ('loggedIn' in data) {
          setLoggedIn(true);
          getUserData();
        } else {
          // setError("Please login to continue");
          setLoggedIn(false);
          setUsername("");
          setEmail("");
          window.localStorage.clear();
        }
      })
  }, [token]);

  const getUserData = () => {
    const token = localStorage.getItem("token");
    const requestOptions = {
      method: "GET",
      headers: { "Authorization": "Bearer " + token },
    };
    fetch('/api/get-user-data', requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        window.localStorage.clear();
        return {'error' : 'Please login to view page'};
      })
      .then((data) => {
        if ('data' in data) {
          if ('email' in data.data) {
            setEmail(data.data.email);
            window.localStorage.setItem("email", data.data.email);
          }
          if ('username' in data.data) {
            setUsername(data.data.username);
            window.localStorage.setItem("username", data.data.username);
          }
        } else if ('error' in data) {
          // setEmail("");
          // setUsername("");
          window.localStorage.clear();
          setError(data.error);
        }

      });
  }

  const renderRouter = () => {
    return (
      <Routes>
        <Route 
          path="/" 
          element = { <HomePage email={email} username={username} loggedIn={loggedIn}/> }
        />
        <Route 
          path="/login" 
          element = { <Login setToken={setToken} setLoggedIn={setLoggedIn} /> } 
          component={ Login }
        />
        <Route 
          path="/sign-up" 
          element = { <SignUp setToken={setToken}/> } 
          component={ SignUp }
        />
        <Route 
          path="/password-reset" 
          element = { <PasswordReset/> } 
          component={ PasswordReset }
        />
        <Route
          path="/confirm-email/:token" 
          element = { <ConfirmEmail setToken={setToken} /> } 
          component={ ConfirmEmail }
        />
        <Route
          path="/logout" 
          element = { <Logout setToken={setToken} token={token} /> } 
          component={ Logout }
        />
        <Route
          path="/room/:roomCode" 
          element = { <Room /> } 
          component={ Room }
        />
      </Routes>
    )
  }

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (endpoint) => {
    setAnchorEl(null);
  };

  const navbar = () => {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              
            </Typography>
            <Link to='/'> 
              <Button color="inherit">Home</Button>
            </Link>
            { loggedIn ? ( <div>
                  <Button
                    variant='contained'
                    id="person-button"
                    aria-controls={open ? 'person-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    color='primary'
                    // size='small'
                    startIcon={<PersonIcon />}
                  >
                    { username }
                  </Button>
                  <Menu
                    id="person-menu"
                    aria-labelledby="person-button"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                  >
                    <MenuItem  onClick={handleClose}>
                      <Link to='/profile'>Profile</Link>
                    </MenuItem>
                    <MenuItem  onClick={handleClose}>
                      <Link to='/account'>Account</Link>
                    </MenuItem>
                    <MenuItem onClick={handleClose} > 
                      <Link to='/logout'>Logout</Link>
                    </MenuItem>
                  </Menu>
                </div>
              ) : ( 
                <Link to='/login'> 
                  <Button color="inherit">Login</Button>
                </Link>
              )}
              
          </Toolbar>
        </AppBar>
        <Collapse in={error != ''}>
          <Alert 
            severity="error"
              onClose={() => setError('')}
          >
            { error }
          </Alert>
        </Collapse>
      </Box>
    );
  }

  return (
    
    <div> 
      <Router>
        { navbar() }
        <Collapse in={error != ''}>
        <Alert 
          severity="error"
          onClose={() => setError('')}
          >
          { error }
        </Alert>
      </Collapse>
        { renderRouter() } 
      </Router>
    </div>
  )
}

export default App;
