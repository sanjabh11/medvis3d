'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  Lock,
  MessageSquare,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/stores';
import { AnnotationCanvas, AnnotationToolbar, useAnnotation } from '@/features/annotation';
import {
  analyzeImageQuality,
  enhanceImageData,
  type ConsultContext,
  type ConsultModality,
  type SourceType,
} from '@/features/builder';
import { DemoCaseLibrary, imageDataToDataUrl, type DemoCase } from '@/features/demo-cases';
import { CornerstoneDicomViewer } from '@/features/dicom';
import { FhirDicomwebSandbox, FhirLauncher } from '@/features/fhir';
import { SegmentationResearchPanel } from '@/features/segmentation';
import { UploadSection } from './UploadSection';
import { InferenceSection } from './InferenceSection';
import { ViewerSection } from './ViewerSection';

const ANNOTATION_WIDTH = 640;
const ANNOTATION_HEIGHT = 420;

function readinessClass(isComplete: boolean) {
  return isComplete
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-gray-200 bg-gray-50 text-[--color-medical-text-secondary]';
}

function ConsultContextPanel() {
  const { consultContext, setConsultContext } = useAppStore();

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-[--color-medical-primary]" />
        <div>
          <h2 className="text-lg font-semibold text-[--color-medical-text-primary]">
            Consult setup
          </h2>
          <p className="text-sm text-[--color-medical-text-secondary]">
            Describe the educational context before building the 3D view.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[--color-medical-text-primary]">Image type</span>
          <select
            value={consultContext.modality}
            onChange={(event) =>
              setConsultContext({ modality: event.target.value as ConsultContext['modality'] })
            }
            className="w-full rounded-md border border-[--color-medical-border] bg-white px-3 py-2 text-sm"
          >
            <option value="unknown">Unknown or mixed</option>
            <option value="xray">X-ray-like</option>
            <option value="ct-mri-slice">CT/MRI slice-like</option>
            <option value="ultrasound">Ultrasound-like</option>
            <option value="camera-capture">Camera-captured image</option>
            <option value="general-image">General medical image</option>
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-[--color-medical-text-primary]">Body region</span>
          <input
            value={consultContext.bodyRegion}
            onChange={(event) => setConsultContext({ bodyRegion: event.target.value })}
            placeholder="Example: knee, chest, spine"
            className="w-full rounded-md border border-[--color-medical-border] bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-[--color-medical-text-primary]">Audience</span>
          <select
            value={consultContext.intendedAudience}
            onChange={(event) =>
              setConsultContext({
                intendedAudience: event.target.value as ConsultContext['intendedAudience'],
              })
            }
            className="w-full rounded-md border border-[--color-medical-border] bg-white px-3 py-2 text-sm"
          >
            <option value="clinician">Clinician explanation</option>
            <option value="patient">Patient explanation</option>
            <option value="pilot-review">Pilot review</option>
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-[--color-medical-text-primary]">Review status</span>
          <select
            value={consultContext.reviewStatus}
            onChange={(event) =>
              setConsultContext({
                reviewStatus: event.target.value as ConsultContext['reviewStatus'],
              })
            }
            className="w-full rounded-md border border-[--color-medical-border] bg-white px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="clinician-reviewed">Clinician reviewed</option>
            <option value="demo-only">Demo only</option>
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        {consultContext.educationalLimitation}
      </div>
    </Card>
  );
}

