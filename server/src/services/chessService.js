import { INITIAL_BOARD } from '../utils/constants.js';
import { Chess } from 'chess.js';

class ChessService {
  getInitialBoard() {
    return INITIAL_BOARD.map(row => [...row]);
  }

  evaluateGameState(chessFen, currentPlayer) {
    const chess = new Chess(chessFen);

    if (chess.isCheckmate()) {
      return {
        status: 'checkmate',
        winner: currentPlayer === 'white' ? 'black' : 'white',
        reason: `${currentPlayer === 'white' ? 'White' : 'Black'} is checkmated`
      };
    }

    if (chess.isStalemate()) {
      return {
        status: 'stalemate',
        winner: null,
        reason: 'Stalemate'
      };
    }

    if (chess.isDraw()) {
      return {
        status: 'draw',
        winner: null,
        reason: 'Draw'
      };
    }

    if (chess.inCheck()) {
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
}

export default ChessService;
