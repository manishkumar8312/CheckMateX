import React from 'react';

const TimeSelector = ({ currentTime, onTimeChange }) => {
  const timeControls = [
    { value: 1, label: '1 min', category: 'Bullet' },
    { value: 3, label: '3 min', category: 'Blitz' },
    { value: 5, label: '5 min', category: 'Blitz' },
    { value: 10, label: '10 min', category: 'Rapid' },
    { value: 15, label: '15 min', category: 'Rapid' },
    { value: 30, label: '30 min', category: 'Classical' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Time Control</h3>
      <div className="grid grid-cols-3 gap-3">
        {timeControls.map((tc) => (
          <button
            key={tc.value}
            onClick={() => onTimeChange(tc.value)}
            className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors
              ${currentTime === tc.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            {tc.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSelector;
