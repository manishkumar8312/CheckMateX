import { registerRoomSocket } from './room.socket.js';
import { registerGameSocket } from './game.socket.js';
import { registerTimerSocket } from './timer.socket.js';

export const registerSockets = (io) => {
  io.on('connection', (socket) => {
    registerRoomSocket(io, socket);
    registerGameSocket(io, socket);
    registerTimerSocket(io, socket);

    socket.on('disconnect', () => {
      const { roomId, playerId } = socket.data || {};
      if (roomId && playerId) {
        io.to(roomId).emit('playerDisconnected', { playerId });
      }
    });
  });
};
