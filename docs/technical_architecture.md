# Technical Architecture Document

## Medical Imaging 3D Visualization Platform

**Version:** 1.0.0  
**Date:** December 14, 2024  
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [First Principles Analysis](#2-first-principles-analysis)
3. [System Architecture](#3-system-architecture)
4. [Component Architecture](#4-component-architecture)
5. [Data Flow Architecture](#5-data-flow-architecture)
6. [AI/ML Pipeline](#6-aiml-pipeline)
7. [3D Rendering Architecture](#7-3d-rendering-architecture)
8. [Performance Architecture](#8-performance-architecture)
9. [Security Architecture](#9-security-architecture)
10. [Implementation Plan](#10-implementation-plan)

---

## 1. Executive Summary

This document defines the technical architecture for a browser-based medical imaging 3D visualization platform. The system converts 2D medical images into interactive 3D topological visualizations using client-side AI inference.

### Core Technical Principles

| Principle | Implementation |
|-----------|----------------|
| **Privacy First** | All processing client-side, zero data transmission |
| **Performance** | WebGPU acceleration with WASM fallback |
| **Accessibility** | Mobile-first, progressive enhancement |
| **Reliability** | Graceful degradation, error recovery |

---

## 2. First Principles Analysis

### 2.1 What Are We Really Building?

Breaking down to fundamentals:

```
INPUT:  2D Medical Image (pixels: RGB/Grayscale array)
           ↓
PROCESS: AI Depth Estimation (pixel → depth value mapping)
           ↓
OUTPUT: 3D Interactive Mesh (vertices displaced by depth)
```

### 2.2 Core Problems to Solve

| Problem | First Principle | Solution |
|---------|-----------------|----------|
| **Large AI model in browser** | Data locality reduces latency | Cache model in IndexedDB/Cache API |
| **GPU compute in browser** | Direct hardware access = speed | WebGPU API with shader compute |
| **Memory limits on mobile** | Constrained resources require efficiency | Resolution capping, aggressive disposal |
| **Privacy of medical data** | Data that never leaves can't be breached | 100% client-side architecture |

### 2.3 Minimum Viable Technology Stack

```
Browser APIs Required:
├── WebGPU API        → GPU compute for AI inference
├── WebGL2            → 3D rendering
├── File API          → Image upload handling
├── Cache API         → Model caching
├── Canvas API        → Image preprocessing
└── Web Workers       → Non-blocking inference
```

---

## 3. System Architecture

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │   UI LAYER   │    │ STATE LAYER  │    │      SERVICE LAYER       │  │
│  │              │    │              │    │                          │  │
│  │ React 18+    │◄──►│   Zustand    │◄──►│  ONNX Runtime Web       │  │
│  │ React Three  │    │   Stores     │    │  Transformers.js        │  │
│  │ Fiber        │    │              │    │  Cornerstone.js         │  │
│  │ TailwindCSS  │    │              │    │                          │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────┘  │
│         │                   │                        │                  │
│         ▼                   ▼                        ▼                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      BROWSER APIs                                │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │   │
│  │  │ WebGPU  │  │ WebGL2  │  │  Cache  │  │  File   │  │ Canvas│ │   │
│  │  │   API   │  │   API   │  │   API   │  │   API   │  │  API  │ │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └───┬───┘ │   │
│  └───────┼───────────┼───────────┼───────────┼─────────────┼─────┘   │
│          │           │           │           │             │          │
├──────────┼───────────┼───────────┼───────────┼─────────────┼──────────┤
│          ▼           ▼           ▼           ▼             ▼          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         HARDWARE                                 │   │
│  │         GPU (Compute + Render)    │    CPU    │    Storage      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

                    ▲
                    │ NO DATA TRANSMISSION
                    │ (Privacy by Architecture)
                    ▼
              ┌──────────┐
              │  SERVER  │
              │  (CDN)   │  ← Only serves static assets
              │          │    (HTML, JS, CSS, ONNX model)
              └──────────┘
```

### 3.2 Technology Stack Decision Matrix

| Layer | Technology | Alternatives Considered | Decision Rationale |
|-------|------------|------------------------|-------------------|
| Framework | Next.js 14+ | Vite+React, Remix | SSG for SEO, App Router, optimal caching |
| AI Runtime | ONNX Runtime Web | TensorFlow.js | 100x faster WebGPU, native ONNX support |
| 3D Rendering | React Three Fiber | Three.js, Babylon.js | Declarative React integration |
| Styling | TailwindCSS | CSS Modules, styled-components | Rapid prototyping, design system alignment |
| Components | shadcn/ui | Material UI, Chakra | Customizable, accessible, lightweight |
| State | Zustand | Redux, Jotai | Minimal boilerplate, TypeScript native |
| Medical Format | Cornerstone.js | dcmjs, daikon | Industry standard, maintained, full-featured |

---

## 4. Component Architecture

### 4.1 Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── PrivacyBadge
│   ├── Main
│   │   └── [Page Content]
│   └── Footer
│
├── Pages
│   └── HomePage
│       ├── HeroSection
│       ├── UploadSection
│       │   └── UploadZone
│       │       ├── DropZone
│       │       ├── FileInput
│       │       ├── CameraCapture (mobile)
│       │       └── FormatInfo
│       ├── ProcessingSection
│       │   ├── ImagePreview
│       │   ├── ProcessingStatus
│       │   └── InferenceProgress
│       └── ViewerSection
│           └── Viewer3DContainer
│               ├── Viewer3D (R3F Canvas)
│               │   ├── DepthMesh
│               │   ├── Lighting
│               │   ├── OrbitControls
│               │   └── CameraController
│               ├── ViewerControls
│               │   ├── DepthSlider
│               │   ├── ResetButton
│               │   ├── FullscreenToggle
│               │   └── ExportButton
│               └── ViewerOverlay
│                   ├── DisclaimerBanner
│                   └── LoadingOverlay
│
└── Shared
    ├── Button
    ├── Card
    ├── Slider
    ├── Modal
    ├── Tooltip
    └── ErrorBoundary
```

### 4.2 Feature Module Structure

```typescript
// Feature: Upload
features/upload/
├── components/
│   ├── UploadZone.tsx      // Main upload interface
│   ├── DropZone.tsx        // Drag-and-drop area
│   ├── FileInput.tsx       // Hidden file input
│   ├── CameraCapture.tsx   // Mobile camera button
│   └── ImagePreview.tsx    // Uploaded image preview
├── hooks/
│   ├── useFileUpload.ts    // File handling logic
│   ├── useDicomParser.ts   // DICOM parsing hook
│   └── useImageProcessor.ts // Image preprocessing
├── utils/
│   ├── validators.ts       // File validation
│   └── formatters.ts       // File info formatting
└── types.ts                // TypeScript interfaces

// Feature: Inference
features/inference/
├── components/
│   ├── InferenceEngine.tsx  // Orchestrates inference
│   ├── ModelLoader.tsx      // Handles model loading UI
│   └── ProgressIndicator.tsx // Loading states
├── hooks/
│   ├── useOnnxRuntime.ts    // ONNX runtime management
│   ├── useDepthEstimation.ts // Depth inference hook
│   └── useModelCache.ts     // Cache API integration
├── workers/
│   └── inference.worker.ts  // Web Worker for inference
├── utils/
│   ├── webgpu-detector.ts   // Hardware detection
│   └── tensor-utils.ts      // Tensor operations
└── types.ts

// Feature: Viewer
features/viewer/
├── components/
│   ├── Viewer3D.tsx         // R3F Canvas wrapper
│   ├── DepthMesh.tsx        // Displacement mesh
│   ├── ViewerControls.tsx   // Control panel
│   ├── DepthSlider.tsx      // Depth intensity control
│   └── DisclaimerBanner.tsx // Legal disclaimer
├── hooks/
│   ├── useViewer.ts         // Viewer state management
│   ├── useDepthMaterial.ts  // Custom shader material
│   └── useMemoryManager.ts  // GPU memory management
├── shaders/
│   ├── displacement.vert    // Vertex shader
│   └── displacement.frag    // Fragment shader
└── types.ts
```

---

## 5. Data Flow Architecture

### 5.1 Main Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW PIPELINE                             │
└─────────────────────────────────────────────────────────────────────────┘

  USER ACTION          PROCESSING STAGE              DATA TRANSFORMATION
  ───────────          ────────────────              ───────────────────

  ┌─────────┐
  │ Upload  │
  │  File   │
  └────┬────┘
       │
       ▼
  ┌─────────────────┐    ┌─────────────────────────────────────────────┐
  │  File Received  │───►│  Validate: type, size, format               │
  └─────────────────┘    │  Output: File object or error               │
                         └─────────────────────────────────────────────┘
       │
       ▼
  ┌─────────────────┐    ┌─────────────────────────────────────────────┐
  │  Parse/Decode   │───►│  JPEG/PNG: Canvas decode                    │
  │                 │    │  DICOM: Cornerstone.js extraction           │
  └─────────────────┘    │  Output: ImageData (RGBA array)             │
                         └─────────────────────────────────────────────┘
       │
       ▼
  ┌─────────────────┐    ┌─────────────────────────────────────────────┐
  │  Preprocess     │───►│  Resize to 518x518                          │
  │                 │    │  Normalize to [0,1] range                   │
  └─────────────────┘    │  Convert to Float32 tensor [1,3,518,518]    │
                         └─────────────────────────────────────────────┘
       │
       ▼
  ┌─────────────────┐    ┌─────────────────────────────────────────────┐
  │  AI Inference   │───►│  Load ONNX model (cached)                   │
  │  (WebGPU/WASM)  │    │  Run Depth Anything V2                      │
  └─────────────────┘    │  Output: Depth map tensor [1,1,518,518]     │
                         └─────────────────────────────────────────────┘
       │
       ▼
  ┌─────────────────┐    ┌─────────────────────────────────────────────┐
  │  Post-process   │───►│  Normalize depth to [0,1]                   │
  │                 │    │  Convert to displacement texture            │
  └─────────────────┘    │  Output: Float32Array for displacement      │
                         └─────────────────────────────────────────────┘
       │
       ▼
  ┌─────────────────┐    ┌─────────────────────────────────────────────┐
  │  3D Rendering   │───►│  Create PlaneGeometry                       │
  │                 │    │  Apply displacement in vertex shader        │
  └─────────────────┘    │  Apply original image as texture            │
                         │  Output: Interactive 3D mesh                │
                         └─────────────────────────────────────────────┘
       │
       ▼
  ┌─────────┐
  │ Display │
  │ to User │
  └─────────┘
```

### 5.2 State Management Architecture

```typescript
// stores/useAppStore.ts
interface AppState {
  // Upload State
  uploadedFile: File | null;
  imageData: ImageData | null;
  dicomMetadata: DicomMetadata | null;
  
  // Inference State
  modelStatus: 'idle' | 'loading' | 'ready' | 'error';
  inferenceStatus: 'idle' | 'processing' | 'complete' | 'error';
  inferenceProgress: number;
  depthMap: Float32Array | null;
  
  // Viewer State
  viewerReady: boolean;
  depthIntensity: number;
  cameraPosition: [number, number, number];
  
  // Error State
  error: AppError | null;
  
  // Actions
  setUploadedFile: (file: File | null) => void;
  setImageData: (data: ImageData | null) => void;
  setDepthMap: (depth: Float32Array | null) => void;
  setDepthIntensity: (intensity: number) => void;
  resetViewer: () => void;
  clearAll: () => void;
}
```

---

## 6. AI/ML Pipeline

### 6.1 Model Loading Strategy

```typescript
// Pseudo-code for model loading with caching
async function loadDepthModel(): Promise<InferenceSession> {
  const MODEL_URL = '/models/depth-anything-v2-small-fp16.onnx';
  const CACHE_KEY = 'depth-anything-v2-small';
  
  // 1. Check Cache API first
  const cache = await caches.open('onnx-models-v1');
  const cachedResponse = await cache.match(MODEL_URL);
  
  if (cachedResponse) {
    const buffer = await cachedResponse.arrayBuffer();
    return createSession(buffer);
  }
  
  // 2. Download and cache
  const response = await fetch(MODEL_URL);
  await cache.put(MODEL_URL, response.clone());
  const buffer = await response.arrayBuffer();
  
  return createSession(buffer);
}

async function createSession(buffer: ArrayBuffer): Promise<InferenceSession> {
  // Detect WebGPU support
  const hasWebGPU = await detectWebGPU();
  
  const options: InferenceSession.SessionOptions = {
    executionProviders: hasWebGPU 
      ? ['webgpu', 'wasm'] 
      : ['wasm'],
    graphOptimizationLevel: 'all',
  };
  
  return InferenceSession.create(buffer, options);
}
```

### 6.2 Inference Pipeline

```typescript
async function runDepthEstimation(
  imageData: ImageData,
  session: InferenceSession
): Promise<Float32Array> {
  // 1. Preprocess image
  const inputTensor = preprocessImage(imageData);
  // Shape: [1, 3, 518, 518], dtype: float32
  
  // 2. Run inference
  const feeds = { pixel_values: inputTensor };
  const results = await session.run(feeds);
  
  // 3. Extract depth map
  const depthTensor = results['predicted_depth'];
  // Shape: [1, 1, 518, 518]
  
  // 4. Post-process
  const normalizedDepth = normalizeDepthMap(depthTensor.data);
  
  // 5. Cleanup tensors
  inputTensor.dispose();
  depthTensor.dispose();
  
  return normalizedDepth;
}

function preprocessImage(imageData: ImageData): Tensor {
  const { width, height, data } = imageData;
  const targetSize = 518;
  
  // Resize using canvas
  const resized = resizeImage(imageData, targetSize, targetSize);
  
  // Convert to CHW format and normalize
  const float32Data = new Float32Array(3 * targetSize * targetSize);
  
  for (let i = 0; i < targetSize * targetSize; i++) {
    const r = resized.data[i * 4] / 255;
    const g = resized.data[i * 4 + 1] / 255;
    const b = resized.data[i * 4 + 2] / 255;
    
    // ImageNet normalization
    float32Data[i] = (r - 0.485) / 0.229;                    // R channel
    float32Data[targetSize * targetSize + i] = (g - 0.456) / 0.224;  // G channel
    float32Data[2 * targetSize * targetSize + i] = (b - 0.406) / 0.225;  // B channel
  }
  
  return new Tensor('float32', float32Data, [1, 3, targetSize, targetSize]);
}
```

### 6.3 WebGPU Detection

```typescript
async function detectWebGPU(): Promise<boolean> {
  if (!navigator.gpu) {
    console.log('WebGPU not available');
    return false;
  }
  
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.log('No WebGPU adapter found');
      return false;
    }
    
    const device = await adapter.requestDevice();
    console.log('WebGPU available:', adapter.info);
    return true;
  } catch (error) {
    console.log('WebGPU initialization failed:', error);
    return false;
  }
}
```

---

## 7. 3D Rendering Architecture

### 7.1 React Three Fiber Setup

```tsx
// features/viewer/components/Viewer3D.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

export function Viewer3D({ depthMap, texture, intensity }: ViewerProps) {
  return (
    <Canvas
      gl={{ 
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance'
      }}
      onCreated={({ gl }) => {
        // Handle context loss
        gl.domElement.addEventListener('webglcontextlost', handleContextLost);
        gl.domElement.addEventListener('webglcontextrestored', handleContextRestored);
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 2]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      
      <DepthMesh 
        depthMap={depthMap}
        texture={texture}
        displacementScale={intensity}
      />
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.5}
        maxDistance={5}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
      />
    </Canvas>
  );
}
```

### 7.2 Displacement Mesh Component

```tsx
// features/viewer/components/DepthMesh.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function DepthMesh({ 
  depthMap, 
  texture, 
  displacementScale = 0.5 
}: DepthMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create displacement texture from depth map
  const displacementTexture = useMemo(() => {
    if (!depthMap) return null;
    
    const tex = new THREE.DataTexture(
      depthMap,
      518, 518,
      THREE.RedFormat,
      THREE.FloatType
    );
    tex.needsUpdate = true;
    return tex;
  }, [depthMap]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      displacementTexture?.dispose();
    };
  }, [displacementTexture]);
  
  if (!depthMap || !texture) return null;
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2, 256, 256]} />
      <meshStandardMaterial
        map={texture}
        displacementMap={displacementTexture}
        displacementScale={displacementScale}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
```

### 7.3 Memory Management

```typescript
// lib/utils/memory-management.ts
export class GPUMemoryManager {
  private disposables: Set<THREE.Object3D | THREE.Material | THREE.Texture> = new Set();
  
  track(object: THREE.Object3D | THREE.Material | THREE.Texture) {
    this.disposables.add(object);
  }
  
  dispose(object: THREE.Object3D | THREE.Material | THREE.Texture) {
    if ('dispose' in object) {
      object.dispose();
    }
    
    if (object instanceof THREE.Object3D) {
      object.traverse((child) => {
        if ('geometry' in child && child.geometry) {
          child.geometry.dispose();
        }
        if ('material' in child && child.material) {
          const materials = Array.isArray(child.material) 
            ? child.material 
            : [child.material];
          materials.forEach(mat => mat.dispose());
        }
      });
    }
    
    this.disposables.delete(object);
  }
  
  disposeAll() {
    this.disposables.forEach(obj => this.dispose(obj));
    this.disposables.clear();
  }
  
  getEstimatedMemoryUsage(): number {
    // Rough estimation based on tracked objects
    let bytes = 0;
    this.disposables.forEach(obj => {
      if (obj instanceof THREE.Texture) {
        bytes += (obj.image?.width || 0) * (obj.image?.height || 0) * 4;
      }
    });
    return bytes;
  }
}
```

---

## 8. Performance Architecture

### 8.1 Performance Budget

| Metric | Budget | Critical |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | Yes |
| Time to Interactive | < 3.5s | Yes |
| Model Load (cached) | < 500ms | Yes |
| Model Load (uncached) | < 8s (50MB on 3G) | No |
| Inference (WebGPU) | < 1.5s | Yes |
| Inference (WASM) | < 5s | Yes |
| 3D Frame Rate | ≥ 30 FPS | Yes |
| Memory (iOS Safari) | < 300MB | Yes |

### 8.2 Optimization Strategies

```typescript
// 1. Code Splitting
const Viewer3D = dynamic(() => import('@/features/viewer/Viewer3D'), {
  loading: () => <ViewerSkeleton />,
  ssr: false // 3D viewer is client-only
});

// 2. Model Preloading (on user intent)
function useModelPreload() {
  useEffect(() => {
    // Start loading model when user hovers upload zone
    const uploadZone = document.getElementById('upload-zone');
    
    const handleMouseEnter = () => {
      // Begin model download in background
      prefetchModel();
    };
    
    uploadZone?.addEventListener('mouseenter', handleMouseEnter, { once: true });
    
    return () => {
      uploadZone?.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);
}

// 3. Render Loop Optimization
function useOptimizedRenderLoop() {
  const { invalidate } = useThree();
  const isInteracting = useRef(false);
  
  // Only render when necessary
  useFrame(() => {
    if (!isInteracting.current) {
      // Pause render loop when idle
      return;
    }
  });
  
  const onInteractionStart = () => {
    isInteracting.current = true;
    invalidate();
  };
  
  const onInteractionEnd = () => {
    isInteracting.current = false;
  };
  
  return { onInteractionStart, onInteractionEnd };
}
```

### 8.3 Bundle Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  webpack: (config) => {
    // Tree-shake Three.js
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': 'three/src/Three.js',
    };
    
    // Externalize ONNX runtime WASM files
    config.externals = {
      ...config.externals,
      'onnxruntime-web': 'onnxruntime-web',
    };
    
    return config;
  },
};
```

---

## 9. Security Architecture

### 9.1 Zero-Trust Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       SECURITY BOUNDARY                                  │
│                     (User's Browser/Device)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐                                                       │
│  │ Medical Image│                                                       │
│  │    (PHI)     │                                                       │
│  └──────┬───────┘                                                       │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   Browser    │───►│    Canvas    │───►│   ONNX RT    │              │
│  │   Memory     │    │     API      │    │    (Local)   │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                                        │                      │
│         ▼                                        ▼                      │
│  ┌──────────────┐                        ┌──────────────┐              │
│  │   WebGL/     │◄───────────────────────│  Depth Map   │              │
│  │   Three.js   │                        │   (Local)    │              │
│  └──────────────┘                        └──────────────┘              │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                       │
│  │   Display    │  ◄── All processing stays here                       │
│  └──────────────┘                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                    │
                    │  ✗ NO IMAGE DATA CROSSES THIS LINE
                    │
                    ▼
           ┌──────────────┐
           │    CDN       │
           │  (Static     │ ◄── Only serves: HTML, JS, CSS, ONNX model
           │   Assets)    │     No user data received
           └──────────────┘
```

### 9.2 Content Security Policy

```typescript
// next.config.js - Security Headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' blob:", // Required for WASM
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

---

## 10. Implementation Plan

### 10.1 Phase 1: MVP (14 Days)

#### Week 1: Foundation

| Day | Tasks | Deliverables |
|-----|-------|--------------|
| 1-2 | Project setup | Next.js app, Tailwind, shadcn/ui, TypeScript config |
| 3 | Layout components | Header, Footer, Container, PrivacyBadge |
| 4 | Upload feature | DropZone, FileInput, validation |
| 5 | ONNX integration | Runtime setup, model loading, caching |
| 6 | WebGPU detection | Feature detection, WASM fallback |
| 7 | Buffer/testing | Integration testing, bug fixes |

#### Week 2: Core Features

| Day | Tasks | Deliverables |
|-----|-------|--------------|
| 8 | Inference pipeline | Preprocessing, tensor ops, postprocessing |
| 9 | Progress UI | Loading states, progress indicator |
| 10 | R3F setup | Canvas, basic mesh, lighting |
| 11 | Displacement shader | Depth-based vertex displacement |
| 12 | Controls | OrbitControls, depth slider, reset |
| 13 | Mobile optimization | Touch gestures, memory management |
| 14 | Polish | Disclaimers, error handling, final testing |

### 10.2 Technical Milestones

```
M1 (Day 2):  "Hello World" - App renders with Tailwind styling
M2 (Day 4):  "Upload Works" - Can drop image and see preview
M3 (Day 6):  "Model Loads" - ONNX model loads with WebGPU/WASM
M4 (Day 9):  "Depth Works" - Get depth map from uploaded image
M5 (Day 11): "3D Renders" - Basic 3D mesh with texture
M6 (Day 12): "It's Alive" - Full pipeline: upload → depth → 3D
M7 (Day 14): "MVP Complete" - Polished, mobile-ready, deployed
```

### 10.3 Definition of Done (MVP)

- [ ] User can upload JPEG/PNG image
- [ ] WebGPU used when available, WASM fallback works
- [ ] Depth estimation completes in < 1.5s (WebGPU) / < 5s (WASM)
- [ ] 3D visualization renders at 30+ FPS
- [ ] Touch controls work on mobile
- [ ] Depth intensity slider functional
- [ ] "Educational Use Only" disclaimer visible
- [ ] Privacy badge visible
- [ ] No crashes on iOS Safari
- [ ] Lighthouse Performance > 90 (desktop)
- [ ] Works offline after first load (model cached)

---

## Appendix A: Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "three": "^0.158.0",
    "onnxruntime-web": "^1.16.0",
    "@xenova/transformers": "^2.17.0",
    "zustand": "^4.4.0",
    "tailwindcss": "^3.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/react": "^18.2.0",
    "@types/three": "^0.158.0"
  }
}
```

---

## Appendix B: Browser Support Matrix

| Browser | WebGPU | WASM | Status |
|---------|--------|------|--------|
| Chrome 113+ | ✅ | ✅ | Full Support |
| Edge 113+ | ✅ | ✅ | Full Support |
| Firefox 141+ | ✅ | ✅ | Full Support |
| Safari 18+ | 🟡 (flag) | ✅ | WASM Fallback |
| iOS Safari 17+ | 🟡 (flag) | ✅ | WASM Fallback |
| Chrome Android | ✅ | ✅ | Full Support |

---

*Document maintained by: Engineering Team*  
*Next review: After MVP completion*
