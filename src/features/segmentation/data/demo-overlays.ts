import type { SegmentationOverlay, SegmentationProvider } from '../types';

export const DEMO_SEGMENTATION_OVERLAYS: SegmentationOverlay[] = [
  {
    id: 'demo-mask-structure-highlight',
    label: 'Demo structure highlight',
    provider: 'demo-mask',
    confidence: 'demo',
    limitations: [
      'Synthetic overlay for UI and outreach proof only.',
      'Not lesion detection, not diagnosis, and not treatment guidance.',
    ],
    nonDiagnostic: true,
  },
];

export const SEGMENTATION_PROVIDERS: SegmentationProvider[] = [
  {
    id: 'demo-mask',
    label: 'Local demo mask',
    mode: 'local-demo',
    createOverlay: async () => DEMO_SEGMENTATION_OVERLAYS[0],
  },
  {
    id: 'medsam2-research',
    label: 'MedSAM2 research server candidate',
    mode: 'server-research',
    createOverlay: async () => DEMO_SEGMENTATION_OVERLAYS[0],
  },
  {
    id: 'totalsegmentator-research',
    label: 'TotalSegmentator research server candidate',
    mode: 'server-research',
    createOverlay: async () => DEMO_SEGMENTATION_OVERLAYS[0],
  },
  {
    id: 'monai-label-research',
    label: 'MONAI Label research workflow candidate',
    mode: 'server-research',
    createOverlay: async () => DEMO_SEGMENTATION_OVERLAYS[0],
  },
];
