import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT || 5000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be configured with at least 32 characters. Copy .env.example to .env and set a strong secret.');
  process.exit(1);
}
try {
  await connectDatabase();
  const server = app.listen(port, () => console.log(`CivicTrack API listening on http://localhost:${port}`));
  const shutdown = async (signal) => { console.log(`${signal} received; shutting down...`); server.close(async () => { const mongoose = await import('mongoose'); await mongoose.default.disconnect(); process.exit(0); }); };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
} catch (error) {
  console.error(`Failed to start CivicTrack API: ${error.message}`);
  process.exit(1);
}
