export type SourceType = 'image' | 'camera' | 'dicom';

export type EnhancementProfile =
  | 'auto'
  | 'xray'
  | 'ct-mri-slice'
  | 'ultrasound-like'
  | 'general-photo';

export type ImageQualityOverall =
  | 'good'
  | 'enhanceable'
  | 'low-confidence'
  | 'insufficient';

export interface ImageQualityReport {
  resolution: {
    width: number;
    height: number;
  };
  blurScore: number;
  contrastScore: number;
  exposureScore: number;
  grayscaleLikelihood: number;
  overall: ImageQualityOverall;
  warnings: string[];
}

export interface EnhancedImageResult {
  imageData: ImageData;
  profile: EnhancementProfile;
  appliedSteps: string[];
}

export type VisualizationConfidence = 'high' | 'medium' | 'low';

export interface VisualizationFacts {
  sourceType: SourceType;
  imageQuality: ImageQualityOverall;
  enhancementProfile: EnhancementProfile;
  enhancementSteps: string[];
  modelName: string;
  modelProvider: string;
  modelVariant: string;
  backend: string;
  confidence: VisualizationConfidence;
  limitations: string[];
  privacyStatus: string;
}

export type ConsultAudience = 'clinician' | 'patient' | 'pilot-review';

export type ConsultReviewStatus = 'draft' | 'clinician-reviewed' | 'demo-only';

export type ConsultModality =
  | 'xray'
  | 'ct-mri-slice'
  | 'ultrasound'
  | 'camera-capture'
  | 'general-image'
  | 'unknown';

export interface ConsultContext {
  modality: ConsultModality;
  bodyRegion: string;
  intendedAudience: ConsultAudience;
  reviewStatus: ConsultReviewStatus;
  educationalLimitation: string;
}

export type MeshMaterialPreset =
  | 'clinical-relief'
  | 'bone-contrast'
  | 'depth-heatmap'
  | 'soft-tissue'
  | 'original-texture';

export type ViewPreset = 'front' | 'oblique' | 'side' | 'topographic';
