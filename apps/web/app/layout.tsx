import type { Metadata } from 'next';
import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import { Header } from '@/components/Header';
import { CartProvider } from '@/lib/context/CartContext';
import ClientErrorSuppressor from './ClientErrorSuppressor';

export const metadata: Metadata = {
  title: 'Ride & Dine - Home Cooked Meals Delivered',
  description: 'Order delicious home-cooked meals from local chefs, delivered to your door.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <CartProvider>
          <ClientErrorSuppressor />
          <Header />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
