const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    status: err.statusCode || 500,
    message: err.message || 'Internal Server Error'
  };

  // Validation error
  if (err.isJoi) {
    error.status = 400;
    error.message = err.details[0].message;
  }

  // PostgreSQL constraint error
  if (err.code === '23505') { // unique_violation
    error.status = 409;
    error.message = 'Resource already exists';
  }

  // PostgreSQL foreign key constraint error
  if (err.code === '23503') { // foreign_key_violation
    error.status = 400;
    error.message = 'Referenced resource does not exist';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Send error response
  res.status(error.status).json({
    error: true,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};
