import dotenv from "dotenv";

dotenv.config();

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : [
      "https://checkmatex.vercel.app",
      "http://localhost:5173"
    ];

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  },

  game: {
    maxRooms: 1000,
    maxPlayersPerRoom: 2,
    roomCleanupInterval: 300000,
    inactiveRoomTimeout: 1800000
  }
};
