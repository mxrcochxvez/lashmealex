'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export default function PurchaseTracker() {
  useEffect(() => {
    analytics.purchaseComplete();
  }, []);

  return null;
}
