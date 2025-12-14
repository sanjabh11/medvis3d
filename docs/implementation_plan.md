# Step-by-Step Implementation Plan

## Medical Imaging 3D Visualization Platform

**Approach:** First Principles Thinking  
**Date:** December 14, 2024

---

## Executive Overview

This document provides a **granular, step-by-step implementation plan** derived from first principles analysis. Each step is atomic, testable, and builds upon previous steps.

---

## First Principles Breakdown

### What is the absolute minimum we need?

```
CORE PROBLEM: Convert 2D image → 3D visualization in browser

DECOMPOSITION:
├── 1. Get image into browser memory (File API)
├── 2. Convert image to tensor format (Canvas API)
├── 3. Run depth estimation model (ONNX Runtime)
├── 4. Convert depth output to 3D mesh (Three.js)
└── 5. Display and interact (WebGL + Touch events)

EACH STEP IS INDEPENDENT AND TESTABLE
```

### Technology Selection Rationale

| Need | First Principle | Solution |
|------|-----------------|----------|
| Fast UI development | Composition over inheritance | React + shadcn/ui |
| GPU compute in browser | Direct hardware access | WebGPU via ONNX RT |
| 3D with React | Declarative > Imperative | React Three Fiber |
| Styling consistency | Constraint-based design | Tailwind + 8px grid |
| State simplicity | Minimal indirection | Zustand |

---

## Pre-Implementation Checklist

Before starting, ensure:

- [ ] Node.js 18+ installed
- [ ] Git initialized
- [ ] VS Code with Tailwind IntelliSense, TypeScript extensions
- [ ] Chrome/Edge for WebGPU testing
- [ ] Mobile device for touch testing

---

## Phase 1: MVP Implementation (14 Days)

### Day 1: Project Scaffolding

#### Step 1.1: Initialize Next.js Project
```bash
npx create-next-app@latest medical-imaging-3d --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Verification:** `npm run dev` shows Next.js welcome page

#### Step 1.2: Install Core Dependencies
```bash
npm install zustand lucide-react clsx class-variance-authority
npm install @react-three/fiber @react-three/drei three
npm install onnxruntime-web @xenova/transformers
npm install -D @types/three
```

**Verification:** `npm ls` shows all packages installed

#### Step 1.3: Install shadcn/ui
```bash
npx shadcn-ui@latest init
# Select: New York style, Slate base color, CSS variables
npx shadcn-ui@latest add button card slider progress badge
```

**Verification:** `src/components/ui/` contains button.tsx, card.tsx, etc.

#### Step 1.4: Configure Tailwind Theme
```typescript
// tailwind.config.ts - Add medical design system colors
const config = {
  theme: {
    extend: {
      colors: {
        medical: {
          primary: '#2563EB',    // Trust blue
          surface: '#F9FAFB',
          border: '#E5E7EB',
        }
      },
      spacing: {
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
      }
    }
  }
}
```

**Verification:** Tailwind classes work with new colors

#### Step 1.5: Create Folder Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/           # shadcn components
│   ├── layout/       # Header, Footer
│   └── common/       # Shared components
├── features/
│   ├── upload/
│   ├── inference/
│   └── viewer/
├── hooks/
├── lib/
│   ├── utils.ts
│   └── constants.ts
├── stores/
└── types/
```

**Verification:** All folders exist with index.ts barrel exports

---

### Day 2: Layout Shell & Design System

#### Step 2.1: Create Layout Components

**Header.tsx:**
```tsx
export function Header() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-medical-primary" />
        <span className="font-semibold text-lg">MedVis3D</span>
      </div>
      <PrivacyBadge />
    </header>
  );
}
```

**PrivacyBadge.tsx:**
```tsx
export function PrivacyBadge() {
  return (
    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
      <Shield className="h-4 w-4" />
      <span>Device-Side Processing</span>
    </div>
  );
}
```

**Verification:** Header renders with logo and privacy badge

