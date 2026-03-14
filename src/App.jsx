import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSocket } from './socket/socket';
import Home from './pages/Home';
import Game from './pages/Game';
import RoomLobby from './components/Room/RoomLobby';
import NotFound from './pages/NotFound';

function App() {
  const { connect } = useSocket();

  React.useEffect(() => {
    connect();
  }, [connect]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<RoomLobby />} />
          <Route path="/game/:roomId" element={<Game />} />
          <Route path="/create-room" element={<Home />} />
          <Route path="/join-room" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;