import React, { useState, useEffect } from 'react';
import { useSocket } from '../../socket/socket';

const Timer = ({ roomId, initialTime = 600, currentPlayer = 'white' }) => {
  const socket = useSocket();
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [isWhiteTimerRunning, setIsWhiteTimerRunning] = useState(false);
  const [isBlackTimerRunning, setIsBlackTimerRunning] = useState(false);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Subscribe to timer updates
    socket.emit('subscribeTimer', { roomId });

    // Listen for timer updates from backend
    const handleTimerUpdate = (data) => {
      if (data.roomId === roomId) {
        setWhiteTime(data.whiteTime);
        setBlackTime(data.blackTime);
        setIsWhiteTimerRunning(data.isWhiteTimerRunning);
        setIsBlackTimerRunning(data.isBlackTimerRunning);
      }
    };

    socket.on('timerUpdate', handleTimerUpdate);

    return () => {
      socket.off('timerUpdate', handleTimerUpdate);
      socket.emit('unsubscribeTimer', { roomId });
    };
  }, [socket, roomId]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (time, isRunning) => {
    if (time <= 10) return 'text-red-600 animate-pulse';
    if (time <= 30) return 'text-orange-500';
    if (isRunning) return 'text-green-600';
    return 'text-gray-800';
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 rounded-lg shadow-md">
      <div className="flex space-x-8">
        {/* White Timer */}
        <div className={`text-center ${currentPlayer === 'white' ? 'ring-2 ring-blue-500 rounded-lg p-2' : ''}`}>
          <div className="text-sm font-medium text-gray-600 mb-1">White</div>
          <div className={`text-3xl font-mono font-bold ${getTimeColor(whiteTime, isWhiteTimerRunning)}`}>
            {formatTime(whiteTime)}
          </div>
        </div>

        {/* Black Timer */}
        <div className={`text-center ${currentPlayer === 'black' ? 'ring-2 ring-blue-500 rounded-lg p-2' : ''}`}>
          <div className="text-sm font-medium text-gray-600 mb-1">Black</div>
          <div className={`text-3xl font-mono font-bold ${getTimeColor(blackTime, isBlackTimerRunning)}`}>
            {formatTime(blackTime)}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        {isWhiteTimerRunning && "White's turn"}
        {isBlackTimerRunning && "Black's turn"}
        {!isWhiteTimerRunning && !isBlackTimerRunning && "Timer paused"}
      </div>
    </div>
  );
};

export default Timer;
