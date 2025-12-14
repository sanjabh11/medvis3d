'use client';

import { Loader2, Box } from 'lucide-react';

interface ViewerLoadingProps {
  message?: string;
}

export function ViewerLoading({ message = 'Loading 3D viewer...' }: ViewerLoadingProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900">
      <div className="relative">
        <Box className="h-16 w-16 text-gray-600" />
        <Loader2 className="h-8 w-8 text-[--color-medical-primary] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
      </div>
      <p className="text-gray-400 mt-4">{message}</p>
    </div>
  );
}