#### Step 2.2: Create Base Page Layout

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-medical-surface">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <HeroSection />
        <UploadSection />
        <ViewerSection />
      </div>
      <Footer />
    </main>
  );
}
```

**Verification:** Page renders with all section placeholders

#### Step 2.3: Create Hero Section

```tsx
export function HeroSection() {
  return (
    <section className="text-center py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        See Your Anatomy in 3D
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
        Transform medical images into interactive 3D visualizations. 
        Instant, secure, and private—your data never leaves your device.
      </p>
    </section>
  );
}
```

**Verification:** Hero text renders with proper typography

---

### Day 3: Upload Feature - UI

#### Step 3.1: Create UploadZone Component

```tsx
// features/upload/components/UploadZone.tsx
export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-12 text-center transition-colors",
        isDragging ? "border-medical-primary bg-blue-50" : "border-gray-300",
        "hover:border-medical-primary hover:bg-gray-50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-lg font-medium text-gray-700 mb-2">
        Drop your medical image here
      </p>
      <p className="text-sm text-gray-500 mb-4">
        Supports JPEG, PNG, and DICOM formats
      </p>
      <Button>
        <FileImage className="h-4 w-4 mr-2" />
        Select File
      </Button>
      <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.dcm" />
    </div>
  );
}
```

**Verification:** Upload zone renders, drag state changes color

#### Step 3.2: Create File Upload Hook

```typescript
// features/upload/hooks/useFileUpload.ts
export function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'application/dicom'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.dcm')) {
      setError('Please upload a JPEG, PNG, or DICOM file');
      return false;
    }
    
    if (file.size > maxSize) {
      setError('File size must be under 50MB');
      return false;
    }
    
    return true;
  };
  
  const handleFileSelect = async (file: File) => {
    setError(null);
    
    if (!validateFile(file)) return;
    
    setFile(file);
    
    // Create preview
    const url = URL.createObjectURL(file);
    setPreview(url);
  };
  
  return { file, preview, error, handleFileSelect };
}
```

**Verification:** Hook validates files, creates preview URLs

#### Step 3.3: Create ImagePreview Component

```tsx
// features/upload/components/ImagePreview.tsx
export function ImagePreview({ src, onRemove }: ImagePreviewProps) {
  return (
    <Card className="p-4">
      <div className="relative">
        <img 
          src={src} 
          alt="Uploaded medical image"
          className="w-full h-64 object-contain rounded-lg bg-gray-100"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-gray-600">Ready for analysis</span>
        <Badge variant="outline">Original</Badge>
      </div>
    </Card>
  );
}
```

**Verification:** Preview shows uploaded image with remove button

---

### Day 4: Upload Feature - Integration

#### Step 4.1: Create App State Store

```typescript
// stores/useAppStore.ts
import { create } from 'zustand';

interface AppState {
  // File state
  file: File | null;
  imageData: ImageData | null;
  
  // Inference state
  modelStatus: 'idle' | 'loading' | 'ready' | 'error';
  inferenceStatus: 'idle' | 'processing' | 'complete' | 'error';
  depthMap: Float32Array | null;
  
  // Viewer state
  depthIntensity: number;
  
  // Actions
  setFile: (file: File | null) => void;
  setImageData: (data: ImageData | null) => void;
  setModelStatus: (status: AppState['modelStatus']) => void;
  setInferenceStatus: (status: AppState['inferenceStatus']) => void;
  setDepthMap: (depth: Float32Array | null) => void;
  setDepthIntensity: (intensity: number) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  file: null,
  imageData: null,
  modelStatus: 'idle',
  inferenceStatus: 'idle',
  depthMap: null,
  depthIntensity: 0.5,
  
  setFile: (file) => set({ file }),
  setImageData: (imageData) => set({ imageData }),
  setModelStatus: (modelStatus) => set({ modelStatus }),
  setInferenceStatus: (inferenceStatus) => set({ inferenceStatus }),
  setDepthMap: (depthMap) => set({ depthMap }),
  setDepthIntensity: (depthIntensity) => set({ depthIntensity }),
  reset: () => set({
    file: null,
    imageData: null,
    inferenceStatus: 'idle',
    depthMap: null,
  }),
}));
```

**Verification:** Store updates correctly via React DevTools

#### Step 4.2: Create Image Processing Utility

```typescript
// lib/image-processing.ts
export async function loadImageAsImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      
      URL.revokeObjectURL(url);
      resolve(imageData);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

