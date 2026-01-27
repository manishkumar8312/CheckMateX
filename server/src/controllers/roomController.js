import { roomService, timerService, chessService } from '../services/index.js';
import { generatePlayerId } from '../utils/generatePin.js';

export const createRoom = ({ roomName, playerName, timeControl }) => {
  const hostPlayer = {
    id: generatePlayerId(),
    name: playerName,
    color: 'white',
  };

  const room = roomService.createRoom(roomName, hostPlayer, timeControl);
  timerService.createTimer(room.id, timeControl * 60 || 600);

  return { room, hostPlayer };
};

export const joinRoom = ({ roomId, playerName, playerId }) => {
  const player = {
    id: playerId || generatePlayerId(),
    name: playerName,
  };

  return roomService.joinRoom(roomId, player);
};

export const leaveRoom = ({ roomId, playerId }) => {
  return roomService.leaveRoom(roomId, playerId);
};

export const startGame = ({ roomId }) => {
  const room = roomService.startGame(roomId);
  const timer = timerService.resetTimer(roomId, room.timeControl * 60 || 600);
  timerService.startTimer(roomId, 'white');
  const board = chessService.getInitialBoard();
  room.board = board;
  return { room, timer };
};

export const getRoom = (roomId) => roomService.getRoom(roomId);

export const getServices = () => ({ roomService, timerService, chessService });
