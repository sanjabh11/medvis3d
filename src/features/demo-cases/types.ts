import type { ConsultModality } from '@/features/builder';

export type DemoCaseKind =
  | 'xray-like'
  | 'ct-mri-slice-like'
  | 'ultrasound-like'
  | 'low-contrast'
  | 'camera-captured-screen'
  | 'general-medical-photo-like';

export interface DemoCase {
  id: string;
  title: string;
  kind: DemoCaseKind;
  modality: ConsultModality;
  bodyRegion: string;
  buyerLane: string;
  claimBoundary: string;
  knownLimitations: string[];
  loadImageData: () => Promise<ImageData>;
}
