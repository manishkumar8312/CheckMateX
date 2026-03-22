import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../UI/LoadingOverlay';

const JoinRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId.trim() || !playerName.trim()) {
      alert('Please enter both room ID and your name');
      return;
    }

    setIsJoining(true);

    // Artificial delay to show the animation
    setTimeout(() => {
      try {
        navigate(`/room/${roomId}`, {
          state: {
            playerName,
            isHost: false
          }
        });
      } catch (error) {
        console.error('Error joining room:', error);
        alert('Failed to join room. Please check the room ID and try again.');
        setIsJoining(false);
      }
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Join Room</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room ID
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="Enter room ID"
            maxLength={7}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the 7-character room code
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>

        <button
          type="submit"
          disabled={isJoining}
          className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isJoining ? 'Joining...' : 'Join Room'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">How to join:</h3>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Get the room ID from your opponent</li>
          <li>Enter your name</li>
          <li>Click "Join Room" to enter the game</li>
        </ol>
      </div>
      {isJoining && <LoadingOverlay message="Joining the arena..." />}
    </div>
  );
};

export default JoinRoom;
