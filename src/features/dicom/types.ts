export interface SafeDicomStudySummary {
  modality?: string;
  dimensions?: string;
  transferSyntaxUID?: string;
  photometricInterpretation?: string;
  windowCenter?: number;
  windowWidth?: number;
  supportStatus: 'supported' | 'unsupported' | 'unknown';
  unsupportedReason?: string;
}
