#!/bin/bash

# ==============================================================================
# PHOTO-BOOK EC2 PROVISIONING SCRIPT (One-Click Setup)
# ==============================================================================

set -e # Exit on error

echo "🚀 Starting Photo-book EC2 Setup..."

# 1. Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker
echo "🐳 Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Add current user to Docker group
sudo usermod -aG docker $USER
echo "✅ Docker installed. (Note: You may need to logout/login for docker permissions)"

# 4. Install Nginx and Certbot
echo "🌐 Installing Nginx and Certbot..."
sudo apt-get install -y nginx certbot python3-certbot-nginx

# 5. Create app directory
mkdir -p ~/photo-book

echo "=============================================================================="
echo "🎉 EC2 SETUP COMPLETE!"
echo "=============================================================================="
echo "Next steps:"
echo "1. Put your production .env inside ~/photo-book/.env"
echo "2. Set up your GitHub Action secrets (DOCKER_USERNAME, EC2_HOST, etc.)"
echo "3. Trigger your first GitHub push to deploy!"
echo "=============================================================================="
