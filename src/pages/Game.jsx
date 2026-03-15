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

    const playerColor = players.find(p => p.id === playerId)?.color || 'white';
    const isRotated = playerColor === 'black';

    const rowIndices = isRotated ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const colIndices = isRotated ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    return (
      <div className={`relative inline-block border-8 border-gray-900 rounded-sm shadow-2xl ${theme}-theme board-container`}>
        {rowIndices.map((rowIndex) => (
          <div key={rowIndex} className="flex">
            {colIndices.map((colIndex) => {
              const piece = board[rowIndex][colIndex];
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
              const isPossibleMove = possibleMoves.some(move => move.row === rowIndex && move.col === colIndex);
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`relative flex items-center justify-center cursor-pointer transition-all duration-150
                    chess-square
                    ${isLight ? 'board-light' : 'board-dark'}
                    ${isSelected ? 'ring-4 ring-yellow-400 ring-inset z-10' : ''}
                    ${isPossibleMove ? 'possible-move-hint' : ''}
                    hover:brightness-105 active:scale-95
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {isPossibleMove && !piece && (
                    <div className="w-3 h-3 bg-black bg-opacity-10 rounded-full" />
                  )}
                  {piece && (
                    <span className={`chess-piece select-none drop-shadow-md z-20 ${
                      piece === piece.toUpperCase() ? 'text-white' : 'text-black'
                    }`}>
                      {pieces[piece]}
                    </span>
                  )}
                  {isPossibleMove && piece && (
                    <div className="absolute inset-0 border-4 border-black border-opacity-10 rounded-full m-1" />
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

          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            <div className="flex-1 flex justify-center w-full lg:w-auto">
              {renderBoard()}
            </div>

            <div className="w-full lg:w-80 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Game Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      gameState === 'check' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {gameState}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">To Move:</span>
                    <div className="flex items-center space-x-2">
                       <div className={`w-3 h-3 rounded-full ${currentPlayer === 'white' ? 'bg-white border border-gray-400' : 'bg-gray-900'}`} />
                       <span className="font-bold capitalize">{currentPlayer}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Players</h3>
                <div className="space-y-3">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full shadow-inner ${
                          player.color === 'white' 
                            ? 'bg-white border-2 border-gray-300' 
                            : 'bg-gray-900'
                        }`} />
                        <span className={`text-sm font-medium ${player.id === playerId ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                          {player.name}
                          {player.id === playerId && " (You)"}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{player.color}</span>
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
