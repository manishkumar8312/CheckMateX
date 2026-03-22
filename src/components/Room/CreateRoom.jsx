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

  const timeOptions = [
    { value: '1', label: '1 min' },
    { value: '3', label: '3 min' },
    { value: '5', label: '5 min' },
    { value: '10', label: '10 min' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || !playerName.trim()) {
      alert('Please enter both room name and your name');
      return;
    }

    setIsCreating(true);

    setTimeout(() => {
      try {
        socket.connect?.();
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
    }, 1000); // slightly faster artificial delay
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden h-full">
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

        <label 
          className={`group flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
            isAiOpponent 
              ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' 
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              isAiOpponent ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:text-blue-500'
            }`}>
              🤖
            </div>
            <div>
              <div className="text-sm font-semibold">Play with AI</div>
              <div className={`text-xs ${isAiOpponent ? 'text-blue-600/80' : 'text-gray-500'}`}>
                Practice against Stockfish
              </div>
            </div>
          </div>
          <div className="relative">
            <div className={`block w-10 h-6 rounded-full transition-colors ${
              isAiOpponent ? 'bg-blue-500' : 'bg-gray-300'
            }`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
              isAiOpponent ? 'translate-x-4' : ''
            }`}></div>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={isAiOpponent}
            onChange={(e) => setIsAiOpponent(e.target.checked)}
          />
        </label>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Room'}
        </button>
      </form>
      {isCreating && <LoadingOverlay message="Setting up the board..." />}
    </div>
  );
};

export default CreateRoom;
