#!/bin/bash

# NutriLogic Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting NutriLogic Deployment..."
echo "=================================="

# 1. Pull latest code
echo ""
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# # 2. Install PHP dependencies
# echo ""
# echo "📦 Installing PHP dependencies..."
# docker compose -f docker-compose.light.yml exec app composer install --no-dev --optimize-autoloader

# # 3. Install NPM dependencies
# echo ""
# echo "📦 Installing NPM dependencies..."
# npm install

# # 4. Build frontend assets
# echo ""
# echo "🏗️  Building frontend assets..."
# npm run build

# 5. Clear Laravel cache
echo ""
echo "🧹 Clearing Laravel cache..."
docker compose -f docker-compose.light.yml exec app php artisan config:clear
docker compose -f docker-compose.light.yml exec app php artisan cache:clear
docker compose -f docker-compose.light.yml exec app php artisan route:clear
docker compose -f docker-compose.light.yml exec app php artisan view:clear

# 6. Run migrations
echo ""
echo "🗄️  Running database migrations..."
docker compose -f docker-compose.light.yml exec app php artisan migrate --force

# 7. Optimize Laravel
echo ""
echo "⚡ Optimizing Laravel..."
docker compose -f docker-compose.light.yml exec app php artisan config:cache
docker compose -f docker-compose.light.yml exec app php artisan route:cache
docker compose -f docker-compose.light.yml exec app php artisan view:cache

# 8. Fix permissions
echo ""
# echo "🔐 Fixing permissions..."
# docker compose -f docker-compose.light.yml exec app chown -R www-data:www-data /var/www/html/storage
# docker compose -f docker-compose.light.yml exec app chown -R www-data:www-data /var/www/html/bootstrap/cache

# 9. Restart containers
echo ""
echo "🔄 Restarting containers..."
docker compose -f docker-compose.light.yml restart app queue

echo ""
echo "=================================="
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Container Status:"
docker compose -f docker-compose.light.yml ps
echo ""
echo "🌐 Application: http://YOUR_DOMAIN"
echo "🤖 n8n: http://YOUR_DOMAIN:5678"
echo ""
