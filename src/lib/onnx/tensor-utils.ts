import * as ort from 'onnxruntime-web';

export const MODEL_INPUT_SIZE = 518;

const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

export function imageDataToTensor(imageData: ImageData): ort.Tensor {
  const { width, height, data } = imageData;

  // Create canvas to resize image
  const canvas = document.createElement('canvas');
  canvas.width = MODEL_INPUT_SIZE;
  canvas.height = MODEL_INPUT_SIZE;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Create temp canvas with original image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) {
    throw new Error('Failed to get temp canvas context');
  }

  tempCtx.putImageData(imageData, 0, 0);

  // Draw resized image with high quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tempCanvas, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);

  const resizedData = ctx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);

  // Convert to CHW format with ImageNet normalization
  // Output shape: [1, 3, 518, 518]
  const float32Data = new Float32Array(3 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE);
  const pixelCount = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;

  for (let i = 0; i < pixelCount; i++) {
    const r = resizedData.data[i * 4] / 255;
    const g = resizedData.data[i * 4 + 1] / 255;
    const b = resizedData.data[i * 4 + 2] / 255;

    // Apply ImageNet normalization: (pixel - mean) / std
    // CHW format: all R values, then all G values, then all B values
    float32Data[i] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
    float32Data[pixelCount + i] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
    float32Data[2 * pixelCount + i] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
  }

  return new ort.Tensor('float32', float32Data, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
}

export function normalizeDepthMap(depthData: Float32Array | Int32Array | BigInt64Array | Uint8Array): Float32Array {
  // Convert to Float32Array if needed
  const data = depthData instanceof Float32Array ? depthData : new Float32Array(depthData as unknown as ArrayLike<number>);
  
  // Find min and max values
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < data.length; i++) {
    const val = data[i];
    if (val < min) min = val;
    if (val > max) max = val;
  }

  // Normalize to [0, 1] range
  const range = max - min;
  const normalized = new Float32Array(data.length);

  if (range === 0) {
    // All values are the same, return zeros
    return normalized;
  }

  for (let i = 0; i < data.length; i++) {
    normalized[i] = (data[i] - min) / range;
  }

  return normalized;
}

export function depthMapToImageData(
  depthMap: Float32Array,
  width: number,
  height: number
): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < depthMap.length; i++) {
    const value = Math.round(depthMap[i] * 255);
    const idx = i * 4;
    data[idx] = value;     // R
    data[idx + 1] = value; // G
    data[idx + 2] = value; // B
    data[idx + 3] = 255;   // A
  }

  return imageData;
}

export function getDepthMapDimensions(): { width: number; height: number } {
  return { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE };
}
