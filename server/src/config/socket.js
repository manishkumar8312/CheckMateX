import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  game: {
    maxRooms: 1000,
    maxPlayersPerRoom: 2,
    roomCleanupInterval: 300000, // 5 minutes
    inactiveRoomTimeout: 1800000 // 30 minutes
  }
};
