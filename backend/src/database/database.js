const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.pool = null;
  }

  async initialize() {
    // PostgreSQL connection configuration
    const config = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'teamterrain',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      // Connection pool settings
      max: 10, // max number of clients in pool
      idleTimeoutMillis: 30000, // close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // return error after 2 seconds if connection could not be established
    };

    this.pool = new Pool(config);
    
    // Test the connection
    try {
      const client = await this.pool.connect();
      console.log('Connected to PostgreSQL database');
      client.release();
      
      await this.createTables();
    } catch (err) {
      console.error('Error connecting to PostgreSQL database:', err);
      throw err;
    }
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        coordinates TEXT,
        city VARCHAR(255),
        state VARCHAR(255),
        country VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS location_updates (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        coordinates TEXT NOT NULL,
        city VARCHAR(255),
        state VARCHAR(255),
        country VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_location_updates_user_id ON location_updates(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_location_updates_timestamp ON location_updates(timestamp)`
    ];

    for (const query of queries) {
      await this.run(query);
    }

    // Create default admin user if it doesn't exist
    await this.createDefaultAdmin();
  }

  async createDefaultAdmin() {
    const adminEmail = 'admin@teamterrain.com';
    const adminExists = await this.get('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.run(
        'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
        ['admin-001', 'Administrator', adminEmail, hashedPassword]
      );
      console.log('Default admin user created:', adminEmail);
    }
  }

  async run(query, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return {
        id: result.rows[0]?.id || null,
        changes: result.rowCount,
        rows: result.rows
      };
    } catch (err) {
      console.error('Database run error:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  async get(query, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows[0] || null;
    } catch (err) {
      console.error('Database get error:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  async all(query, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } catch (err) {
      console.error('Database all error:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('PostgreSQL connection pool closed');
    }
  }
}

// Singleton instance
const database = new Database();

const initializeDatabase = async () => {
  await database.initialize();
};

const getDatabase = () => {
  if (!database.pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return database;
};

module.exports = {
  initializeDatabase,
  getDatabase,
  Database
};
