import { INITIAL_BOARD } from '../utils/constants.js';
import { validateMove } from '../utils/validateMove.js';

class ChessService {
  getInitialBoard() {
    return INITIAL_BOARD.map(row => [...row]);
  }

  validateMove(from, to, board, currentPlayer) {
    return validateMove(from, to, board, currentPlayer);
  }

  evaluateGameState(board, currentPlayer) {
    const isCheckmate = this.isCheckmate(board, currentPlayer);
    if (isCheckmate) {
      return {
        status: 'checkmate',
        winner: currentPlayer === 'white' ? 'black' : 'white',
        reason: `${currentPlayer === 'white' ? 'White' : 'Black'} is checkmated`
      };
    }

    const isStalemate = this.isStalemate(board, currentPlayer);
    if (isStalemate) {
      return {
        status: 'stalemate',
        winner: null,
        reason: 'Stalemate'
      };
    }

    const isInCheck = this.isInCheck(board, currentPlayer);
    if (isInCheck) {
      return {
        status: 'check',
        winner: null,
        reason: `${currentPlayer === 'white' ? 'White' : 'Black'} is in check`
      };
    }

    return {
      status: 'playing',
      winner: null,
      reason: null
    };
  }

  isInCheck(board, color) {
    const kingPiece = color === 'white' ? 'K' : 'k';
    let kingPos = null;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === kingPiece) {
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
        const piece = board[row][col];
        if (!piece) continue;

        const isWhitePiece = piece === piece.toUpperCase();
        if ((opponentColor === 'white' && isWhitePiece) || (opponentColor === 'black' && !isWhitePiece)) {
          const validation = validateMove({ row, col }, kingPos, board, opponentColor);
          if (validation.valid) {
            return true;
          }
        }
      }
    }

    return false;
  }

  isCheckmate(board, color) {
    if (!this.isInCheck(board, color)) return false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (!piece) continue;

        const isWhitePiece = piece === piece.toUpperCase();
        if ((color === 'white' && isWhitePiece) || (color === 'black' && !isWhitePiece)) {
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const validation = validateMove({ row, col }, { row: r, col: c }, board, color);
              if (validation.valid) {
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  }

  isStalemate(board, color) {
    if (this.isInCheck(board, color)) return false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (!piece) continue;

        const isWhitePiece = piece === piece.toUpperCase();
        if ((color === 'white' && isWhitePiece) || (color === 'black' && !isWhitePiece)) {
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const validation = validateMove({ row, col }, { row: r, col: c }, board, color);
              if (validation.valid) {
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  }
}

export default ChessService;
