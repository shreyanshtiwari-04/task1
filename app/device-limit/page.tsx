'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Device {
  deviceId: string;
  deviceName: string;
  lastActiveAt: string;
}

export default function DeviceLimitPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [oldestDevice, setOldestDevice] = useState<Device | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      checkDeviceLimit();
    }
  }, [user, isLoading, router]);

  const checkDeviceLimit = async () => {
    try {
      const res = await fetch('/api/device/check');
      const data = await res.json();

      if (data.canLogin) {
        // Shouldn't be on this page if can login
        router.push('/dashboard');
        return;
      }

      setDevices(data.activeDevices || []);
      setOldestDevice(data.oldestDevice);
    } catch (error) {
      console.error('Device check error:', error);
    }
  };

  const handleForceLogout = async () => {
    if (!oldestDevice) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/device/force-logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceIdToRemove: oldestDevice.deviceId }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Failed to remove device. Please try again.');
      }
    } catch (error) {
      console.error('Force logout error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push('/api/auth/logout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Device Limit Reached
          </h1>
          <p className="text-lg text-gray-600">
            You are already logged in on 3 devices. To continue, you need to log out from one of your existing devices.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Currently Active Devices:
          </h2>
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.deviceId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-transparent"
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
                {oldestDevice?.deviceId === device.deviceId && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    Oldest
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-900">
            <strong>Recommended:</strong> We'll automatically log out the oldest device ({oldestDevice?.deviceName}) to make room for this device.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleForceLogout}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Logout Oldest Device & Continue'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel Login
          </button>
        </div>
      </div>
    </div>
  );
}

