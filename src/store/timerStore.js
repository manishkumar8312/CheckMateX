import { create } from 'zustand';

export const useTimerStore = create((set, get) => ({
  whiteTime: 600,
  blackTime: 600,
  isWhiteTimerRunning: false,
  isBlackTimerRunning: false,
  isPaused: false,
  
  setWhiteTime: (time) => set({ whiteTime: time }),
  
  setBlackTime: (time) => set({ blackTime: time }),
  
  startWhiteTimer: () => set({
    isWhiteTimerRunning: true,
    isBlackTimerRunning: false,
    isPaused: false
  }),
  
  startBlackTimer: () => set({
    isWhiteTimerRunning: false,
    isBlackTimerRunning: true,
    isPaused: false
  }),
  
  pauseTimers: () => set({
    isWhiteTimerRunning: false,
    isBlackTimerRunning: false,
    isPaused: true
  }),
  
  resumeTimers: () => set({ isPaused: false }),
  
  switchTimer: (currentPlayer) => {
    if (currentPlayer === 'white') {
      set({
        isWhiteTimerRunning: true,
        isBlackTimerRunning: false
      });
    } else {
      set({
        isWhiteTimerRunning: false,
        isBlackTimerRunning: true
      });
    }
  },
  
  decrementWhiteTime: () => set((state) => ({
    whiteTime: Math.max(0, state.whiteTime - 1)
  })),
  
  decrementBlackTime: () => set((state) => ({
    blackTime: Math.max(0, state.blackTime - 1)
  })),
  
  resetTimers: (initialTime = 600) => set({
    whiteTime: initialTime,
    blackTime: initialTime,
    isWhiteTimerRunning: false,
    isBlackTimerRunning: false,
    isPaused: false
  }),
  
  setInitialTime: (time) => set({
    whiteTime: time,
    blackTime: time
  })
}));
