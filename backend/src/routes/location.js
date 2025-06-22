const express = require('express');
const { getDatabase } = require('../database/database');
const { authenticateTokenOrApiKey } = require('../middleware/auth');
const { validate, locationUpdateSchema } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// POST /api/location/update - Update user location
router.post('/update', authenticateTokenOrApiKey, validate(locationUpdateSchema), asyncHandler(async (req, res) => {
  const { coordinates, city, state, country, user_id, userId } = req.body;
  const db = getDatabase();
  
  // Determine user ID (from token or request body) - handle both user_id and userId
  const userIdFromBody = user_id || userId;
  const finalUserId = userIdFromBody || (req.user ? req.user.id : null);
  
  if (!finalUserId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  // Verify user exists
  const user = await db.get('SELECT * FROM users WHERE id = ?', [finalUserId]);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update user's current location
  await db.run(
    'UPDATE users SET coordinates = ?, city = ?, state = ?, country = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [coordinates, city || '', state || '', country || '', finalUserId]
  );

  // Add to location history
  await db.run(
    'INSERT INTO location_updates (user_id, coordinates, city, state, country) VALUES (?, ?, ?, ?, ?)',
    [finalUserId, coordinates, city || '', state || '', country || '']
  );

  // Get updated user
  const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [finalUserId]);
  
  // Format user response
  const { password, ...userWithoutPassword } = updatedUser;
  let location = null;
  
  if (updatedUser.coordinates) {
    try {
      const coords = updatedUser.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        location = coords;
      }
    } catch (e) {
      console.warn('Failed to parse coordinates:', updatedUser.coordinates);
    }
  }

  const formattedUser = {
    ...userWithoutPassword,
    location,
    pinned: location !== null
  };

  res.json({
    success: true,
    user: formattedUser,
    message: 'Location updated successfully'
  });
}));

// GET /api/location/history/:userId - Get location history for a user
router.get('/history/:userId', authenticateTokenOrApiKey, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 50, offset = 0 } = req.query;
  const db = getDatabase();
  
  // Verify user exists
  const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const locations = await db.all(
    'SELECT * FROM location_updates WHERE user_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
    [userId, parseInt(limit), parseInt(offset)]
  );

  const total = await db.get(
    'SELECT COUNT(*) as count FROM location_updates WHERE user_id = ?',
    [userId]
  );

  res.json({
    success: true,
    locations,
    pagination: {
      total: total.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: total.count > parseInt(offset) + parseInt(limit)
    }
  });
}));

// GET /api/location/all - Get all recent location updates
router.get('/all', authenticateTokenOrApiKey, asyncHandler(async (req, res) => {
  const { limit = 100 } = req.query;
  const db = getDatabase();
  
  const locations = await db.all(`
    SELECT 
      lu.*,
      u.name as user_name,
      u.email as user_email
    FROM location_updates lu
    JOIN users u ON lu.user_id = u.id
    ORDER BY lu.timestamp DESC
    LIMIT ?
  `, [parseInt(limit)]);

  res.json({
    success: true,
    locations,
    count: locations.length
  });
}));

// DELETE /api/location/history/:userId - Clear location history for a user
router.delete('/history/:userId', authenticateTokenOrApiKey, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const db = getDatabase();
  
  // Verify user exists
  const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const result = await db.run('DELETE FROM location_updates WHERE user_id = ?', [userId]);

  res.json({
    success: true,
    message: `Deleted ${result.changes} location records`,
    deletedCount: result.changes
  });
}));

module.exports = router;
