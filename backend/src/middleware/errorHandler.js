export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((item) => item.message).join(', '); }
  if (err.code === 11000) { status = 409; message = 'An account or record with that value already exists.'; }
  if (err.name === 'CastError') { status = 400; message = 'Invalid resource identifier.'; }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') { status = 401; message = 'Your session is invalid or expired. Please log in again.'; }
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message, ...(process.env.NODE_ENV === 'development' && status >= 500 ? { detail: err.message } : {}) });
}
