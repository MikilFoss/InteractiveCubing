'use client';

import { useState, useEffect } from 'react';
import Timer from './Timer';

function LoadingFallback() {
  return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
      Loading timer...
    </div>
  );
}

export default function ClientTimer() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render Timer on client side to avoid SSR issues with IndexedDB
  if (!isMounted) {
    return <LoadingFallback />;
  }

  return <Timer />;
}
