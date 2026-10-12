import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, trim: true, maxlength: 1000, default: '' },
}, { timestamps: true });

const issueSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 160 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 10000 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  status: { type: String, enum: ['Pending', 'Verified', 'Assigned', 'In Progress', 'Inspection', 'Resolved', 'Escalated', 'Rejected'], default: 'Pending', index: true },
  priority: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM', index: true },
  location: { type: String, required: true, trim: true, maxlength: 300 },
  ward: { type: String, trim: true, maxlength: 100, default: '' },
  lat: { type: Number, min: -90, max: 90 },
  lng: { type: Number, min: -180, max: 180 },
  images: [{ type: String, trim: true }],
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  assignedDepartment: { type: String, trim: true, default: '' },
  rejectionReason: { type: String, trim: true, maxlength: 1000, default: '' },
  resolutionEvidence: [{ type: String, trim: true }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  statusHistory: [statusHistorySchema],
  slaTargetHours: { type: Number, min: 1, default: 72 },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true, transform(_doc, ret) { ret.id = ret._id.toString(); ret.upvoteCount = ret.upvotes?.length || 0; ret.isEndorsed = false; ret.reporterName = ret.reporter?.name || ''; ret.date = ret.createdAt; delete ret._id; delete ret.__v; return ret; } } });

issueSchema.pre('validate', function () {
  if (!this.ticketId) this.ticketId = `CT-${Date.now().toString().slice(-7)}-${Math.floor(Math.random() * 90 + 10)}`;
});

export const Issue = mongoose.model('Issue', issueSchema);
