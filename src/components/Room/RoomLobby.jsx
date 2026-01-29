import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../../socket/socket';
import ChessBoard from '../ChessBoard/ChessBoard';
import Timer from '../Timer/Timer';

const RoomLobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const socketClient = useSocket();
  const storagePrefix = useMemo(() => `room:${roomId}`, [roomId]);
  const sessionKeys = useMemo(() => ({
    name: `${storagePrefix}:playerName`,
    id: `${storagePrefix}:playerId`,
    role: `${storagePrefix}:role`,
  }), [storagePrefix]);

  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(() => {
    if (typeof location.state?.isHost === 'boolean') return location.state.isHost;
    if (typeof window !== 'undefined') {
      const storedRole = sessionStorage.getItem(sessionKeys.role);
      if (storedRole) return storedRole === 'host';
    }
    return false;
  });
  const [playerName, setPlayerName] = useState(() => {
    if (location.state?.playerName) return location.state.playerName;
    if (typeof window !== 'undefined') {
      const storedName = sessionStorage.getItem(sessionKeys.name);
      if (storedName) return storedName;
    }
    return '';
  });
  const [playerId, setPlayerId] = useState(() => {
    if (location.state?.playerId) return location.state.playerId;
    if (typeof window !== 'undefined') {
      const storedId = sessionStorage.getItem(sessionKeys.id);
      if (storedId) return storedId;
    }
    return null;
  });
  const [isJoining, setIsJoining] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const joinAttemptedRef = useRef(false);
  const stateRequestedRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  const navigateToGame = (room) => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    navigate(`/game/${room?.id || roomId}`);
  };

  const persistPlayerMeta = (meta = {}) => {
    if (typeof window === 'undefined') return;
    if (meta.playerName) {
      sessionStorage.setItem(sessionKeys.name, meta.playerName);
    }
    if (meta.playerId) {
      sessionStorage.setItem(sessionKeys.id, meta.playerId);
    }
    if (typeof meta.isHost === 'boolean') {
      sessionStorage.setItem(sessionKeys.role, meta.isHost ? 'host' : 'guest');
    }
  };

  useEffect(() => {
    joinAttemptedRef.current = false;
    stateRequestedRef.current = false;
    hasNavigatedRef.current = false;
  }, [roomId]);

  useEffect(() => {
    if (!socketClient) return;

    socketClient.connect?.();

    const handleRoomSnapshot = (data) => {
      if (!data) return;
      setRoomData(data.room || data);
      const nextPlayers = data.players || data.room?.players;
      if (Array.isArray(nextPlayers)) {
        setPlayers(nextPlayers);
      }
      if (typeof data.isHost === 'boolean') {
        setIsHost(data.isHost);
        persistPlayerMeta({ isHost: data.isHost });
      }
    };

    const handleRoomJoined = (payload) => {
      handleRoomSnapshot(payload);
      if (payload?.playerId) {
        setPlayerId((prev) => {
          if (prev) return prev;
          persistPlayerMeta({ playerId: payload.playerId });
          return payload.playerId;
        });
      }
    };

    const handlePlayerJoined = (player) => {
      setPlayers(prev => {
        if (prev.some(p => p.id === player.id)) {
          return prev;
        }
        return [...prev, player];
      });
    };

    const handlePlayerLeft = (id) => {
      setPlayers(prev => prev.filter(p => p.id !== id));
    };

    socketClient.on?.('roomJoined', handleRoomJoined);
    socketClient.on?.('roomUpdated', handleRoomSnapshot);
    socketClient.on?.('playerJoined', handlePlayerJoined);
    socketClient.on?.('playerLeft', handlePlayerLeft);
    socketClient.on?.('gameStarted', ({ room }) => {
      setGameStarted(true);
      setRoomData(room);
      navigate(`/game/${roomId}`);
    });
    socketClient.on?.('error', (message) => {
      setError(message || 'Something went wrong');
    });
    return () => {
      socketClient.off?.('roomJoined', handleRoomJoined);
      socketClient.off?.('roomUpdated', handleRoomSnapshot);
      socketClient.off?.('playerJoined', handlePlayerJoined);
      socketClient.off?.('playerLeft', handlePlayerLeft);
      socketClient.off?.('gameStarted');
      socketClient.off?.('error');
    };
  }, [socketClient, roomId, storagePrefix, navigate]);

  useEffect(() => {
    if (!socketClient || !playerName) return;

    const sessionPlayerId = typeof window !== 'undefined' ? sessionStorage.getItem(sessionKeys.id) : null;
    const knownPlayerId = playerId || sessionPlayerId;
    const isLikelyHost = location.state?.isHost || sessionStorage.getItem(sessionKeys.role) === 'host';

    if (isLikelyHost && !knownPlayerId && !stateRequestedRef.current) {
      stateRequestedRef.current = true;
      setIsJoining(true);
      socketClient.emit?.('requestRoomState', { roomId }, (response) => {
        if (!response?.room) {
          setError('Room not found');
          setIsJoining(false);
          return;
        }

        const inferredHost = response.room.host?.id === knownPlayerId || isLikelyHost;
        setRoomData(response.room);
        setPlayers(response.room.players || []);
        setIsHost(inferredHost);

        if (response.room.host?.id) {
          setPlayerId(response.room.host.id);
          persistPlayerMeta({ playerId: response.room.host.id, isHost: inferredHost });
        }

        setIsJoining(false);
        navigateToGame(response.room);
      });
      return;
    }

    if (joinAttemptedRef.current) return;
    joinAttemptedRef.current = true;
    setIsJoining(true);

    const joinPayload = { roomId, playerName };
    if (knownPlayerId) {
      joinPayload.playerId = knownPlayerId;
    }

    socketClient.emit?.('joinRoom', joinPayload, (response) => {
      if (!response?.success) {
        joinAttemptedRef.current = false;
        setError(response?.message || 'Failed to join room');
        setIsJoining(false);
        return;
      }

      const isHostPlayer = response.player?.id === response.room.host.id;
      setRoomData(response.room);
      setPlayers(response.room.players || []);
      setIsHost(isHostPlayer);

      if (response.player) {
        setPlayerId(response.player.id);
        persistPlayerMeta({
          playerId: response.player.id,
          playerName: response.player.name,
          isHost: isHostPlayer,
        });
      } else {
        persistPlayerMeta({ playerName, isHost: isHostPlayer });
      }

      setIsJoining(false);
      navigateToGame(response.room);
    });
  }, [socketClient, roomId, playerName, playerId, sessionKeys, location.state?.isHost]);

  useEffect(() => {
    if (gameStarted) {
      navigateToGame(roomData);
    }
  }, [gameStarted, roomData]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!pendingName.trim()) return;
    const name = pendingName.trim();
    setPlayerName(name);
    persistPlayerMeta({ playerName: name, isHost });
  };

  const startGame = () => {
    if (!socketClient || players.length < 2) return;
    socketClient.emit?.('startGame', { roomId }, (response) => {
      if (!response?.success) {
        alert(response?.message || 'Unable to start game yet');
        return;
      }
      setGameStarted(true);
      navigate(`/game/${roomId}`);
    });
  };

  const leaveRoom = () => {
    if (socketClient) {
      socketClient.emit?.('leaveRoom', { roomId, playerId });
    }
    sessionStorage.removeItem(sessionKeys.name);
    sessionStorage.removeItem(sessionKeys.id);
    sessionStorage.removeItem(sessionKeys.role);
    navigate('/');
  };

  if (!playerName && !error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Enter your name to join</h1>
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <input
            type="text"
            value={pendingName}
            onChange={(e) => setPendingName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (gameStarted) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Room: {roomData?.name}</h1>
              <button
                onClick={leaveRoom}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Leave Room
              </button>
            </div>
            
            <div className="flex gap-8">
              <div className="flex-1">
                <ChessBoard />
              </div>
              
              <div className="w-64 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Players</h3>
                  <div className="space-y-2">
                    {players.map((player, index) => (
                      <div key={player.id} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-white border-2 border-black' : 'bg-black'}`} />
                        <span>{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Timer roomId={roomId} initialTime={roomData?.timeControl * 60 || 600} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Room Lobby</h1>
        <p className="text-gray-600">Room ID: <span className="font-mono font-bold">{roomId?.toUpperCase()}</span></p>
        <p className="text-gray-600">{roomData?.name}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Players ({players.length}/2)</h3>
        <div className="space-y-2">
          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Waiting for players...</p>
          ) : (
            players.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-white border-2 border-black' : 'bg-black'}`} />
                  <span className="font-medium">{player.name}</span>
                  {player.id === playerId && <span className="text-xs text-blue-600">(You)</span>}
                </div>
                <span className="text-sm text-gray-500">
                  {index === 0 ? 'White' : 'Black'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isHost && players.length === 2 && (
          <button
            onClick={startGame}
            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
          >
            Start Game
          </button>
        )}
        
        {!isHost && players.length === 1 && (
          <p className="text-center text-gray-500 py-2">
            Waiting for host to start the game...
          </p>
        )}
        
        {players.length < 2 && (
          <p className="text-center text-gray-500 py-2">
            Waiting for {2 - players.length} more player{2 - players.length > 1 ? 's' : ''}...
          </p>
        )}

        <button
          onClick={leaveRoom}
          className="w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default RoomLobby;
