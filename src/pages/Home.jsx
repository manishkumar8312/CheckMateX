import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CreateRoom from '../components/Room/CreateRoom';
import JoinRoom from '../components/Room/JoinRoom';
import ThemeSelector from '../components/Controls/ThemeSelector';

const Home = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('chessTheme') || 'classic');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('chessTheme', newTheme);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 flex flex-col items-center">
          <div className="mb-4 inline-flex items-center justify-center space-x-4">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg border border-blue-400/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                <path d="M5 19h14v2H5z" />
                <path d="M19 17 22 7l-5 3-5-6-5 6-5-3 3 10zm-14 0h14" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
              CheckMate<span className="text-blue-600">X</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">
            Play chess online with friends in real-time
          </p>
        </header>

        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 w-full">
              <CreateRoom />
            </div>
            <div className="flex-1 w-full">
              <JoinRoom />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ThemeSelector
                currentTheme={theme}
                onThemeChange={handleThemeChange}
              />
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="text-blue-500 mr-2">ℹ️</span> How to Play
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">1.</span>
                    <p>Create a room or join an existing one using a room code</p>
                  </div>
                  <div className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">2.</span>
                    <p>Wait for another player to join (2 players required)</p>
                  </div>
                  <div className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">3.</span>
                    <p>Start playing chess with real-time moves</p>
                  </div>
                  <div className="flex items-start">
                    <span className="font-bold text-blue-600 mr-2">4.</span>
                    <p>Use the timer to add competitive pressure</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="text-green-500 mr-2">✨</span> Features
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Real-time multiplayer gameplay
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Multiple time controls
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Beautiful board themes
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Move validation
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Check and checkmate detection
                  </li>
                  <li className="flex items-center text-blue-600 font-bold">
                    <span className="text-blue-500 mr-2">★</span>
                    NEW: Play with AI (Stockfish)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-12 text-gray-600">
          <p>&copy; 2024 CheckMateX. Built with React and Socket.io</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
