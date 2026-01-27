import React, { useState, useEffect } from 'react';

const Timer = ({ initialTime = 600, isActive = true, onTimeExpire }) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(isActive);

  useEffect(() => {
    let interval = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((time) => {
          if (time <= 1) {
            setIsRunning(false);
            if (onTimeExpire) {
              onTimeExpire();
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, time, onTimeExpire]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTime(initialTime);
    setIsRunning(false);
  };

  const getTimeColor = () => {
    if (time <= 10) return 'text-red-600 animate-pulse';
    if (time <= 30) return 'text-orange-500';
    return 'text-gray-800';
  };

  return (
    <div className="flex flex-col items-center space-y-2 p-4 bg-gray-100 rounded-lg shadow-md">
      <div className={`text-4xl font-mono font-bold ${getTimeColor()}`}>
        {formatTime(time)}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={toggleTimer}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
