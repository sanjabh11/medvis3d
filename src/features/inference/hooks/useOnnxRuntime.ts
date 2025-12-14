'use client';

import { useState, useCallback, useRef } from 'react';
import * as ort from 'onnxruntime-web';
import {
  detectGPUCapabilities,
  loadDepthModel,
  type GPUCapabilities,
  type ModelLoadProgress,
} from '@/lib/onnx';

export type RuntimeStatus = 'idle' | 'detecting' | 'loading' | 'ready' | 'error';

interface UseOnnxRuntimeReturn {
  session: ort.InferenceSession | null;
  status: RuntimeStatus;
  progress: ModelLoadProgress | null;
  capabilities: GPUCapabilities | null;
  error: string | null;
  initialize: () => Promise<void>;
  reset: () => void;
}

export function useOnnxRuntime(): UseOnnxRuntimeReturn {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [status, setStatus] = useState<RuntimeStatus>('idle');
  const [progress, setProgress] = useState<ModelLoadProgress | null>(null);
  const [capabilities, setCapabilities] = useState<GPUCapabilities | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const initializingRef = useRef(false);

  const initialize = useCallback(async () => {
    if (initializingRef.current || status === 'ready') {
      return;
    }

    initializingRef.current = true;
    setStatus('detecting');
    setError(null);

    try {
      // Step 1: Detect GPU capabilities
      console.log('[Runtime] Detecting GPU capabilities...');
      const caps = await detectGPUCapabilities();
      setCapabilities(caps);
      console.log('[Runtime] Detected:', caps);

      // Step 2: Load model
      setStatus('loading');
      const loadedSession = await loadDepthModel(
        caps.recommendedBackend,
        (prog) => setProgress(prog)
      );

      setSession(loadedSession);
      setStatus('ready');
      console.log('[Runtime] Initialization complete');
    } catch (err) {
      console.error('[Runtime] Initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize AI runtime');
      setStatus('error');
    } finally {
      initializingRef.current = false;
    }
  }, [status]);

  const reset = useCallback(() => {
    if (session) {
      // Note: ONNX Runtime Web sessions don't have a dispose method
      // The garbage collector will handle cleanup
    }
    setSession(null);
    setStatus('idle');
    setProgress(null);
    setCapabilities(null);
    setError(null);
    initializingRef.current = false;
  }, [session]);

  return {
    session,
    status,
    progress,
    capabilities,
    error,
    initialize,
    reset,
  };
}