function ConsultAnnotationPanel() {
  const { previewUrl, enhancedPreviewUrl, setConsultAnnotations } = useAppStore();
  const [textLabel, setTextLabel] = useState('Discuss this area');
  const {
    annotations,
    activeType,
    isDrawing,
    setActiveType,
    startDrawing,
    continueDrawing,
    finishDrawing,
    addTextAnnotation,
    clearAnnotations,
    undoLast,
  } = useAnnotation();

  const annotationImageUrl = enhancedPreviewUrl || previewUrl;

  useEffect(() => {
    setConsultAnnotations(annotations);
  }, [annotations, setConsultAnnotations]);

  const handleStart = (x: number, y: number) => {
    if (activeType === 'text') {
      const safeLabel = textLabel.trim() || 'Discuss this area';
      addTextAnnotation(x, y, safeLabel);
      return;
    }

    startDrawing(x, y);
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-[--color-medical-primary]" />
          <div>
            <h2 className="text-lg font-semibold text-[--color-medical-text-primary]">
              Consult annotations
            </h2>
            <p className="text-sm text-[--color-medical-text-secondary]">
              Add visual callouts for the educational consult snapshot.
            </p>
          </div>
        </div>
        <AnnotationToolbar
          activeType={activeType}
          onTypeChange={setActiveType}
          onUndo={undoLast}
          onClear={clearAnnotations}
          hasAnnotations={annotations.length > 0}
          disabled={!annotationImageUrl}
        />
      </div>

      {activeType === 'text' && (
        <label className="mb-3 block space-y-2 text-sm">
          <span className="font-medium text-[--color-medical-text-primary]">Text callout</span>
          <input
            value={textLabel}
            onChange={(event) => setTextLabel(event.target.value)}
            className="w-full rounded-md border border-[--color-medical-border] bg-white px-3 py-2 text-sm"
          />
        </label>
      )}

      <div className="overflow-x-auto rounded-lg border border-[--color-medical-border] bg-gray-950 p-3">
        <div
          className="relative mx-auto bg-black"
          style={{ width: ANNOTATION_WIDTH, height: ANNOTATION_HEIGHT }}
        >
          {annotationImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={annotationImageUrl}
              alt="Image selected for consult annotation"
              className="absolute inset-0 h-full w-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-gray-300">
              Upload or capture an image to enable routed annotation tools.
            </div>
          )}
          <AnnotationCanvas
            annotations={annotations}
            isDrawing={isDrawing || activeType !== null}
            width={ANNOTATION_WIDTH}
            height={ANNOTATION_HEIGHT}
            className="absolute inset-0"
            onMouseDown={handleStart}
            onMouseMove={continueDrawing}
            onMouseUp={finishDrawing}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-[--color-medical-text-secondary]">
        Annotations are exported as consult context only. They are not diagnostic measurements.
      </p>
    </Card>
  );
}

function PatientExplanationPanel() {
  const {
    consultContext,
    consultNotes,
    patientQuestion,
    visualizationFacts,
    setConsultNotes,
    setPatientQuestion,
  } = useAppStore();

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[--color-medical-primary]" />
        <div>
          <h2 className="text-lg font-semibold text-[--color-medical-text-primary]">
            Patient explanation
          </h2>
          <p className="text-sm text-[--color-medical-text-secondary]">
            Prepare plain-language talking points without making diagnostic claims.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[--color-medical-text-primary]">
            Consult notes
          </span>
          <textarea
            value={consultNotes}
            onChange={(event) => setConsultNotes(event.target.value)}
            rows={4}
            placeholder="Example: Use this 3D relief view to explain image orientation, visible structure, and why clinical interpretation should come from the care team."
            className="w-full resize-y rounded-md border border-[--color-medical-border] bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-[--color-medical-text-primary]">
            Question for clinician
          </span>
          <input
            value={patientQuestion}
            onChange={(event) => setPatientQuestion(event.target.value)}
            placeholder="Example: What should I ask my clinician about this image?"
            className="w-full rounded-md border border-[--color-medical-border] bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[--color-medical-text-secondary]">
            Context
          </p>
          <p className="mt-1 text-[--color-medical-text-primary]">
            {consultContext.modality} {consultContext.bodyRegion ? `- ${consultContext.bodyRegion}` : ''}
          </p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[--color-medical-text-secondary]">
            Confidence
          </p>
          <p className="mt-1 text-[--color-medical-text-primary]">
            {visualizationFacts?.confidence || 'Pending 3D build'}
          </p>
        </div>
      </div>
    </Card>
  );
}

