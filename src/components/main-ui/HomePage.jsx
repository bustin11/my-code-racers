import "../../css/App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import { useEffect, useState, useCallback, useContext } from "react";
import { Typography } from "@mui/material";
import { Collapse, Alert, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { socket, URL } from "../socket";


const defaultTheme = createTheme();

function HomePage(props) {
  
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const token = window.localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    // if (props.username === "" || props.email === "") {
    if (!window.localStorage.getItem("token")) {
      setError("Please login to view this home page");
    }

    return () => {
      // https://stackoverflow.com/questions/61697349/keep-socket-connection-when-new-page-is-loaded
      socket.off('join', handleUserJoined);
    }
  }, []);
  
  const joinRoom = useCallback(() => {
    if (!joined) {
      setJoined(true);
      const username = window.localStorage.getItem("username");
      socket.emit('join', {"username" : username});
      socket.on('join', handleUserJoined);
    }
  }, []);

  const handleUserJoined = (data) => {
    const room = data["room"];
    const username = window.localStorage.getItem("username");
    console.log(data)
    navigate('/room/' + room, { 
      "state" : {
        "username" : username,
        "users" : data.users,
        "code_block" : data.code_block,
      }
    });
  }


  return (
    <div> 
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          ></Box>
            <Collapse in={error != ''}>
              <Alert 
                severity="error"
                  onClose={() => setError('')}
              >
                { error }
              </Alert>
            </Collapse>
            { error != '' ? (
              <></>
              ) : ( 
                <div>
                  <Typography variant="h4" component="h4" align="center">
                    { joined ? (
                      <></>
                    ) : (
                      <Button type='button' fullWidth variant='contained' color='primary' onClick={joinRoom}> 
                        Join Race!
                      </Button>
                    )}
                  </Typography>
                  
                </div>
              )
            }
            
        </Container>
      </ThemeProvider>
    </div>
  )
}

export default HomePage;
