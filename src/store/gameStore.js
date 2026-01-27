import { create } from 'zustand';
import { INITIAL_BOARD, GAME_STATUS } from '../utils/constants.js';

export const useGameStore = create((set, get) => ({
  board: INITIAL_BOARD,
  currentPlayer: 'white',
  gameStatus: GAME_STATUS.WAITING,
  selectedSquare: null,
  possibleMoves: [],
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  gameResult: null,
  players: [],
  
  setBoard: (board) => set({ board }),
  
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  
  setGameStatus: (status) => set({ gameStatus: status }),
  
  setSelectedSquare: (square) => set({ selectedSquare: square }),
  
  setPossibleMoves: (moves) => set({ possibleMoves: moves }),
  
  addMove: (move) => set((state) => ({
    moveHistory: [...state.moveHistory, move]
  })),
  
  capturePiece: (piece, color) => set((state) => ({
    capturedPieces: {
      ...state.capturedPieces,
      [color]: [...state.capturedPieces[color], piece]
    }
  })),
  
  setGameResult: (result) => set({ gameResult: result }),
  
  setPlayers: (players) => set({ players }),
  
  resetGame: () => set({
    board: INITIAL_BOARD,
    currentPlayer: 'white',
    gameStatus: GAME_STATUS.WAITING,
    selectedSquare: null,
    possibleMoves: [],
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    gameResult: null
  }),
  
  makeMove: (from, to, piece) => {
    const state = get();
    const newBoard = state.board.map(row => [...row]);
    const capturedPiece = newBoard[to.row][to.col];
    
    newBoard[to.row][to.col] = newBoard[from.row][from.col];
    newBoard[from.row][from.col] = null;
    
    const move = {
      from,
      to,
      piece,
      capturedPiece,
      timestamp: Date.now()
    };
    
    if (capturedPiece) {
      const capturedColor = capturedPiece === capturedPiece.toUpperCase() ? 'white' : 'black';
      state.capturePiece(capturedPiece, capturedColor);
    }
    
    state.addMove(move);
    state.setBoard(newBoard);
    state.setCurrentPlayer(state.currentPlayer === 'white' ? 'black' : 'white');
    state.setSelectedSquare(null);
    state.setPossibleMoves([]);
  }
}));
