export { detectGPUCapabilities, getExpectedInferenceTime, getBackendDisplayName } from './webgpu-detector';
export type { GPUCapabilities } from './webgpu-detector';

export {
  loadDepthModel,
  clearModelCache,
  isModelCached,
  DEPTH_MODEL_INFO,
  DEPTH_MODEL_PROFILES,
  getDepthModelProfile,
} from './model-loader';
export type { DepthModelProfile, ModelLoadProgress, OnProgressCallback } from './model-loader';

export { 
  imageDataToTensor, 
  normalizeDepthMap, 
  depthMapToImageData,
  getDepthMapDimensions,
  MODEL_INPUT_SIZE 
} from './tensor-utils';
