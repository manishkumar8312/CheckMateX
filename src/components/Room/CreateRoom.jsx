import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../socket/socket';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [timeControl, setTimeControl] = useState('10');
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
    
    try {
      socket.connect?.();
      socket.emit('createRoom', {
        roomName,
        playerName,
        timeControl: parseInt(timeControl, 10)
      }, (response) => {
        if (!response?.success) {
          alert(response?.message || 'Failed to create room. Please try again.');
          setIsCreating(false);
          return;
        }

        const createdRoom = response.room;
        navigate(`/room/${createdRoom.id}`, {
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
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
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

        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;
