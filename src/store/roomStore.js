import { create } from 'zustand';

export const useRoomStore = create((set, get) => ({
  roomId: null,
  roomName: null,
  players: [],
  isHost: false,
  maxPlayers: 2,
  roomStatus: 'waiting',
  
  setRoomId: (roomId) => set({ roomId }),
  
  setRoomName: (roomName) => set({ roomName }),
  
  setPlayers: (players) => set({ players }),
  
  setIsHost: (isHost) => set({ isHost }),
  
  setRoomStatus: (status) => set({ roomStatus: status }),
  
  addPlayer: (player) => set((state) => ({
    players: [...state.players, player]
  })),
  
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter(p => p.id !== playerId)
  })),
  
  updatePlayer: (playerId, updates) => set((state) => ({
    players: state.players.map(p => 
      p.id === playerId ? { ...p, ...updates } : p
    )
  })),
  
  createRoom: (roomData) => set({
    roomId: roomData.roomId,
    roomName: roomData.roomName,
    players: [roomData.host],
    isHost: true,
    roomStatus: 'waiting'
  }),
  
  joinRoom: (roomData) => set({
    roomId: roomData.roomId,
    roomName: roomData.roomName,
    players: roomData.players,
    isHost: roomData.isHost,
    roomStatus: roomData.roomStatus || 'waiting'
  }),
  
  leaveRoom: () => set({
    roomId: null,
    roomName: null,
    players: [],
    isHost: false,
    roomStatus: 'waiting'
  }),
  
  startGame: () => set({ roomStatus: 'playing' }),
  
  endGame: () => set({ roomStatus: 'ended' }),
  
  isRoomFull: () => {
    const state = get();
    return state.players.length >= state.maxPlayers;
  },
  
  getPlayerById: (playerId) => {
    const state = get();
    return state.players.find(p => p.id === playerId);
  },
  
  getCurrentPlayer: (socketId) => {
    const state = get();
    return state.players.find(p => p.id === socketId);
  }
}));
