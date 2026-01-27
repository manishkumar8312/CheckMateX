import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </Link>
          
          <div className="text-sm text-gray-500">
            Or try one of these links:
          </div>
          
          <div className="flex justify-center space-x-4 text-sm">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Home
            </Link>
            <Link
              to="/create-room"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Create Room
            </Link>
            <Link
              to="/join-room"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Join Room
            </Link>
          </div>
        </div>

        <div className="mt-12 text-gray-400">
          <p className="text-6xl">♔ ♚</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
