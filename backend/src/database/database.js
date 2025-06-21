const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.db = null;
  }

  async initialize() {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        coordinates TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS location_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        coordinates TEXT NOT NULL,
        city TEXT,
        state TEXT,
        country TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
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
    const adminExists = await this.get('SELECT id FROM users WHERE email = ?', [adminEmail]);
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.run(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        ['admin-001', 'Administrator', adminEmail, hashedPassword]
      );
      console.log('Default admin user created:', adminEmail);
    }
  }

  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          console.error('Database run error:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          console.error('Database get error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Database all error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// Singleton instance
const database = new Database();

const initializeDatabase = async () => {
  await database.initialize();
};

const getDatabase = () => {
  if (!database.db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return database;
};

module.exports = {
  initializeDatabase,
  getDatabase,
  Database
};