export function resizeImageData(
  imageData: ImageData, 
  targetWidth: number, 
  targetHeight: number
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Create temp canvas with original image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Could not get temp canvas context');
  
  tempCtx.putImageData(imageData, 0, 0);
  
  // Draw scaled
  ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
  
  return ctx.getImageData(0, 0, targetWidth, targetHeight);
}
```

**Verification:** Images load and resize correctly

#### Step 4.3: Wire Up Upload Flow

```tsx
// features/upload/UploadSection.tsx
export function UploadSection() {
  const { file, setFile, setImageData, reset } = useAppStore();
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    
    // Load as ImageData for inference
    const imageData = await loadImageAsImageData(selectedFile);
    setImageData(imageData);
  };
  
  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    reset();
  };
  
  if (file && preview) {
    return <ImagePreview src={preview} onRemove={handleRemove} />;
  }
  
  return <UploadZone onFileSelect={handleFileSelect} />;
}
```

**Verification:** Full upload flow works: select → preview → remove

---

### Day 5: ONNX Runtime Setup

#### Step 5.1: Create WebGPU Detector

```typescript
// lib/onnx/webgpu-detector.ts
export interface GPUCapabilities {
  hasWebGPU: boolean;
  hasWASM: boolean;
  recommendedBackend: 'webgpu' | 'wasm';
  adapterInfo?: GPUAdapterInfo;
}

export async function detectGPUCapabilities(): Promise<GPUCapabilities> {
  const hasWASM = typeof WebAssembly !== 'undefined';
  
  // Check WebGPU
  if (!navigator.gpu) {
    console.log('[GPU] WebGPU not available in this browser');
    return { hasWebGPU: false, hasWASM, recommendedBackend: 'wasm' };
  }
  
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.log('[GPU] No WebGPU adapter found');
      return { hasWebGPU: false, hasWASM, recommendedBackend: 'wasm' };
    }
    
    const info = adapter.info;
    console.log('[GPU] WebGPU available:', info);
    
    return {
      hasWebGPU: true,
      hasWASM,
      recommendedBackend: 'webgpu',
      adapterInfo: info,
    };
  } catch (error) {
    console.error('[GPU] WebGPU detection failed:', error);
    return { hasWebGPU: false, hasWASM, recommendedBackend: 'wasm' };
  }
}
```

**Verification:** Function returns correct capabilities on different browsers

#### Step 5.2: Create Model Loader

```typescript
// lib/onnx/model-loader.ts
import * as ort from 'onnxruntime-web';

const MODEL_URL = '/models/depth-anything-v2-small.onnx';
const CACHE_NAME = 'onnx-models-v1';

