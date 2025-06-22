const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { initializeDatabase, getDatabase } = require('../database/database');

// Generate UUID v4
const uuidv4 = () => {
  return crypto.randomUUID();
};

// Validate coordinates are within valid ranges
const validateCoordinates = (coordinates) => {
  if (!coordinates) return true;
  
  try {
    const coords = coordinates.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length !== 2) return false;
    
    const [lng, lat] = coords;
    
    // Longitude must be between -180 and 180
    if (lng < -180 || lng > 180) {
      console.error(`Invalid longitude: ${lng}. Must be between -180 and 180.`);
      return false;
    }
    
    // Latitude must be between -90 and 90
    if (lat < -90 || lat > 90) {
      console.error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error parsing coordinates:', coordinates, error);
    return false;
  }
};

const seedUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@teamterrain.com',
    password: 'password123',
    coordinates: '36.8219, -1.2921', // Nairobi, Kenya (lng, lat)
    city: 'Nairobi',
    state: 'Nairobi County',
    country: 'Kenya'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@teamterrain.com',
    password: 'password123',
    coordinates: '-74.0060, 40.7128', // New York, USA (lng, lat)
    city: 'New York',
    state: 'New York',
    country: 'United States'
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@teamterrain.com',
    password: 'password123',
    coordinates: '-0.1278, 51.5074', // London, UK (lng, lat)
    city: 'London',
    state: 'England',
    country: 'United Kingdom'
  },
  {
    name: 'Alice Williams',
    email: 'alice.williams@teamterrain.com',
    password: 'password123',
    coordinates: '139.6503, 35.6762', // Tokyo, Japan (lng, lat)
    city: 'Tokyo',
    state: 'Tokyo',
    country: 'Japan'
  },
  {
    name: 'Charlie Brown',
    email: 'charlie.brown@teamterrain.com',
    password: 'password123',
    coordinates: '151.2093, -33.8688', // Sydney, Australia (lng, lat)
    city: 'Sydney',
    state: 'New South Wales',
    country: 'Australia'
  }
];

const seed = async () => {
  try {
    console.log('Starting database seeding...');
    
    await initializeDatabase();
    
    const db = getDatabase();
    
    // Clear existing seed data (except admin)
    await db.run('DELETE FROM location_updates WHERE user_id NOT LIKE $1', ['admin-%']);
    await db.run('DELETE FROM users WHERE id NOT LIKE $1', ['admin-%']);
    
    console.log('Cleared existing seed data');
    
    // Insert seed users
    for (const userData of seedUsers) {
      // Validate coordinates before inserting
      if (!validateCoordinates(userData.coordinates)) {
        console.error(`Skipping user ${userData.name} due to invalid coordinates: ${userData.coordinates}`);
        continue;
      }
      
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      await db.run(
        'INSERT INTO users (id, name, email, password, coordinates, city, state, country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, userData.name, userData.email, hashedPassword, userData.coordinates, userData.city, userData.state, userData.country]
      );
      
      // Add initial location update
      await db.run(
        'INSERT INTO location_updates (user_id, coordinates, city, state, country) VALUES ($1, $2, $3, $4, $5)',
        [userId, userData.coordinates, userData.city, userData.state, userData.country]
      );
      
      console.log(`Created user: ${userData.name} (${userData.email}) with coordinates: ${userData.coordinates}`);
    }
    
    console.log('\nSeed data inserted successfully!');
    console.log('\nTest credentials:');
    console.log('- Admin: admin@teamterrain.com / admin123');
    seedUsers.forEach(user => {
      console.log(`- ${user.name}: ${user.email} / ${user.password}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
