'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useOnnxRuntime, useDepthEstimation } from '../hooks';
import type { RuntimeStatus } from '../hooks';
import type { GPUCapabilities, ModelLoadProgress } from '@/lib/onnx';
import * as ort from 'onnxruntime-web';

interface InferenceContextValue {
  // Runtime state
  session: ort.InferenceSession | null;
  runtimeStatus: RuntimeStatus;
  modelProgress: ModelLoadProgress | null;
  capabilities: GPUCapabilities | null;
  runtimeError: string | null;
  
  // Inference state
  depthMap: Float32Array | null;
  depthSize: number;
  inferenceStatus: string;
  inferenceTime: number | null;
  inferenceError: string | null;
  
  // Actions
  initializeRuntime: () => Promise<void>;
  estimateDepth: (imageData: ImageData) => Promise<Float32Array | null>;
  resetInference: () => void;
}

const InferenceContext = createContext<InferenceContextValue | null>(null);

interface InferenceProviderProps {
  children: ReactNode;
  autoInitialize?: boolean;
}

export function InferenceProvider({ 
  children, 
  autoInitialize = false 
}: InferenceProviderProps) {
  const {
    session,
    status: runtimeStatus,
    progress: modelProgress,
    capabilities,
    error: runtimeError,
    initialize: initializeRuntime,
  } = useOnnxRuntime();

  const {
    depthMap,
    depthSize,
    status: inferenceStatus,
    inferenceTime,
    error: inferenceError,
    estimateDepth,
    reset: resetInference,
  } = useDepthEstimation(session);

  // Auto-initialize on mount if requested
  useEffect(() => {
    if (autoInitialize && runtimeStatus === 'idle') {
      initializeRuntime();
    }
  }, [autoInitialize, runtimeStatus, initializeRuntime]);

  const value: InferenceContextValue = {
    session,
    runtimeStatus,
    modelProgress,
    capabilities,
    runtimeError,
    depthMap,
    depthSize,
    inferenceStatus,
    inferenceTime,
    inferenceError,
    initializeRuntime,
    estimateDepth,
    resetInference,
  };

  return (
    <InferenceContext.Provider value={value}>
      {children}
    </InferenceContext.Provider>
  );
}

export function useInference(): InferenceContextValue {
  const context = useContext(InferenceContext);
  if (!context) {
    throw new Error('useInference must be used within an InferenceProvider');
  }
  return context;
}
