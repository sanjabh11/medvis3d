'use client';

import { Database, Link2, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  MOCK_FHIR_IMAGING_SANDBOX_STUDIES,
  buildQidoRsStudyUrl,
  buildWadoRsRenderedUrl,
  describeDicomwebChain,
} from '../utils/dicomweb-client';

export function FhirDicomwebSandbox() {
  const demoStudy = MOCK_FHIR_IMAGING_SANDBOX_STUDIES[0];
  const chain = describeDicomwebChain(demoStudy);
  const qidoUrl = buildQidoRsStudyUrl('https://example.invalid/dicomweb', 'SANDBOX-PATIENT');
  const wadoUrl = buildWadoRsRenderedUrl('https://example.invalid/dicomweb', demoStudy.id);

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-[--color-medical-primary]" />
          <div>
            <h2 className="text-lg font-semibold text-[--color-medical-text-primary]">
              SMART/FHIR sandbox
            </h2>
            <p className="text-sm text-[--color-medical-text-secondary]">
              Sandbox proof chain only; registered EHR app and imaging endpoints are required for production.
            </p>
          </div>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
          <ShieldAlert className="h-3.5 w-3.5" />
          sandbox proof, not production EHR support
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-lg border border-[--color-medical-border] bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[--color-medical-text-secondary]">
            Standards chain
          </p>
          <p className="sr-only">
            SMART launch context to FHIR Patient to ImagingStudy to DICOMweb endpoint to viewer.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {chain.map((step, index) => (
              <span key={step} className="inline-flex items-center gap-2">
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-800">
                  {step}
                </span>
                {index < chain.length - 1 && <Link2 className="h-3.5 w-3.5 text-gray-400" />}
              </span>
            ))}
          </div>
          <div className="mt-4 grid gap-2 text-xs text-[--color-medical-text-secondary]">
            <p>QIDO-RS demo URL: {qidoUrl}</p>
            <p>WADO-RS rendered demo URL: {wadoUrl}</p>
          </div>
        </div>

        <div className="rounded-lg border border-[--color-medical-border] bg-white p-4 text-sm">
          <p className="font-semibold text-[--color-medical-text-primary]">Mock ImagingStudy</p>
          <p className="mt-2">ID: {demoStudy.id}</p>
          <p>Status: {demoStudy.status}</p>
          <p>Modality: {demoStudy.modality.join(', ')}</p>
          <p>Series: {demoStudy.seriesCount}</p>
          <p>Instances: {demoStudy.instanceCount}</p>
          <p className="mt-3 text-xs leading-relaxed text-[--color-medical-text-secondary]">
            DICOMweb utilities name QIDO-RS and WADO-RS for standards readiness, but no remote
            archive is contacted unless an explicit sandbox endpoint is configured.
          </p>
        </div>
      </div>
    </Card>
  );
}
