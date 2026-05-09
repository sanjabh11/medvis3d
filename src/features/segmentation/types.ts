export type SegmentationProviderId =
  | 'demo-mask'
  | 'medsam2-research'
  | 'totalsegmentator-research'
  | 'monai-label-research';

export interface SegmentationOverlay {
  id: string;
  label: string;
  provider: SegmentationProviderId;
  confidence: 'demo' | 'low' | 'medium' | 'high';
  limitations: string[];
  nonDiagnostic: true;
}

export interface SegmentationProvider {
  id: SegmentationProviderId;
  label: string;
  mode: 'local-demo' | 'server-research';
  createOverlay: () => Promise<SegmentationOverlay>;
}
