const { initializeDatabase, getDatabase } = require('../database/database');

const migrate = async () => {
  try {
    console.log('Starting database migration...');
    
    await initializeDatabase();
    
    const db = getDatabase();
    
    // Add any additional migrations here
    console.log('Running additional migrations...');
    
    // Example: Add new columns if they don't exist
    try {
      await db.run('ALTER TABLE users ADD COLUMN avatar_url TEXT');
      console.log('Added avatar_url column to users table');
    } catch (error) {
      // Column might already exist, ignore error
      if (!error.message.includes('duplicate column name')) {
        throw error;
      }
    }
    
    console.log('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
