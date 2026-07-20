#!/bin/bash
set -e

echo "📦 Drug Registration System - Production Start"
echo "==============================================="

# Run database migrations
echo "🗄️  Running database migrations..."
cd server
npx prisma migrate deploy

# Seed the database if empty
echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  Seed may have already run, continuing..."

cd ..

# Start the server
echo "🚀 Starting server..."
NODE_ENV=production npx tsx server/src/index.ts
