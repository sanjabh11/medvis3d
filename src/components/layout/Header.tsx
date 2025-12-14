'use client';

import { Activity } from 'lucide-react';
import { PrivacyBadge } from './PrivacyBadge';

export function Header() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-[--color-medical-primary]" />
        <span className="font-semibold text-lg text-[--color-medical-text-primary]">
          MedVis3D
        </span>
      </div>
      <PrivacyBadge />
    </header>
  );
}
