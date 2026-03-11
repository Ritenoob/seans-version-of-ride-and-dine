export interface Driver {
  id: string;
  userId: string;
  displayName: string;
  phone: string;
  vehicleType: VehicleType;
  vehiclePlate: string | null;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation: GeoLocation | null;
  rating: number;
  totalDeliveries: number;
  createdAt: string;
  updatedAt: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export type VehicleType = 'car' | 'motorcycle' | 'bicycle' | 'scooter';

export type DriverStatus = 'online' | 'offline' | 'busy';
