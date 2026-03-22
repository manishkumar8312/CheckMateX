import React from 'react';

const LoadingOverlay = ({ message = 'Preparing your board...' }) => {
  console.log('[FRONTEND] LoadingOverlay rendered with message:', message);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="text-center p-10 rounded-3xl bg-gray-900/80 border border-white/10 shadow-2xl scale-110">
        <div className="relative mb-6">
          {/* Outer spinning ring */}
          <div className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin-slow"></div>
          
          {/* Inner pulsing chess piece (SVG King) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-blue-500 animate-chess-pulse" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M19,10H17.42C16.89,8.27 15.3,7 13.41,7C14.07,6.33 14.5,5.43 14.5,4.5C14.5,2.57 12.93,1 11,1C9.07,1 7.5,2.57 7.5,4.5C7.5,5.43 7.93,6.33 8.59,7C6.7,7 5.11,8.27 4.58,10H3A1,1 0 0,0 2,11V12A1,1 0 0,0 3,13H4.11C4.6,15.61 6.33,17.7 8.68,18.5L8.1,21H7A1,1 0 0,0 6,22V23H18V22A1,1 0 0,0 17,21H15.9L15.32,18.5C17.67,17.7 19.4,15.61 19.89,13H21A1,1 0 0,0 22,12V11A1,1 0 0,0 21,10M11,3C11.83,3 12.5,3.67 12.5,4.5C12.5,5.33 11.83,6 11,6C10.17,6 9.5,5.33 9.5,4.5C9.5,3.67 10.17,3 11,3M11,8.5C12.65,8.5 14,9.85 14,11.5H8C8,9.85 9.35,8.5 11,8.5M10.22,21H13.78L14.24,23H9.76L10.22,21M13.66,16.63C13.24,16.87 12.75,17 12.25,17H11.75C11.25,17 10.76,16.87 10.34,16.63C8.42,15.82 7,13.84 7,11.5H8C8,13.16 9.34,14.5 11,14.5H13C14.66,14.5 16,13.16 16,11.5H17C17,13.84 15.58,15.82 13.66,16.63Z" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-white tracking-wide animate-pulse">
          {message}
        </h3>
        <p className="text-blue-200/70 text-sm mt-2">
          Almost there...
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
