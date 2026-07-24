#!/bin/bash
# Startup script for TravelProject with rootless Docker support

cd /home/jitender/Desktop/TravelProject

echo "🚀 Starting TravelProject..."

# Source environment variables properly
set -a
[ -f .env ] && . .env
set +a

# Start the API proxy in background (for rootless Docker)
echo "📡 Starting API proxy on port 3090..."
if [ -n "$GEMINI_API_KEY" ]; then
    nohup python3 api-proxy.py 3090 > proxy.log 2>&1 &
    echo "   Proxy PID: $!"
    echo "   Gemini API key loaded: ${GEMINI_API_KEY:0:10}..."
else
    echo "   ⚠️  GEMINI_API_KEY not found in .env - proxy will run in demo mode"
fi

# Start all Docker containers
echo "🐳 Starting Docker containers..."
docker compose up -d

echo "✅ All services starting! Wait ~60s for full startup."
echo ""
echo "📋 Access points:"
echo "   Frontend: http://localhost:5173/"
echo "   Manali demo: http://localhost:5173/?tenant=manali"
echo "   Admin: http://localhost:5173/admin"
echo ""
echo "📊 To check status:"
echo "   docker compose ps"
echo "   tail -f proxy.log"