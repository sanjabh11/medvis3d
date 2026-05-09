export interface FhirImagingSandboxStudy {
  id: string;
  status: string;
  modality: string[];
  seriesCount: number;
  instanceCount: number;
  dicomwebEndpoint?: string;
  sandboxOnly: true;
}

export const MOCK_FHIR_IMAGING_SANDBOX_STUDIES: FhirImagingSandboxStudy[] = [
  {
    id: 'sandbox-imagingstudy-educational-001',
    status: 'available',
    modality: ['XR'],
    seriesCount: 1,
    instanceCount: 1,
    dicomwebEndpoint: 'https://example.invalid/dicomweb/studies/sandbox-imagingstudy-educational-001',
    sandboxOnly: true,
  },
  {
    id: 'sandbox-imagingstudy-educational-ct-002',
    status: 'available',
    modality: ['CT'],
    seriesCount: 2,
    instanceCount: 12,
    dicomwebEndpoint: 'https://example.invalid/dicomweb/studies/sandbox-imagingstudy-educational-ct-002',
    sandboxOnly: true,
  },
];

export function buildQidoRsStudyUrl(dicomwebRoot: string, patientId: string): string {
  // QIDO-RS study discovery. Sandbox only; this is not production PACS access.
  const root = dicomwebRoot.replace(/\/$/, '');
  return `${root}/studies?PatientID=${encodeURIComponent(patientId)}`;
}

export function buildWadoRsRenderedUrl(dicomwebRoot: string, studyInstanceUid: string): string {
  // WADO-RS rendered study URL for sandbox/demo viewers.
  const root = dicomwebRoot.replace(/\/$/, '');
  return `${root}/studies/${encodeURIComponent(studyInstanceUid)}/rendered`;
}

export function describeDicomwebChain(study: FhirImagingSandboxStudy): string[] {
  return [
    'SMART launch context',
    'FHIR Patient',
    `ImagingStudy ${study.id}`,
    study.dicomwebEndpoint ? 'DICOMweb endpoint' : 'DICOMweb endpoint unavailable',
    'Viewer sandbox proof',
  ];
}
