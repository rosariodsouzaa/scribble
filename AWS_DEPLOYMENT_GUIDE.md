# 🚀 AWS Deployment Guide — Scribble Royale

This guide covers deploying **Scribble Royale** (Vite React frontend + Node.js Express backend + Socket.IO real-time multiplayer) on **Amazon Web Services (AWS)**.

---

## 📌 Architecture & Prerequisites

- **Frontend:** React + Vite (compiled to static production build).
- **Backend:** Node.js Express with WebSockets (`socket.io`).
- **Database:** PostgreSQL (Neon Cloud or AWS RDS).
- **Architecture Note:** Because active game rooms are managed in-memory for low-latency gameplay, the best, most cost-effective architecture is **a single AWS EC2 instance (or Lightsail instance) behind Nginx with SSL (HTTPS & WSS)**.

---

## 🏆 Method 1: AWS EC2 (Recommended — Free Tier Eligible)

This is the standard, most cost-effective path. It runs comfortably on a `t2.micro` or `t3.micro` instance (eligible for the 12-month AWS Free Tier).

### Step 1: Launch an EC2 Instance
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Navigate to **EC2** > **Instances** > **Launch Instances**.
3. Configure the instance:
   - **Name:** `scribble-royale-server`
   - **OS Image (AMI):** **Ubuntu Server 24.04 LTS** (64-bit x86).
   - **Instance Type:** `t3.small` (recommended for smooth builds) or `t2.micro` / `t3.micro` (free tier).
   - **Key pair:** Create a new key pair (e.g. `scribble-key.pem`) and download it.
4. Under **Network settings**, configure firewall (Security Group):
   - Check **Allow SSH traffic from Anywhere** (or your IP).
   - Check **Allow HTTP traffic from the internet** (Port 80).
   - Check **Allow HTTPS traffic from the internet** (Port 443).
5. Storage: 20 GB gp3 is plenty.
6. Click **Launch Instance**.

---

### Step 2: Connect to your EC2 Instance
Open your terminal (PowerShell, Git Bash, or macOS/Linux Terminal) where your `scribble-key.pem` is stored:

```bash
# On Linux / Mac:
chmod 400 scribble-key.pem

# SSH into the instance:
ssh -i "scribble-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```
*(Alternatively, use **EC2 Instance Connect** in the AWS Console for a 1-click browser terminal).*

---

### Step 3: Install Docker & Docker Compose (Fastest Method)
Once logged into your EC2 terminal, run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose-v2 git

# Allow ubuntu user to run Docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

---

### Step 4: Clone Repository & Configure Environment
```bash
# Clone the repository
git clone <YOUR_GITHUB_REPO_URL> scribble-royale
cd scribble-royale

# Create production .env file
nano .env
```

Paste your production environment variables (press `Ctrl+O` then `Enter` to save, `Ctrl+X` to exit):
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://user:password@ep-host.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=super_secret_production_key_make_this_random_and_long
JWT_EXPIRES_IN=7d
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM=Scribble Royale <noreply@yourdomain.com>
```

---

### Step 5: Build and Run with Docker Compose
```bash
# Build and start container in the background
docker compose up -d --build

# View logs to verify startup
docker compose logs -f
```

Your app is now running on port `3001`!

---

### Step 6: Setup Nginx Reverse Proxy & Free SSL

To allow players to connect via `http://` (port 80) and secure `https://` / `wss://` (port 443):

```bash
# Install Nginx and Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Copy our pre-configured Nginx config
sudo cp nginx/default.conf /etc/nginx/sites-available/scribble-royale

# Edit the domain name in the config (or leave as default if using IP)
sudo nano /etc/nginx/sites-available/scribble-royale
```
In the config, set:
```nginx
server_name yourdomain.com www.yourdomain.com; # or your EC2 Public DNS
```

Enable the site and reload Nginx:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/scribble-royale /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Add Free HTTPS & WSS (Let's Encrypt):
Once your domain points to your EC2 Public IP:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will automatically install the certificate and configure auto-renewals.

---

## 🛠️ Method 2: Native Node.js + PM2 (Alternative to Docker)

If you prefer running without Docker:

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Install PM2 process manager
sudo npm install -g pm2

# Clone & Install dependencies
git clone <YOUR_GITHUB_REPO_URL> scribble-royale
cd scribble-royale
npm install

# Build the frontend
npm run build

# Copy .env
cp backend/.env.example .env
nano .env # update your secrets

# Start backend using PM2
NODE_ENV=production pm2 start backend/src/index.js --name "scribble-royale"

# Ensure PM2 restarts on server reboot
pm2 startup
pm2 save
```

---

## ⚡ Method 3: AWS Lightsail (Simplest 1-Click Cloud VPS)

AWS Lightsail is AWS's simplified cloud platform with predictable flat pricing ($3.50 - $5/month):
1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/).
2. Click **Create instance**.
3. Select **Linux/Unix** > **OS Only** > **Ubuntu 22.04 LTS / 24.04 LTS**.
4. Choose the **$3.50 or $5/month plan** (1 GB - 2 GB RAM).
5. Click **Create instance**.
6. Under the **Networking** tab of your instance:
   - Attach a **Static IP** (free).
   - Under IPv4 Firewall, ensure ports **80 (HTTP)** and **443 (HTTPS)** are open.
7. Click the terminal icon in Lightsail to open the web SSH console, then follow **Step 3 to Step 6** above!

---

## 🗄️ Database Options

1. **Neon PostgreSQL (Current Default - Recommended):**
   - Free tier, autoscaling serverless PostgreSQL.
   - Requires zero maintenance on AWS. Just paste your Neon connection string in `DATABASE_URL`.
2. **AWS RDS PostgreSQL (Enterprise AWS Native):**
   - In AWS Console, go to **RDS** > **Create database**.
   - Engine: **PostgreSQL**.
   - Template: **Free tier** (`db.t4g.micro` or `db.t3.micro`).
   - In VPC Security Groups, allow inbound port `5432` from your EC2 Security Group.
   - Use the RDS endpoint in your `DATABASE_URL`.

---

## 🔍 Verification Checklist

- [ ] Security group allows ports **80** (HTTP), **443** (HTTPS), and **22** (SSH).
- [ ] Backend is running (`docker ps` or `pm2 status`).
- [ ] Health check responds: `curl http://localhost:3001/api/health` returns `{"ok":true,"rooms":0,...}`.
- [ ] WebSockets connect: In your browser DevTools Network tab, filter for `WS` and verify `socket.io` connects with code `101 Switching Protocols`.
- [ ] SPA Routing works: Refreshing `/store` or `/lobby` correctly reloads the page without 404s (handled by `distPath` fallback and Nginx `try_files`).
