const express = require('express');
const { getDatabase } = require('../database/database');
const { authenticateTokenOrApiKey } = require('../middleware/auth');
const { validate, updateUserSchema } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Format user response with location parsing
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

// GET /api/users or /webhook-test/:id (legacy)
router.get(['/', '/:webhookId'], authenticateTokenOrApiKey, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const users = await db.all('SELECT * FROM users ORDER BY created_at DESC');
  
  const formattedUsers = users.map(formatUserResponse);

  res.json({
    success: true,
    users: formattedUsers,
    count: formattedUsers.length
  });
}));

// GET /api/users/:id
router.get('/user/:id', authenticateTokenOrApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user: formatUserResponse(user)
  });
}));

// PUT /api/users/:id
router.put('/user/:id', authenticateTokenOrApiKey, validate(updateUserSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, coordinates, city, state, country } = req.body;
  const db = getDatabase();
  
  // Check if user exists
  const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  
  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if email is already taken by another user
  if (email && email !== existingUser.email) {
    const emailExists = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'Email already taken by another user'
      });
    }
  }

  // Build update query dynamically
  const updates = [];
  const values = [];
  
  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  
  if (email !== undefined) {
    updates.push('email = ?');
    values.push(email);
  }
  
  if (coordinates !== undefined) {
    updates.push('coordinates = ?');
    values.push(coordinates);
  }
  
  if (city !== undefined) {
    updates.push('city = ?');
    values.push(city);
  }
  
  if (state !== undefined) {
    updates.push('state = ?');
    values.push(state);
  }
  
  if (country !== undefined) {
    updates.push('country = ?');
    values.push(country);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  
  await db.run(query, values);

  // Get updated user
  const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);

  res.json({
    success: true,
    user: formatUserResponse(updatedUser),
    message: 'User updated successfully'
  });
}));

// DELETE /api/users/:id
router.delete('/user/:id', authenticateTokenOrApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  // Check if user exists
  const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Delete user's location history
  await db.run('DELETE FROM location_updates WHERE user_id = ?', [id]);
  
  // Delete user
  await db.run('DELETE FROM users WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// GET /api/users/:id/locations - Get user's location history
router.get('/user/:id/locations', authenticateTokenOrApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  // Check if user exists
  const user = await db.get('SELECT id FROM users WHERE id = ?', [id]);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const locations = await db.all(
    'SELECT * FROM location_updates WHERE user_id = ? ORDER BY timestamp DESC',
    [id]
  );

  res.json({
    success: true,
    locations,
    count: locations.length
  });
}));

module.exports = router;
