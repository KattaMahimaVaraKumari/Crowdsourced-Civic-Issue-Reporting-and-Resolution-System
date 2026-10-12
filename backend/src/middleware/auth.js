import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const cookieName = () => process.env.COOKIE_NAME || 'civictrack_token';

export const setAuthCookie = (res, token) => {
  res.cookie(cookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const clearAuthCookie = (res) => res.clearCookie(cookieName(), {
  httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
});

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[cookieName()] || (req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7) : null);
  if (!token) throw new AppError(401, 'Please log in to continue.');
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.sub).select('-passwordHash');
  if (!user || !user.isActive) throw new AppError(401, 'This account is unavailable. Please contact an administrator.');
  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError(403, 'You do not have permission to perform this action.'));
  next();
};

export const signAuthToken = (user) => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
});
