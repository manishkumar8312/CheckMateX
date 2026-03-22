import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import { config } from "./socket.js";

const createSocketServer = (app) => {
  const server = createServer(app);

  /* Express CORS */
  app.use(cors(config.cors));

  /* Socket.IO server */
  const io = new Server(server, {
    cors: config.cors,
    transports: ["websocket"],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  return { server, io };
};

export { createSocketServer };
