import dotenv from 'dotenv';

dotenv.config();

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: corsOrigin.length === 1 ? corsOrigin[0] : corsOrigin
  },
  game: {
    maxRooms: 1000,
    maxPlayersPerRoom: 2,
    roomCleanupInterval: 300000, // 5 minutes
    inactiveRoomTimeout: 1800000 // 30 minutes
  }
};
