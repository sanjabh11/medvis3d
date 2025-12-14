'use client';

import { ReactNode } from 'react';
import { InferenceProvider } from '@/features/inference';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <InferenceProvider>
      {children}
    </InferenceProvider>
  );
}
