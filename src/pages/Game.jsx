import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
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
  const [chessFen, setChessFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  
  const chess = useMemo(() => new Chess(chessFen), [chessFen]);

  const fromCoords = (row, col) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[col]}${8 - row}`;
  };

  const toCoords = (square) => {
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(square[1]);
    return { row, col };
  };

  useEffect(() => {
    setPlayerId(getSessionValue('playerId'));
    setPlayerName(getSessionValue('playerName'));
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinGame', { roomId });

    socket.on('gameState', (state) => {
      setGameState(state.isInCheck ? 'check' : state.status);
      setBoard(state.board);
      if (state.chessFen) setChessFen(state.chessFen);
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
      console.log('=== MOVE MADE EVENT ===');
      console.log('Move data:', moveData);
      
      setBoard(moveData.room?.board || moveData.board);
      if (moveData.room?.chessFen) setChessFen(moveData.room.chessFen);
      setCurrentPlayer(moveData.room?.currentPlayer || moveData.currentPlayer);
      setSelectedSquare(null);
      setPossibleMoves([]);
      
      // Only treat as game over for terminal states — never for "check"
      const GAME_OVER_STATUSES = ['checkmate', 'stalemate', 'draw', 'timeout', 'resigned'];
      if (moveData.gameState && GAME_OVER_STATUSES.includes(moveData.gameState.status)) {
        console.log('Game over detected:', moveData.gameState);
        setGameResult(moveData.gameState);
        setGameState('ended');
      }
    });

    socket.on('checkStatus', (checkData) => {
      if (checkData.isInCheck) {
        setGameState('check');
      } else {
        setGameState('playing');
      }
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
      socket.off('checkStatus');
      socket.off('gameEnded');
      socket.off('error');
    };
  }, [socket, roomId, navigate]);

  const handleSquareClick = (row, col) => {
    const GAME_OVER_STATUSES = ['checkmate', 'stalemate', 'draw', 'timeout', 'resigned'];
    const isGameOver = gameResult && GAME_OVER_STATUSES.includes(gameResult.status);
    
    if (isGameOver) return;

    if (selectedSquare) {
      const clickedPiece = board[row][col];
      const isSameSquare = selectedSquare.row === row && selectedSquare.col === col;

      if (isSameSquare) {
        // Deselect if clicking same square again
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // If clicking another own piece, re-select it instead of trying to move
      if (clickedPiece && isPlayerPiece(clickedPiece)) {
        setSelectedSquare({ row, col });
        setPossibleMoves([]);
        return;
      }

      // Otherwise attempt the move (capture or empty square)
      makeMove(selectedSquare.row, selectedSquare.col, row, col);
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      if (board[row][col] && isPlayerPiece(board[row][col])) {
        setSelectedSquare({ row, col });
        // Calculate possible moves using chess.js
        const square = fromCoords(row, col);
        const moves = chess.moves({ square, verbose: true });
        setPossibleMoves(moves.map(m => toCoords(m.to)));
      }
    }
  };

  const isPlayerPiece = (piece) => {
    if (!playerId) return false;
    const isWhite = piece === piece.toUpperCase();
    const playerColor = players.find(p => p.id === playerId)?.color;
    return (playerColor === 'white' && isWhite) || (playerColor === 'black' && !isWhite);
  };



  const makeMove = (fromRow, fromCol, toRow, toCol) => {
    console.log('Making move:', { fromRow, fromCol, toRow, toCol, playerId, roomId });
    if (socket && playerId) {
      socket.emit('makeMove', {
        roomId,
        playerId,
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol }
      }, (response) => {
        console.log('Move response:', response);
        if (!response?.success) {
          alert(response?.message || 'Invalid move');
        }
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
                    ${isPossibleMove ? 'ring-4 ring-green-500 ring-inset bg-green-200 bg-opacity-50' : ''}
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
            <div className={`mb-6 p-4 border rounded-lg text-center ${
              gameResult.winner ? 'bg-green-100 border-green-400' : 'bg-yellow-100 border-yellow-400'
            }`}>
              <h2 className={`text-xl font-bold ${
                gameResult.winner ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {gameResult.status === 'checkmate' && `${gameResult.winner} wins by checkmate!`}
                {gameResult.status === 'stalemate' && 'Draw! (Stalemate)'}
                {gameResult.status === 'timeout' && `${gameResult.winner} wins on time!`}
                {gameResult.status === 'resigned' && `${gameResult.winner} wins! (${gameResult.reason})`}
                {!gameResult.status && (gameResult.winner ? `${gameResult.winner} wins!` : 'Draw!')}
              </h2>
              <p className={`${
                gameResult.winner ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {gameResult.reason}
              </p>
            </div>
          )}

          {/* Show check status when not game over */}
          {!gameResult && gameState === 'check' && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-center">
              <h2 className="text-xl font-bold text-red-800">
                Check!
              </h2>
              <p className="text-red-700">
                {currentPlayer === 'white' ? 'White' : 'Black'} is in check
              </p>
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
                roomId={roomId}
                currentPlayer={currentPlayer}
                initialTime={timeControl} 
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
