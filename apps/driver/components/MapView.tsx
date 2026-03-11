'use client';

import type { ComponentType } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';

type MarkerRole = 'driver' | 'customer' | 'chef' | 'order';

export type MapMarker = {
  id: string;
  position: [number, number];
  label: string;
  role: MarkerRole;
};

const roleColors: Record<MarkerRole, string> = {
  driver: '#2563eb',
  customer: '#16a34a',
  chef: '#f97316',
  order: '#7c3aed',
};

const defaultCenter: [number, number] = [43.2206, -79.7658];

export default function MapView({ markers, height = '320px' }: { markers: MapMarker[]; height?: string }) {
  const center = markers[0]?.position ?? defaultCenter;
  const MapContainerAny = MapContainer as unknown as ComponentType<Record<string, unknown>>;
  const TileLayerAny = TileLayer as unknown as ComponentType<Record<string, unknown>>;
  const CircleMarkerAny = CircleMarker as unknown as ComponentType<Record<string, unknown>>;
  const PopupAny = Popup as unknown as ComponentType<Record<string, unknown>>;

  return (
    <div className="w-full overflow-hidden rounded-lg border" style={{ height }}>
      <MapContainerAny center={center} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayerAny
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <CircleMarkerAny
            key={marker.id}
            center={marker.position}
            radius={8}
            pathOptions={{ color: roleColors[marker.role], fillColor: roleColors[marker.role], fillOpacity: 0.9 }}
          >
            <PopupAny>
              <div className="text-sm font-medium">{marker.label}</div>
            </PopupAny>
          </CircleMarkerAny>
        ))}
      </MapContainerAny>
    </div>
  );
}
