# Multi-stage build for a single container with PostgreSQL, Backend, and Frontend
FROM oven/bun:1-alpine AS build

# Install PostgreSQL and other dependencies
RUN apk add --no-cache postgresql postgresql-contrib supervisor nginx nodejs npm

# Create app directory
WORKDIR /app

# Copy package files
COPY backend/package*.json backend/bun.lockb* ./backend/
COPY frontend/package*.json frontend/bun.lockb* ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN bun install --frozen-lockfile --production

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN bun install --frozen-lockfile
COPY frontend/ .
RUN bun run build

# Production stage
FROM oven/bun:1-alpine

# Install PostgreSQL, nginx, and supervisor
RUN apk add --no-cache postgresql postgresql-contrib supervisor nginx nodejs npm

# PostgreSQL user is automatically created by the package
# Just ensure directories exist and have correct permissions
RUN mkdir -p /var/lib/postgresql/data /var/log/postgresql
RUN chown -R postgres:postgres /var/lib/postgresql /var/log/postgresql

# Create app user
RUN addgroup -S appuser && adduser -S appuser -G appuser

# Set up directories
WORKDIR /app
RUN mkdir -p /app/backend /app/frontend/dist /var/log/supervisor

# Copy backend
COPY backend/ ./backend/
COPY --from=build /app/backend/node_modules ./backend/node_modules

# Copy frontend build
COPY --from=build /app/frontend/dist ./frontend/dist

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/postgresql.conf /etc/postgresql/postgresql.conf
COPY docker/init-db.sh /docker-entrypoint-initdb.d/init-db.sh

# Create nginx directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /run/nginx
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /run/nginx

# Set up PostgreSQL
RUN mkdir -p /run/postgresql
RUN chown postgres:postgres /run/postgresql
USER postgres
RUN initdb -D /var/lib/postgresql/data
USER root

# Set permissions
RUN chown -R appuser:appuser /app
RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh

# Expose ports
EXPOSE 80 3001 5432

# Environment variables
ENV NODE_ENV=production
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=teamterrain
ENV DB_USER=postgres
ENV DB_PASSWORD=password
ENV JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENV API_AUTH_TOKEN=your-api-auth-token-change-this
ENV PORT=3001
ENV PGDATA=/var/lib/postgresql/data

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
