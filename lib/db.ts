import { MongoClient, Db } from 'mongodb';

// Helper to get mongo URI - handles build time edge cases
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Build time workaround - need to check this later
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      throw new Error('Please add your Mongo URI to .env.local');
    }
    // Placeholder for build
    return 'mongodb://localhost:27017/placeholder';
  }
  return uri;
}

const uri = getMongoUri();
const options = {}; // Default options should be fine

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Handle dev vs prod differently for HMR
if (process.env.NODE_ENV === 'development') {
  // Keep connection alive during hot reloads
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Production - fresh connection each time
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db('auth0_multi_device'); // TODO: maybe make this configurable
}

export interface DeviceSession {
  userId: string;
  deviceId: string;
  deviceName: string;
  sessionToken: string;
  createdAt: Date;
  lastActiveAt: Date;
  userAgent?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  updatedAt: Date;
}

