import { makeMove, resignGame, getGameState } from '../controllers/gameController.js';
import { timerService } from '../services/index.js';

export const registerGameSocket = (io, socket) => {
  socket.on('joinGame', ({ roomId }, callback) => {
    try {
      const state = getGameState(roomId);
      if (!state?.room) {
        throw new Error('Room not found');
      }

      socket.join(roomId);

      const payload = {
        status: state.gameState?.status || state.room.status,
        board: state.room.board,
        players: state.room.players,
        currentPlayer: state.room.currentPlayer,
        result: state.gameState?.reason ? state.gameState : state.room.gameResult,
      };

      socket.emit('gameState', payload);
      callback?.({ success: true, ...payload });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('makeMove', (payload, callback) => {
    try {
      const result = makeMove(payload);
      
      // Switch timer to the next player
      const nextPlayer = result.currentPlayer;
      timerService.switchTimer(payload.roomId, nextPlayer);
      
      io.to(payload.roomId).emit('moveMade', result);
      callback?.({ success: true, ...result });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('resignGame', (payload, callback) => {
    try {
      const room = resignGame(payload);
      io.to(payload.roomId).emit('gameEnded', room.gameResult);
      callback?.({ success: true, room });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('getGameState', (payload, callback) => {
    try {
      const state = getGameState(payload.roomId);
      callback?.({ success: true, ...state });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });
};
