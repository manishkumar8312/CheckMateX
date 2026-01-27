import app from './app.js';
import { config } from './config/socket.js';
import { createSocketServer } from './config/server.js';
import { registerSockets } from './sockets/index.js';

const { server, io } = createSocketServer(app);
registerSockets(io);

const startServer = () => {
  server.listen(config.port, () => {
    console.log(`⚡ CheckMateX server running on port ${config.port}`);
  });
};

const gracefulShutdown = () => {
  console.log('\nShutting down server...');
  io.close(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();
