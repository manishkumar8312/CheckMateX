import { INITIAL_BOARD } from '../utils/constants.js';
import { Chess } from 'chess.js';

class RoomService {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomName, hostPlayer, timeControl = 600) {
    const roomId = this.generateRoomId();

    const room = {
      id: roomId,
      name: roomName,
      host: hostPlayer,
      players: [hostPlayer],
      status: 'waiting',
      timeControl,
      board: this.deepCopyBoard(INITIAL_BOARD),
      chessFen: new Chess().fen(),
      currentPlayer: 'white',
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      gameResult: null,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId, player) {
    console.log('Joining room:', roomId, 'with player:', player);
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    console.log('Room found:', room);
    console.log('Current players:', room.players);

    if (player?.id) {
      const existingIndex = room.players.findIndex((p) => p.id === player.id);
      if (existingIndex !== -1) {
        console.log('Player reconnecting:', player.id);
        const existingPlayer = room.players[existingIndex];
        const updatedPlayer = {
          ...existingPlayer,
          name: player.name || existingPlayer.name,
        };
        room.players[existingIndex] = updatedPlayer;
        room.lastActivity = new Date();
        return { room, player: updatedPlayer, isReconnect: true };
      }
    }

    if (room.players.length >= 2) {
      console.log('Room is full. Players:', room.players);
      throw new Error('Room is full');
    }

    // Check for duplicate player names
    const existingPlayerWithName = room.players.find(p => p.name.toLowerCase() === player.name.toLowerCase());
    if (existingPlayerWithName) {
      console.log('Duplicate player name:', player.name, 'Existing player:', existingPlayerWithName);
      throw new Error('A player with this name is already in the room');
    }

    const newPlayer = { ...player };
    room.players.push(newPlayer);
    room.lastActivity = new Date();

    // Assign colors
    if (room.players.length === 1) {
      room.players[0].color = 'white';
    } else if (room.players.length === 2) {
      const [first, second] = room.players;
      first.color = first.id === room.host.id ? 'white' : 'black';
      second.color = first.color === 'white' ? 'black' : 'white';
    }

    return { room, player: newPlayer, isReconnect: false };
  }

  leaveRoom(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);
    room.lastActivity = new Date();

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.length < 2) {
      throw new Error('Not enough players to start game');
    }

    room.status = 'playing';
    room.board = this.deepCopyBoard(INITIAL_BOARD);
    room.chessFen = new Chess().fen();
    room.currentPlayer = 'white';
    room.moveHistory = [];
    room.capturedPieces = { white: [], black: [] };
    room.gameResult = null;
    room.lastActivity = new Date();

    return room;
  }

  makeMove(roomId, from, to, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const GAME_OVER_STATUSES = ['checkmate', 'stalemate', 'draw', 'timeout', 'resigned'];
    const isActuallyOver = room.status === 'ended' && room.gameResult && GAME_OVER_STATUSES.includes(room.gameResult.status);

    if (room.status !== 'playing' && isActuallyOver) {
      throw new Error('Game is not in progress');
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not in room');
    }

    const isWhiteTurn = room.currentPlayer === 'white';
    const isWhitePlayer = player.color === 'white';

    if (isWhiteTurn !== isWhitePlayer) {
      throw new Error('Not your turn');
    }

    const piece = room.board[from.row][from.col];
    if (!piece) {
      throw new Error('No piece at source position');
    }

    const chess = new Chess(room.chessFen);

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fromSquare = `${files[from.col]}${8 - from.row}`;
    const toSquare = `${files[to.col]}${8 - to.row}`;

    // Calculate possible promotion
    let promotion = undefined;
    if (piece.toLowerCase() === 'p' && (to.row === 0 || to.row === 7)) {
      promotion = 'q'; // Always auto-promote to Queen for now to simplify
    }

    let moveResult;
    try {
      moveResult = chess.move({
        from: fromSquare,
        to: toSquare,
        promotion
      });
    } catch (e) {
      throw new Error('Invalid move');
    }

    if (!moveResult) {
      throw new Error('Invalid move');
    }

    // Make the move
    // Handle en passant, castling, promotion correctly by syncing board with chess.js
    room.chessFen = chess.fen();
    room.board = this.getBoardArray(chess);

    let capturedPiece = null;
    if (moveResult.captured) {
       capturedPiece = room.currentPlayer === 'white' 
          ? moveResult.captured.toLowerCase() 
          : moveResult.captured.toUpperCase();
    }

    // Record move
    const move = {
      from,
      to,
      piece,
      capturedPiece,
      player: playerId,
      timestamp: new Date()
    };

    room.moveHistory.push(move);

    if (capturedPiece) {
      const capturedColor = capturedPiece === capturedPiece.toUpperCase() ? 'white' : 'black';
      room.capturedPieces[capturedColor].push(capturedPiece);
    }

    room.currentPlayer = room.currentPlayer === 'white' ? 'black' : 'white';
    room.lastActivity = new Date();

    // Check for game end conditions (checkmate, stalemate, etc.)
    // This would be implemented with proper chess logic

    return { room, move };
  }

  endGame(roomId, result) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.status = 'ended';
    room.gameResult = result;
    room.lastActivity = new Date();

    return room;
  }

  cleanupInactiveRooms() {
    const now = new Date();
    const timeout = 30 * 60 * 1000; // 30 minutes

    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastActivity > timeout) {
        this.rooms.delete(roomId);
      }
    }
  }

  getRoomCount() {
    return this.rooms.size;
  }

  getPlayerCount() {
    let totalPlayers = 0;
    for (const room of this.rooms.values()) {
      totalPlayers += room.players.length;
    }
    return totalPlayers;
  }

  generateRoomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId = '';
    for (let i = 0; i < 7; i++) {
      roomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomId;
  }

  deepCopyBoard(board) {
    return board.map(row => [...row]);
  }

  getBoardArray(chess) {
    return chess.board().map(row => 
      row.map(piece => {
        if (!piece) return null;
        return piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
      })
    );
  }
}

export default RoomService;
