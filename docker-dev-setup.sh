#!/bin/bash

# TeamTerrain Development Docker Setup Script
set -e

echo "🚀 Setting up TeamTerrain Development Environment with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker is installed"

# Stop and remove existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from example..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend/.env..."
    cat > frontend/.env << EOF
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_AUTH_TOKEN=your-api-auth-token-change-this
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token-here
EOF
fi

# Build and start the development environment
echo "🔨 Building the development environment..."
docker-compose -f docker-compose.dev.yml build

echo "🚀 Starting the development environment..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for database to be ready..."
sleep 15

# Initialize database
echo "🗄️ Initializing database..."
docker-compose -f docker-compose.dev.yml exec backend bun run db:migrate
docker-compose -f docker-compose.dev.yml exec backend bun run db:seed

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:3001"
echo "   Database: localhost:5432"
echo ""
echo "🔑 Default credentials:"
echo "   Admin: admin@teamterrain.com / admin123"
echo ""
echo "📋 Development commands:"
echo "   View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop: docker-compose -f docker-compose.dev.yml down"
echo "   Restart: docker-compose -f docker-compose.dev.yml restart"
echo "   Shell into backend: docker-compose -f docker-compose.dev.yml exec backend sh"
echo "   Shell into frontend: docker-compose -f docker-compose.dev.yml exec frontend sh"
echo ""
