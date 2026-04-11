# SSL Certificate Setup with Let's Encrypt

## Step 1: SSH into Your EC2 Instance

```bash
ssh -i "photobook-key.pem" ec2-user@100.54.9.68
```

---

## Step 2: Install Certbot (Let's Encrypt Client)

```bash
# Update system
sudo yum update -y

# Install Certbot and Nginx plugin
sudo yum install certbot python3-certbot-nginx -y
```

---

## Step 3: Create SSL Certificate

```bash
# Stop backend temporarily (if running)
cd Photo-book
docker-compose down

# Get certificate from Let's Encrypt
sudo certbot certonly --standalone \
  -d photobook-backend.duckdns.org \
  --email your-email@gmail.com \
  --agree-tos \
  --non-interactive
```

**This creates:**
```
/etc/letsencrypt/live/photobook-backend.duckdns.org/
├── cert.pem          <- Certificate
├── chain.pem         <- Intermediate cert
├── fullchain.pem     <- Full certificate chain
└── privkey.pem       <- Private key
```

---

## Step 4: Update Nginx Configuration

Edit Nginx config to use SSL:

```bash
sudo nano /etc/nginx/conf.d/default.conf
```

Replace the entire content with:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name photobook-backend.duckdns.org;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name photobook-backend.duckdns.org;

    # SSL Certificate Paths
    ssl_certificate /etc/letsencrypt/live/photobook-backend.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/photobook-backend.duckdns.org/privkey.pem;
    
    # SSL Configuration (Security best practices)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Frontend - Static Files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }

    # Backend API - Proxy
    location /api/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Increase timeouts for long-running AI requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

Save: Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 5: Fix Permission Issues

Let your Docker container access the certificates:

```bash
# Make certificates readable
sudo chmod -R 755 /etc/letsencrypt/live/
sudo chmod -R 755 /etc/letsencrypt/archive/

# Add ec2-user to docker group (so you don't need sudo)
sudo usermod -aG docker ec2-user
```

---

## Step 6: Update Docker Compose to Mount Certificates

Edit your `docker-compose.yml`:

```bash
nano docker-compose.yml
```

Find the **nginx** section and update it:

```yaml
nginx:
  image: nginx:alpine
  container_name: photobook-nginx
  restart: always
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
    - /etc/letsencrypt:/etc/letsencrypt:ro  # Add this line
    - ./frontend/dist:/usr/share/nginx/html
  depends_on:
    - backend
  networks:
    - photobook-network
```

Save the file.

---

## Step 7: Start Services

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose logs -f nginx

# Should see: "Server running" or similar
```

---

## Step 8: Verify SSL Works

```bash
# Test from EC2 command line
curl -v https://photobook-backend.duckdns.org/api/v1/auth/login

# Should show:
# - SSL certificate is valid
# - Connected to photobook-backend.duckdns.org
# - Response from backend (not an SSL error)
```

---

## Step 9: Auto-Renewal Setup

Let's Encrypt certificates expire after 90 days. Set up auto-renewal:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Create cron job for auto-renewal
sudo bash -c 'cat > /etc/cron.d/certbot << EOF
0 3 * * * root /usr/bin/certbot renew --quiet && /usr/bin/docker-compose -f /home/ec2-user/Photo-book/docker-compose.yml restart nginx
EOF'
```

This will:
- ✅ Check for certificate renewal at 3 AM daily
- ✅ Automatically renew if needed
- ✅ Restart Nginx to load new certificate

---

## Step 10: Update Frontend to Use HTTPS

Update your environment files:

**`/frontend/.env.production`:**
```env
VITE_API_URL=https://photobook-backend.duckdns.org/api/v1
VITE_API_BASE_URL=https://photobook-backend.duckdns.org
```

**Socket service** (`/frontend/src/modules/chat/services/socketService.ts`):
```typescript
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "https://photobook-backend.duckdns.org";
```

Then rebuild and deploy:
```bash
npm run build
git add .
git commit -m "Setup: Enable HTTPS with Let's Encrypt SSL"
git push
```

---

## Troubleshooting

### ❌ Certificate creation failed?
```bash
# Check if DuckDNS domain resolves
nslookup photobook-backend.duckdns.org

# If it doesn't, update DuckDNS with your EC2 public IP first
```

### ❌ Nginx won't start?
```bash
# Check Nginx log
docker-compose logs nginx

# Validate Nginx config
docker-compose exec nginx nginx -t
```

### ❌ Certificate not found by Docker?
```bash
# Verify certificates exist
sudo ls -la /etc/letsencrypt/live/photobook-backend.duckdns.org/

# Check Docker volume mounting
docker-compose exec nginx ls -la /etc/letsencrypt/live/
```

### ❌ Still getting SSL error?
```bash
# Check certificate details
sudo openssl x509 -in /etc/letsencrypt/live/photobook-backend.duckdns.org/cert.pem -text -noout

# Should show your domain name in "Subject Alternative Name"
```

---

## Verify Everything Works

1. Test from local machine:
```powershell
curl -v https://photobook-backend.duckdns.org/api/v1/auth/login
# Should NOT show SSL errors
```

2. Go to your Amplify app: `https://main.d27f9jvazqn4mr.amplifyapp.com`

3. Check DevTools (F12) → Network tab:
   - ✅ Should see `https://photobook-backend.duckdns.org/api/v1/...` requests
   - ✅ Status should be **200/201** (not SSL errors)
   - ✅ No `net::ERR_CERT_COMMON_NAME_INVALID` errors

---

## Summary

| Step | Action |
|------|--------|
| 1 | SSH into EC2 |
| 2 | Install Certbot |
| 3 | Create SSL certificate |
| 4 | Update Nginx config with SSL |
| 5 | Fix permissions |
| 6 | Update docker-compose.yml |
| 7 | Start services |
| 8 | Verify SSL works |
| 9 | Set up auto-renewal |
| 10 | Update frontend to HTTPS |

**After all steps:** Your app will use `https://photobook-backend.duckdns.org` securely! 🔒✅

