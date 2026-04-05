# Deployment Guide — Ubuntu 24

## Prerequisites

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# PostgreSQL 16 (should already be installed)
sudo apt install -y postgresql-16
```

## Database Setup

```bash
sudo -u postgres psql <<'EOF'
CREATE USER batch_tracker_app WITH PASSWORD 'changeme';
ALTER USER batch_tracker_app CREATEDB;
CREATE DATABASE batch_tracker OWNER batch_tracker_app;
EOF
```

## Create App User & Directory

```bash
sudo useradd -r -s /bin/false batch-tracker
sudo mkdir -p /opt/batch-tracker/releases
sudo chown -R batch-tracker:batch-tracker /opt/batch-tracker

# Create .env with production secrets
sudo nano /opt/batch-tracker/.env
# → Add DATABASE_URL and JWT_SECRET (use a 64-char random hex)
sudo chmod 600 /opt/batch-tracker/.env
sudo chown batch-tracker:batch-tracker /opt/batch-tracker/.env
```

`.env` contents:
```
DATABASE_URL="postgresql://batch_tracker_app:STRONG_PASSWORD@localhost:5432/batch_tracker"
JWT_SECRET="CHANGE_THIS_TO_A_64_CHAR_RANDOM_HEX_STRING"
JWT_EXPIRY="8h"
```

## Build & Deploy

```bash
# On your dev machine or CI: build the project
npm install
npm run build

# Copy standalone output to server
RELEASE=$(date +%Y%m%d_%H%M)
sudo mkdir -p /opt/batch-tracker/releases/$RELEASE
sudo cp -r .next/standalone/. /opt/batch-tracker/releases/$RELEASE/
sudo cp -r .next/static /opt/batch-tracker/releases/$RELEASE/.next/static
sudo cp -r public /opt/batch-tracker/releases/$RELEASE/public

# Symlink to current release
sudo ln -sfn /opt/batch-tracker/releases/$RELEASE /opt/batch-tracker/current
sudo chown -R batch-tracker:batch-tracker /opt/batch-tracker/releases/$RELEASE
```

## Run Database Migrations & Seed

```bash
# From the project directory (with DATABASE_URL in .env)
npx prisma migrate deploy
npx tsx scripts/seed.ts
```

## Configure PM2

```bash
sudo -u batch-tracker pm2 start /path/to/deploy/ecosystem.config.js
pm2 startup systemd -u batch-tracker --hp /home/batch-tracker
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u batch-tracker --hp /var/lib/batch-tracker
pm2 save
```

## Configure Nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/batch-tracker
sudo ln -s /etc/nginx/sites-available/batch-tracker /etc/nginx/sites-enabled/
# Edit server_name in the conf to match your hostname/IP
sudo nginx -t
sudo systemctl reload nginx
```

## Post-Deploy

1. Visit `http://YOUR_SERVER_IP`
2. User portal: `/user/login` — testuser / user123
3. Admin portal: `/admin/login` — admin / admin123
4. **Change default passwords immediately** via admin user management or `scripts/seed.ts`

## Logs

```bash
pm2 logs batch-tracker
pm2 status
```
