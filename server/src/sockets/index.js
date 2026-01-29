import { registerRoomSocket } from './room.socket.js';
import { registerGameSocket } from './game.socket.js';
import { registerTimerSocket } from './timer.socket.js';

export const registerSockets = (io) => {
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);
    console.log('Socket data:', socket.data);
    
    registerRoomSocket(io, socket);
    registerGameSocket(io, socket);
    registerTimerSocket(io, socket);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      const { roomId, playerId } = socket.data || {};
      if (roomId && playerId) {
        io.to(roomId).emit('playerDisconnected', { playerId });
      }
    });
  });
};
