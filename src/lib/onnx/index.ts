export { detectGPUCapabilities, getExpectedInferenceTime, getBackendDisplayName } from './webgpu-detector';
export type { GPUCapabilities } from './webgpu-detector';

export { loadDepthModel, clearModelCache, isModelCached } from './model-loader';
export type { ModelLoadProgress, OnProgressCallback } from './model-loader';

export { 
  imageDataToTensor, 
  normalizeDepthMap, 
  depthMapToImageData,
  getDepthMapDimensions,
  MODEL_INPUT_SIZE 
} from './tensor-utils';
