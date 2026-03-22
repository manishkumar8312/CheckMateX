import { roomService, timerService, chessService } from '../services/index.js';

export const makeMove = ({ roomId, playerId, from, to }) => {
  const { room, move } = roomService.makeMove(roomId, from, to, playerId);
  const timer = timerService.switchTimer(roomId, room.currentPlayer);
  const gameState = chessService.evaluateGameState(room.chessFen, room.currentPlayer);

  const GAME_OVER_STATUSES = ['checkmate', 'stalemate', 'draw'];
  if (GAME_OVER_STATUSES.includes(gameState.status)) {
    timerService.stopTimer(roomId);
    roomService.endGame(roomId, {
      status: gameState.status,
      winner: gameState.winner,
      reason: gameState.reason,
    });
  } else {
    // If we're here, the game is still in progress.
    // Ensure room is in playing state even if previous logic accidentally ended it.
    room.status = 'playing';
    room.gameResult = null;
  }

  return {
    room,
    move,
    timer: timerService.getTimerStatus(roomId),
    gameState,
  };
};

export const resignGame = ({ roomId, playerId }) => {
  const room = roomService.getRoom(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error('Player not in room');
  }

  const winner = player.color === 'white' ? 'black' : 'white';
  const result = {
    status: 'resigned',
    winner,
    reason: `${player.name || player.id} resigned`,
  };

  timerService.stopTimer(roomId);
  return roomService.endGame(roomId, result);
};

export const getGameState = (roomId) => {
  const room = roomService.getRoom(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  const gameState = chessService.evaluateGameState(room.chessFen, room.currentPlayer);
  return {
    room,
    timer: timerService.getTimerStatus(roomId),
    gameState,
  };
};

export const handleTimerExpired = ({ roomId, color }) => {
  const winner = color === 'white' ? 'black' : 'white';
  const result = {
    status: 'timeout',
    winner: winner.charAt(0).toUpperCase() + winner.slice(1),
    reason: `${color.charAt(0).toUpperCase() + color.slice(1)} ran out of time`,
  };

  timerService.stopTimer(roomId);
  const updatedRoom = roomService.endGame(roomId, result);
  return updatedRoom;
};
