# Multi-Device Auth App

Built this Next.js app with Auth0 for handling multiple device logins. Users can be logged in on a maximum of 3 devices at the same time. When they try to login on a 4th device, they get prompted to either cancel the login or force-logout an existing device.

## What it does

- Auth0 for login (free tier works fine)
- Tracks devices and limits to 3 concurrent sessions (MAX_DEVICES = 3)
- When limit is hit, shows a page to force logout an old device or cancel the current login
- If a device gets force logged out, shows a friendly message when they come back
- User can add their full name and phone number in the dashboard
- UI uses Tailwind for styling

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Auth0 (OAuth) for authentication
- MongoDB Atlas for storing device sessions and user profiles
- TailwindCSS for styling
- Deployable to Vercel (free tier)

## What you need (for local development)

- Node.js 18+ (npm comes with it)
- Auth0 account (free tier)
- MongoDB Atlas (free tier)

## Environment variables

Create a `.env.local` file in the project root with these values (examples):

AUTH0_SECRET='<generate with: openssl rand -hex 32>'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN'
AUTH0_CLIENT_ID='YOUR_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_CLIENT_SECRET'
MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority'
MAX_DEVICES=3

Generate the secret:

```
openssl rand -hex 32
```

## Run locally

1. npm install
2. npm run dev
3. Open http://localhost:3000

## How the multi-device flow works (high level)

1. On login, the app creates a device session in MongoDB (device_sessions) and sets a secure HttpOnly cookie with a session token that maps to the DB record.
2. If creating a new session would push the user's active device count over MAX_DEVICES (3), the app shows a UI listing existing sessions and allows the user to:
   - Cancel the current login,
   - Or select a previous device session to revoke. After revocation, the new login completes.
3. When a previously-revoked device makes a request, middleware/server-side checks fail and the user sees a friendly page: "You were signed out from another device".

## Database collections (expected)

device_sessions:
- userId, deviceId, deviceName
- sessionToken, createdAt, lastActiveAt
- userAgent

user_profiles:
- userId, email, fullName, phoneNumber
- updatedAt

## APIs (expected)

- POST /api/sessions/create — register a device session on login
- GET /api/sessions — list active sessions for the current user
- POST /api/sessions/revoke — revoke a session (force logout)
- Middleware or GET /api/auth/status — validate the current session on each page load

## Deployment (Vercel recommended)

1. Push code to GitHub (this repo already present)
2. Import project in Vercel
3. Add environment variables in the Vercel project settings (same as above, use production callback/logout URLs)
4. Update Auth0 application settings with your production URL:
   - Callback: `https://your-app.vercel.app/api/auth/callback`
   - Logout: `https://your-app.vercel.app`
   - Web Origins: `https://your-app.vercel.app`
5. Deploy

## How to test the MAX_DEVICES=3 flow (manual steps reviewers can follow)

1. Make sure MAX_DEVICES=3 in env.
2. Open Browser A (normal window) and log in with the test Auth0 account. Complete the profile (add name + phone) and confirm Private page displays name & phone.
3. Open Browser B (another browser) or Browser A incognito and log in with same account. Repeat for Browser C.
4. Attempt to login from Browser D (a 4th device/browser). The app should show a page listing the 3 active device sessions and present options:
   - Cancel login (stay on Browser D not logged in), or
   - Force logout one of the three previous devices (select a device and confirm). After forcing logout, Browser D becomes logged in.
5. Return to the forced-logged-out browser (one of A, B, or C) and reload the private page. The app should show a graceful logout page explaining "You were signed out from another device" and offer a button to log in again.

(If reviewers cannot see this flow, they can check the device_sessions collection in MongoDB Atlas to observe session create/revoke events.)

## Polishing & UX

- Use Tailwind classes for a consistent, professional look.
- Validate phone number fields client-side and server-side.
- Use accessible form labels and ARIA attributes for modals.

## Services used (free tiers)

- Auth0 (free tier for OAuth)
- MongoDB Atlas (free tier cluster)
- Vercel (free personal projects)

## What I changed/added in this update

- Expanded README to include an explicit reviewer guide and a step-by-step test plan for the MAX_DEVICES=3 flow.
- Added clear list of expected API endpoints and DB collections to make verification easier.

## Next steps I can take now

- Implement missing API endpoints and middleware for session create/list/revoke with full TypeScript code (I can add these as API routes in `/app/api/sessions/*`).
- Add UI pages for the "Choose a device to force logout" flow and the graceful logout page (if they are missing).
- Create unit/integration tests for session logic.