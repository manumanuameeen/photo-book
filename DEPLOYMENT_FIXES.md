# Login & API Deployment Fixes

## Issues Fixed ✅

### 1. **Network Error: DNS Resolution Failed**
**Problem**: `POST https://photobook-api.duckdns.org/api/v1/auth/login net::ERR_NAME_NOT_RESOLVED`

**Cause**: 
- DuckDNS domain either not set up or not pointing to your API server
- Frontend environment variables configured with internal IP that's not accessible from Amplify

**Fixes Applied**:
- ✅ Updated `/frontend/.env.production` to use `https://photobook-api.duckdns.org/api/v1`
- ✅ Updated `/frontend/.env` for local dev to use `http://localhost:5000/api/v1`
- ✅ Updated `/frontend/src/modules/chat/services/socketService.ts` to use correct DuckDNS domain
- ✅ Updated `/backend/.env` CORS to include your Amplify domain: `https://main.d27f9jvazqn4mr.amplifyapp.com`

### 2. **CORS Blocking Requests**
**Problem**: Frontend on Amplify couldn't reach backend (CORS errors)

**Cause**: Backend only allowed `localhost:5173` and `localhost:3000` origins

**Fix**: Updated `/backend/.env`:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://main.d27f9jvazqn4mr.amplifyapp.com,https://photobook-api.duckdns.org
```

### 3. **404 on /auth/login/**
**Problem**: `GET https://main.d27f9jvazqn4mr.amplifyapp.com/auth/login/ 404`

**Cause**: Frontend route mismatch or Amplify routing not configured

**Resolution**: Should be fixed by correcting API URL - the 404 was because API calls were failing

---

## Required Next Steps 🚀

### Step 1: Configure DuckDNS (CRITICAL)
Your API must be accessible via `photobook-api.duckdns.org`

1. Go to [duckdns.org](https://www.duckdns.org/)
2. Log in with your account
3. Find or create domain: `photobook-api`
4. Update the IP address to your server's public IP:
   - If running on home server: Your public IP from your ISP
   - If running on AWS/cloud: Your instance's public IP
   - Run this to check: `curl -s http://checkip.amazonaws.com`

5. **Test it works**:
   ```bash
   nslookup photobook-api.duckdns.org
   # Should return your public IP
   ```

### Step 2: Update Environment Variables with Correct Values

**Backend** (`/backend/.env`):
```env
# Make sure this matches your actual setup:
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://main.d27f9jvazqn4mr.amplifyapp.com,https://photobook-api.duckdns.org
```

**Frontend Production** (`/frontend/.env.production`):
```env
# Replace photobook-api with YOUR actual duckdns domain
VITE_API_URL=https://photobook-api.duckdns.org/api/v1
VITE_API_BASE_URL=https://photobook-api.duckdns.org
```

**Frontend Development** (`/frontend/.env`):
```env
# For local testing
VITE_API_URL=http://localhost:5000/api/v1
VITE_API_BASE_URL=http://localhost:5000
```

### Step 3: Verify Backend Is Running Correctly

```bash
# Check if backend is accessible
curl https://photobook-api.duckdns.org/api/v1/auth/login
# Should return 405 (Method Not Allowed) - GET not supported for POST endpoint
# NOT a 404 or network error

# Check CORS headers
curl -i -X OPTIONS https://photobook-api.duckdns.org/api/v1/auth/login \
  -H "Origin: https://main.d27f9jvazqn4mr.amplifyapp.com"
# Should show: Access-Control-Allow-Origin: https://main.d27f9jvazqn4mr.amplifyapp.com
```

### Step 4: Rebuild and Redeploy

**Local Development** (test before deploying):
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

**Production Deployment**:
```bash
# Rebuild Docker images with new env variables
docker-compose --file docker-compose.prod.yml up --build

# Or rebuild just frontend for Amplify:
npm run build
# Deploy the /frontend/dist folder to Amplify
```

### Step 5: Test Login Flow

1. Go to `https://main.d27f9jvazqn4mr.amplifyapp.com/auth/login`
2. Enter credentials
3. Check browser DevTools → Network tab:
   - ✅ Should see `POST /api/v1/auth/login` returning **200/201** (not 404 or network error)
   - ✅ Check Console for error messages

---

## Troubleshooting Checklist

- **Still getting DNS error?**
  - [ ] Verify DuckDNS domain is updated with correct IP
  - [ ] Wait a few minutes for DNS cache to clear
  - [ ] Try: `nslookup photobook-api.duckdns.org`

- **CORS error after loading page?**
  - [ ] Verify `ALLOWED_ORIGINS` in `/backend/.env` includes your Amplify domain
  - [ ] Restart backend container: `docker-compose restart backend`
  - [ ] Check backend logs: `docker-compose logs -f backend`

- **Getting 404 on API routes?**
  - [ ] Ensure `VITE_API_URL` in frontend points to correct backend
  - [ ] Check backend is running and accessible via `curl`
  - [ ] Verify routes match: `/api/v1/auth/login` (no trailing slash in code)

- **Network works locally but not in production?**
  - [ ] Frontend `.env.production` has correct API URL
  - [ ] Rebuild frontend: `npm run build`
  - [ ] Redeploy to Amplify
  - [ ] Clear browser cache (Ctrl+Shift+Delete)

---

## Files Modified

- ✅ `/frontend/.env.production` - Updated API URL for production
- ✅ `/frontend/.env` - Corrected local dev URL
- ✅ `/frontend/src/modules/chat/services/socketService.ts` - Fixed socket URL
- ✅ `/backend/.env` - Updated CORS origins

## Need More Help?

Check the logs:
```bash
# Backend errors
docker-compose logs backend | grep -i error

# Frontend console (use DevTools in browser)
# Check: F12 → Console tab for console.error() messages
```
