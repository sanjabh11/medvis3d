import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Top20 feature plan exists and records honest implementation categories', async () => {
  const roadmap = await readFile(new URL('../docs/Top20_Features.md', import.meta.url), 'utf8');

  assert.match(roadmap, /Implemented and relevant|routed app supports/i);
  assert.match(roadmap, /Code-only/i);
  assert.match(roadmap, /Unsafe|PHI/i);
  assert.match(roadmap, /OHIF/);
  assert.match(roadmap, /Cornerstone3D/);
});

test('URL image sharing remains disabled for PHI safety', async () => {
  const encoder = await readFile(new URL('../src/features/sharing/utils/encoder.ts', import.meta.url), 'utf8');

  assert.match(encoder, /URL_IMAGE_SHARING_ENABLED = false/);
  assert.match(encoder, /medical image pixels must not be embedded in links/);
  assert.match(encoder, /throw new Error\(URL_IMAGE_SHARING_DISABLED_REASON\)/);
});

test('export report generator escapes text fields before HTML interpolation', async () => {
  const generator = await readFile(new URL('../src/features/export/utils/pdf-generator.ts', import.meta.url), 'utf8');

  assert.match(generator, /function escapeHtml/);
  assert.match(generator, /const notes = data\.notes \? escapeHtml\(data\.notes\)/);
  assert.match(generator, /const disclaimer = escapeHtml\(data\.disclaimer\)/);
});

test('builder adds deterministic quality and enhancement before inference', async () => {
  const quality = await readFile(new URL('../src/features/builder/utils/image-quality.ts', import.meta.url), 'utf8');
  const inference = await readFile(new URL('../src/app/sections/InferenceSection.tsx', import.meta.url), 'utf8');

  assert.match(quality, /export function analyzeImageQuality/);
  assert.match(quality, /export function enhanceImageData/);
  assert.match(quality, /contrast stretch/);
  assert.match(quality, /edge-preserving sharpen/);
  assert.match(inference, /enhancedImageData \|\| imageData/);
});

