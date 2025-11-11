# Setup Guide

## Quick Start

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
AUTH0_SECRET='<generate using: openssl rand -hex 32>'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN'
AUTH0_CLIENT_ID='YOUR_AUTH0_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_AUTH0_CLIENT_SECRET'
MONGODB_URI='mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority'
MAX_DEVICES=3
```

### 2. Auth0 Configuration

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Create a new Application (Regular Web Application)
3. Configure URLs:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback, https://your-domain.vercel.app/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000, https://your-domain.vercel.app`
   - **Allowed Web Origins**: `http://localhost:3000, https://your-domain.vercel.app`

### 3. MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier M0)
3. Create database user
4. Add IP address to whitelist (use `0.0.0.0/0` for development)
5. Get connection string from "Connect" → "Connect your application"

### 4. Install and Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Deployment to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Update Auth0 URLs with production domain
5. Deploy!

## Testing Multi-Device Functionality

1. Login on Device 1 → Should work
2. Login on Device 2 → Should work
3. Login on Device 3 → Should work
4. Login on Device 4 → Should show device limit page
5. Force logout oldest device → Should allow login
6. Return to force-logged-out device → Should show graceful logout message

