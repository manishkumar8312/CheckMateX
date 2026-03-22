import { registerRoomSocket } from './room.socket.js';
import { registerGameSocket } from './game.socket.js';
import { registerTimerSocket } from './timer.socket.js';
import { aiLog } from '../utils/logger.js';
import { getServices } from '../controllers/roomController.js';

export const registerSockets = (io) => {
  aiLog('Socket server initialized and registerSockets called');
  io.on('connection', (socket) => {
    aiLog('New socket connection', { socketId: socket.id });
    console.log('New socket connection:', socket.id);
    console.log('Socket data:', socket.data);
    
    registerRoomSocket(io, socket);
    registerGameSocket(io, socket);
    registerTimerSocket(io, socket);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      const { roomId, playerId } = socket.data || {};
      if (roomId && playerId) {
        const { roomService, timerService } = getServices();
        const room = roomService.getRoom(roomId);

        if (room && room.status === 'playing') {
          timerService.pauseTimer(roomId);

          const leavingPlayer = room.players.find(p => p.id === playerId);
          const remainingPlayer = room.players.find(p => p.id !== playerId);

          const result = {
            status: 'resigned',
            winner: remainingPlayer?.color
              ? remainingPlayer.color.charAt(0).toUpperCase() + remainingPlayer.color.slice(1)
              : 'Opponent',
            reason: `${leavingPlayer?.name || 'Opponent'} disconnected`,
            leaverName: leavingPlayer?.name || 'Opponent',
          };

          room.status = 'resigned';
          room.gameResult = result;

          io.to(roomId).emit('opponentLeft', result);
        } else {
          io.to(roomId).emit('playerDisconnected', { playerId });
        }
      }
    });
  });
};
