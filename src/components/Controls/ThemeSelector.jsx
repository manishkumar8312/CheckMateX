import React from 'react';

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const themes = [
    { id: 'classic', name: 'Classic', description: 'Traditional chess board colors', icon: '♟️' },
    { id: 'wood', name: 'Wood', description: 'Wooden board aesthetic', icon: '🪵' },
    { id: 'dark', name: 'Dark', description: 'Dark theme for night play', icon: '🌙' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Board Theme</h3>
      <div className="space-y-3">
        {themes.map((theme) => (
          <label
            key={theme.id}
            className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
              currentTheme === theme.id ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="theme"
              value={theme.id}
              checked={currentTheme === theme.id}
              onChange={(e) => onThemeChange(e.target.value)}
              className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="text-2xl mr-4">{theme.icon}</div>
            <div>
              <div className="font-medium text-gray-800">{theme.name}</div>
              <div className="text-sm text-gray-500">{theme.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
