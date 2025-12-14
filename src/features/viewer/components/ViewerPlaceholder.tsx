'use client';

import { Box, Upload } from 'lucide-react';

interface ViewerPlaceholderProps {
  hasImage: boolean;
  hasDepthMap: boolean;
}

export function ViewerPlaceholder({ hasImage, hasDepthMap }: ViewerPlaceholderProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900">
      <Box className="h-16 w-16 text-gray-600 mb-4" />
      
      {!hasImage ? (
        <>
          <p className="text-lg font-medium text-gray-400">3D Preview</p>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload an image to get started
          </p>
        </>
      ) : !hasDepthMap ? (
        <>
          <p className="text-lg font-medium text-gray-400">Ready for Analysis</p>
          <p className="text-sm text-gray-500 mt-2">
            Click &quot;Generate 3D View&quot; to create visualization
          </p>
        </>
      ) : null}
    </div>
  );
}
