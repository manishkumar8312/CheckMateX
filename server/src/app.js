import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/socket.js';

const app = express();

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
