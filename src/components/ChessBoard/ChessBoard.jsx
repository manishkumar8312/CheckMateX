import React, { useState } from 'react';
import './BoardTheme.css';

const ChessBoard = ({ orientation = 'white', theme = localStorage.getItem('chessTheme') || 'classic' }) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [board, setBoard] = useState(initializeBoard(orientation));

  function initializeBoard(orientation) {
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

    const mappedBoard = initialSetup.map(row => row.map(piece => piece ? pieces[piece] : null));
    return mappedBoard;
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

  const isRotated = orientation === 'black';
  const rowIndices = isRotated ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = isRotated ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className={`inline-block border-4 border-gray-800 rounded-lg shadow-2xl ${theme}-theme board-container`}>
        {rowIndices.map((rowIndex) => (
          <div key={rowIndex} className="flex">
            {colIndices.map((colIndex) => {
              const piece = board[rowIndex][colIndex];
              return (
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
              );
            })}
          </div>
        ))}
      </div>
    );
};

export default ChessBoard;
