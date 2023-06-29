import { useState } from 'react'
import { io } from 'socket.io-client';

// import { createServer } from "http";
// import { Server } from "socket.io";
export const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://127.0.0.1:5000';

// const httpServer = createServer();
// const io = new Server(httpServer, {
//   cors: {
//     origin: URL
//   }
// });
// "undefined" means the URL will be computed from the `window.location` object
  // https://stackoverflow.com/questions/69807774/react-js-socket-io-client-opens-multiple-connections
export const socket = io(URL);