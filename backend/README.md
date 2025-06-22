# TeamTerrain Backend API

Node.js backend with SQLite database for the TeamTerrain employee location management application.

## Features

- **RESTful API**: Modern REST endpoints with proper HTTP methods
- **JWT Authentication**: Secure token-based authentication
- **User Management**: CRUD operations for users and locations
- **Location Tracking**: Real-time updates with historical data
- **Database**: SQLite with automatic migrations and seeding
- **Security**: Rate limiting, CORS, input validation, password hashing
- **Legacy Support**: Webhook compatibility for existing integrations

## Requirements

- Node.js 18+
- npm or yarn

## Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server
PORT=3001
NODE_ENV=development

# Database  
DATABASE_PATH=./database.sqlite

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
API_AUTH_TOKEN=your-api-auth-token-change-this

# Security
ADMIN_EMAILS=admin@teamterrain.com
CORS_ORIGIN=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

```bash
# Initialize database and create tables
npm run db:migrate

# Add sample data (optional)
npm run db:seed
```

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3001`

## Test the API

### Health Check
```bash
curl http://localhost:3001/health
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teamterrain.com", "password": "admin123"}'
```

### Get Users (with API token)
```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer your-api-auth-token-change-this"
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login (email/password) |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/verify` | Verify JWT token |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/user/:id` | Get user by ID |
| PUT | `/api/users/user/:id` | Update user |
| DELETE | `/api/users/user/:id` | Delete user |
| GET | `/api/users/user/:id/locations` | Get user's location history |

### Location Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/location/update` | Update user location |
| GET | `/api/location/history/:userId` | Get location history |
| GET | `/api/location/all` | Get all recent locations |
| DELETE | `/api/location/history/:userId` | Clear location history |

### Legacy Webhook Endpoints

For backward compatibility:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/:id` | Legacy login endpoint |
| GET | `/webhook-test/:id` | Legacy users endpoint |

## Authentication Methods

The API supports two authentication methods:

### 1. JWT Tokens (User Sessions)
```bash
Authorization: Bearer <jwt_token>
```

### 2. API Keys (External Services)
```bash
Authorization: Bearer <api_auth_token>
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
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
);
```

### Location Updates Table
```sql
CREATE TABLE location_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  coordinates TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Default Test Accounts

After running `npm run db:seed`:

- **Admin**: `admin@teamterrain.com` / `admin123`
- **John Doe**: `john.doe@teamterrain.com` / `password123` (Nairobi, Kenya)
- **Jane Smith**: `jane.smith@teamterrain.com` / `password123` (New York, USA)
- **Bob Johnson**: `bob.johnson@teamterrain.com` / `password123` (London, UK)
- **Alice Williams**: `alice.williams@teamterrain.com` / `password123` (Tokyo, Japan)
- **Charlie Brown**: `charlie.brown@teamterrain.com` / `password123` (Sydney, Australia)

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run db:migrate` | Initialize/update database schema |
| `npm run db:seed` | Populate database with sample data |
| `npm test` | Run tests (when implemented) |

## Database Management

### Reset Database
```bash
# Careful! This deletes all data
rm database.sqlite
npm run db:migrate
npm run db:seed
```

### Inspect Database
```bash
sqlite3 database.sqlite
.tables
.schema users
SELECT * FROM users;
.quit
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_PATH` | SQLite file path | `./database.sqlite` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `API_AUTH_TOKEN` | API authentication token | Required |
| `ADMIN_EMAILS` | Admin user emails (comma-separated) | `` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:8080` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based sessions
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Helmet middleware

## Production Deployment

### Environment Setup
- Set `NODE_ENV=production`
- Use strong, unique secrets for `JWT_SECRET` and `API_AUTH_TOKEN`
- Configure proper `CORS_ORIGIN` for your frontend domain
- Set appropriate admin emails in `ADMIN_EMAILS`

### Database Considerations
- SQLite works for moderate traffic
- Consider PostgreSQL/MySQL for high traffic
- Ensure database backups are configured
- Set proper file permissions for SQLite

### Hosting Recommendations
- **Railway**: Easy Node.js deployment
- **Heroku**: Classic PaaS option
- **DigitalOcean App Platform**: Simple deployment
- **AWS/GCP/Azure**: Full cloud solutions

### Process Management
Use PM2 or similar for production:
```bash
npm install -g pm2
pm2 start src/server.js --name "teamterrain-backend"
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
lsof -ti:3001 | xargs kill -9
```

**Database Errors**
```bash
# Reset database
rm database.sqlite
npm run db:migrate
```

**CORS Errors**
- Check `CORS_ORIGIN` in `.env`
- Ensure frontend URL matches exactly

**Authentication Failures**
- Verify `API_AUTH_TOKEN` matches frontend
- Check JWT secret is properly set

### Logs

Development logs are verbose. Production logs are minimal.
Check console output for detailed error messages.

## API Response Format

### Success Response
```json
{
  "success": true,
  "user": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": true,
  "message": "Error description",
  "stack": "Stack trace (development only)"
}
```

## Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Test with sample data

## Support

For backend-specific issues:
1. Check logs for error details
2. Verify environment variables
3. Test API endpoints directly
4. Review database schema

See main [README](../README.md) for general setup instructions.

2. **API Keys**: For external services
   ```
   Authorization: Bearer <api_auth_token>
   ```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
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
);
```

### Location Updates Table
```sql
CREATE TABLE location_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  coordinates TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Default Credentials

After running the seed script:

- **Admin**: `admin@teamterrain.com` / `admin123`
- **Test Users**: Various users with different global locations

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_PATH` | SQLite database path | `./database.sqlite` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `API_AUTH_TOKEN` | API authentication token | Required |
| `ADMIN_EMAILS` | Comma-separated admin emails | `` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:8080` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Development

```bash
# Start development server with auto-reload
npm run dev

# Run database migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Run tests (when implemented)
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper `API_AUTH_TOKEN`
4. Set up proper CORS origins
5. Consider using a proper database (PostgreSQL/MySQL) for production
6. Set up reverse proxy (nginx)
7. Use PM2 or similar for process management

## Security Features

- **Rate Limiting**: Prevents abuse
- **CORS**: Configurable cross-origin policies
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Secure session management

## Error Handling

The API returns consistent error responses:

```json
{
  "error": true,
  "message": "Error description",
  "stack": "Error stack (development only)"
}
```

## Health Check

Check server status:
```bash
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```
