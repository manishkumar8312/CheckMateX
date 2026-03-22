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
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Join Room</h2>
      <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Room ID
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all tracking-wider"
            placeholder="e.g. A1B2C3D"
            maxLength={7}
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Enter the 7-character room code from your friend
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isJoining}
            className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isJoining ? 'Joining Room...' : 'Join Room'}
          </button>
        </div>
      </form>
      
      {isJoining && <LoadingOverlay message="Joining the arena..." />}
    </div>
  );
};

export default JoinRoom;
