import * as ort from 'onnxruntime-web';

const MODEL_URL = '/models/depth-anything-v2-small.onnx';
const CACHE_NAME = 'medvis3d-models-v1';
const MODEL_SIZE_BYTES = 50 * 1024 * 1024; // ~50MB estimated

export type ModelLoadProgress = {
  stage: 'checking-cache' | 'downloading' | 'creating-session' | 'ready' | 'error';
  progress: number; // 0-100
  message: string;
};

export type OnProgressCallback = (progress: ModelLoadProgress) => void;

async function getModelFromCache(): Promise<ArrayBuffer | null> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(MODEL_URL);
    if (response) {
      console.log('[Model] Found in cache');
      return await response.arrayBuffer();
    }
    return null;
  } catch (error) {
    console.warn('[Model] Cache check failed:', error);
    return null;
  }
}

async function cacheModel(buffer: ArrayBuffer): Promise<void> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': buffer.byteLength.toString(),
      },
    });
    await cache.put(MODEL_URL, response);
    console.log('[Model] Cached successfully');
  } catch (error) {
    console.warn('[Model] Failed to cache:', error);
  }
}

async function downloadModelWithProgress(
  onProgress: OnProgressCallback
): Promise<ArrayBuffer> {
  onProgress({
    stage: 'downloading',
    progress: 0,
    message: 'Downloading AI model...',
  });

  const response = await fetch(MODEL_URL);

  if (!response.ok) {
    throw new Error(`Failed to download model: ${response.status} ${response.statusText}`);
  }

  const contentLength = parseInt(response.headers.get('content-length') || '0');
  const totalSize = contentLength || MODEL_SIZE_BYTES;

  const reader = response.body?.getReader();
  if (!reader) {
    // Fallback: download without progress
    const buffer = await response.arrayBuffer();
    onProgress({
      stage: 'downloading',
      progress: 100,
      message: 'Download complete',
    });
    return buffer;
  }

  const chunks: Uint8Array[] = [];
  let receivedLength = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    receivedLength += value.length;

    const progress = Math.min(Math.round((receivedLength / totalSize) * 100), 99);
    onProgress({
      stage: 'downloading',
      progress,
      message: `Downloading: ${(receivedLength / 1024 / 1024).toFixed(1)}MB`,
    });
  }

  // Combine chunks
  const buffer = new Uint8Array(receivedLength);
  let position = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, position);
    position += chunk.length;
  }

  onProgress({
    stage: 'downloading',
    progress: 100,
    message: 'Download complete',
  });

  return buffer.buffer;
}

export async function loadDepthModel(
  backend: 'webgpu' | 'wasm',
  onProgress: OnProgressCallback
): Promise<ort.InferenceSession> {
  try {
    // Step 1: Check cache
    onProgress({
      stage: 'checking-cache',
      progress: 0,
      message: 'Checking for cached model...',
    });

    let modelBuffer = await getModelFromCache();

    // Step 2: Download if not cached
    if (!modelBuffer) {
      modelBuffer = await downloadModelWithProgress(onProgress);
      await cacheModel(modelBuffer);
    } else {
      onProgress({
        stage: 'downloading',
        progress: 100,
        message: 'Loaded from cache',
      });
    }

    // Step 3: Create inference session
    onProgress({
      stage: 'creating-session',
      progress: 0,
      message: 'Initializing AI engine...',
    });

    // Configure execution providers
    const executionProviders: ort.InferenceSession.ExecutionProviderConfig[] =
      backend === 'webgpu'
        ? ['webgpu', 'wasm']
        : ['wasm'];

    console.log('[Model] Creating session with providers:', executionProviders.map(p => typeof p === 'string' ? p : p.name));

    const session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders,
      graphOptimizationLevel: 'all',
    });

    onProgress({
      stage: 'ready',
      progress: 100,
      message: 'AI model ready',
    });

    console.log('[Model] Session created successfully');
    console.log('[Model] Input names:', session.inputNames);
    console.log('[Model] Output names:', session.outputNames);

    return session;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onProgress({
      stage: 'error',
      progress: 0,
      message: `Failed to load model: ${errorMessage}`,
    });
    throw error;
  }
}

export async function clearModelCache(): Promise<void> {
  try {
    await caches.delete(CACHE_NAME);
    console.log('[Model] Cache cleared');
  } catch (error) {
    console.warn('[Model] Failed to clear cache:', error);
  }
}

export async function isModelCached(): Promise<boolean> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(MODEL_URL);
    return response !== undefined;
  } catch {
    return false;
  }
}
