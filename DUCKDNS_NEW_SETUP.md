# DuckDNS Setup Guide: photobook-backend

## Step 1: Create Domain at DuckDNS (Do This First!)

1. Go to [duckdns.org](https://www.duckdns.org/)
2. **Login** with your account
3. Click **"Add Domain"** button
4. Type: `photobook-backend` (in the domain field)
5. Click **"Add Domain"**
6. Now you'll see: `photobook-backend.duckdns.org`
7. **Enter your EC2 Public IP** in the IPv4 field (e.g., `54.xxx.xxx.xxx`)
8. Click **"Update"** button
9. Wait 2-5 minutes for DNS to propagate

**Verify it works:**
```powershell
nslookup photobook-backend.duckdns.org
# Should show your EC2 public IP
```

---

## Step 2: Update EC2 Backend Files

### On your EC2 instance:

SSH into EC2:
```bash
ssh -i "photobook-key.pem" ec2-user@100.54.9.68
```

Then update the backend `.env` file:
```bash
cd /home/ec2-user/Photo-book/backend  # (or wherever your backend is)
nano .env
```

Find this line and update it:
```env
# OLD:
# ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://main.d27f9jvazqn4mr.amplifyapp.com,https://photobook-api.duckdns.org

# NEW:
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://main.d27f9jvazqn4mr.amplifyapp.com,https://photobook-backend.duckdns.org
```

Save file: Press `Ctrl+X`, then `Y`, then `Enter`

**Restart backend:**
```bash
cd /home/ec2-user/Photo-book
docker-compose restart backend
# OR
docker-compose down && docker-compose up -d
```

---

## Step 3: Update Amplify Frontend Files

### Method 1: Update files on your LOCAL computer (Windows)

Update these files in your local workspace:

**File 1: `/frontend/.env.production`**
```env
VITE_API_URL=https://photobook-backend.duckdns.org/api/v1
VITE_API_BASE_URL=https://photobook-backend.duckdns.org
```

**File 2: `/backend/.env`** (local copy)
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://main.d27f9jvazqn4mr.amplifyapp.com,https://photobook-backend.duckdns.org
```

**File 3: `/frontend/src/modules/chat/services/socketService.ts`**
```typescript
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "https://photobook-backend.duckdns.org";
```

### Then Deploy to Amplify:

```bash
# In frontend folder
npm run build

# Deploy the dist folder to Amplify:
# Option 1: Push to git (if connected to GitHub/GitLab)
git add .
git commit -m "Update DuckDNS domain to photobook-backend"
git push

# Option 2: Manual upload in Amplify console:
# - Go to AWS Amplify Console
# - Select your app
# - Drag and drop the /frontend/dist folder
```

---

## Step 4: Update Amplify Environment Variables (Important!)

Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/):

1. Select your **Photo-Book app**
2. Click **Environment variables** (in left sidebar)
3. Add these variables:
   ```
   VITE_API_URL=https://photobook-backend.duckdns.org/api/v1
   VITE_API_BASE_URL=https://photobook-backend.duckdns.org
   ```
4. Click **Save**
5. **Redeploy**: Click **Deployments** → select latest → **Redeploy this version**

---

## Summary of Changes

| Location | What to Change | Old Value | New Value |
|----------|---|---|---|
| EC2 Backend `.env` | ALLOWED_ORIGINS | `photobook-api.duckdns.org` | `photobook-backend.duckdns.org` |
| Frontend `.env.production` | VITE_API_URL | `photobook-api.duckdns.org` | `photobook-backend.duckdns.org` |
| Frontend `.env.production` | VITE_API_BASE_URL | `photobook-api.duckdns.org` | `photobook-backend.duckdns.org` |
| Frontend socketService.ts | SOCKET_URL fallback | `photobook-api.ddns.net` | `photobook-backend.duckdns.org` |
| Amplify Console | Env Variables | (Old or missing) | `photobook-backend.duckdns.org` |

---

## Test Login After Changes

1. Wait 5 minutes for all changes to propagate
2. Go to: `https://main.d27f9jvazqn4mr.amplifyapp.com/auth/login`
3. Open **DevTools** (F12) → **Network** tab
4. Try to login
5. Check that:
   - ✅ Network shows `POST /api/v1/auth/login` → **200 or 201** (success)
   - ❌ NOT showing 404 or **net::ERR_NAME_NOT_RESOLVED**

**If still getting errors:**
```bash
# Test from your local machine:
curl -v https://photobook-backend.duckdns.org/api/v1/auth/login
# Should NOT be DNS error - should be 405 (method not allowed)
```

---

## Quick Checklist

- [ ] DuckDNS domain created: `photobook-backend.duckdns.org`
- [ ] DuckDNS IP updated to EC2 public IP
- [ ] DNS resolves: `nslookup photobook-backend.duckdns.org` works
- [ ] EC2 `.env` updated with new domain
- [ ] EC2 backend restarted
- [ ] Frontend files updated with new domain
- [ ] Amplify environment variables set
- [ ] Frontend rebuilt and redeployed
- [ ] Waited 5 minutes for propagation
- [ ] Login tested and working ✅

