import React from 'react';
import { Link } from 'react-router-dom';
import CreateRoom from '../components/Room/CreateRoom';
import JoinRoom from '../components/Room/JoinRoom';
import ThemeSelector from '../components/Controls/ThemeSelector';
import TimeSelector from '../components/Controls/TimeSelector';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            ♔ CheckMateX ♚
          </h1>
          <p className="text-xl text-gray-600">
            Play chess online with friends in real-time
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <CreateRoom />
            <JoinRoom />
          </div>

          <div className="space-y-6">
            <ThemeSelector
              currentTheme="classic"
              onThemeChange={(theme) => console.log('Theme changed:', theme)}
            />
            <TimeSelector
              currentTime={10}
              onTimeChange={(time) => console.log('Time changed:', time)}
            />

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">How to Play</h3>
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
              <h3 className="text-lg font-semibold mb-4">Features</h3>
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
              </ul>
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
