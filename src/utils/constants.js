export const PIECES = {
  WHITE: {
    KING: 'K',
    QUEEN: 'Q',
    ROOK: 'R',
    BISHOP: 'B',
    KNIGHT: 'N',
    PAWN: 'P'
  },
  BLACK: {
    KING: 'k',
    QUEEN: 'q',
    ROOK: 'r',
    BISHOP: 'b',
    KNIGHT: 'n',
    PAWN: 'p'
  }
};

export const BOARD_SIZE = 8;

export const INITIAL_BOARD = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

export const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  PAUSED: 'paused',
  ENDED: 'ended'
};

export const GAME_RESULTS = {
  WHITE_WINS: 'white_wins',
  BLACK_WINS: 'black_wins',
  DRAW: 'draw',
  STALEMATE: 'stalemate'
};

export const TIME_CONTROLS = {
  BULLET: { name: 'Bullet', times: [1, 2] },
  BLITZ: { name: 'Blitz', times: [3, 5] },
  RAPID: { name: 'Rapid', times: [10, 15] },
  CLASSICAL: { name: 'Classical', times: [30, 60] }
};

export const THEMES = {
  CLASSIC: 'classic',
  WOOD: 'wood',
  DARK: 'dark'
};
