import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
// import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Link, useParams, useNavigate, useLocation } from'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { Collapse, FormControl } from '@mui/material';
import { Alert, Grid, Slider } from '@mui/material';
import { URL, socket } from '../socket';

import { HandymanOutlined, LocalTaxiOutlined } from '@mui/icons-material';

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

// https://stackoverflow.com/questions/54676966/push-method-in-react-hooks-usestate
// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Room(props) {
  const navigate = useNavigate();
  const [info, setInfo] = useState(false);
  const location = useLocation();

  const { roomCode } = useParams();
  
  const [opponentsType, setOpponentsType] = useState([]); // what opponents have already typed and submitted
  
  const [userType, setUserType] = useState(""); // what you have typed currently
  const [text, setText] = useState(""); // text that you need to type
  const [typedText, setTypedText] = useState(""); // text that you have already submitted
  const [numSpaces, setNumSpaces] = useState(0); // index of the position that you have typed 
  const [words, setWords] = useState([]); // the full text split by spaces

  const [time, setTime] = useState(15); // time that you have submitted
  const [started, setStarted] = useState(false); // whether you have started the game
  const [persist, setPersist] = useState(true);

  const [newRoom, setNewRoom] = useState(false); // whether you are creating a new room

  // not working 
  const [enableNewLines, setEnableNewLines] = useState(true); // whether or not you want to use new lines in the code 

  const init = () => {
    if (enableNewLines) {
      setWords(location.state.code_block.split(' ').filter((word) => word.length > 0));
    } else {
      const textNoNewLines = location.state.code_block.replace(/\\n/g," ");
      setWords(textNoNewLines.split(" ").filter((word) => word.length > 0));
      setText(textNoNewLines);
    }
    setUserType("");
    setNumSpaces(0);
    location.state.users.forEach((username) => {
      setOpponentsType((prev) => [...prev, { username : username, code : ""}]);
    })
  }

  useEffect(() => {
    socket.on('join', handleJoin); // other people joining
    socket.on('leave', handleLeave);
    socket.on('opponentUpdate', handleOpponentsUpdatedCode);
    
    socket.emit('countdown');
    socket.on('countdown', handleCountdown);

    // window.onbeforeunload = function() {
    //   nagviate("/");
    // };
    
    init();

    return () => {
      const username = location.state.username;
      socket.emit('leave', {"username" : username });
      socket.off('join', handleJoin);
      socket.off('opponentUpdate', handleOpponentsUpdatedCode);
      socket.off('countdown', handleCountdown);
      socket.off('leave', handleLeave);
      // window.onbeforeunload = null;
    }
  }, []);

  // aight imma head out 
  const leaveRoom = () => {
    navigate('/');
  };
  
  // notifications 
  const handleJoin = (data) => {
    if (data.username !== location.state.username) {
      setInfo(data.username + " has joined the room.");
      setOpponentsType((prev) => [...prev, { username : data.username, code : ""}]);
    }
  }
  
  const handleLeave = (data) => {
    console.log(data)
    setInfo(data.username + " has left the room.");
  }

  // update the opponents' code
  const handleOpponentsUpdatedCode = ({username, code}) => {
    console.log(username, code)
    setOpponentsType(prevOpponentsType => {
      return prevOpponentsType.map(opponent => {
        if (opponent.username === username) {
          return { username : username, code : code };
        }
        return opponent;
      });
    });
  };

  // countdown
  const handleCountdown = ({time_left}) => {
    if (started) return;
    setTime(time_left);
    if (time_left > 0) {
      const timeout = setTimeout(() => {
        socket.emit('countdown');
        clearTimeout(timeout);
      }, 1000)
    } else {
      socket.off('countdown', handleCountdown);
      setStarted(true);
    }
  }


  // sending code to the server
  useEffect(() => {
    socket.emit('updatedCode', { code : typedText, username : location.state.username})
  }, [typedText])

  const sendUpdatedCode = (e) => {
    if (time == 0) {
      if (numSpaces === words.length) {
        setUserType("");
        return;
      }
  
      if (e.target.value[e.target.value.length - 1] !== ' ') {
        setUserType(e.target.value)
      } else {
        setUserType("");
      }
    }
  }

  // when a user presses space
  const handleSpace = (e) => {
    if (e.keyCode === 32 && userType.length > 0) {
      if (numSpaces >= words.length-1) {
        setInfo("Nice Job!"); // TODO: show some stats 
        setTypedText(typedText + " " + e.target.value);
        setText(" " + words.slice(numSpaces + 1).join(" "));
        return;
      }
      setTypedText(typedText + " " + e.target.value);
      setText(" " + words.slice(numSpaces + 1).join(" "));
      setNumSpaces(numSpaces + 1);
    } 
  }

  const newRace = () => {
    // https://www.nicesnippets.com/blog/how-to-make-screen-refresh-when-navigating-back-in-react-native?expand_article=1
    socket.emit('leave', {"username" : location.state.username });
    setTimeout(() => {
      console.log('fkjds;fjk;afjdlazfjdsfjdasf')
      socket.emit('join', {"username" : location.state.username});
      // https://stackoverflow.com/questions/35315872/reactjs-prevent-multiple-times-button-press
      socket.on('join', (data) => {
        navigate('/room/' + data.room, { 
          "state" : {
            "username" : location.state.username,
            "users" : data.users,
            "code_block" : data.code_block,
          }
        });
      }, 1000);
    });
  }

  const renderText = () => {
    let wordsTyped = typedText.split(' ').filter(word => word.length > 0);
    return (
      wordsTyped.map((word, index) => {
        if (word === words[index]) {
          return (
            <Typography variant="p" color="green" key={index}>
              { words[index] + " " }
            </Typography>
          )
        } else {
          return (
            <Typography variant="p" color="red" key={index}>
              { words[index] + " "}
            </Typography>
          )
        }
      })
    )
  }

  const renderMyProgress = () => {
    const myPercentage = 100 * typedText.length / (text.length + typedText.length);
    return (
      <div id="my-bar">
        You ({ location.state.username })
        <Slider
        value={myPercentage}
        aria-label="Small"
        valueLabelDisplay="auto"
        disabled
        />
      </div>
    )
  }

  const renderProgressBar = () => {
    if (opponentsType === undefined || opponentsType.length === 0) return <div> </div>;
    return (
      opponentsType.map((obj, index) => {
        if (obj.username === location.state.username) return <div key={index}> </div>
        return (<div>
          { obj.username }
          <Slider
            value={100 * obj.code.length / (text.length + typedText.length)}
            aria-label="Small"
            valueLabelDisplay="auto"
            disabled
            key={index}
            />
          </div>
        )
      })
    )
  }

  const renderClock = () => {
    if (time > 0) {
      return (
        <Alert severity={time > 3 ? "warning" : "error"}> {time} </Alert>
      )
    }
    setStarted(true);
    return <div> </div>;
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
          { started ? <Alert severity="success"> Race has started </Alert> : renderClock() }
          <Collapse in={info != ''}>
            <Alert 
              severity="info"
                onClose={() => setInfo('')}
            >
              { info }
            </Alert>
          </Collapse>
          { renderMyProgress() }
          { renderProgressBar() }
          { renderText() }
          <Typography variant="p" color="gray">
            { text }
          </Typography>

          <TextField
            placeholder='Type Here'
            multiline
            onChange={sendUpdatedCode}
            onKeyDown={handleSpace}
            value={userType}
            readOnly
            fullWidth
            color='primary'
          /> 
          <Grid container direction='row'>
            <Grid item xs={6}>
              <Button type='button' fullWidth variant='contained' color='primary' onClick={leaveRoom}> 
                Leave Race
              </Button> 
            </Grid>
            <Grid item xs={6}> 
              <Button type='button' fullWidth variant='contained' color='primary' onClick={newRace}> 
                New Race
              </Button> 
            </Grid>
          </Grid>


          {/* <Grid container direction='row'>
            <Grid item xs={6}>
              <TextField
                placeholder='Type Here'
                multiline
                rows={2}
                onChange={sendUpdatedCode}
                value={userType}
                />    
            </Grid>
            <Grid item xs={6}>
              <TextField
                placeholder='Opponent Typing...'
                multiline
                rows={2}
                value={opponentType}
              />      
            </Grid>
          </Grid> */}
        </Container>
      </ThemeProvider>
    </div>
  );
}