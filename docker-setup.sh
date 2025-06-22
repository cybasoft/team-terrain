#!/bin/bash

# TeamTerrain Production Docker Setup Script
set -e

echo "🚀 Setting up TeamTerrain with Docker..."

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
docker compose down --remove-orphans 2>/dev/null || true

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo ""
    echo "⚠️  IMPORTANT: Please edit backend/.env with your production settings:"
    echo "   - Set a strong JWT_SECRET"
    echo "   - Set a secure API_AUTH_TOKEN"
    echo "   - Configure your database credentials"
    echo ""
    read -p "Press Enter to continue after editing backend/.env..."
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend/.env from example..."
    cp frontend/.env.example frontend/.env
    echo ""
    echo "⚠️  IMPORTANT: Please edit frontend/.env with your settings:"
    echo "   - Add your Mapbox access token"
    echo "   - Set the correct API base URL"
    echo "   - Configure admin emails"
    echo ""
    read -p "Press Enter to continue after editing frontend/.env..."
fi

# Build and start the production environment
echo "🔨 Building the production environment..."
docker compose build --no-cache

echo "🚀 Starting the production environment..."
docker compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Initialize database
echo "🗄️ Initializing database..."
docker compose exec app bun run db:migrate
docker compose exec app bun run db:seed

echo "✅ TeamTerrain is now running!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3001"
echo ""
echo "🔑 Default credentials:"
echo "   Admin: admin@teamterrain.com / admin123"
echo ""
echo "📋 Management commands:"
echo "   View logs: docker compose logs -f"
echo "   Stop: docker compose down"
echo "   Restart: docker compose restart"
echo "   Update: docker compose pull && docker compose up -d"
echo ""
echo "📚 For more information, see:"
echo "   - README.md for general setup"
echo "   - DOCKER.md for Docker-specific instructions"
echo "   - DEVELOPMENT.md for development workflow"
echo ""