test('depth result is refined before the 3D viewer receives it', async () => {
  const depthRefinement = await readFile(new URL('../src/features/builder/utils/depth-refinement.ts', import.meta.url), 'utf8');
  const depthHook = await readFile(new URL('../src/features/inference/hooks/useDepthEstimation.ts', import.meta.url), 'utf8');

  assert.match(depthRefinement, /export function refineDepthMap/);
  assert.match(depthRefinement, /edgeAwareSmooth/);
  assert.match(depthHook, /refineDepthMap\(normalizedDepth/);
});

test('viewer exposes builder provenance and visual presets', async () => {
  const viewer = await readFile(new URL('../src/app/sections/ViewerSection.tsx', import.meta.url), 'utf8');
  const controls = await readFile(new URL('../src/features/viewer/components/ViewerControls.tsx', import.meta.url), 'utf8');
  const facts = await readFile(new URL('../src/features/builder/components/VisualizationFactsPanel.tsx', import.meta.url), 'utf8');

  assert.match(viewer, /VisualizationFactsPanel/);
  assert.match(controls, /clinical-relief/);
  assert.match(controls, /depth-heatmap/);
  assert.match(controls, /topographic/);
  assert.match(facts, /not a diagnostic/i);
  assert.match(facts, /No image pixels in share URLs by default/);
});

test('consult workspace is the routed product surface with annotations and explanation context', async () => {
  const page = await readFile(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
  const workspace = await readFile(new URL('../src/app/sections/ConsultWorkspace.tsx', import.meta.url), 'utf8');

  assert.match(page, /ConsultWorkspace/);
  assert.match(workspace, /UploadSection/);
  assert.match(workspace, /InferenceSection/);
  assert.match(workspace, /ViewerSection/);
  assert.match(workspace, /AnnotationCanvas/);
  assert.match(workspace, /Patient explanation/);
  assert.match(workspace, /ConsultContext/);
});

test('consult snapshot export is sanitized and not mislabeled as PDF', async () => {
  const dialog = await readFile(new URL('../src/features/export/components/ExportDialog.tsx', import.meta.url), 'utf8');
  const generator = await readFile(new URL('../src/features/export/utils/pdf-generator.ts', import.meta.url), 'utf8');

  assert.match(dialog, /Consult Snapshot/);
  assert.doesNotMatch(dialog, /Export Report/);
  assert.match(dialog, /includeSourceImage/);
  assert.match(dialog, /source image excluded by default/i);
  assert.match(generator, /generateConsultSnapshot/);
  assert.match(generator, /Patient identifiers and raw DICOM metadata are not included/);
  assert.match(generator, /escapeHtml/);
});

test('DICOM metadata is redacted and unsupported transfer syntaxes are explicit', async () => {
  const parser = await readFile(new URL('../src/features/dicom/hooks/useDicomParser.ts', import.meta.url), 'utf8');
  const panel = await readFile(new URL('../src/features/dicom/components/DicomMetadataPanel.tsx', import.meta.url), 'utf8');

  assert.match(parser, /redactDicomMetadata/);
  assert.match(parser, /isSupportedTransferSyntax/);
  assert.match(parser, /Unsupported DICOM transfer syntax/);
  assert.match(panel, /PHI redacted/);
  assert.doesNotMatch(panel, /metadata\.patientId \|\| 'Anonymous'/);
});

test('MedVis3D proof-pack and outreach operating docs exist with claim boundaries', async () => {
  const freeze = await readFile(new URL('../docs/MEDVIS3D_BEST_IN_CLASS_GAP_AND_IMPLEMENTATION_FREEZE.md', import.meta.url), 'utf8');
  const outreach = await readFile(new URL('../docs/growth/MEDVIS3D_OUTREACH_OPERATING_PLAN.md', import.meta.url), 'utf8');
  const templates = await readFile(new URL('../docs/growth/templates/MEDVIS3D_OUTREACH_AND_PILOT_TEMPLATES.md', import.meta.url), 'utf8');

  assert.match(freeze, /Source, Runtime, Data, Provenance, Buyer Workflow, Artifact/);
  assert.match(freeze, /patient_specific_3d_consult_builder/);
  assert.match(outreach, /Manual founder-led only/);
  assert.match(outreach, /educational visualization, not diagnostic output/);
  assert.match(templates, /14-day pilot/);
  assert.match(templates, /Do not claim/);
});

test('demo cases are synthetic non-PHI proof-pack inputs', async () => {
  const demoData = await readFile(new URL('../src/features/demo-cases/data/demo-cases.ts', import.meta.url), 'utf8');
  const demoTypes = await readFile(new URL('../src/features/demo-cases/types.ts', import.meta.url), 'utf8');
  const workspace = await readFile(new URL('../src/app/sections/ConsultWorkspace.tsx', import.meta.url), 'utf8');

  assert.match(demoTypes, /export interface DemoCase/);
  assert.match(demoData, /synthetic/);
  assert.match(demoData, /xray-like/);
  assert.match(demoData, /ct-mri-slice-like/);
  assert.match(demoData, /ultrasound-like/);
  assert.match(demoData, /low-contrast/);
  assert.match(demoData, /camera-captured-screen/);
  assert.doesNotMatch(demoData, /patientName|patientId|MRN|DOB|John|Jane/i);
  assert.match(workspace, /DemoCaseLibrary/);
});

test('Cornerstone DICOM viewer initializes local file stack with tools and safe copy', async () => {
  const pkg = await readFile(new URL('../package.json', import.meta.url), 'utf8');
  const viewer = await readFile(new URL('../src/features/dicom/components/CornerstoneDicomViewer.tsx', import.meta.url), 'utf8');

  assert.match(pkg, /"@cornerstonejs\/tools": "\^?4\.14\.2"/);
  assert.match(viewer, /@cornerstonejs\/core/);
  assert.match(viewer, /@cornerstonejs\/dicom-image-loader/);
  assert.match(viewer, /@cornerstonejs\/tools/);
  assert.match(viewer, /wadouri\.fileManager\.add/);
  assert.match(viewer, /ViewportType\.STACK/);
  assert.match(viewer, /WindowLevelTool/);
  assert.match(viewer, /StackScrollTool/);
  assert.match(viewer, /LengthTool/);
  assert.match(viewer, /measurement-lite \/ educational only/);
  assert.match(viewer, /renderingEngine\.destroy/);
});

test('SMART FHIR DICOMweb sandbox is explicit and avoids production EHR claims', async () => {
  const launcher = await readFile(new URL('../src/features/fhir/components/FhirLauncher.tsx', import.meta.url), 'utf8');
  const sandbox = await readFile(new URL('../src/features/fhir/components/FhirDicomwebSandbox.tsx', import.meta.url), 'utf8');
  const dicomweb = await readFile(new URL('../src/features/fhir/utils/dicomweb-client.ts', import.meta.url), 'utf8');

  assert.match(launcher, /SMART sandbox/);
  assert.match(launcher, /registered EHR app required for production/);
  assert.doesNotMatch(launcher, /Epic, Cerner/);
  assert.match(sandbox, /SMART launch context/);
  assert.match(sandbox, /FHIR Patient/);
  assert.match(sandbox, /ImagingStudy/);
  assert.match(sandbox, /DICOMweb endpoint/);
  assert.match(sandbox, /sandbox proof/i);
  assert.match(dicomweb, /QIDO-RS/);
  assert.match(dicomweb, /WADO-RS/);
  assert.match(dicomweb, /sandboxOnly: true/);
});

test('segmentation research track uses demo overlays with non-diagnostic labels', async () => {
  const types = await readFile(new URL('../src/features/segmentation/types.ts', import.meta.url), 'utf8');
  const data = await readFile(new URL('../src/features/segmentation/data/demo-overlays.ts', import.meta.url), 'utf8');
  const component = await readFile(new URL('../src/features/segmentation/components/SegmentationResearchPanel.tsx', import.meta.url), 'utf8');
  const docs = await readFile(new URL('../docs/SEGMENTATION_RESEARCH_TRACK.md', import.meta.url), 'utf8');

  assert.match(types, /SegmentationProvider/);
  assert.match(types, /nonDiagnostic: true/);
  assert.match(data, /provider: 'demo-mask'/);
  assert.match(data, /nonDiagnostic: true/);
  assert.match(component, /experimental overlay/i);
  assert.match(component, /non-diagnostic/i);
  assert.match(docs, /MedSAM2/);
  assert.match(docs, /TotalSegmentator/);
  assert.match(docs, /MONAI Label/);
});

test('proof screenshots scripts and manifest are wired for outreach evidence', async () => {
  const pkg = await readFile(new URL('../package.json', import.meta.url), 'utf8');
  const e2e = await readFile(new URL('../tests/e2e/medvis3d-proof.spec.ts', import.meta.url), 'utf8');
  const proofScript = await readFile(new URL('../scripts/capture-proof-screenshots.mjs', import.meta.url), 'utf8');
  const manifest = await readFile(new URL('../docs/growth/proof/PROOF_PACK_MANIFEST.md', import.meta.url), 'utf8');

  assert.match(pkg, /"test:e2e"/);
  assert.match(pkg, /"proof:screenshots"/);
  assert.match(e2e, /Demo case gallery visible/);
  assert.match(e2e, /Consult Snapshot/);
  assert.match(e2e, /SMART\/FHIR sandbox/);
  assert.match(e2e, /experimental overlay/i);
  assert.match(proofScript, /docs\/growth\/proof\/screenshots/);
  assert.match(manifest, /Source, Runtime, Data, Provenance, Buyer Workflow, Artifact/);
  assert.match(manifest, /verification command/i);
});
