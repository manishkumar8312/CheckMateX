import { INITIAL_BOARD } from './constants.js';

export const validateMove = (from, to, board, currentPlayer) => {
  const piece = board[from.row][from.col];
  if (!piece) return { valid: false, reason: 'No piece at source position' };

  const isWhitePiece = piece === piece.toUpperCase();
  const isCorrectTurn = (currentPlayer === 'white' && isWhitePiece) ||
                       (currentPlayer === 'black' && !isWhitePiece);

  if (!isCorrectTurn) {
    return { valid: false, reason: 'Not your turn' };
  }

  const possibleMoves = getPossibleMoves(from.row, from.col, board);
  const isValidMove = possibleMoves.some(move => move.row === to.row && move.col === to.col);

  if (!isValidMove) {
    return { valid: false, reason: 'Invalid move for this piece' };
  }

  // Simulate the move to check if it would leave king in check
  const tempBoard = simulateMove(board, from, to);
  if (isKingInCheck(currentPlayer, tempBoard)) {
    return { valid: false, reason: 'Move would leave king in check' };
  }

  return { valid: true };
};

const getPossibleMoves = (row, col, board) => {
  const piece = board[row][col];
  if (!piece) return [];

  const pieceType = piece.toLowerCase();
  const isWhite = piece === piece.toUpperCase();

  switch (pieceType) {
    case 'p': return getPawnMoves(row, col, isWhite, board);
    case 'n': return getKnightMoves(row, col, isWhite, board);
    case 'b': return getBishopMoves(row, col, isWhite, board);
    case 'r': return getRookMoves(row, col, isWhite, board);
    case 'q': return getQueenMoves(row, col, isWhite, board);
    case 'k': return getKingMoves(row, col, isWhite, board);
    default: return [];
  }
};

const getPawnMoves = (row, col, isWhite, board) => {
  const moves = [];
  const direction = isWhite ? -1 : 1;
  const startRow = isWhite ? 6 : 1;

  // Forward move
  if (isValidSquare(row + direction, col) && !board[row + direction][col]) {
    moves.push({ row: row + direction, col });
    
    // Double move from start
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col });
    }
  }

  // Captures
  for (const dc of [-1, 1]) {
    if (isValidSquare(row + direction, col + dc)) {
      const target = board[row + direction][col + dc];
      if (target && (target === target.toUpperCase()) !== isWhite) {
        moves.push({ row: row + direction, col: col + dc });
      }
    }
  }

  return moves;
};

const getKnightMoves = (row, col, isWhite, board) => {
  const moves = [];
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  for (const [dr, dc] of knightMoves) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (isValidSquare(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (!target || (target === target.toUpperCase()) !== isWhite) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
};

const getBishopMoves = (row, col, isWhite, board) => {
  const moves = [];
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  for (const [dr, dc] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;
      
      if (!isValidSquare(newRow, newCol)) break;
      
      const target = board[newRow][newCol];
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
};

const getRookMoves = (row, col, isWhite, board) => {
  const moves = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dr, dc] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;
      
      if (!isValidSquare(newRow, newCol)) break;
      
      const target = board[newRow][newCol];
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
};

const getQueenMoves = (row, col, isWhite, board) => {
  return [...getBishopMoves(row, col, isWhite, board), ...getRookMoves(row, col, isWhite, board)];
};

const getKingMoves = (row, col, isWhite, board) => {
  const moves = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (isValidSquare(newRow, newCol)) {
      const target = board[newRow][newCol];
      if (!target || (target === target.toUpperCase()) !== isWhite) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
};

const isValidSquare = (row, col) => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

const simulateMove = (board, from, to) => {
  const newBoard = board.map(row => [...row]);
  newBoard[to.row][to.col] = newBoard[from.row][from.col];
  newBoard[from.row][from.col] = null;
  return newBoard;
};

const isKingInCheck = (color, board) => {
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
      if (piece && ((piece === piece.toUpperCase()) !== (color === 'white'))) {
        const moves = getPossibleMoves(row, col, board);
        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
          return true;
        }
      }
    }
  }

  return false;
};
