# Docker Setup Guide

This guide covers running TeamTerrain using Docker, which provides the easiest way to get the application running with all dependencies included.

## Quick Start

### Production Setup (Single Container)

The fastest way to run the complete application:

```bash
# Clone and run
git clone <repository-url>
cd teamterrain
./docker-setup.sh
```

This creates a single container with:

- PostgreSQL database
- Node.js backend API
- Nginx serving the React frontend
- All services automatically configured and started

**Access:**

- Frontend: <http://localhost>
- Backend API: <http://localhost:3001> (optional direct access)
- Database: localhost:5432 (optional direct access)

### Development Setup (Multi-Container)

For development with hot-reload and separate services:

```bash
# Clone and run development environment
git clone <repository-url>
cd teamterrain
./docker-dev-setup.sh
```

This creates separate containers for:

- PostgreSQL database
- Backend API with hot-reload
- Frontend dev server with hot-reload

**Access:**

- Frontend: <http://localhost:8080>
- Backend API: <http://localhost:3001>
- Database: localhost:5432

## Container Architecture

### Production Container (Single)

```txt
┌─────────────────────────────────────┐
│            Docker Container        │
├─────────────────────────────────────┤
│  Nginx (Port 80)                   │
│  ├── Frontend (React SPA)          │
│  └── API Proxy (/api/* -> :3001)   │
├─────────────────────────────────────┤
│  Node.js Backend (Port 3001)       │
│  ├── Express API Server            │
│  ├── JWT Authentication            │
│  └── Business Logic                │
├─────────────────────────────────────┤
│  PostgreSQL (Port 5432)            │
│  ├── User Data                     │
│  ├── Location History              │
│  └── Authentication                │
├─────────────────────────────────────┤
│  Supervisor (Process Manager)      │
│  ├── PostgreSQL Service            │
│  ├── Backend Service               │
│  ├── Nginx Service                 │
│  └── Database Initialization       │
└─────────────────────────────────────┘
```

### Development Containers (Multi)

```txt
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │   Backend API    │  │   Frontend      │
│   Container     │  │   Container      │  │   Container     │
│                 │  │                  │  │                 │
│ Port: 5432      │  │ Port: 3001       │  │ Port: 8080      │
│ Volume: DB Data │  │ Volume: ./backend│  │ Volume: ./frontend│
│                 │  │ Hot Reload: Yes  │  │ Hot Reload: Yes │
└─────────────────┘  └──────────────────┘  └─────────────────┘
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               │
                        Docker Network
```

## Environment Variables

All environment variables are pre-configured in Docker, but you can customize them:

### Production Environment Variables

```bash
# In docker-compose.yml or Dockerfile
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teamterrain
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key-change-in-production
API_AUTH_TOKEN=your-api-auth-token-change-this
PORT=3001
```

### Development Environment Variables

Create `backend/.env` and `frontend/.env` files or let the setup script create them.

## Docker Commands

### Production Commands

```bash
# Start application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose down && docker-compose build && docker-compose up -d

# Shell access
docker-compose exec app sh

# Database access
docker-compose exec app psql -h localhost -U postgres -d teamterrain
```

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs (all services)
docker-compose -f docker-compose.dev.yml logs -f

# View logs (specific service)
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f postgres

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Restart specific service
docker-compose -f docker-compose.dev.yml restart backend

# Shell access
docker-compose -f docker-compose.dev.yml exec backend sh
docker-compose -f docker-compose.dev.yml exec frontend sh

# Database commands
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d teamterrain

# Reset database
docker-compose -f docker-compose.dev.yml exec backend bun run db:migrate
docker-compose -f docker-compose.dev.yml exec backend bun run db:seed
```

## Data Persistence

### Production

- Database data: Docker volume `postgres_data`
- Application logs: Docker volume `app_logs`

### Development

- Database data: Docker volume `postgres_dev_data`
- Code changes: Bind mounts to `./backend` and `./frontend`

## Networking

### Production (Single Container)

- Port 80: Nginx (frontend + API proxy)
- Port 3001: Direct backend access (optional)
- Port 5432: Direct database access (optional)

### Development (Multi-Container)

- Port 8080: Frontend development server
- Port 3001: Backend API
- Port 5432: PostgreSQL database
- Internal Docker network for service communication

## Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Find and kill process using port
lsof -ti:80 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

**Database Connection Issues**

```bash
# Check if PostgreSQL is running
docker-compose exec app pg_isready -h localhost -U postgres

# Or in development
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres
```

**Frontend Not Loading**

```bash
# Check nginx configuration
docker-compose exec app nginx -t

# Restart nginx
docker-compose exec app supervisorctl restart nginx
```

**Backend API Issues**

```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart
```

### Health Checks

**Production Health Check**

```bash
# Application health
curl http://localhost/health

# Database health
docker-compose exec app pg_isready -h localhost -U postgres
```

**Development Health Checks**

```bash
# Frontend health
curl http://localhost:8080

# Backend health
curl http://localhost:3001/health

# Database health
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres
```

### Performance Tuning

**For Production**

- Increase PostgreSQL `shared_buffers` for better performance
- Configure Nginx caching for static assets
- Use production build optimizations

**For Development**

- Use bind mounts for faster file sync
- Configure hot-reload for both frontend and backend
- Use separate containers for better isolation

## Security Considerations

- Change default JWT secrets and API tokens
- Use environment-specific passwords
- Configure proper CORS origins
- Enable SSL/HTTPS in production
- Regularly update base Docker images
- Scan images for vulnerabilities

## Backup and Recovery

### Database Backup

```bash
# Production
docker-compose exec app pg_dump -h localhost -U postgres teamterrain > backup.sql

# Development
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres teamterrain > backup.sql
```

### Database Restore

```bash
# Production
docker-compose exec app psql -h localhost -U postgres teamterrain < backup.sql

# Development
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres teamterrain < backup.sql
```

## CI/CD Integration

The Docker setup can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Build Docker Image
  run: docker build -t teamterrain:latest .

- name: Run Tests
  run: docker-compose -f docker-compose.test.yml up --abort-on-container-exit

- name: Deploy
  run: docker-compose up -d
```
