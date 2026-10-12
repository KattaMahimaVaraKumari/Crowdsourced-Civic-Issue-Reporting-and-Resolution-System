import { User } from '../models/User.js';
import { signAuthToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, department: user.department, district: user.district, avatar: user.avatar, points: user.points });

export const register = asyncHandler(async (req, res) => {
  const { name, fullName, email, phone = '', password, confirmPassword } = req.body;
  const cleanName = String(name || fullName || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (cleanName.length < 2) throw new AppError(400, 'Please provide your full name.');
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new AppError(400, 'Please provide a valid email address.');
  if (typeof password !== 'string' || password.length < 10 || password.length > 128) throw new AppError(400, 'Password must be between 10 and 128 characters.');
  if (confirmPassword !== undefined && password !== confirmPassword) throw new AppError(400, 'Passwords do not match.');
  if (await User.exists({ email: cleanEmail })) throw new AppError(409, 'An account with this email already exists.');
  // Public registration is citizen-only; staff accounts must be provisioned by an administrator.
  const user = await User.create({ name: cleanName, email: cleanEmail, phone: String(phone).trim(), passwordHash: await User.hashPassword(password), role: 'citizen' });
  setAuthCookie(res, signAuthToken(user));
  res.status(201).json({ success: true, message: 'Account created successfully.', user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = req.body.password;
  if (!email || typeof password !== 'string') throw new AppError(400, 'Email and password are required.');
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) throw new AppError(401, 'Invalid email or password.');
  if (!user.isActive) throw new AppError(403, 'This account has been disabled. Contact an administrator.');
  user.lastLoginAt = new Date();
  await user.save();
  setAuthCookie(res, signAuthToken(user));
  res.json({ success: true, message: 'Login successful.', user: publicUser(user) });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

export const leaderboard = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: 'citizen', isActive: true })
    .select('name email avatar points district createdAt')
    .sort({ points: -1 })
    .limit(50);
  const data = users.map((u, idx) => ({
    id: u.id,
    rank: idx + 1,
    name: u.name,
    avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    ward: u.district || 'Ward 4 - Central',
    badgeId: `CT-${u.id.slice(-4).toUpperCase()}`,
    tier: u.points >= 500 ? 'Platinum Guardian' : u.points >= 300 ? 'Gold Sentinel' : u.points >= 150 ? 'Silver Watcher' : 'Bronze Scout',
    points: u.points || 0,
    issuesReported: Math.max(1, Math.round((u.points || 10) / 15)),
    issuesResolved: Math.max(0, Math.round((u.points || 10) / 25)),
  }));
  res.json({ success: true, data });
});
