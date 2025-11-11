# Multi-Device Auth App

Built this Next.js app with Auth0 for handling multiple device logins. Basically, users can be logged in on max 3 devices at the same time. When they try to login on a 4th device, they get prompted to either cancel or kick out one of the existing devices. Pretty straightforward.

## What it does

- Auth0 for login (free tier works fine)
- Tracks devices and limits to 3 concurrent sessions
- When limit is hit, shows a page to force logout an old device
- If a device gets force logged out, shows a nice message when they come back
- User can add their name and phone number in the dashboard
- UI looks decent with Tailwind

## Tech stuff

- Next.js 16 with App Router
- TypeScript
- Auth0 for auth
- MongoDB for storing device sessions
- Tailwind for styling
- Deployed on Vercel (free tier)

## What you need

- Node.js 18+ (npm comes with it)
- Auth0 account - free tier is enough
- MongoDB Atlas - also free tier works

## Getting started

First, clone the repo and install:

```bash
git clone <repository-url>
cd auth0-multi-device-app
npm install
```

### Auth0 setup

1. Sign up at [Auth0](https://auth0.com) (free tier)
2. Create a new Application:
   - Type: Regular Web Application
   - Callback URL: `http://localhost:3000/api/auth/callback`
   - Logout URL: `http://localhost:3000`
   - Web Origins: `http://localhost:3000`
3. Copy these values (you'll need them):
   - Domain
   - Client ID
   - Client Secret

### MongoDB setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier M0 works)
3. Create a database user
4. Add IP to whitelist (or use 0.0.0.0/0 for dev - not recommended for prod)
5. Get connection string from "Connect" button

### Environment variables

Create `.env.local` in the root:

```env
AUTH0_SECRET='<generate with: openssl rand -hex 32>'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN'
AUTH0_CLIENT_ID='YOUR_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_CLIENT_SECRET'
MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority'
MAX_DEVICES=3
```

Generate the secret:
```bash
openssl rand -hex 32
```

### Run it

```bash
npm run dev
```

Then open http://localhost:3000

## How it works

When a user logs in:
1. App checks if they already have a device session (cookie)
2. If not, checks how many devices they're logged in on
3. If they hit the limit (3 devices), shows a page to kick out an old device
4. Each page load validates the device session
5. If device was force logged out, shows a message when they come back

The device limit is configurable via `MAX_DEVICES` env var (defaults to 3).

### Database collections

**device_sessions** - stores active device sessions:
- userId, deviceId, deviceName
- sessionToken, createdAt, lastActiveAt
- userAgent (optional)

**user_profiles** - user info:
- userId, email
- fullName, phoneNumber (optional)
- updatedAt

## Deployment

Easiest way is Vercel:

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all the env variables in Vercel dashboard
4. Update Auth0 settings with your production URL:
   - Callback: `https://your-app.vercel.app/api/auth/callback`
   - Logout: `https://your-app.vercel.app`
   - Web Origins: `https://your-app.vercel.app`
5. Deploy

Don't forget to set these env vars in Vercel:
- AUTH0_SECRET
- AUTH0_BASE_URL (your production URL)
- AUTH0_ISSUER_BASE_URL
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET
- MONGODB_URI
- MAX_DEVICES (optional, default is 3)

## Free tier services

All of these are free:
- Auth0 - 7k monthly active users
- MongoDB Atlas - 512MB storage
- Vercel - unlimited personal projects

Should be enough for testing and small projects.

## Notes

- Device limit is set to 3 by default, change via MAX_DEVICES env var
- MongoDB connection uses a placeholder during build (to avoid build errors)
- Device sessions are tracked via cookies and MongoDB
- Force logout removes the device from DB, so validation fails on next page load

Built for Front End Developer Internship Task
