// No need for node-fetch in Node 18+

class ChessAiService {
  /**
   * Get the next best move from the Chess-API.com (Stockfish-powered)
   * @param {string} fen Current board state in FEN format
   * @param {number} difficulty Level of AI (0-3 for some APIs, or depth)
   * @returns {Promise<Object>} The move in { from, to, promotion } format
   */
  async getNextMove(fen, difficulty = 1) {
    try {
      console.log('[AI] Requesting move for FEN from stockfish.online:', fen);
      
      const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=10`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[AI] Received data:', data);

      if (!data.success || !data.bestmove) {
        throw new Error('AI API returned unsuccessful response');
      }

      // bestmove is usually in format "bestmove e2e4 ..." or just "e2e4"
      const bestMoveStr = data.bestmove.replace('bestmove ', '').split(' ')[0];
      const from = bestMoveStr.substring(0, 2);
      const to = bestMoveStr.substring(2, 4);
      const promotion = bestMoveStr.length > 4 ? bestMoveStr[4] : 'q';

      console.log('[AI] Parsed move:', { from, to, promotion });

      return {
        fromSquare: from,
        toSquare: to,
        promotion: promotion
      };
    } catch (error) {
      console.error('[AI] Failed to get move:', error);
      throw error;
    }
  }
}

export default new ChessAiService();
