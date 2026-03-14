import { makeMove, resignGame, getGameState } from '../controllers/gameController.js';
import { timerService } from '../services/index.js';
import { chessService } from '../services/index.js';

export const registerGameSocket = (io, socket) => {
  socket.on('joinGame', ({ roomId }, callback) => {
    try {
      const state = getGameState(roomId);
      if (!state?.room) {
        throw new Error('Room not found');
      }

      socket.join(roomId);

      const GAME_OVER_STATUSES = ['checkmate', 'stalemate', 'draw', 'timeout', 'resigned'];
      const currentGameState = state.gameState;
      const isGameOver = currentGameState && GAME_OVER_STATUSES.includes(currentGameState.status);
      
      // Also filter the room's stored result to ensure no stale "check" results block the UI
      const roomResult = state.room.gameResult;
      const filteredRoomResult = (roomResult && GAME_OVER_STATUSES.includes(roomResult.status)) ? roomResult : null;

      const payload = {
        status: isGameOver ? currentGameState.status : state.room.status,
        board: state.room.board,
        chessFen: state.room.chessFen,
        players: state.room.players,
        currentPlayer: state.room.currentPlayer,
        result: isGameOver ? currentGameState : filteredRoomResult,
        isInCheck: currentGameState?.status === 'check'
      };

      socket.emit('gameState', payload);
      callback?.({ success: true, ...payload });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('makeMove', (payload, callback) => {
    console.log('makeMove received:', payload);
    try {
      const result = makeMove(payload);
      console.log('makeMove successful:', result);

      // Evaluate game state after the move
      const gameState = chessService.evaluateGameState(result.room.chessFen, result.room.currentPlayer);
      console.log('Game state after move:', gameState);

      const GAME_OVER_STATUSES = ['checkmate', 'stalemate', 'draw'];
      const isGameOver = GAME_OVER_STATUSES.includes(gameState.status);

      // Update room with game state only if game is actually over
      if (isGameOver) {
        result.room.status = gameState.status;
        result.room.gameResult = gameState;
      }

      // Switch timer to the next player
      const nextPlayer = result.room.currentPlayer;
      timerService.switchTimer(payload.roomId, nextPlayer);

      io.to(payload.roomId).emit('moveMade', {
        ...result,
        // Only send gameState to client if game is truly over (not just check)
        gameState: isGameOver ? gameState : null
      });

      // Emit check status separately so client can show the warning without freezing game
      if (gameState.status === 'check') {
        io.to(payload.roomId).emit('checkStatus', {
          isInCheck: true,
          currentPlayer: result.room.currentPlayer,
          reason: gameState.reason
        });
      } else {
        io.to(payload.roomId).emit('checkStatus', {
          isInCheck: false,
          currentPlayer: result.room.currentPlayer
        });
      }

      callback?.({ success: true, ...result });
    } catch (error) {
      console.log('makeMove error:', error.message);
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