function ProofReadinessPanel() {
  const { file, depthMap, visualizationFacts, consultAnnotations, consultNotes } = useAppStore();

  const checks = useMemo(
    () => [
      { label: 'Source image', done: !!file },
      { label: 'Depth build', done: !!depthMap },
      { label: 'Visualization facts', done: !!visualizationFacts },
      { label: 'Consult notes', done: consultNotes.trim().length > 0 },
      { label: 'Annotations', done: consultAnnotations.length > 0 },
    ],
    [consultAnnotations.length, consultNotes, depthMap, file, visualizationFacts]
  );

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-[--color-medical-primary]" />
        <div>
          <h2 className="text-lg font-semibold text-[--color-medical-text-primary]">
            Proof-pack readiness
          </h2>
          <p className="text-sm text-[--color-medical-text-secondary]">
            A route is marketable only when source, runtime, data, provenance, buyer workflow, and artifact gates are visible.
          </p>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-5">
        {checks.map((check) => (
          <div
            key={check.label}
            className={`rounded-md border px-3 py-2 text-xs font-medium ${readinessClass(check.done)}`}
          >
            {check.label}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ConsultWorkspace() {
  const {
    previewUrl,
    enhancementProfile,
    setFile,
    setPreviewUrl,
    setImageData,
    setSourceType,
    setQualityReport,
    setEnhancedImageData,
    setEnhancedPreviewUrl,
    setEnhancedResult,
    setDepthMap,
    setVisualizationFacts,
    setConsultContext,
    setConsultNotes,
    setPatientQuestion,
  } = useAppStore();

  const loadImageIntoBuilder = useCallback((
    imageData: ImageData,
    preview: string,
    fileName: string,
    modality: ConsultModality,
    bodyRegion: string,
    sourceType: SourceType,
    notes?: string
  ) => {
    const report = analyzeImageQuality(imageData);
    const enhanced = enhanceImageData(imageData, enhancementProfile, report);
    const enhancedPreview = imageDataToDataUrl(enhanced.imageData);

    setFile(new File([], fileName, { type: 'image/png' }));
    setPreviewUrl(preview);
    setImageData(imageData);
    setSourceType(sourceType);
    setQualityReport(report);
    setEnhancedImageData(enhanced.imageData);
    setEnhancedPreviewUrl(enhancedPreview);
    setEnhancedResult(enhanced);
    setDepthMap(null);
    setVisualizationFacts(null);
    setConsultContext({ modality, bodyRegion, reviewStatus: 'demo-only' });
    setConsultNotes(notes || '');
    setPatientQuestion('What should I ask my clinician about this educational visualization?');
  }, [
    enhancementProfile,
    setConsultContext,
    setConsultNotes,
    setDepthMap,
    setEnhancedImageData,
    setEnhancedPreviewUrl,
    setEnhancedResult,
    setFile,
    setImageData,
    setPatientQuestion,
    setPreviewUrl,
    setQualityReport,
    setSourceType,
    setVisualizationFacts,
  ]);

  const handleLoadDemoCase = useCallback(async (demoCase: DemoCase) => {
    const imageData = await demoCase.loadImageData();
    const preview = imageDataToDataUrl(imageData);
    loadImageIntoBuilder(
      imageData,
      preview,
      `${demoCase.id}.png`,
      demoCase.modality,
      demoCase.bodyRegion,
      'image',
      `${demoCase.claimBoundary} ${demoCase.knownLimitations.join(' ')}`
    );
  }, [loadImageIntoBuilder]);

  const handleUseDicomFrame = useCallback((imageData: ImageData, preview: string) => {
    loadImageIntoBuilder(
      imageData,
      preview,
      'cornerstone-dicom-frame.png',
      'ct-mri-slice',
      'DICOM frame',
      'dicom',
      'Current DICOM frame was copied into the educational 3D builder. This is not diagnostic DICOM interpretation.'
    );
  }, [loadImageIntoBuilder]);

  return (
    <section className="space-y-6" aria-label="3D Consult Builder">
      <Card className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-[--color-medical-primary]">
              <Lock className="h-3.5 w-3.5" />
              Browser-local consult builder
            </div>
            <h2 className="text-2xl font-bold text-[--color-medical-text-primary]">
              Build a patient-specific educational 3D consult
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[--color-medical-text-secondary]">
              Upload or capture a 2D image, enhance unclear inputs, build a confidence-labeled
              3D view, add annotations, and export a sanitized consult snapshot.
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 md:max-w-xs">
            Educational visualization only. This workflow is not diagnostic AI, PACS replacement,
            secure PHI sharing, or surgical planning software.
          </div>
        </div>
      </Card>

      <ConsultContextPanel />
      <DemoCaseLibrary onLoadCase={handleLoadDemoCase} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
        <div className="space-y-6">
          <UploadSection />
          <InferenceSection />
          <ConsultAnnotationPanel />
        </div>

        <div className="space-y-6">
          <PatientExplanationPanel />
          <ViewerSection />
        </div>
      </div>

      <ProofReadinessPanel />
      <CornerstoneDicomViewer onUseFrameForBuilder={handleUseDicomFrame} />
      <FhirLauncher />
      <FhirDicomwebSandbox />
      <SegmentationResearchPanel imageUrl={previewUrl} />
    </section>
  );
}
