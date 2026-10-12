import { Issue } from '../models/Issue.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populated = (query) => query.populate('reporter', 'name email role avatar').populate('assignedOfficer', 'name email department').populate('comments.author', 'name role avatar');
const serialize = (issue, viewerId) => {
  const value = issue.toJSON();
  value.isEndorsed = issue.upvotes.some((id) => id.toString() === viewerId?.toString());
  value.commentsCount = issue.comments.length;
  value.reporterName = issue.reporter?.name || '';
  value.thumbnail = issue.images?.[0] || '';
  value.upvotes = issue.upvotes.length;
  return value;
};

export const listIssues = asyncHandler(async (req, res) => {
  const { status, category, ward, mine, assigned, search, page = '1', limit = '20' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (ward) filter.ward = ward;
  if (mine === 'true') filter.reporter = req.user._id;
  if (assigned === 'true') filter.assignedOfficer = req.user._id;
  if (req.user.role === 'citizen') {
    // Citizens may see the public issue stream and their own reports, but never internal rejected drafts from other users.
    filter.$or = [{ status: { $ne: 'Rejected' } }, { reporter: req.user._id }];
  }
  if (search) filter.$and = [...(filter.$and || []), { $or: ['title', 'description', 'location', 'ticketId'].map((field) => ({ [field]: { $regex: String(search).slice(0, 100), $options: 'i' } })) }];
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
  const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const [issues, total] = await Promise.all([
    populated(Issue.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit)),
    Issue.countDocuments(filter),
  ]);
  res.json({ success: true, data: issues.map((issue) => serialize(issue, req.user._id)), pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } });
});

import mongoose from 'mongoose';

const findIssueByIdOrTicket = async (idParam) => {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const doc = await Issue.findById(idParam);
    if (doc) return doc;
  }
  return Issue.findOne({ ticketId: idParam });
};

export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError(400, 'Please upload at least one image file.');
  }
  const urls = req.files.map((file) => `/uploads/${file.filename}`);
  res.status(201).json({ success: true, urls, data: urls });
});

export const getIssue = asyncHandler(async (req, res) => {
  const query = mongoose.Types.ObjectId.isValid(req.params.id)
    ? Issue.findById(req.params.id)
    : Issue.findOne({ ticketId: req.params.id });
  const issue = await populated(query);
  if (!issue) throw new AppError(404, 'Issue not found.');
  if (req.user.role === 'citizen' && issue.status === 'Rejected' && issue.reporter._id.toString() !== req.user.id) throw new AppError(404, 'Issue not found.');
  res.json({ success: true, data: serialize(issue, req.user._id) });
});

export const createIssue = asyncHandler(async (req, res) => {
  const { title, description, category, priority = 'MEDIUM', location, address, ward = '', lat, lng, images = [] } = req.body;
  if (!title || !description || !category || !(location || address)) throw new AppError(400, 'Title, description, category and location are required.');
  if (!Array.isArray(images) || images.length > 8) throw new AppError(400, 'Provide at most 8 image URLs.');
  const issue = await Issue.create({ title, description, category, priority, location: location || address, ward, lat, lng, images, reporter: req.user._id, statusHistory: [{ status: 'Pending', changedBy: req.user._id, note: 'Issue submitted by citizen.' }] });
  
  // Award citizen reward points for filing legitimate issue (+25 points)
  await User.findByIdAndUpdate(req.user._id, { $inc: { points: 25 } });

  res.status(201).json({ success: true, message: 'Issue submitted successfully.', data: await populated(Issue.findById(issue._id)).then((doc) => serialize(doc, req.user._id)) });
});

export const updateIssueStatus = asyncHandler(async (req, res) => {
  const { status, note = '', rejectionReason = '', assignedOfficerId, assignedDepartment, resolutionEvidence } = req.body;
  const allowed = ['Pending', 'Verified', 'Assigned', 'In Progress', 'Inspection', 'Resolved', 'Escalated', 'Rejected'];
  if (!allowed.includes(status)) throw new AppError(400, 'Invalid issue status.');
  const issue = await findIssueByIdOrTicket(req.params.id);
  if (!issue) throw new AppError(404, 'Issue not found.');
  if (req.user.role === 'officer' && (!issue.assignedOfficer || issue.assignedOfficer.toString() !== req.user.id)) throw new AppError(403, 'Officers can only update issues assigned to them.');
  if (req.user.role === 'officer' && !['In Progress', 'Inspection', 'Resolved', 'Escalated'].includes(status)) throw new AppError(403, 'Officers cannot perform this status transition.');
  if (status === 'Rejected' && !String(rejectionReason).trim()) throw new AppError(400, 'A rejection reason is required.');
  if (status === 'Assigned' && assignedOfficerId) {
    const officer = await User.findOne({ _id: assignedOfficerId, role: 'officer', isActive: true });
    if (!officer) throw new AppError(400, 'Choose an active officer account.');
    issue.assignedOfficer = officer._id;
  }
  if (assignedDepartment !== undefined) issue.assignedDepartment = String(assignedDepartment).trim();
  if (status === 'Rejected') issue.rejectionReason = String(rejectionReason).trim();
  if (status === 'Resolved') {
    if (Array.isArray(resolutionEvidence)) issue.resolutionEvidence = resolutionEvidence.slice(0, 8);
    issue.resolvedAt = new Date();
  }
  issue.status = status;
  issue.statusHistory.push({ status, changedBy: req.user._id, note: String(note).trim() });
  await issue.save();
  const recipientIds = new Set([issue.reporter.toString()]);
  if (issue.assignedOfficer) recipientIds.add(issue.assignedOfficer.toString());
  await Notification.insertMany([...recipientIds].filter((id) => id !== req.user.id).map((recipient) => ({ recipient, title: `Issue ${issue.ticketId} updated`, message: `Status changed to ${status}.${note ? ` ${note}` : ''}`, category: status === 'Resolved' ? 'RESOLVED' : status === 'Assigned' ? 'ASSIGNED' : status === 'Inspection' ? 'INSPECTION' : status === 'Verified' ? 'VERIFIED' : 'ALERT', issue: issue._id })));
  res.json({ success: true, message: 'Issue status updated.', data: await populated(Issue.findById(issue._id)).then((doc) => serialize(doc, req.user._id)) });
});

