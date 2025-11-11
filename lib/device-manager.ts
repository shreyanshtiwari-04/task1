import { getDb, DeviceSession } from './db';
import { randomBytes } from 'crypto';

// Max devices allowed - configurable via env
const MAX_DEVICES = parseInt(process.env.MAX_DEVICES || '3', 10);

export async function getActiveDevices(userId: string): Promise<DeviceSession[]> {
  const db = await getDb();
  // Get all devices for this user, sorted by most recent activity
  const devices = await db
    .collection<DeviceSession>('device_sessions')
    .find({ userId })
    .sort({ lastActiveAt: -1 })
    .toArray();
  return devices;
}

export async function addDeviceSession(
  userId: string,
  deviceId: string,
  deviceName: string,
  sessionToken: string,
  userAgent?: string
): Promise<void> {
  const db = await getDb();
  const now = new Date();
  
  // Insert new device session
  await db.collection<DeviceSession>('device_sessions').insertOne({
    userId,
    deviceId,
    deviceName,
    sessionToken,
    createdAt: now,
    lastActiveAt: now, // Track when device was last used
    userAgent,
  });
}

export async function removeDeviceSession(userId: string, deviceId: string): Promise<void> {
  const db = await getDb();
  await db.collection<DeviceSession>('device_sessions').deleteOne({
    userId,
    deviceId,
  });
}

export async function updateDeviceActivity(userId: string, deviceId: string): Promise<void> {
  const db = await getDb();
  await db.collection<DeviceSession>('device_sessions').updateOne(
    { userId, deviceId },
    { $set: { lastActiveAt: new Date() } }
  );
}

export async function checkDeviceLimit(userId: string): Promise<{
  canLogin: boolean;
  activeDevices: DeviceSession[];
  oldestDevice?: DeviceSession;
}> {
  const activeDevices = await getActiveDevices(userId);
  
  // Check if user has room for another device
  if (activeDevices.length < MAX_DEVICES) {
    return {
      canLogin: true,
      activeDevices,
    };
  }

  // User hit the limit - find the oldest device to potentially kick out
  const sortedDevices = [...activeDevices].sort(
    (a, b) => a.lastActiveAt.getTime() - b.lastActiveAt.getTime()
  );

  return {
    canLogin: false,
    activeDevices,
    oldestDevice: sortedDevices[0], // First one is the oldest
  };
}

export async function removeOldestDevice(userId: string): Promise<DeviceSession | null> {
  const activeDevices = await getActiveDevices(userId);
  
  if (activeDevices.length === 0) {
    return null;
  }

  const sortedDevices = [...activeDevices].sort(
    (a, b) => a.lastActiveAt.getTime() - b.lastActiveAt.getTime()
  );

  const oldestDevice = sortedDevices[0];
  await removeDeviceSession(userId, oldestDevice.deviceId);
  
  return oldestDevice;
}

export function generateDeviceId(): string {
  return randomBytes(16).toString('hex');
}

export function getDeviceName(userAgent?: string): string {
  if (!userAgent) return 'Unknown Device';
  
  // Basic device detection from user agent
  // Could be improved but works for now
  if (userAgent.includes('Mobile')) {
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('Android')) return 'Android Device';
    return 'Mobile Device';
  }
  
  // Desktop detection
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Linux')) return 'Linux PC';
  
  // Fallback
  return 'Desktop Device';
}

