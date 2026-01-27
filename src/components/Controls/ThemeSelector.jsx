import React from 'react';

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const themes = [
    { id: 'classic', name: 'Classic', description: 'Traditional chess board colors' },
    { id: 'wood', name: 'Wood', description: 'Wooden board aesthetic' },
    { id: 'dark', name: 'Dark', description: 'Dark theme for night play' }
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">Board Theme</h3>
      <div className="space-y-2">
        {themes.map((theme) => (
          <label
            key={theme.id}
            className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="radio"
              name="theme"
              value={theme.id}
              checked={currentTheme === theme.id}
              onChange={(e) => onThemeChange(e.target.value)}
              className="mr-3"
            />
            <div>
              <div className="font-medium">{theme.name}</div>
              <div className="text-sm text-gray-500">{theme.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
