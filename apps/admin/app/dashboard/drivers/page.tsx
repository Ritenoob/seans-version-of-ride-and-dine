'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Driver {
  id: string;
  display_name: string;
  phone: string;
  vehicle_type: string;
  vehicle_plate: string;
  is_online: boolean;
  is_available: boolean;
  rating: number;
  total_deliveries: number;
  created_at: string;
  profile?: {
    email: string;
  };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        profile:profiles!drivers_user_id_fkey(email)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDrivers(data as Driver[]);
    }
    setLoading(false);
  };

  const toggleDriverStatus = async (driverId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('drivers')
      .update({ is_available: !currentStatus })
      .eq('id', driverId);

    if (!error) {
      setDrivers(drivers.map(d => 
        d.id === driverId ? { ...d, is_available: !currentStatus } : d
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading drivers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {drivers.filter(d => d.is_online).length} online
          </span>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700">
            Add Driver
          </button>
        </div>
      </div>

      {drivers.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500">No drivers registered yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deliveries</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {driver.display_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{driver.display_name}</p>
                        <p className="text-sm text-gray-500">{driver.profile?.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{driver.phone}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="capitalize">{driver.vehicle_type || 'N/A'}</span>
                    {driver.vehicle_plate && (
                      <span className="text-gray-500 ml-1">({driver.vehicle_plate})</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">{driver.total_deliveries}</td>
                  <td className="px-6 py-4 text-sm">
                    {driver.rating ? `${driver.rating}/5` : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full inline-block w-fit ${
                        driver.is_online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {driver.is_online ? 'Online' : 'Offline'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full inline-block w-fit ${
                        driver.is_available ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {driver.is_available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleDriverStatus(driver.id, driver.is_available)}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      {driver.is_available ? 'Mark Busy' : 'Mark Available'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
