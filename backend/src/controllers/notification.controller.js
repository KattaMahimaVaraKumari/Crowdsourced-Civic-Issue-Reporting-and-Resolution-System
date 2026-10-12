import { Notification } from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const [data, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(100).populate('issue', 'ticketId title'),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);
  res.json({ success: true, data, unreadCount });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true }, { new: true });
  if (!notification) throw new AppError(404, 'Notification not found.');
  res.json({ success: true, data: notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read.' });
});
