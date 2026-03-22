class TimerService {
  constructor() {
    this.timers = new Map();
  }

  createTimer(roomId, initialTime = 600) {
    const timer = {
      roomId,
      whiteTime: initialTime,
      blackTime: initialTime,
      isWhiteTimerRunning: false,
      isBlackTimerRunning: false,
      isPaused: false,
      interval: null,
      lastUpdate: Date.now(),
      listeners: new Set()
    };

    this.timers.set(roomId, timer);
    return timer;
  }

  startTimer(roomId, color) {
    const timer = this.timers.get(roomId);
    if (!timer) {
      throw new Error('Timer not found');
    }

    // Stop any running timer
    this.stopTimer(roomId);

    if (color === 'white') {
      timer.isWhiteTimerRunning = true;
      timer.isBlackTimerRunning = false;
    } else {
      timer.isWhiteTimerRunning = false;
      timer.isBlackTimerRunning = true;
    }

    timer.isPaused = false;
    timer.lastUpdate = Date.now();

    // Start the interval
    timer.interval = setInterval(() => {
      const result = this.updateTimer(roomId);
      if (result?.timeout) {
        this.notifyListeners(roomId, { ...this.getTimerStatus(roomId), timeout: true, winner: result.winner, reason: result.reason });
      }
    }, 1000);

    return timer;
  }

  stopTimer(roomId) {
    const timer = this.timers.get(roomId);
    if (!timer) return;

    if (timer.interval) {
      clearInterval(timer.interval);
      timer.interval = null;
    }

    timer.isWhiteTimerRunning = false;
    timer.isBlackTimerRunning = false;
    timer.isPaused = true;
  }

  switchTimer(roomId, color) {
    const timer = this.timers.get(roomId);
    if (!timer) {
      throw new Error('Timer not found');
    }

    // Update the current timer before switching
    this.updateTimer(roomId);

    // Start the new timer
    this.startTimer(roomId, color);

    return timer;
  }

  updateTimer(roomId) {
    const timer = this.timers.get(roomId);
    if (!timer || timer.isPaused) return;

    const now = Date.now();
    const elapsed = Math.floor((now - timer.lastUpdate) / 1000);
    timer.lastUpdate = now;

    if (timer.isWhiteTimerRunning) {
      timer.whiteTime = Math.max(0, timer.whiteTime - elapsed);
    } else if (timer.isBlackTimerRunning) {
      timer.blackTime = Math.max(0, timer.blackTime - elapsed);
    }

    // Check for timeout
    this.notifyListeners(roomId, { ...this.getTimerStatus(roomId), timeout: false });

    if (timer.whiteTime === 0 || timer.blackTime === 0) {
      this.stopTimer(roomId);
      return {
        timeout: true,
        winner: timer.whiteTime === 0 ? 'black' : 'white',
        reason: 'Time out'
      };
    }

    return { timeout: false };
  }

  pauseTimer(roomId) {
    const timer = this.timers.get(roomId);
    if (!timer) return;

    this.updateTimer(roomId);
    timer.isPaused = true;

    if (timer.interval) {
      clearInterval(timer.interval);
      timer.interval = null;
    }

    timer.isWhiteTimerRunning = false;
    timer.isBlackTimerRunning = false;
  }

  resumeTimer(roomId, color) {
    const timer = this.timers.get(roomId);
    if (!timer) return;

    timer.isPaused = false;
    timer.lastUpdate = Date.now();
    this.startTimer(roomId, color);
  }

  resetTimer(roomId, initialTime = 600) {
    const timer = this.timers.get(roomId);
    if (!timer) {
      return this.createTimer(roomId, initialTime);
    }

    this.stopTimer(roomId);
    timer.whiteTime = initialTime;
    timer.blackTime = initialTime;
    timer.isPaused = false;
    timer.lastUpdate = Date.now();

    this.notifyListeners(roomId, { ...this.getTimerStatus(roomId), timeout: false });

    return timer;
  }

  getTimer(roomId) {
    return this.timers.get(roomId) || null;
  }

  deleteTimer(roomId) {
    const timer = this.timers.get(roomId);
    if (timer) {
      this.stopTimer(roomId);
      timer.listeners.clear();
      this.timers.delete(roomId);
    }
  }

  addTime(roomId, color, seconds) {
    const timer = this.timers.get(roomId);
    if (!timer) return;

    if (color === 'white') {
      timer.whiteTime += seconds;
    } else {
      timer.blackTime += seconds;
    }
  }

  getTimerStatus(roomId) {
    const timer = this.timers.get(roomId);
    if (!timer) return null;

    return {
      whiteTime: timer.whiteTime,
      blackTime: timer.blackTime,
      isWhiteTimerRunning: timer.isWhiteTimerRunning,
      isBlackTimerRunning: timer.isBlackTimerRunning,
      isPaused: timer.isPaused
    };
  }

  notifyListeners(roomId, payload) {
    const timer = this.timers.get(roomId);
    if (!timer) return;
    timer.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error('Timer listener error:', error);
      }
    });
  }

  onTick(roomId, listener) {
    const timer = this.timers.get(roomId);
    if (!timer) return () => { };
    timer.listeners.add(listener);
    return () => timer.listeners.delete(listener);
  }
}

export default TimerService;
