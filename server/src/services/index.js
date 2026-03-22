import RoomService from './roomService.js';
import TimerService from './timerService.js';
import ChessService from './chessService.js';
import chessAiService from './chessAiService.js';

export const roomService = new RoomService();
export const timerService = new TimerService();
export const chessService = new ChessService();
export { chessAiService };
