import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../socket/socket';
import LoadingOverlay from '../UI/LoadingOverlay';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [timeControl, setTimeControl] = useState('10');
  const [isAiOpponent, setIsAiOpponent] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || !playerName.trim()) {
      alert('Please enter both room name and your name');
      return;
    }

    setIsCreating(true);

    // Artificial delay to show the animation
    setTimeout(() => {
      try {
        socket.connect?.();
        console.log('[CreateRoom] Emitting createRoom with:', {
          roomName,
          playerName,
          timeControl: parseInt(timeControl, 10),
          isAiOpponent
        });
        socket.emit('createRoom', {
          roomName,
          playerName,
          timeControl: parseInt(timeControl, 10),
          isAiOpponent
        }, (response) => {
          if (!response?.success) {
            alert(response?.message || 'Failed to create room. Please try again.');
            setIsCreating(false);
            return;
          }

          const createdRoom = response.room;
          const targetPath = createdRoom.isAiOpponent ? `/game/${createdRoom.id}` : `/room/${createdRoom.id}`;

          if (createdRoom.isAiOpponent && response.player) {
            const storagePrefix = `room:${createdRoom.id}`;
            sessionStorage.setItem(`${storagePrefix}:playerId`, response.player.id);
            sessionStorage.setItem(`${storagePrefix}:playerName`, response.player.name);
            sessionStorage.setItem(`${storagePrefix}:role`, 'host');
          }

          navigate(targetPath, {
            state: {
              roomName: createdRoom.name,
              playerName,
              timeControl: createdRoom.timeControl,
              isHost: true
            }
          });
          setIsCreating(false);
        });
      } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room. Please try again.');
        setIsCreating(false);
      }
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 transform rotate-45 translate-x-3 translate-y-2">
        AI READY
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">Create Room</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter room name"
            maxLength={30}
          />
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Control (minutes)
          </label>
          <select
            value={timeControl}
            onChange={(e) => setTimeControl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1 minute (Bullet)</option>
            <option value="3">3 minutes (Blitz)</option>
            <option value="5">5 minutes (Blitz)</option>
            <option value="10">10 minutes (Rapid)</option>
            <option value="15">15 minutes (Rapid)</option>
            <option value="30">30 minutes (Classical)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 py-2">
          <input
            type="checkbox"
            id="ai-toggle"
            checked={isAiOpponent}
            onChange={(e) => setIsAiOpponent(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="ai-toggle" className="text-sm font-medium text-gray-700">
            Play with AI (Stockfish)
          </label>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Room'}
        </button>
      </form>
      {isCreating && <LoadingOverlay message="Creating your room..." />}
    </div>
  );
};

export default CreateRoom;
