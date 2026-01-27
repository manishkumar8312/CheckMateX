import { INITIAL_BOARD, PIECES } from './constants.js';

export class ChessGame {
  constructor() {
    this.board = this.deepCopyBoard(INITIAL_BOARD);
    this.currentPlayer = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    };
    this.enPassantTarget = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
  }

  deepCopyBoard(board) {
    return board.map(row => [...row]);
  }

  isValidMove(from, to) {
    const piece = this.board[from.row][from.col];
    if (!piece) return false;

    const isWhitePiece = piece === piece.toUpperCase();
    const isCorrectTurn = (this.currentPlayer === 'white' && isWhitePiece) ||
                         (this.currentPlayer === 'black' && !isWhitePiece);

    if (!isCorrectTurn) return false;

    const possibleMoves = this.getPossibleMoves(from.row, from.col);
    return possibleMoves.some(move => move.row === to.row && move.col === to.col);
  }

  makeMove(from, to) {
    if (!this.isValidMove(from, to)) {
      throw new Error('Invalid move');
    }

    const piece = this.board[from.row][from.col];
    const capturedPiece = this.board[to.row][to.col];

    if (capturedPiece) {
      const isWhiteCaptured = capturedPiece === capturedPiece.toUpperCase();
      this.capturedPieces[isWhiteCaptured ? 'white' : 'black'].push(capturedPiece);
    }

    this.board[to.row][to.col] = piece;
    this.board[from.row][from.col] = null;

    this.moveHistory.push({
      from: { ...from },
      to: { ...to },
      piece,
      capturedPiece,
      timestamp: Date.now()
    });

    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    this.fullMoveNumber++;

    return true;
  }

  getPossibleMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return [];

    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();

    switch (pieceType) {
      case 'p':
        return this.getPawnMoves(row, col, isWhite);
      case 'n':
        return this.getKnightMoves(row, col, isWhite);
      case 'b':
        return this.getBishopMoves(row, col, isWhite);
      case 'r':
        return this.getRookMoves(row, col, isWhite);
      case 'q':
        return this.getQueenMoves(row, col, isWhite);
      case 'k':
        return this.getKingMoves(row, col, isWhite);
      default:
        return [];
    }
  }

  getPawnMoves(row, col, isWhite) {
    const moves = [];
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    if (this.isValidSquare(row + direction, col) && !this.board[row + direction][col]) {
      moves.push({ row: row + direction, col });
      
      if (row === startRow && !this.board[row + 2 * direction][col]) {
        moves.push({ row: row + 2 * direction, col });
      }
    }

    for (const dc of [-1, 1]) {
      if (this.isValidSquare(row + direction, col + dc)) {
        const target = this.board[row + direction][col + dc];
        if (target && (target === target.toUpperCase()) !== isWhite) {
          moves.push({ row: row + direction, col: col + dc });
        }
      }
    }

    return moves;
  }

  getKnightMoves(row, col, isWhite) {
    const moves = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [dr, dc] of knightMoves) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (this.isValidSquare(newRow, newCol)) {
        const target = this.board[newRow][newCol];
        if (!target || (target === target.toUpperCase()) !== isWhite) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    return moves;
  }

  getBishopMoves(row, col, isWhite) {
    const moves = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dr, dc] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + dr * i;
        const newCol = col + dc * i;
        
        if (!this.isValidSquare(newRow, newCol)) break;
        
        const target = this.board[newRow][newCol];
        if (!target) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if ((target === target.toUpperCase()) !== isWhite) {
            moves.push({ row: newRow, col: newCol });
          }
          break;
        }
      }
    }

    return moves;
  }

  getRookMoves(row, col, isWhite) {
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, dc] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + dr * i;
        const newCol = col + dc * i;
        
        if (!this.isValidSquare(newRow, newCol)) break;
        
        const target = this.board[newRow][newCol];
        if (!target) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if ((target === target.toUpperCase()) !== isWhite) {
            moves.push({ row: newRow, col: newCol });
          }
          break;
        }
      }
    }

    return moves;
  }

  getQueenMoves(row, col, isWhite) {
    return [...this.getBishopMoves(row, col, isWhite), ...this.getRookMoves(row, col, isWhite)];
  }

  getKingMoves(row, col, isWhite) {
    const moves = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (this.isValidSquare(newRow, newCol)) {
        const target = this.board[newRow][newCol];
        if (!target || (target === target.toUpperCase()) !== isWhite) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    return moves;
  }

  isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  isInCheck(color) {
    const kingPiece = color === 'white' ? 'K' : 'k';
    let kingPos = null;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === kingPiece) {
          kingPos = { row, col };
          break;
        }
      }
      if (kingPos) break;
    }

    if (!kingPos) return false;

    const opponentColor = color === 'white' ? 'black' : 'white';
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && ((piece === piece.toUpperCase()) !== (color === 'white'))) {
          const moves = this.getPossibleMoves(row, col);
          if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  isCheckmate(color) {
    if (!this.isInCheck(color)) return false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && ((piece === piece.toUpperCase()) === (color === 'white'))) {
          const moves = this.getPossibleMoves(row, col);
          for (const move of moves) {
            const tempBoard = this.deepCopyBoard(this.board);
            this.board[move.row][move.col] = piece;
            this.board[row][col] = null;
            
            const stillInCheck = this.isInCheck(color);
            
            this.board = tempBoard;
            
            if (!stillInCheck) return false;
          }
        }
      }
    }

    return true;
  }

  isStalemate(color) {
    if (this.isInCheck(color)) return false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && ((piece === piece.toUpperCase()) === (color === 'white'))) {
          const moves = this.getPossibleMoves(row, col);
          if (moves.length > 0) return false;
        }
      }
    }

    return true;
  }

  getGameState() {
    const currentColor = this.currentPlayer;
    
    if (this.isCheckmate(currentColor)) {
      return {
        status: 'checkmate',
        winner: currentColor === 'white' ? 'black' : 'white',
        reason: `${currentColor === 'white' ? 'White' : 'Black'} is in checkmate`
      };
    }

    if (this.isStalemate(currentColor)) {
      return {
        status: 'stalemate',
        winner: null,
        reason: 'Stalemate - draw'
      };
    }

    if (this.isInCheck(currentColor)) {
      return {
        status: 'check',
        winner: null,
        reason: `${currentColor === 'white' ? 'White' : 'Black'} is in check`
      };
    }

    return {
      status: 'playing',
      winner: null,
      reason: null
    };
  }

  reset() {
    this.board = this.deepCopyBoard(INITIAL_BOARD);
    this.currentPlayer = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    };
    this.enPassantTarget = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
  }
}
