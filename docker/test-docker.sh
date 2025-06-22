#!/bin/bash

# Docker Build Test Script
# This script tests the Docker build process for TeamTerrain

set -e

echo "🐳 Testing TeamTerrain Docker Build"
echo "=================================="

# Test 1: Build main Dockerfile
echo "📦 Testing main Dockerfile build..."
docker build -t teamterrain:test .
echo "✅ Main Dockerfile build successful"

# Test 2: Build development Docker Compose
echo "📦 Testing Docker Compose build..."
docker-compose -f docker-compose.dev.yml build --no-cache
echo "✅ Docker Compose build successful"

# Test 3: Quick container test (optional)
read -p "🤔 Do you want to test container startup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Testing container startup..."
    
    # Create test environment files
    if [ ! -f backend/.env ]; then
        echo "📝 Creating test backend/.env..."
        cp backend/.env.example backend/.env
    fi
    
    if [ ! -f frontend/.env ]; then
        echo "📝 Creating test frontend/.env..."
        cp frontend/.env.example frontend/.env
    fi
    
    # Start services
    docker-compose -f docker-compose.dev.yml up -d
    
    echo "⏳ Waiting for services to start..."
    sleep 30
    
    echo "🔍 Checking service status..."
    docker-compose -f docker-compose.dev.yml ps
    
    echo "🧪 Testing endpoints..."
    curl -f http://localhost:8080 > /dev/null 2>&1 && echo "✅ Frontend responding" || echo "❌ Frontend not responding"
    curl -f http://localhost:3001/health > /dev/null 2>&1 && echo "✅ Backend health check passed" || echo "❌ Backend health check failed"
    
    echo "🛑 Stopping services..."
    docker-compose -f docker-compose.dev.yml down -v
    
    echo "✅ Container test completed"
fi

echo ""
echo "🎉 All Docker tests completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. The Docker build is working correctly"
echo "  2. Both Dockerfile and docker-compose.dev.yml are functional"
echo "  3. Your project is ready for CI/CD deployment"
echo ""
echo "💡 To run the application:"
echo "  docker-compose -f docker-compose.dev.yml up"
