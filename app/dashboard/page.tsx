'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Profile {
  email: string;
  fullName: string;
  phoneNumber: string;
}

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phoneNumber: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [deviceValid, setDeviceValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      setupDevice();
      validateDevice();
      fetchProfile();
    }
  }, [user, isLoading, router]);

  const setupDevice = async () => {
    try {
      const res = await fetch('/api/auth/setup-device', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.canLogin === false) {
        // Redirect if hit device limit
        router.push('/device-limit');
      }
    } catch (error) {
      console.error('Device setup error:', error);
    }
  };

  const validateDevice = async () => {
    try {
      const res = await fetch('/api/device/validate');
      const data = await res.json();
      
      if (!data.valid) {
        // Check if device was force logged out
        if (data.reason === 'device_not_found' || data.reason === 'no_device') {
          router.push('/force-logout');
          return;
        }
      }
      setDeviceValid(data.valid);
    } catch (error) {
      console.error('Device validation error:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      setProfile(data);
      // Populate form with existing data
      setFormData({
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Refresh profile data and exit edit mode
        await fetchProfile();
        setIsEditing(false);
      } else {
        // TODO: show error message
        console.error('Failed to save profile');
      }
    } catch (error) {
      console.error('Profile save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || deviceValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <Link
              href="/api/auth/logout"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </Link>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 font-medium w-32">Email:</div>
                  <div className="text-gray-900">{profile?.email || user.email}</div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 font-medium w-32">Full Name:</div>
                  <div className="text-gray-900">
                    {profile?.fullName || 'Not set'}
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 font-medium w-32">Phone Number:</div>
                  <div className="text-gray-900">
                    {profile?.phoneNumber || 'Not set'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Devices Card */}
          <ActiveDevicesCard />
        </div>
      </div>
    </div>
  );
}

function ActiveDevicesCard() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
    // Auto-refresh device list every 5 seconds
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/device/list');
      const data = await res.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error('Device list error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Active Devices</h2>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : devices.length === 0 ? (
        <p className="text-gray-600">No active devices</p>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <div
              key={device.deviceId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">
                  {device.deviceName.includes('iPhone') || device.deviceName.includes('Android')
                    ? '📱'
                    : '💻'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{device.deviceName}</div>
                  <div className="text-sm text-gray-600">
                    Last active: {new Date(device.lastActiveAt).toLocaleString()}
                  </div>
                </div>
              </div>
              {device.isCurrent && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  Current Device
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

