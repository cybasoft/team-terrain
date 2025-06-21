const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { initializeDatabase, getDatabase } = require('../database/database');

// Generate UUID v4
const uuidv4 = () => {
  return crypto.randomUUID();
};

const seedUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@teamterrain.com',
    password: 'password123',
    coordinates: '36.8219, -1.2921', // Nairobi, Kenya
    city: 'Nairobi',
    state: 'Nairobi County',
    country: 'Kenya'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@teamterrain.com',
    password: 'password123',
    coordinates: '40.7128, -74.0060', // New York, USA
    city: 'New York',
    state: 'New York',
    country: 'United States'
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@teamterrain.com',
    password: 'password123',
    coordinates: '51.5074, -0.1278', // London, UK
    city: 'London',
    state: 'England',
    country: 'United Kingdom'
  },
  {
    name: 'Alice Williams',
    email: 'alice.williams@teamterrain.com',
    password: 'password123',
    coordinates: '35.6762, 139.6503', // Tokyo, Japan
    city: 'Tokyo',
    state: 'Tokyo',
    country: 'Japan'
  },
  {
    name: 'Charlie Brown',
    email: 'charlie.brown@teamterrain.com',
    password: 'password123',
    coordinates: '-33.8688, 151.2093', // Sydney, Australia
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
    await db.run('DELETE FROM location_updates WHERE user_id NOT LIKE "admin-%"');
    await db.run('DELETE FROM users WHERE id NOT LIKE "admin-%"');
    
    console.log('Cleared existing seed data');
    
    // Insert seed users
    for (const userData of seedUsers) {
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      await db.run(
        'INSERT INTO users (id, name, email, password, coordinates, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, userData.name, userData.email, hashedPassword, userData.coordinates, userData.city, userData.state, userData.country]
      );
      
      // Add initial location update
      await db.run(
        'INSERT INTO location_updates (user_id, coordinates, city, state, country) VALUES (?, ?, ?, ?, ?)',
        [userId, userData.coordinates, userData.city, userData.state, userData.country]
      );
      
      console.log(`Created user: ${userData.name} (${userData.email})`);
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
