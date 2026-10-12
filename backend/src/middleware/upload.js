import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { AppError } from '../utils/AppError.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, randomName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
  if (allowedMime.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.'));
  }
};

export const uploadEvidence = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 8, // max 8 files
  },
});
