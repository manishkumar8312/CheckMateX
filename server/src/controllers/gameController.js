import { roomService, timerService, chessService } from '../services/index.js';

export const makeMove = ({ roomId, playerId, from, to }) => {
  const { room, move } = roomService.makeMove(roomId, from, to, playerId);
  const timer = timerService.switchTimer(roomId, room.currentPlayer);
  const gameState = chessService.evaluateGameState(room.board, room.currentPlayer);

  if (gameState.status !== 'playing') {
    timerService.stopTimer(roomId);
    roomService.endGame(roomId, {
      status: gameState.status,
      winner: gameState.winner,
      reason: gameState.reason,
    });
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

  const gameState = chessService.evaluateGameState(room.board, room.currentPlayer);
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
    winner,
    reason: `${color} ran out of time`,
  };

  timerService.stopTimer(roomId);
  return roomService.endGame(roomId, result);
};
