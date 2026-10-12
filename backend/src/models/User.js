import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['citizen', 'officer', 'admin'], default: 'citizen', index: true },
  department: { type: String, trim: true, default: '' },
  district: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' },
  points: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true, toJSON: { transform(_doc, ret) { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; delete ret.passwordHash; return ret; } } });

userSchema.methods.comparePassword = function (candidate) { return bcrypt.compare(candidate, this.passwordHash); };
userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 12);

export const User = mongoose.model('User', userSchema);
