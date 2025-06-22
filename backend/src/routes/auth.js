const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getDatabase } = require('../database/database');
const { validate, loginSchema, registerSchema } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Generate UUID v4
const uuidv4 = () => {
  return crypto.randomUUID();
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Format user response (remove password)
const formatUserResponse = (user) => {
  const { password, ...userWithoutPassword } = user;
  
  // Parse coordinates if they exist
  let location = null;
  if (user.coordinates) {
    try {
      const coords = user.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        location = coords;
      }
    } catch (e) {
      console.warn('Failed to parse coordinates:', user.coordinates);
    }
  }

  return {
    ...userWithoutPassword,
    location,
    pinned: location !== null
  };
};

// POST /api/auth/login or /webhook/:id (legacy)
router.post(['/login', '/:webhookId'], validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const db = getDatabase();

  // Find user by email
  const user = await db.get('SELECT * FROM users WHERE email = $1', [email]);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate JWT token
  const token = generateToken(user);

  // Update last login timestamp
  await db.run(
    'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  res.json({
    success: true,
    user: formatUserResponse(user),
    token,
    message: 'Login successful'
  });
}));

// POST /api/auth/register
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const db = getDatabase();

  // Check if user already exists
  const existingUser = await db.get('SELECT id FROM users WHERE email = $1', [email]);

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const userId = uuidv4();
  await db.run(
    'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
    [userId, name, email, hashedPassword]
  );

  // Get created user
  const newUser = await db.get('SELECT * FROM users WHERE id = $1', [userId]);

  // Generate JWT token
  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    user: formatUserResponse(newUser),
    token,
    message: 'User registered successfully'
  });
}));

// GET /api/auth/verify - Verify JWT token
router.get('/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDatabase();
    
    // Get current user data
    const user = await db.get('SELECT * FROM users WHERE id = $1', [decoded.id]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: formatUserResponse(user),
      message: 'Token is valid'
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}));

module.exports = router;
