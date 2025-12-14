'use client';

import { Shield } from 'lucide-react';

export function PrivacyBadge() {
  return (
    <div className="flex items-center gap-2 text-sm text-[--color-medical-success] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
      <Shield className="h-4 w-4" />
      <span className="font-medium">Device-Side Processing</span>
    </div>
  );
}
