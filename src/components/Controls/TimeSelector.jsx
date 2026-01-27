import React from 'react';

const TimeSelector = ({ currentTime, onTimeChange }) => {
  const timeControls = [
    { value: 1, label: '1 min', category: 'Bullet' },
    { value: 2, label: '2 min', category: 'Bullet' },
    { value: 3, label: '3 min', category: 'Blitz' },
    { value: 5, label: '5 min', category: 'Blitz' },
    { value: 10, label: '10 min', category: 'Rapid' },
    { value: 15, label: '15 min', category: 'Rapid' },
    { value: 30, label: '30 min', category: 'Classical' },
    { value: 60, label: '60 min', category: 'Classical' }
  ];

  const categories = [...new Set(timeControls.map(tc => tc.category))];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">Time Control</h3>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
            <div className="grid grid-cols-2 gap-2">
              {timeControls
                .filter((tc) => tc.category === category)
                .map((timeControl) => (
                  <label
                    key={timeControl.value}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      currentTime === timeControl.value
                        ? 'bg-blue-500 text-white border-blue-600'
                        : 'hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeControl"
                      value={timeControl.value}
                      checked={currentTime === timeControl.value}
                      onChange={(e) => onTimeChange(parseInt(e.target.value))}
                      className="sr-only"
                    />
                    <span className="font-medium">{timeControl.label}</span>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSelector;
