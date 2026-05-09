import { create } from 'zustand';
import type {
  ConsultContext,
  EnhancedImageResult,
  EnhancementProfile,
  ImageQualityReport,
  MeshMaterialPreset,
  SourceType,
  ViewPreset,
  VisualizationFacts,
} from '@/features/builder';
import type { Annotation } from '@/features/annotation';

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';
export type InferenceStatus = 'idle' | 'processing' | 'complete' | 'error';

interface AppState {
  file: File | null;
  imageData: ImageData | null;
  previewUrl: string | null;
  sourceType: SourceType | null;
  qualityReport: ImageQualityReport | null;
  enhancementProfile: EnhancementProfile;
  enhancedImageData: ImageData | null;
  enhancedPreviewUrl: string | null;
  enhancedResult: EnhancedImageResult | null;
  
  modelStatus: ModelStatus;
  modelProgress: number;
  
  inferenceStatus: InferenceStatus;
  depthMap: Float32Array | null;
  
  depthIntensity: number;
  meshMaterialPreset: MeshMaterialPreset;
  viewPreset: ViewPreset;
  visualizationFacts: VisualizationFacts | null;
  consultContext: ConsultContext;
  consultNotes: string;
  patientQuestion: string;
  consultAnnotations: Annotation[];
  
  error: string | null;
  
  setFile: (file: File | null) => void;
  setImageData: (data: ImageData | null) => void;
  setPreviewUrl: (url: string | null) => void;
  setSourceType: (sourceType: SourceType | null) => void;
  setQualityReport: (report: ImageQualityReport | null) => void;
  setEnhancementProfile: (profile: EnhancementProfile) => void;
  setEnhancedImageData: (data: ImageData | null) => void;
  setEnhancedPreviewUrl: (url: string | null) => void;
  setEnhancedResult: (result: EnhancedImageResult | null) => void;
  setModelStatus: (status: ModelStatus) => void;
  setModelProgress: (progress: number) => void;
  setInferenceStatus: (status: InferenceStatus) => void;
  setDepthMap: (depth: Float32Array | null) => void;
  setDepthIntensity: (intensity: number) => void;
  setMeshMaterialPreset: (preset: MeshMaterialPreset) => void;
  setViewPreset: (preset: ViewPreset) => void;
  setVisualizationFacts: (facts: VisualizationFacts | null) => void;
  setConsultContext: (context: Partial<ConsultContext>) => void;
  setConsultNotes: (notes: string) => void;
  setPatientQuestion: (question: string) => void;
  setConsultAnnotations: (annotations: Annotation[]) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const DEFAULT_EDUCATIONAL_LIMITATION =
  'Educational visualization only. Not for diagnosis, treatment decisions, surgical planning, or regulatory clinical use.';

const initialState = {
  file: null,
  imageData: null,
  previewUrl: null,
  sourceType: null,
  qualityReport: null,
  enhancementProfile: 'auto' as EnhancementProfile,
  enhancedImageData: null,
  enhancedPreviewUrl: null,
  enhancedResult: null,
  modelStatus: 'idle' as ModelStatus,
  modelProgress: 0,
  inferenceStatus: 'idle' as InferenceStatus,
  depthMap: null,
  depthIntensity: 0.5,
  meshMaterialPreset: 'clinical-relief' as MeshMaterialPreset,
  viewPreset: 'oblique' as ViewPreset,
  visualizationFacts: null,
  consultContext: {
    modality: 'unknown',
    bodyRegion: '',
    intendedAudience: 'clinician',
    reviewStatus: 'draft',
    educationalLimitation: DEFAULT_EDUCATIONAL_LIMITATION,
  } satisfies ConsultContext,
  consultNotes: '',
  patientQuestion: '',
  consultAnnotations: [] as Annotation[],
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
  setSourceType: (sourceType) => set({ sourceType }),
  setQualityReport: (qualityReport) => set({ qualityReport }),
  setEnhancementProfile: (enhancementProfile) => set({ enhancementProfile }),
  setEnhancedImageData: (enhancedImageData) => set({ enhancedImageData }),
  setEnhancedPreviewUrl: (enhancedPreviewUrl) => {
    const currentUrl = get().enhancedPreviewUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
    set({ enhancedPreviewUrl });
  },
  setEnhancedResult: (enhancedResult) => set({ enhancedResult }),
  setModelStatus: (modelStatus) => set({ modelStatus }),
  setModelProgress: (modelProgress) => set({ modelProgress }),
  setInferenceStatus: (inferenceStatus) => set({ inferenceStatus }),
  setDepthMap: (depthMap) => set({ depthMap }),
  setDepthIntensity: (depthIntensity) => set({ depthIntensity }),
  setMeshMaterialPreset: (meshMaterialPreset) => set({ meshMaterialPreset }),
  setViewPreset: (viewPreset) => set({ viewPreset }),
  setVisualizationFacts: (visualizationFacts) => set({ visualizationFacts }),
  setConsultContext: (consultContext) => set((state) => ({
    consultContext: {
      ...state.consultContext,
      ...consultContext,
    },
  })),
  setConsultNotes: (consultNotes) => set({ consultNotes }),
  setPatientQuestion: (patientQuestion) => set({ patientQuestion }),
  setConsultAnnotations: (consultAnnotations) => set({ consultAnnotations }),
  setError: (error) => set({ error }),
  reset: () => {
    const currentUrl = get().previewUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
    const currentEnhancedUrl = get().enhancedPreviewUrl;
    if (currentEnhancedUrl) {
      URL.revokeObjectURL(currentEnhancedUrl);
    }
    set({ ...initialState });
  },
}));
