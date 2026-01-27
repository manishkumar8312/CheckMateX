import React, { useState } from 'react';
import './BoardTheme.css';

const ChessBoard = () => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [board, setBoard] = useState(initializeBoard());

  function initializeBoard() {
    const pieces = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };

    const initialSetup = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    return initialSetup.map(row => row.map(piece => piece ? pieces[piece] : null));
  }

  const handleSquareClick = (row, col) => {
    if (selectedSquare) {
      if (selectedSquare.row === row && selectedSquare.col === col) {
        setSelectedSquare(null);
      } else {
        movePiece(selectedSquare.row, selectedSquare.col, row, col);
        setSelectedSquare(null);
      }
    } else {
      if (board[row][col]) {
        setSelectedSquare({ row, col });
      }
    }
  };

  const movePiece = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = [...board];
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;
    setBoard(newBoard);
  };

  const getSquareColor = (row, col) => {
    return (row + col) % 2 === 0 ? 'board-light' : 'board-dark';
  };

  const isSelected = (row, col) => {
    return selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
  };

  return (
    <div className="inline-block border-4 border-gray-800 rounded-lg shadow-2xl">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 flex items-center justify-center text-5xl cursor-pointer transition-all duration-200 hover:brightness-110
                ${getSquareColor(rowIndex, colIndex)}
                ${isSelected(rowIndex, colIndex) ? 'ring-4 ring-yellow-400 ring-inset' : ''}
              `}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && (
                <span className={`select-none ${piece === piece.toUpperCase() ? 'text-white drop-shadow-lg' : 'text-black drop-shadow-lg'}`}>
                  {piece}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ChessBoard;
