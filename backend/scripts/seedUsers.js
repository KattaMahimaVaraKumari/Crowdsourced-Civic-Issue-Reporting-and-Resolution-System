import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/db.js';
import { User } from '../src/models/User.js';

if (process.env.SEED_DEMO_USERS !== 'true') {
  console.error('Seeding is disabled. Set SEED_DEMO_USERS=true in backend/.env intentionally before running this script.');
  process.exit(1);
}
if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_OFFICER_PASSWORD) {
  console.error('Set SEED_ADMIN_PASSWORD and SEED_OFFICER_PASSWORD before seeding.');
  process.exit(1);
}
try {
  await connectDatabase();
  const seeds = [
    { name: process.env.SEED_ADMIN_NAME || 'CivicTrack Admin', email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, role: 'admin' },
    { name: process.env.SEED_OFFICER_NAME || 'Demo Officer', email: process.env.SEED_OFFICER_EMAIL, password: process.env.SEED_OFFICER_PASSWORD, role: 'officer', department: 'Public Works' },
  ];
  for (const seed of seeds) {
    if (!seed.email) throw new Error(`Email missing for ${seed.role}`);
    const email = seed.email.toLowerCase().trim();
    const existing = await User.findOne({ email }).select('+passwordHash');
    const passwordHash = await User.hashPassword(seed.password);
    if (existing) { existing.name = seed.name; existing.role = seed.role; existing.passwordHash = passwordHash; existing.isActive = true; if (seed.department) existing.department = seed.department; await existing.save(); }
    else await User.create({ name: seed.name, email, passwordHash, role: seed.role, department: seed.department || '' });
    console.log(`Seeded ${seed.role}: ${email}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
