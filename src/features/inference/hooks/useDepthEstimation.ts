'use client';

import { useState, useCallback } from 'react';
import * as ort from 'onnxruntime-web';
import { imageDataToTensor, normalizeDepthMap, MODEL_INPUT_SIZE } from '@/lib/onnx';

export type InferenceStatus = 'idle' | 'preprocessing' | 'inferring' | 'postprocessing' | 'complete' | 'error';

interface UseDepthEstimationReturn {
  depthMap: Float32Array | null;
  depthSize: number;
  status: InferenceStatus;
  inferenceTime: number | null;
  error: string | null;
  estimateDepth: (imageData: ImageData) => Promise<Float32Array | null>;
  reset: () => void;
}

export function useDepthEstimation(
  session: ort.InferenceSession | null
): UseDepthEstimationReturn {
  const [depthMap, setDepthMap] = useState<Float32Array | null>(null);
  const [status, setStatus] = useState<InferenceStatus>('idle');
  const [inferenceTime, setInferenceTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const estimateDepth = useCallback(
    async (imageData: ImageData): Promise<Float32Array | null> => {
      if (!session) {
        setError('AI model not loaded');
        setStatus('error');
        return null;
      }

      setStatus('preprocessing');
      setError(null);
      setInferenceTime(null);

      const startTime = performance.now();

      try {
        // Step 1: Preprocess image to tensor
        console.log('[Inference] Preprocessing image...');
        console.log('[Inference] Input dimensions:', imageData.width, 'x', imageData.height);
        
        const inputTensor = imageDataToTensor(imageData);
        console.log('[Inference] Tensor shape:', inputTensor.dims);

        // Step 2: Run inference
        setStatus('inferring');
        console.log('[Inference] Running depth estimation...');

        // Determine input name (may vary by model export)
        const inputName = session.inputNames[0] || 'pixel_values';
        const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor };

        const results = await session.run(feeds);

        // Step 3: Get output tensor
        const outputName = session.outputNames[0] || 'predicted_depth';
        const outputTensor = results[outputName];

        if (!outputTensor) {
          throw new Error(`Output tensor "${outputName}" not found in results`);
        }

        console.log('[Inference] Output tensor shape:', outputTensor.dims);
        console.log('[Inference] Output tensor type:', outputTensor.type);

        // Step 4: Postprocess - normalize depth map
        setStatus('postprocessing');
        console.log('[Inference] Normalizing depth map...');

        const normalizedDepth = normalizeDepthMap(outputTensor.data as Float32Array);

        const endTime = performance.now();
        const duration = endTime - startTime;

        setDepthMap(normalizedDepth);
        setInferenceTime(duration);
        setStatus('complete');

        console.log(`[Inference] Complete in ${duration.toFixed(0)}ms`);
        console.log('[Inference] Depth map size:', normalizedDepth.length);
        console.log('[Inference] Depth range: [0, 1] normalized');

        return normalizedDepth;
      } catch (err) {
        console.error('[Inference] Failed:', err);
        setError(err instanceof Error ? err.message : 'Depth estimation failed');
        setStatus('error');
        return null;
      }
    },
    [session]
  );

  const reset = useCallback(() => {
    setDepthMap(null);
    setStatus('idle');
    setInferenceTime(null);
    setError(null);
  }, []);

  return {
    depthMap,
    depthSize: MODEL_INPUT_SIZE,
    status,
    inferenceTime,
    error,
    estimateDepth,
    reset,
  };
}
