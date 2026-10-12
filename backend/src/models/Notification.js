import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  category: { type: String, enum: ['VERIFIED', 'ASSIGNED', 'INSPECTION', 'RESOLVED', 'ALERT', 'COMMENT', 'GENERAL'], default: 'GENERAL' },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true, toJSON: { transform(_doc, ret) { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; } } });

export const Notification = mongoose.model('Notification', notificationSchema);
