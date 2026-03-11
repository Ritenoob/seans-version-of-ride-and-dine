'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export default function ClientErrorSuppressor() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const originalError = console.error;
    console.error = (...args) => {
      const message = args.map((arg) => (typeof arg === 'string' ? arg : '')).join(' ');
      if (message.includes('logFromNative')) return;
      if (message.includes('next-devtools')) return;
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
