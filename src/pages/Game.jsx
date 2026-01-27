import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../socket/socket';
import ChessBoard from '../components/ChessBoard/ChessBoard';
import Timer from '../components/Timer/Timer';
import ThemeSelector from '../components/Controls/ThemeSelector';
import TimeSelector from '../components/Controls/TimeSelector';

const Game = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const storagePrefix = useMemo(() => `room:${roomId}`, [roomId]);
  const getSessionValue = (suffix) => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(`${storagePrefix}:${suffix}`) || null;
  };
  const [gameState, setGameState] = useState('waiting');
  const [board, setBoard] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [theme, setTheme] = useState('classic');
  const [timeControl, setTimeControl] = useState(600);
  const [playerId, setPlayerId] = useState(() => getSessionValue('playerId'));
  const [playerName, setPlayerName] = useState(() => getSessionValue('playerName'));

  useEffect(() => {
    setPlayerId(getSessionValue('playerId'));
    setPlayerName(getSessionValue('playerName'));
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinGame', { roomId });

    socket.on('gameState', (state) => {
      setGameState(state.status);
      setBoard(state.board);
      setPlayers(state.players);
      setCurrentPlayer(state.currentPlayer);
      setGameResult(state.result);
      if (!playerId) {
        const inferredPlayer = state.players?.find(p => p.name === playerName);
        if (inferredPlayer) {
          setPlayerId(inferredPlayer.id);
        }
      }
    });

    socket.on('moveMade', (moveData) => {
      setBoard(moveData.board);
      setCurrentPlayer(moveData.currentPlayer);
      setSelectedSquare(null);
      setPossibleMoves([]);
    });

    socket.on('gameEnded', (result) => {
      setGameResult(result);
      setGameState('ended');
    });

    socket.on('error', (error) => {
      console.error('Game error:', error);
      alert(error);
      navigate('/');
    });

    return () => {
      socket.off('gameState');
      socket.off('moveMade');
      socket.off('gameEnded');
      socket.off('error');
    };
  }, [socket, roomId, navigate]);

  const handleSquareClick = (row, col) => {
    if (gameState !== 'playing' || gameResult) return;

    if (selectedSquare) {
      const isValidMove = possibleMoves.some(move => move.row === row && move.col === col);
      
      if (isValidMove) {
        makeMove(selectedSquare.row, selectedSquare.col, row, col);
      } else if (board[row][col] && isPlayerPiece(board[row][col])) {
        selectSquare(row, col);
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else {
      if (board[row][col] && isPlayerPiece(board[row][col])) {
        selectSquare(row, col);
      }
    }
  };

  const isPlayerPiece = (piece) => {
    if (!playerId) return false;
    const isWhite = piece === piece.toUpperCase();
    const playerColor = players.find(p => p.id === playerId)?.color;
    return (playerColor === 'white' && isWhite) || (playerColor === 'black' && !isWhite);
  };

  const selectSquare = (row, col) => {
    setSelectedSquare({ row, col });
    const moves = calculatePossibleMoves(row, col);
    setPossibleMoves(moves);
  };

  const calculatePossibleMoves = (row, col) => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves = [];
    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();

    switch (pieceType) {
      case 'p':
        moves.push(...getPawnMoves(row, col, isWhite));
        break;
      case 'n':
        moves.push(...getKnightMoves(row, col, isWhite));
        break;
      case 'b':
        moves.push(...getBishopMoves(row, col, isWhite));
        break;
      case 'r':
        moves.push(...getRookMoves(row, col, isWhite));
        break;
      case 'q':
        moves.push(...getQueenMoves(row, col, isWhite));
        break;
      case 'k':
        moves.push(...getKingMoves(row, col, isWhite));
        break;
    }

    return moves;
  };

  const getPawnMoves = (row, col, isWhite) => {
    const moves = [];
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    if (isValidSquare(row + direction, col) && !board[row + direction][col]) {
      moves.push({ row: row + direction, col });
      
      if (row === startRow && !board[row + 2 * direction][col]) {
        moves.push({ row: row + 2 * direction, col });
      }
    }

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

  const getKnightMoves = (row, col, isWhite) => {
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

  const getBishopMoves = (row, col, isWhite) => {
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

  const getRookMoves = (row, col, isWhite) => {
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

  const getQueenMoves = (row, col, isWhite) => {
    return [...getBishopMoves(row, col, isWhite), ...getRookMoves(row, col, isWhite)];
  };

  const getKingMoves = (row, col, isWhite) => {
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

  const makeMove = (fromRow, fromCol, toRow, toCol) => {
    if (socket && playerId) {
      socket.emit('makeMove', {
        roomId,
        playerId,
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol }
      });
    }
  };

  const leaveGame = () => {
    if (socket) {
      socket.emit('leaveGame', { roomId });
    }
    navigate('/');
  };

  const renderBoard = () => {
    if (!board) return null;

    const pieces = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };

    return (
      <div className={`inline-block border-4 border-gray-800 rounded-lg shadow-2xl ${theme}-theme`}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
              const isPossibleMove = possibleMoves.some(move => move.row === rowIndex && move.col === colIndex);
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-16 h-16 flex items-center justify-center text-5xl cursor-pointer transition-all duration-200
                    ${isLight ? 'board-light' : 'board-dark'}
                    ${isSelected ? 'ring-4 ring-yellow-400 ring-inset' : ''}
                    ${isPossibleMove ? 'ring-2 ring-green-400 ring-inset' : ''}
                    hover:brightness-110
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece && (
                    <span className={`select-none drop-shadow-lg ${
                      piece === piece.toUpperCase() ? 'text-white' : 'text-black'
                    }`}>
                      {pieces[piece]}
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">CheckMateX</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Room: <span className="font-mono font-bold">{roomId?.toUpperCase()}</span>
              </span>
              <button
                onClick={leaveGame}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Leave Game
              </button>
            </div>
          </div>

          {gameResult && (
            <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg text-center">
              <h2 className="text-xl font-bold text-yellow-800">
                {gameResult.winner ? `${gameResult.winner} wins!` : 'Draw!'}
              </h2>
              <p className="text-yellow-700">{gameResult.reason}</p>
            </div>
          )}

          <div className="flex gap-8">
            <div className="flex-1 flex justify-center">
              {renderBoard()}
            </div>

            <div className="w-80 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Game Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium capitalize">{gameState}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Turn:</span>
                    <span className="font-medium capitalize">{currentPlayer}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Players</h3>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          player.color === 'white' 
                            ? 'bg-white border-2 border-black' 
                            : 'bg-black'
                        }`} />
                        <span className="text-sm">{player.name}</span>
                        {player.id === playerId && (
                          <span className="text-xs text-blue-600">(You)</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{player.color}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Timer 
                initialTime={timeControl} 
                isActive={gameState === 'playing' && !gameResult}
                onTimeExpire={() => console.log('Time expired')}
              />

              <ThemeSelector 
                currentTheme={theme} 
                onThemeChange={setTheme} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
