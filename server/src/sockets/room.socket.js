import { createRoom, joinRoom, leaveRoom, startGame, getRoom } from '../controllers/roomController.js';
import { timerService } from '../services/index.js';

export const registerRoomSocket = (io, socket) => {
  const emitRoomState = (roomId) => {
    const room = getRoom(roomId);
    if (room) {
      io.to(roomId).emit('roomUpdated', room);
    }
  };

  socket.on('createRoom', async (payload, callback) => {
    try {
      const { room, hostPlayer } = createRoom(payload);
      socket.join(room.id);
      socket.data.roomId = room.id;
      socket.data.playerId = hostPlayer.id;
      socket.emit('roomJoined', {
        room,
        players: room.players,
        isHost: true,
      });

      if (room.isAiOpponent) {
        // Start the white player's timer when game begins against AI
        timerService.startTimer(room.id, 'white');
        io.to(room.id).emit('gameStarted', { room });
      }

      emitRoomState(room.id);
      callback?.({ success: true, room, player: hostPlayer });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('joinRoom', (payload, callback) => {
    console.log('joinRoom event received:', payload);
    try {
      const { room, player } = joinRoom(payload);
      console.log('joinRoom successful:', { room, player });
      socket.join(room.id);
      socket.data.roomId = room.id;
      socket.data.playerId = player.id;
      socket.emit('roomJoined', {
        room,
        players: room.players,
        isHost: player.id === room.host.id,
      });
      io.to(room.id).emit('playerJoined', player);
      emitRoomState(room.id);

      if (room.players.length === 2 && room.status !== 'playing') {
        const { room: startedRoom } = startGame({ roomId: room.id });
        
        // Start the white player's timer when game begins
        timerService.startTimer(room.id, 'white');
        
        io.to(room.id).emit('gameStarted', { room: startedRoom });
        emitRoomState(room.id);
      }

      callback?.({ success: true, room, player });
    } catch (error) {
      console.log('joinRoom error:', error.message);
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('leaveRoom', (payload, callback) => {
    try {
      const { roomId, playerId } = payload || socket.data;
      const room = leaveRoom({ roomId, playerId });
      socket.leave(roomId);
      socket.data.roomId = null;
      socket.data.playerId = null;
      io.to(roomId).emit('playerLeft', playerId);
      if (room) emitRoomState(roomId);
      callback?.({ success: true });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('startGame', (payload, callback) => {
    try {
      const { room, timer } = startGame(payload);
      io.to(room.id).emit('gameStarted', { room, timer });
      emitRoomState(room.id);
      callback?.({ success: true, room, timer });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('requestRoomState', ({ roomId }, callback) => {
    const room = getRoom(roomId);
    callback?.({ room });
    if (room) {
      socket.emit('roomJoined', {
        room,
        players: room.players,
        isHost: room.host?.id === socket.data.playerId,
      });
    }
  });
};
