# 🚀 Photo-book: Ultimate AWS Hosting Guide (2026)

This master guide provides a "one-click" journey to hosting your Photo-book application for **completely free** using AWS Free Tier services.

---

## 🏗️ Architecture
*   **Frontend**: AWS Amplify (Serverless) - Connects directly to GitHub.
*   **Backend**: AWS EC2 (`t2.micro`) - Runs the Backend + Redis in Docker.
*   **Database**: MongoDB Atlas (External Free Tier).
*   **Reverse Proxy**: Nginx (installed on EC2) with SSL (Certbot).

---

## 📍 Phase 1: Prerequisites
1.  **GitHub Repo**: Push your code to a GitHub repository.
2.  **Docker Hub**: Sign up for a free account at [hub.docker.com](https://hub.docker.com/).
3.  **DuckDNS**: Get a free domain at [duckdns.org](https://www.duckdns.org/) (e.g., `photobook-api.duckdns.org`).

---

## ☁️ Phase 2: AWS EC2 Zero-Configuration Setup
1.  **Launch Instance**: Select `Ubuntu 22.04 LTS` (Free Tier).
2.  **Security Group**: 
    - [x] Port 22 (SSH)
    - [x] Port 80 (HTTP)
    - [x] Port 443 (HTTPS)
3.  **Key Pair**: Download the `.pem` file.

### One-Click Provisioning
Once your EC2 is running, SSH into it and run this single command to install everything automatically:
```bash
# SSH in: ssh -i key.pem ubuntu@your-ec2-ip
curl -sSL https://raw.githubusercontent.com/YourUser/photo-book/main/scripts/setup-ec2.sh | bash
```

---

## 🔒 Phase 3: GitHub automation
In your GitHub Repo (**Settings > Secrets > Actions**), add these exact secrets:

| Secret Name | Value |
| :--- | :--- |
| `DOCKER_USERNAME` | Your Docker Hub Username |
| `DOCKER_PASSWORD` | Your Docker Hub Token/Password |
| `EC2_HOST` | Your EC2 Public IP |
| `EC2_SSH_KEY` | The full content of your `.pem` file |

---

## 🌐 Phase 4: Nginx Reverse Proxy (Docker Ready)
Your backend runs on port 5000 inside Docker. Nginx will route your domain to it.

1. Create config: `sudo nano /etc/nginx/sites-available/photobook`
2. **PASTE THIS CONFIG**:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.duckdns.org;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
3. Enable and SSL:
```bash
sudo ln -s /etc/nginx/sites-available/photobook /etc/nginx/sites-enabled/
sudo certbot --nginx -d YOUR_DOMAIN.duckdns.org
```

---

## 🎨 Phase 5: Frontend Hosting (AWS Amplify)
1.  Connect your GitHub repo to Amplify.
2.  **CRITICAL**: Add this **Environment Variable** in the Amplify Console:
    *   `VITE_API_URL`: `https://YOUR_DOMAIN.duckdns.org/api/v1`
3.  Deploy.

---
> [!IMPORTANT]
> Always ensure your `.env` file on the EC2 instance (in `~/photo-book/.env`) has the correct Production MongoDB Atlas and Redis strings!
