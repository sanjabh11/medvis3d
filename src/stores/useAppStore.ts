import { create } from 'zustand';

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';
export type InferenceStatus = 'idle' | 'processing' | 'complete' | 'error';

interface AppState {
  file: File | null;
  imageData: ImageData | null;
  previewUrl: string | null;
  
  modelStatus: ModelStatus;
  modelProgress: number;
  
  inferenceStatus: InferenceStatus;
  depthMap: Float32Array | null;
  
  depthIntensity: number;
  
  error: string | null;
  
  setFile: (file: File | null) => void;
  setImageData: (data: ImageData | null) => void;
  setPreviewUrl: (url: string | null) => void;
  setModelStatus: (status: ModelStatus) => void;
  setModelProgress: (progress: number) => void;
  setInferenceStatus: (status: InferenceStatus) => void;
  setDepthMap: (depth: Float32Array | null) => void;
  setDepthIntensity: (intensity: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  file: null,
  imageData: null,
  previewUrl: null,
  modelStatus: 'idle' as ModelStatus,
  modelProgress: 0,
  inferenceStatus: 'idle' as InferenceStatus,
  depthMap: null,
  depthIntensity: 0.5,
  error: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,
  
  setFile: (file) => set({ file }),
  setImageData: (imageData) => set({ imageData }),
  setPreviewUrl: (previewUrl) => {
    const currentUrl = get().previewUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
    set({ previewUrl });
  },
  setModelStatus: (modelStatus) => set({ modelStatus }),
  setModelProgress: (modelProgress) => set({ modelProgress }),
  setInferenceStatus: (inferenceStatus) => set({ inferenceStatus }),
  setDepthMap: (depthMap) => set({ depthMap }),
  setDepthIntensity: (depthIntensity) => set({ depthIntensity }),
  setError: (error) => set({ error }),
  reset: () => {
    const currentUrl = get().previewUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
    set({ ...initialState });
  },
}));
