import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest } from 'next/server';

// Singleton pattern for auth0 client
let auth0Client: Auth0Client | null = null;

export function getAuth0Client(): Auth0Client {
  if (!auth0Client) {
    // Initialize once - reads from env vars
    auth0Client = new Auth0Client();
  }
  return auth0Client;
}

// Wrapper for getting session - handles both with and without request
export async function getSession(req?: NextRequest) {
  const client = getAuth0Client();
  if (req) {
    return await client.getSession(req);
  }
  // App router can call without request sometimes
  return await client.getSession();
}

