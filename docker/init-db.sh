#!/bin/sh
set -e

echo "Waiting for PostgreSQL to start..."
sleep 10

# Check if PostgreSQL is ready
until pg_isready -h localhost -p 5432 -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready - initializing database..."

# Create database if it doesn't exist
psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'teamterrain'" | grep -q 1 || psql -h localhost -U postgres -c "CREATE DATABASE teamterrain"

echo "Database created, running migrations..."

# Wait a bit more to ensure backend is ready
sleep 5

# Run database migrations
cd /app/backend
bun run src/scripts/migrate.js

echo "Running seed data..."
bun run src/scripts/seed.js

echo "Database initialization complete!"
