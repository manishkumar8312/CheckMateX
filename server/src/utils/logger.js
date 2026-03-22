import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'ai_debug.log');

export const aiLog = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
};
