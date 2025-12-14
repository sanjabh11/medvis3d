'use client';

import { Loader2, CheckCircle, AlertCircle, Cpu, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInference } from './InferenceProvider';
import { getBackendDisplayName, getExpectedInferenceTime } from '@/lib/onnx';

export function ModelStatus() {
  const {
    runtimeStatus,
    modelProgress,
    capabilities,
    runtimeError,
    initializeRuntime,
  } = useInference();

  if (runtimeStatus === 'idle') {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-[--color-medical-text-primary]">
                AI Model Not Loaded
              </p>
              <p className="text-sm text-[--color-medical-text-secondary]">
                Load the model to enable 3D visualization
              </p>
            </div>
          </div>
          <Button 
            onClick={initializeRuntime}
            className="bg-[--color-medical-primary] hover:bg-[--color-medical-primary-hover]"
          >
            Load AI Model
          </Button>
        </div>
      </Card>
    );
  }

  if (runtimeStatus === 'detecting') {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[--color-medical-primary]" />
          <div>
            <p className="font-medium text-[--color-medical-text-primary]">
              Detecting Hardware...
            </p>
            <p className="text-sm text-[--color-medical-text-secondary]">
              Checking for GPU acceleration support
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (runtimeStatus === 'loading' && modelProgress) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[--color-medical-primary]" />
            <div className="flex-1">
              <p className="font-medium text-[--color-medical-text-primary]">
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
    );
  }

  if (runtimeStatus === 'ready' && capabilities) {
    return (
      <Card className="p-4 border-[--color-medical-success] bg-emerald-50">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-[--color-medical-success]" />
          <div className="flex-1">
            <p className="font-medium text-[--color-medical-text-primary]">
              AI Model Ready
            </p>
            <div className="flex items-center gap-4 text-sm text-[--color-medical-text-secondary]">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {getBackendDisplayName(capabilities.recommendedBackend)}
              </span>
              <span>Expected: {getExpectedInferenceTime(capabilities)}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (runtimeStatus === 'error') {
    return (
      <Card className="p-4 border-red-300 bg-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">
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
    );
  }

  return null;
}
