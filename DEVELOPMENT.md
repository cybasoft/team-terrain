# Development Guide

This guide will help you set up and run both the frontend and backend of the TeamTerrain map application.

## Project Structure

```
team-terrain/
├── backend/           # Node.js + SQLite backend
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── middleware/# Auth, validation, error handling
│   │   ├── database/  # Database setup and models
│   │   └── scripts/   # Migration and seed scripts
│   ├── package.json
│   └── README.md
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   └── README.md
└── .github/workflows/ # GitHub Actions
```

## Quick Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Initialize database
npm run db:migrate

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

The backend will start on `http://localhost:3001`

### 2. Frontend Setup

```bash
# Navigate to frontend directory  
cd frontend

# Install dependencies
bun install

# Start development server
bun run dev
```

The frontend will start on `http://localhost:5173`

## Environment Configuration

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./database.sqlite
JWT_SECRET=dev-super-secret-jwt-key-change-in-production
API_AUTH_TOKEN=dev-api-auth-token-change-this
ADMIN_EMAILS=admin@teamterrain.com
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables
Update your frontend environment to point to the local backend:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_AUTH_TOKEN=dev-api-auth-token-change-this
VITE_LOCATION_TRACKER_ENDPOINT=/location/update
VITE_USERS_ENDPOINT=/users
VITE_LOGIN_ENDPOINT=/auth/login
```

## API Testing

You can test the API endpoints using curl or a tool like Postman:

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teamterrain.com", "password": "admin123"}'
```

### Get Users (with API token)
```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer dev-api-auth-token-change-this"
```

### Health Check
```bash
curl http://localhost:3001/health
```

## Default Test Accounts

After running `npm run db:seed`:

- **Admin**: `admin@teamterrain.com` / `admin123`
- **John Doe**: `john.doe@teamterrain.com` / `password123`
- **Jane Smith**: `jane.smith@teamterrain.com` / `password123`
- **Bob Johnson**: `bob.johnson@teamterrain.com` / `password123`
- **Alice Williams**: `alice.williams@teamterrain.com` / `password123`
- **Charlie Brown**: `charlie.brown@teamterrain.com` / `password123`

## Development Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && bun run dev`
3. **Open Browser**: Visit `http://localhost:5173`
4. **Login**: Use any of the test accounts above

## Database Management

```bash
# Reset database (careful!)
cd backend
rm database.sqlite
npm run db:migrate
npm run db:seed

# View database (optional)
sqlite3 database.sqlite
.tables
.schema users
SELECT * FROM users;
```

## Troubleshooting

### Backend Issues
- Check if port 3001 is already in use
- Verify `.env` file exists and has correct values
- Check database file permissions

### Frontend Issues  
- Ensure backend is running first
- Check API endpoints match backend routes
- Verify CORS settings allow frontend origin

### Common Errors
- **CORS errors**: Check `CORS_ORIGIN` in backend `.env`
- **Auth failures**: Verify `API_AUTH_TOKEN` matches between frontend and backend
- **Database errors**: Try resetting the database

## Production Deployment

### Backend
- Set `NODE_ENV=production`
- Use strong secrets for `JWT_SECRET` and `API_AUTH_TOKEN`
- Configure proper CORS origins
- Use a reverse proxy (nginx)
- Consider PostgreSQL for production database

### Frontend
- Build with `bun run build`
- Deploy `dist/` folder to static hosting
- Update environment variables for production API

## API Documentation

The backend provides a comprehensive RESTful API. See `backend/README.md` for detailed endpoint documentation.

Key endpoints:
- `/api/auth/*` - Authentication
- `/api/users/*` - User management  
- `/api/location/*` - Location tracking
- `/health` - Health check