export const assignIssue = asyncHandler(async (req, res) => {
  const { officerId, department = '' } = req.body;
  const officer = await User.findOne({ _id: officerId, role: 'officer', isActive: true });
  if (!officer) throw new AppError(400, 'Choose an active officer account.');
  const issue = await findIssueByIdOrTicket(req.params.id);
  if (!issue) throw new AppError(404, 'Issue not found.');
  issue.assignedOfficer = officer._id;
  issue.assignedDepartment = String(department || officer.department || '').trim();
  issue.status = 'Assigned';
  issue.statusHistory.push({ status: 'Assigned', changedBy: req.user._id, note: 'Assigned by administrator.' });
  await issue.save();
  await Notification.create({ recipient: officer._id, title: 'New issue assigned', message: `You have been assigned ${issue.ticketId}: ${issue.title}`, category: 'ASSIGNED', issue: issue._id });
  await Notification.create({ recipient: issue.reporter, title: 'Your issue has been assigned', message: `${issue.ticketId} has been assigned to a municipal officer.`, category: 'ASSIGNED', issue: issue._id });
  res.json({ success: true, message: 'Issue assigned.', data: await populated(Issue.findById(issue._id)).then((doc) => serialize(doc, req.user._id)) });
});

export const addComment = asyncHandler(async (req, res) => {
  const text = String(req.body.text || '').trim();
  if (text.length < 1 || text.length > 2000) throw new AppError(400, 'Comment must contain 1–2000 characters.');
  const issue = await findIssueByIdOrTicket(req.params.id);
  if (!issue) throw new AppError(404, 'Issue not found.');
  issue.comments.push({ author: req.user._id, text });
  await issue.save();
  const recipients = new Set([issue.reporter.toString(), ...(issue.assignedOfficer ? [issue.assignedOfficer.toString()] : [])]);
  await Notification.insertMany([...recipients].filter((id) => id !== req.user.id).map((recipient) => ({ recipient, title: 'New issue comment', message: `A comment was added to ${issue.ticketId}.`, category: 'COMMENT', issue: issue._id })));
  res.status(201).json({ success: true, data: await populated(Issue.findById(issue._id)).then((doc) => serialize(doc, req.user._id)) });
});

export const toggleUpvote = asyncHandler(async (req, res) => {
  const issue = await findIssueByIdOrTicket(req.params.id);
  if (!issue) throw new AppError(404, 'Issue not found.');
  const index = issue.upvotes.findIndex((id) => id.toString() === req.user.id);
  if (index >= 0) issue.upvotes.splice(index, 1); else issue.upvotes.push(req.user._id);
  await issue.save();
  res.json({ success: true, upvoted: index < 0, upvotes: issue.upvotes.length });
});

export const listOfficers = asyncHandler(async (_req, res) => {
  const officers = await User.find({ role: 'officer', isActive: true }).select('name email department district');
  res.json({ success: true, data: officers });
});

export const dashboardStats = asyncHandler(async (req, res) => {
  const base = req.user.role === 'citizen' ? { reporter: req.user._id } : req.user.role === 'officer' ? { assignedOfficer: req.user._id } : {};
  const [total, pending, inProgress, resolved, byCategory] = await Promise.all([
    Issue.countDocuments(base), Issue.countDocuments({ ...base, status: { $in: ['Pending', 'Verified'] } }),
    Issue.countDocuments({ ...base, status: { $in: ['Assigned', 'In Progress', 'Inspection'] } }),
    Issue.countDocuments({ ...base, status: 'Resolved' }),
    Issue.aggregate([{ $match: base.reporter || base.assignedOfficer ? base : {} }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);
  res.json({ success: true, data: { total, pending, inProgress, resolved, byCategory } });
});
