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
    transports: ["websocket", "polling"] // Support both transports
  });

  return { server, io };
};

export { createSocketServer };
