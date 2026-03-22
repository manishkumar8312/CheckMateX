import { timerService } from '../services/index.js';
import { handleTimerExpired } from '../controllers/gameController.js';

const expirationListeners = new Map();

export const registerTimerSocket = (io, socket) => {
  if (!socket.data) {
    socket.data = {};
  }
  if (!socket.data.timerSubscriptions) {
    socket.data.timerSubscriptions = new Map();
  }

  const emitStatus = (roomId) => {
    const status = timerService.getTimerStatus(roomId);
    if (status) {
      io.to(roomId).emit('timerUpdate', { roomId, ...status });
    }
  };

  socket.on('subscribeTimer', ({ roomId }, callback) => {
    try {
      if (!roomId) throw new Error('Room ID required');

      // Add a room-level expiration listener if it doesn't exist
      if (!expirationListeners.has(roomId)) {
        const expirationUnsubscribe = timerService.onTick(roomId, (status) => {
          if (status.timeout) {
            try {
              const result = handleTimerExpired({
                roomId,
                color: status.winner === 'white' ? 'black' : 'white'
              });
              io.to(roomId).emit('gameEnded', result.gameResult);

              // Stop this listener once game ends
              const unsub = expirationListeners.get(roomId);
              if (unsub) unsub();
              expirationListeners.delete(roomId);
            } catch (err) {
              console.error('Error handling timer expiration:', err);
            }
          }
        });
        expirationListeners.set(roomId, expirationUnsubscribe);
      }

      const unsubscribe = timerService.onTick(roomId, (status) => {
        io.to(roomId).emit('timerUpdate', { roomId, ...status });
      });
      socket.data.timerSubscriptions.set(roomId, unsubscribe);
      socket.join(roomId);
      emitStatus(roomId);
      callback?.({ success: true });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('unsubscribeTimer', ({ roomId }, callback) => {
    const unsubscribe = socket.data.timerSubscriptions.get(roomId);
    if (unsubscribe) {
      unsubscribe();
      socket.data.timerSubscriptions.delete(roomId);
    }
    socket.leave(roomId);
    callback?.({ success: true });
  });

  socket.on('timerAction', ({ roomId, action, color, seconds }, callback) => {
    try {
      switch (action) {
        case 'pause':
          timerService.pauseTimer(roomId);
          break;
        case 'resume':
          timerService.resumeTimer(roomId, color || 'white');
          break;
        case 'switch':
          timerService.switchTimer(roomId, color || 'white');
          break;
        case 'addTime':
          timerService.addTime(roomId, color || 'white', seconds || 0);
          break;
        default:
          throw new Error('Unknown timer action');
      }
      emitStatus(roomId);
      callback?.({ success: true, status: timerService.getTimerStatus(roomId) });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('disconnect', () => {
    socket.data.timerSubscriptions.forEach((unsubscribe) => unsubscribe());
    socket.data.timerSubscriptions.clear();
  });
};
