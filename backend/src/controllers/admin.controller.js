import { User } from '../models/User.js';
import { Issue } from '../models/Issue.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const filter = {};
  if (role && ['citizen', 'officer', 'admin'].includes(role)) filter.role = role;
  if (search) filter.$or = ['name', 'email', 'department'].map((field) => ({ [field]: { $regex: String(search).slice(0, 100), $options: 'i' } }));
  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).limit(250);
  res.json({ success: true, data: users });
});

export const createStaffUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department = '', district = '' } = req.body;
  if (!['officer', 'admin'].includes(role)) throw new AppError(400, 'Staff role must be officer or admin.');
  if (typeof password !== 'string' || password.length < 10) throw new AppError(400, 'Password must be at least 10 characters.');
  const user = await User.create({ name, email: String(email).trim().toLowerCase(), passwordHash: await User.hashPassword(password), role, department, district });
  res.status(201).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive, department, district, name } = req.body;
  if (req.params.id === req.user.id && isActive === false) throw new AppError(400, 'You cannot disable your own account.');
  const updates = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (department !== undefined) updates.department = String(department).trim();
  if (district !== undefined) updates.district = String(district).trim();
  if (typeof isActive === 'boolean') updates.isActive = isActive;
  if (role !== undefined) {
    if (!['citizen', 'officer', 'admin'].includes(role)) throw new AppError(400, 'Invalid role.');
    updates.role = role;
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) throw new AppError(404, 'User not found.');
  res.json({ success: true, data: user });
});

export const analytics = asyncHandler(async (_req, res) => {
  const [totalUsers, usersByRole, totalIssues, issuesByStatus, issuesByCategory, recentIssues] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Issue.countDocuments(),
    Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Issue.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Issue.find().sort({ createdAt: -1 }).limit(10).populate('reporter', 'name').select('ticketId title status priority category createdAt reporter'),
  ]);
  res.json({ success: true, data: { totalUsers, usersByRole, totalIssues, issuesByStatus, issuesByCategory, recentIssues } });
});

export const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findByIdAndDelete(req.params.id);
  if (!issue) throw new AppError(404, 'Issue not found.');
  await Notification.deleteMany({ issue: issue._id });
  res.json({ success: true, message: 'Issue deleted.' });
});
