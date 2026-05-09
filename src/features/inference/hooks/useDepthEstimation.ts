'use client';

import { useState, useCallback } from 'react';
import * as ort from 'onnxruntime-web';
import { imageDataToTensor, normalizeDepthMap, MODEL_INPUT_SIZE } from '@/lib/onnx';
import { refineDepthMap } from '@/features/builder';

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
        const inputTensor = imageDataToTensor(imageData);

        // Step 2: Run inference
        setStatus('inferring');

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

        // Step 4: Postprocess - normalize depth map
        setStatus('postprocessing');

        const normalizedDepth = normalizeDepthMap(outputTensor.data as Float32Array);
        const refinedDepth = refineDepthMap(normalizedDepth, {
          width: MODEL_INPUT_SIZE,
          height: MODEL_INPUT_SIZE,
          smoothPasses: 1,
          edgeThreshold: 0.07,
          clipPercentile: 1,
        });

        const endTime = performance.now();
        const duration = endTime - startTime;

        setDepthMap(refinedDepth);
        setInferenceTime(duration);
        setStatus('complete');

        if (process.env.NODE_ENV !== 'production') {
          console.info(`[Inference] Educational depth build complete in ${duration.toFixed(0)}ms`);
        }

        return refinedDepth;
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
