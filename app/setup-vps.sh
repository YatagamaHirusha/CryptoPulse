#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting VPS Setup for Web3Instant News Bot..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (LTS) if not installed
if ! command -v node &> /dev/null; then
    echo "🟢 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js is already installed."
fi

# Install PM2 globally
echo "🔄 Installing PM2..."
sudo npm install -g pm2

# Install dependencies
echo "📥 Installing project dependencies..."
npm ci

# Start the bot
echo "🤖 Starting the bot with PM2..."
pm2 start ecosystem.config.cjs

# Save PM2 list to resurrect on reboot
echo "💾 Saving PM2 process list..."
pm2 save

# Setup PM2 startup hook (this might require manual intervention depending on the OS, but we try)
# We just display the command to run if it fails or just run it
echo "🔌 Setting up PM2 startup hook..."
pm2 startup | tail -n 1 | bash || echo "⚠️  Could not auto-setup startup hook. Run 'pm2 startup' manually if needed."

echo "✅ Setup complete! Your bot is running in the background."
echo "📝 Use 'pm2 logs' to see the logs."
echo "🛑 Use 'pm2 stop news-bot' to stop it."
