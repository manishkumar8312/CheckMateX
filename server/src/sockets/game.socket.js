import { makeMove, resignGame, getGameState } from '../controllers/gameController.js';
import { roomService, timerService, chessAiService, chessService } from '../services/index.js';
import { aiLog } from '../utils/logger.js';

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
    aiLog('makeMove received:', payload);
    try {
      const result = makeMove(payload);
      aiLog('makeMove successful:', result);

      // Evaluate game state after the move
      const gameState = chessService.evaluateGameState(result.room.chessFen, result.room.currentPlayer);
      aiLog('Game state after move:', gameState);

      const GAME_OVER_STATUSES = ['checkmate', 'stalemate', 'draw'];
      const isGameOver = GAME_OVER_STATUSES.includes(gameState.status);

      // Update room with game state only if game is actually over
      if (isGameOver) {
        result.room.status = gameState.status;
        result.room.gameResult = gameState;
        // Stop timer due to game end
        timerService.pauseTimer(payload.roomId);
      } else {
        // Switch timer to the next player
        const nextPlayer = result.room.currentPlayer;
        timerService.switchTimer(payload.roomId, nextPlayer);
      }

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

      // Trigger AI move if next player is AI
      const room = roomService.getRoom(payload.roomId);
      aiLog('Trigger check for AI move', { roomId: payload.roomId, isAiOpponent: room?.isAiOpponent, status: room?.status, currentPlayer: room?.currentPlayer });
      if (room && room.isAiOpponent && room.status === 'playing') {
        const nextPlayerObj = room.players.find(p => p.color === room.currentPlayer);
        aiLog('Next player object', nextPlayerObj);
        if (nextPlayerObj && nextPlayerObj.isAi) {
          handleAiMove(io, payload.roomId);
        }
      }
    } catch (error) {
      aiLog('makeMove error:', error.message);
      callback?.({ success: false, message: error.message });
    }
  });

  const handleAiMove = async (io, roomId) => {
    try {
      const room = roomService.getRoom(roomId);
      aiLog('handleAiMove execution started', { roomId, fen: room?.chessFen });
      if (!room || !room.isAiOpponent) return;

      const aiPlayer = room.players.find(p => p.isAi);
      if (!aiPlayer) {
        aiLog('AI player not found in room players', room.players);
        return;
      }

      if (room.status !== 'playing') {
        aiLog('[AI] Room status is not playing:', room.status);
        return;
      }

      // Add a small delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));

      aiLog('[AI] Requesting move for FEN:', room.chessFen);
      const moveResult = await chessAiService.getNextMove(room.chessFen);
      aiLog('[AI] API Move Result:', moveResult);
      
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const from = {
        row: 8 - parseInt(moveResult.fromSquare[1], 10),
        col: files.indexOf(moveResult.fromSquare[0])
      };
      const to = {
        row: 8 - parseInt(moveResult.toSquare[1], 10),
        col: files.indexOf(moveResult.toSquare[0])
      };

      // Apply move via controller
      const result = makeMove({
        roomId,
        playerId: aiPlayer.id,
        from,
        to,
        promotion: moveResult.promotion || 'q'
      });

      aiLog('AI move made and recorded', { from, to });

      // Evaluate game state after AI move
      const gameState = chessService.evaluateGameState(result.room.chessFen, result.room.currentPlayer);
      
      const GAME_OVER_STATUSES = ['checkmate', 'stalemate', 'draw'];
      const isGameOver = GAME_OVER_STATUSES.includes(gameState.status);

      if (isGameOver) {
        result.room.status = gameState.status;
        result.room.gameResult = gameState;
        timerService.pauseTimer(roomId);
      } else {
        const nextPlayer = result.room.currentPlayer;
        timerService.switchTimer(roomId, nextPlayer);
      }

      // Emit the move to all clients in the room
      io.to(roomId).emit('moveMade', {
        room: result.room,
        move: result.move,
        gameState: isGameOver ? gameState : null
      });
      
      aiLog('AI move emitted to room', roomId);

      // Handle check status
      if (gameState.status === 'check') {
        io.to(roomId).emit('checkStatus', {
          isInCheck: true,
          currentPlayer: result.room.currentPlayer,
          reason: gameState.reason
        });
      } else {
        io.to(roomId).emit('checkStatus', {
          isInCheck: false,
          currentPlayer: result.room.currentPlayer
        });
      }
    } catch (error) {
      aiLog('Error in handleAiMove:', error.message);
      console.error('[AI] Error during AI move:', error);
    }
  };

  socket.on('leaveGame', ({ roomId, playerId }, callback) => {
    try {
      const room = roomService.getRoom(roomId);
      if (room && room.status === 'playing') {
        // Stop the timer
        timerService.pauseTimer(roomId);

        // Figure out who left and who wins
        const leavingPlayer = room.players.find(p => p.id === playerId);
        const remainingPlayer = room.players.find(p => p.id !== playerId);

        const result = {
          status: 'resigned',
          winner: remainingPlayer?.color
            ? remainingPlayer.color.charAt(0).toUpperCase() + remainingPlayer.color.slice(1)
            : 'Opponent',
          reason: `${leavingPlayer?.name || 'Opponent'} left the game`,
          leaverName: leavingPlayer?.name || 'Opponent',
        };

        room.status = 'resigned';
        room.gameResult = result;

        // Notify the OTHER player still in the room
        socket.to(roomId).emit('opponentLeft', result);
        // Also send gameEnded so the leaver's own screen can handle it if needed
        io.to(roomId).emit('gameEnded', result);
      }

      socket.leave(roomId);
      socket.data.roomId = null;
      socket.data.playerId = null;
      callback?.({ success: true });
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
