const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid token', 
      message: 'Token is not valid' 
    });
  }
};

const authenticateApiKey = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const apiKey = authHeader && authHeader.split(' ')[1]; // Bearer API_KEY

  if (!apiKey || apiKey !== process.env.API_AUTH_TOKEN) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'Invalid or missing API key' 
    });
  }

  next();
};

// Middleware that accepts either JWT token or API key
const authenticateTokenOrApiKey = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided' 
    });
  }

  // Try API key first
  if (token === process.env.API_AUTH_TOKEN) {
    return next();
  }

  // Try JWT token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid token', 
      message: 'Token is not valid' 
    });
  }
};

const isAdmin = (req, res, next) => {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());
  
  if (req.user && adminEmails.includes(req.user.email)) {
    next();
  } else {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'Admin privileges required' 
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateApiKey,
  authenticateTokenOrApiKey,
  isAdmin
};
