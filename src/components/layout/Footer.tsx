'use client';

import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-[--color-medical-text-secondary]">
          <span>Built with</span>
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span>for better patient communication</span>
        </div>
        <div className="text-sm text-[--color-medical-text-tertiary]">
          © {new Date().getFullYear()} MedVis3D. For educational purposes only.
        </div>
      </div>
    </footer>
  );
}
