'use client';

import { useEffect } from 'react';
import { Brain, Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useInference } from '@/features/inference';
import { useAppStore } from '@/stores';
import { getBackendDisplayName, getExpectedInferenceTime } from '@/lib/onnx';

export function InferenceSection() {
  const { file, imageData, setDepthMap } = useAppStore();
  const {
    runtimeStatus,
    modelProgress,
    capabilities,
    runtimeError,
    inferenceStatus,
    inferenceTime,
    inferenceError,
    depthMap,
    initializeRuntime,
    estimateDepth,
  } = useInference();

  // Update global store when depth map changes
  useEffect(() => {
    if (depthMap) {
      setDepthMap(depthMap);
    }
  }, [depthMap, setDepthMap]);

  // Don't show if no file uploaded
  if (!file) {
    return null;
  }

  const handleGenerateDepth = async () => {
    if (!imageData) return;
    
    // Initialize runtime if not ready
    if (runtimeStatus === 'idle') {
      await initializeRuntime();
    }
    
    // Wait for model to be ready, then run inference
    // Note: In a real app, we'd want better state handling here
  };

  const handleRunInference = async () => {
    if (!imageData) return;
    await estimateDepth(imageData);
  };

  // Model loading state
  if (runtimeStatus === 'idle') {
    return (
      <section>
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <Brain className="h-6 w-6 text-[--color-medical-primary]" />
              </div>
              <div>
                <p className="font-semibold text-[--color-medical-text-primary]">
                  Ready to Analyze
                </p>
                <p className="text-sm text-[--color-medical-text-secondary]">
                  Load the AI model to generate 3D visualization
                </p>
              </div>
            </div>
            <Button
              onClick={initializeRuntime}
              className="bg-[--color-medical-primary] hover:bg-[--color-medical-primary-hover]"
            >
              <Brain className="h-4 w-4 mr-2" />
              Load AI Model
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  // Detecting hardware
  if (runtimeStatus === 'detecting') {
    return (
      <section>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-[--color-medical-primary]" />
            <div>
              <p className="font-semibold text-[--color-medical-text-primary]">
                Detecting Hardware...
              </p>
              <p className="text-sm text-[--color-medical-text-secondary]">
                Checking for GPU acceleration support
              </p>
            </div>
          </div>
        </Card>
      </section>
    );
  }

  // Loading model
  if (runtimeStatus === 'loading' && modelProgress) {
    return (
      <section>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-[--color-medical-primary]" />
              <div className="flex-1">
                <p className="font-semibold text-[--color-medical-text-primary]">
                  {modelProgress.message}
                </p>
                {capabilities && (
                  <p className="text-sm text-[--color-medical-text-secondary]">
                    Using {getBackendDisplayName(capabilities.recommendedBackend)}
                  </p>
                )}
              </div>
            </div>
            {modelProgress.stage === 'downloading' && (
              <Progress value={modelProgress.progress} className="h-2" />
            )}
          </div>
        </Card>
      </section>
    );
  }

  // Model load error
  if (runtimeStatus === 'error') {
    return (
      <section>
        <Card className="p-6 border-red-300 bg-red-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">
                  Failed to Load Model
                </p>
                <p className="text-sm text-red-600">
                  {runtimeError || 'Unknown error occurred'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={initializeRuntime}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  // Model ready - show inference controls
  if (runtimeStatus === 'ready') {
    // Inference in progress
    if (inferenceStatus === 'preprocessing' || inferenceStatus === 'inferring' || inferenceStatus === 'postprocessing') {
      const statusMessages: Record<string, string> = {
        preprocessing: 'Preparing image...',
        inferring: 'Running depth estimation...',
        postprocessing: 'Generating depth map...',
      };

      return (
        <section>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-[--color-medical-primary]" />
              <div>
                <p className="font-semibold text-[--color-medical-text-primary]">
                  {statusMessages[inferenceStatus] || 'Processing...'}
                </p>
                <p className="text-sm text-[--color-medical-text-secondary]">
                  This may take a few seconds
                </p>
              </div>
            </div>
          </Card>
        </section>
      );
    }

    // Inference complete
    if (inferenceStatus === 'complete' && depthMap) {
      return (
        <section>
          <Card className="p-6 border-[--color-medical-success] bg-emerald-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-[--color-medical-success]" />
                <div>
                  <p className="font-semibold text-[--color-medical-text-primary]">
                    Depth Analysis Complete
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[--color-medical-text-secondary]">
                    {inferenceTime && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {(inferenceTime / 1000).toFixed(2)}s
                      </span>
                    )}
                    {capabilities && (
                      <span>{getBackendDisplayName(capabilities.recommendedBackend)}</span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleRunInference}
                className="border-[--color-medical-success] text-[--color-medical-success] hover:bg-emerald-100"
              >
                Re-analyze
              </Button>
            </div>
          </Card>
        </section>
      );
    }

    // Inference error
    if (inferenceStatus === 'error') {
      return (
        <section>
          <Card className="p-6 border-red-300 bg-red-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">
                    Analysis Failed
                  </p>
                  <p className="text-sm text-red-600">
                    {inferenceError || 'Unknown error occurred'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleRunInference}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </Card>
        </section>
      );
    }

    // Ready to run inference
    return (
      <section>
        <Card className="p-6 border-[--color-medical-primary] bg-blue-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full">
                <Brain className="h-6 w-6 text-[--color-medical-primary]" />
              </div>
              <div>
                <p className="font-semibold text-[--color-medical-text-primary]">
                  AI Model Ready
                </p>
                <div className="flex items-center gap-4 text-sm text-[--color-medical-text-secondary]">
                  {capabilities && (
                    <>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {getBackendDisplayName(capabilities.recommendedBackend)}
                      </span>
                      <span>Expected: {getExpectedInferenceTime(capabilities)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={handleRunInference}
              disabled={!imageData}
              className="bg-[--color-medical-primary] hover:bg-[--color-medical-primary-hover]"
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate 3D View
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  return null;
}
