import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import ClientErrorSuppressor from './ClientErrorSuppressor';

export const metadata: Metadata = {
  title: 'Ride & Dine - Driver',
  description: 'Driver app for Ride & Dine deliveries',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <ClientErrorSuppressor />
        {children}
      </body>
    </html>
  );
}
