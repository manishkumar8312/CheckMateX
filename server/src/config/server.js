import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './socket.js';

const createSocketServer = (app) => {
  const server = createServer(app);
  
  // Configure CORS
  app.use(cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    credentials: true
  }));

  // Create Socket.io server
  const io = new Server(server, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  return { server, io };
};

export { createSocketServer };