export async function loadDepthModel(
  backend: 'webgpu' | 'wasm',
  onProgress?: (progress: number) => void
): Promise<ort.InferenceSession> {
  // Configure execution providers
  const executionProviders: ort.InferenceSession.ExecutionProviderConfig[] = 
    backend === 'webgpu' 
      ? ['webgpu', 'wasm']
      : ['wasm'];
  
  // Try to load from cache first
  const cache = await caches.open(CACHE_NAME);
  let modelBuffer: ArrayBuffer;
  
  const cachedResponse = await cache.match(MODEL_URL);
  if (cachedResponse) {
    console.log('[Model] Loading from cache');
    modelBuffer = await cachedResponse.arrayBuffer();
    onProgress?.(100);
  } else {
    console.log('[Model] Downloading model...');
    const response = await fetch(MODEL_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.status}`);
    }
    
    // Clone for caching
    const responseClone = response.clone();
    
    // Read with progress
    const reader = response.body?.getReader();
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    
    if (reader && contentLength) {
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        onProgress?.((receivedLength / contentLength) * 100);
      }
      
      modelBuffer = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        modelBuffer.set(chunk, position);
        position += chunk.length;
      }
      modelBuffer = modelBuffer.buffer;
    } else {
      modelBuffer = await response.arrayBuffer();
      onProgress?.(100);
    }
    
    // Cache the model
    await cache.put(MODEL_URL, responseClone);
    console.log('[Model] Cached for future use');
  }
  
  // Create session
  console.log('[Model] Creating inference session with:', executionProviders);
  const session = await ort.InferenceSession.create(modelBuffer, {
    executionProviders,
    graphOptimizationLevel: 'all',
  });
  
  console.log('[Model] Session created successfully');
  return session;
}
```

**Verification:** Model loads, caches, and creates session

#### Step 5.3: Create useOnnxRuntime Hook

```typescript
// features/inference/hooks/useOnnxRuntime.ts
import { useState, useEffect, useCallback } from 'react';
import * as ort from 'onnxruntime-web';
import { detectGPUCapabilities } from '@/lib/onnx/webgpu-detector';
import { loadDepthModel } from '@/lib/onnx/model-loader';

export function useOnnxRuntime() {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [backend, setBackend] = useState<'webgpu' | 'wasm'>('wasm');
  
  const initialize = useCallback(async () => {
    if (status === 'loading' || status === 'ready') return;
    
    setStatus('loading');
    setError(null);
    
    try {
      // Detect capabilities
      const capabilities = await detectGPUCapabilities();
      setBackend(capabilities.recommendedBackend);
      
      // Load model
      const loadedSession = await loadDepthModel(
        capabilities.recommendedBackend,
        setProgress
      );
      
      setSession(loadedSession);
      setStatus('ready');
    } catch (err) {
      console.error('[ONNX] Initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load model');
      setStatus('error');
    }
  }, [status]);
  
  return {
    session,
    status,
    progress,
    error,
    backend,
    initialize,
  };
}
```

**Verification:** Hook initializes ONNX runtime correctly

---

### Day 6: Inference Pipeline

#### Step 6.1: Create Tensor Utilities

```typescript
// lib/onnx/tensor-utils.ts
import * as ort from 'onnxruntime-web';

const MODEL_INPUT_SIZE = 518;
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

export function imageDataToTensor(imageData: ImageData): ort.Tensor {
  const { width, height, data } = imageData;
  
  // Create canvas to resize
  const canvas = document.createElement('canvas');
  canvas.width = MODEL_INPUT_SIZE;
  canvas.height = MODEL_INPUT_SIZE;
  const ctx = canvas.getContext('2d')!;
  
  // Draw resized image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);
  
  ctx.drawImage(tempCanvas, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const resizedData = ctx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  
  // Convert to CHW format with normalization
  const float32Data = new Float32Array(3 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE);
  const pixelCount = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;
  
  for (let i = 0; i < pixelCount; i++) {
    const r = resizedData.data[i * 4] / 255;
    const g = resizedData.data[i * 4 + 1] / 255;
    const b = resizedData.data[i * 4 + 2] / 255;
    
    // Apply ImageNet normalization
    float32Data[i] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
    float32Data[pixelCount + i] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
    float32Data[2 * pixelCount + i] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
  }
  
  return new ort.Tensor('float32', float32Data, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
}

export function normalizeDepthMap(depthData: Float32Array): Float32Array {
  let min = Infinity;
  let max = -Infinity;
  
  // Find min/max
  for (let i = 0; i < depthData.length; i++) {
    if (depthData[i] < min) min = depthData[i];
    if (depthData[i] > max) max = depthData[i];
  }
  
  // Normalize to [0, 1]
  const range = max - min;
  const normalized = new Float32Array(depthData.length);
  
  for (let i = 0; i < depthData.length; i++) {
    normalized[i] = (depthData[i] - min) / range;
  }
  
  return normalized;
}
```

**Verification:** Tensor conversion produces correct shapes

#### Step 6.2: Create Depth Estimation Hook

```typescript
// features/inference/hooks/useDepthEstimation.ts
import { useState, useCallback } from 'react';
import * as ort from 'onnxruntime-web';
import { imageDataToTensor, normalizeDepthMap } from '@/lib/onnx/tensor-utils';

export function useDepthEstimation(session: ort.InferenceSession | null) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [depthMap, setDepthMap] = useState<Float32Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const estimateDepth = useCallback(async (imageData: ImageData) => {
    if (!session) {
      setError('Model not loaded');
      return null;
    }
    
    setStatus('processing');
    setError(null);
    
    try {
      const startTime = performance.now();
      
      // Convert to tensor
      const inputTensor = imageDataToTensor(imageData);
      console.log('[Inference] Input tensor shape:', inputTensor.dims);
      
      // Run inference
      const feeds = { pixel_values: inputTensor };
      const results = await session.run(feeds);
      
      // Get output
      const outputTensor = results['predicted_depth'];
      console.log('[Inference] Output tensor shape:', outputTensor.dims);
      
      // Normalize depth map
      const normalized = normalizeDepthMap(outputTensor.data as Float32Array);
      
      const endTime = performance.now();
      console.log(`[Inference] Completed in ${(endTime - startTime).toFixed(0)}ms`);
      
      setDepthMap(normalized);
      setStatus('complete');
      
      return normalized;
    } catch (err) {
      console.error('[Inference] Failed:', err);
      setError(err instanceof Error ? err.message : 'Inference failed');
      setStatus('error');
      return null;
    }
  }, [session]);
  
  return {
    estimateDepth,
    depthMap,
    status,
    error,
  };
}
```

**Verification:** Depth estimation returns normalized Float32Array

#### Step 6.3: Create Processing Status UI

```tsx
// features/inference/components/ProcessingStatus.tsx
export function ProcessingStatus({ status, progress }: ProcessingStatusProps) {
  if (status === 'idle') return null;
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-medical-primary" />
            <div className="flex-1">
              <p className="font-medium">Loading AI Model...</p>
              <Progress value={progress} className="mt-2" />
            </div>
          </>
        )}
        
        {status === 'processing' && (
          <>
            <Brain className="h-6 w-6 animate-pulse text-medical-primary" />
            <div className="flex-1">
              <p className="font-medium">Analyzing Anatomy...</p>
              <p className="text-sm text-gray-500">Running depth estimation</p>
            </div>
          </>
        )}
        
        {status === 'complete' && (
          <>
            <CheckCircle className="h-6 w-6 text-green-600" />
            <p className="font-medium">Analysis Complete</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="font-medium text-red-600">Analysis Failed</p>
          </>
        )}
      </div>
    </Card>
  );
}
```

**Verification:** All status states render correctly

---

### Day 7: Integration Testing

#### Step 7.1: Create Integration Test Component

```tsx
// Test the full upload → inference pipeline
function TestPipeline() {
  const { initialize, session, status: modelStatus } = useOnnxRuntime();
  const { estimateDepth, depthMap, status: inferenceStatus } = useDepthEstimation(session);
  
  const handleTest = async () => {
    // Load test image
    const response = await fetch('/test-xray.jpg');
    const blob = await response.blob();
    const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
    
    // Convert to ImageData
    const imageData = await loadImageAsImageData(file);
    
    // Run inference
    const depth = await estimateDepth(imageData);
    
    console.log('Depth map size:', depth?.length);
    console.log('Depth map sample:', depth?.slice(0, 10));
  };
  
  return (
    <div className="p-8 space-y-4">
      <Button onClick={initialize}>Load Model</Button>
      <Button onClick={handleTest} disabled={modelStatus !== 'ready'}>
        Run Test
      </Button>
      <pre>{JSON.stringify({ modelStatus, inferenceStatus }, null, 2)}</pre>
    </div>
  );
}
```

**Verification:** Full pipeline executes without errors

---

### Day 8-9: 3D Viewer Foundation

#### Step 8.1: Create Base Viewer Component

```tsx
// features/viewer/components/Viewer3D.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';

export function Viewer3D({ children }: { children?: React.ReactNode }) {
  return (
    <div className="w-full h-[500px] bg-gray-900 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.error('[WebGL] Context lost');
          });
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          {children}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.5}
            maxDistance={5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

**Verification:** Canvas renders with orbit controls

#### Step 8.2: Create DepthMesh Component

```tsx
// features/viewer/components/DepthMesh.tsx
import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface DepthMeshProps {
  imageTexture: THREE.Texture;
  depthMap: Float32Array;
  depthSize: number;
  displacementScale: number;
}

export function DepthMesh({ 
  imageTexture, 
  depthMap, 
  depthSize,
  displacementScale 
}: DepthMeshProps) {
  // Create displacement texture from depth map
  const displacementTexture = useMemo(() => {
    const texture = new THREE.DataTexture(
      depthMap,
      depthSize,
      depthSize,
      THREE.RedFormat,
      THREE.FloatType
    );
    texture.needsUpdate = true;
    return texture;
  }, [depthMap, depthSize]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      displacementTexture.dispose();
    };
  }, [displacementTexture]);
  
  return (
    <mesh>
      <planeGeometry args={[2, 2, 256, 256]} />
      <meshStandardMaterial
        map={imageTexture}
        displacementMap={displacementTexture}
        displacementScale={displacementScale}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
```

**Verification:** Mesh renders with displacement

---

### Day 10-11: Controls & Interactivity

#### Step 10.1: Create Depth Slider Control

```tsx
// features/viewer/components/ViewerControls.tsx
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw, Maximize2, Download } from 'lucide-react';

interface ViewerControlsProps {
  depthIntensity: number;
  onDepthChange: (value: number) => void;
  onReset: () => void;
  onFullscreen: () => void;
}

export function ViewerControls({
  depthIntensity,
  onDepthChange,
  onReset,
  onFullscreen,
}: ViewerControlsProps) {
  return (
    <div className="flex items-center gap-6 p-4 bg-white rounded-lg border">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Depth Intensity
        </label>
        <Slider
          value={[depthIntensity]}
          onValueChange={([value]) => onDepthChange(value)}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onFullscreen}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

**Verification:** Slider updates depth intensity in real-time

#### Step 10.2: Create Disclaimer Banner

```tsx
// features/viewer/components/DisclaimerBanner.tsx
export function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-amber-800">
          For Educational Purposes Only
        </p>
        <p className="text-xs text-amber-700 mt-1">
          This AI-generated visualization is a simulation and may not perfectly 
          reflect anatomical reality. Not for diagnostic use. Consult your 
          physician for medical interpretation.
        </p>
      </div>
    </div>
  );
}
```

**Verification:** Disclaimer renders prominently

---

### Day 12-13: Mobile Optimization

#### Step 12.1: Touch Controls Configuration

```typescript
// features/viewer/hooks/useTouchControls.ts
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

export function useTouchControls() {
  const { gl } = useThree();
  
  useEffect(() => {
    const canvas = gl.domElement;
    
    // Prevent default touch behaviors
    const preventDefaults = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault(); // Prevent pinch zoom on page
      }
    };
    
    canvas.addEventListener('touchstart', preventDefaults, { passive: false });
    canvas.addEventListener('touchmove', preventDefaults, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchstart', preventDefaults);
      canvas.removeEventListener('touchmove', preventDefaults);
    };
  }, [gl]);
}
```

#### Step 12.2: Memory Management Hook

```typescript
// features/viewer/hooks/useMemoryManager.ts
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useMemoryManager() {
  const disposables = useRef<Set<THREE.Object3D | THREE.Material | THREE.Texture>>(new Set());
  
  const track = (obj: THREE.Object3D | THREE.Material | THREE.Texture) => {
    disposables.current.add(obj);
  };
  
  const disposeAll = () => {
    disposables.current.forEach((obj) => {
      if ('dispose' in obj) {
        (obj as any).dispose();
      }
    });
    disposables.current.clear();
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeAll();
    };
  }, []);
  
  return { track, disposeAll };
}
```

**Verification:** Memory properly released on component unmount

---

### Day 14: Polish & Deploy

#### Step 14.1: Error Boundary

```tsx
// components/common/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

#### Step 14.2: Final Integration

Wire everything together in the main page with proper error handling, loading states, and responsive design.

**Final Verification Checklist:**
- [ ] Upload works on desktop and mobile
- [ ] Model loads and caches correctly
- [ ] Inference completes < 1.5s (WebGPU) / < 5s (WASM)
- [ ] 3D viewer renders and responds to touch
- [ ] Depth slider works in real-time
- [ ] Disclaimer is visible
- [ ] Privacy badge is visible
- [ ] No console errors
- [ ] No memory leaks
- [ ] Works offline after first load

---

## Quick Reference Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Test on mobile (ngrok)
npx ngrok http 3000
```

---

## Troubleshooting Guide

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Model fails to load | CORS/network | Check model URL, CORS headers |
| WebGPU not detected | Browser support | Test in Chrome 113+, check flags |
| WASM slow | SIMD not enabled | Ensure SIMD support in browser |
| iOS crash | Memory exceeded | Reduce texture size, dispose properly |
| Black 3D view | Context lost | Implement context restore handler |
| Touch not working | Event prevention | Check passive event handlers |

---

*Document Version: 1.0.0*  
*Last Updated: December 14, 2024*
