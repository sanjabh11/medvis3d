# Top 10 Marketability Roadmap for Medical Imaging 3D

Last updated: 2026-05-08

## 1. Decision Thesis

The website should not try to become a full diagnostic PACS viewer, a surgical planning suite, or an FDA-cleared AI diagnostic tool in the next build cycle. The strongest marketable position is:

> A privacy-first, patient-specific visual explanation layer that turns a medical image into an understandable 2D/3D consult experience inside the browser.

That is more defensible than "AI diagnosis" and more distinctive than a generic anatomy atlas. Best-in-class products show the target patterns:

- OHIF and Cornerstone3D set the standard for web-based DICOM viewing, DICOMweb, measurements, annotations, segmentation display, MPR, and extensible workflow modes.
- BioDigital, Complete Anatomy, and Visible Body set the standard for guided, polished, multilingual 3D patient/anatomy education.
- Sectra Education Portal shows the value of real-case teaching workflows, structured lessons, case banks, and progress-oriented education.
- Materialise Mimics, 3D Slicer, RapidAI, MedSAM2, TotalSegmentator, and MONAI Label show the state of patient-specific segmentation, case management, clinical AI workflow, and 3D reconstruction.
- SMART App Launch and DICOMweb define the standards path for EHR and imaging-system integration.

## 2. Top 10 Missing or Partial Features

| Rank | Feature | Current gap | Marketability impact | First implementation target | Score |
|---|---|---|---|---|---|
| 1 | Guided patient consult mode | First routed workspace now exists; guided templates still need depth | Turns the app into a sellable patient-education product | Expand consult panel with modality/body-region templates and patient questions | 5 |
| 2 | Standards-grade DICOM viewer foundation | Cornerstone3D foundation is routed; compressed decoder and real stack fixtures remain | Makes the product credible to clinicians and hospital IT | Add verified compressed/multi-file DICOM fixtures and isolate decoder loading | 5 |
| 3 | Side-by-side explanation workspace | First consult workspace is routed; compare tabs/depth-map view still need polish | Makes the experience easier to demo and easier for clinicians to use | Add a tighter compare layout: original 2D, enhanced 2D, generated depth, 3D, guidance/provenance panel | 5 |
| 4 | Educational segmentation overlays | Demo-mask provider is routed; real model providers remain research-only | Biggest SOTA differentiator if kept non-diagnostic | Evaluate MedSAM2, TotalSegmentator, and MONAI Label behind a research-grade flag | 5 |
| 5 | Clinician annotation and measurement-lite workflow | Routed callouts exist; measurement-lite remains future | Converts visualization into a doctor-patient communication tool | Add non-diagnostic distance/area annotations only after DICOM spacing and safety labels are proven | 4 |
| 6 | Safe consult export and handoff | Local consult snapshot is routed; true PDF and sharing remain future | Creates shareable sales/demo artifact without PHI leakage | Keep sanitized HTML/print snapshot; add true PDF only when needed | 4 |
| 7 | SMART/FHIR plus DICOMweb sandbox | Sandbox route and QIDO/WADO utilities are routed; no production EHR registration | Gives enterprise integration story without overclaiming production EHR support | Connect a real sandbox FHIR server and demo DICOMweb endpoint | 4 |
| 8 | Patient-specific anatomy education matching | Modality/body-region intake exists; curated content mapping remains future | Differentiates from generic atlases by connecting the patient's image to curated explanation | Map intake to curated explanations, labels, and normal anatomy references | 4 |
| 9 | Performance, offline, and model reliability pack | Remote model download and WebGPU/WASM are not fully benchmarked | Reduces demo risk and helps procurement/security reviews | Add local/quantized model option, cache controls, device profile, fallback proof, and benchmark panel | 4 |
| 10 | De-identified demo case library and evidence dashboard | Synthetic cases and proof screenshots exist; specialty narratives and metrics remain | Makes the site sellable without using real patient PHI | Add curated specialty narratives, performance metrics, and buyer-lane proof labels | 4 |

## 2.1 Implementation Update

Implemented in the latest wave:

1. Synthetic non-PHI demo case gallery for X-ray-like, CT/MRI-like, ultrasound-like, low-contrast, camera-captured-screen, and general medical-photo-like examples.
2. Cornerstone3D DICOM viewer foundation with safe metadata, measurement-lite copy, and explicit unsupported states.
3. SMART/FHIR + DICOMweb sandbox showing SMART launch context to FHIR Patient to ImagingStudy to DICOMweb endpoint.
4. Segmentation provider architecture with a demo-mask overlay and visible experimental/non-diagnostic labeling.
5. Proof-pack manifest plus generated browser screenshots under `docs/growth/proof/screenshots/`.

Still not claimed:

- Production EHR/Epic/Cerner integration.
- Production PACS or DICOMweb archive retrieval.
- Compressed or multi-frame DICOM coverage beyond explicit unsupported states.
- Diagnostic segmentation, disease detection, treatment recommendation, or surgical planning.

## 3. Critical Upgrade Path for Implemented Features

### Upload and Camera

- Convert the upload area into a small intake workflow: source type, modality, body region, PHI warning, and supported-file confidence.
- For camera capture, add "film X-ray capture" guidance, crop/rotate/perspective correction, and exposure warnings.
- Show a hard unsupported-state for complex DICOM instead of silently failing or implying full DICOM coverage.

### Inference and Model Loading

- Keep the current Depth Anything V2 path as an educational 3D surface generator, not an anatomical reconstruction claim.
- Add explicit model modes: remote cached model, local bundled model, and fallback unavailable state.
- Add benchmark telemetry visible to the user: backend, model version, model source, inference time, image size, and cache status.
- Evaluate quantized ONNX variants after the current build is stable; target smaller first-load size and lower mobile memory pressure.

### Viewer

- Turn the current viewer into a consult workspace with presets: front view, oblique view, depth compare, wireframe, and snapshot.
- Add side-by-side 2D and 3D with synchronized "explain this view" copy.
- Keep screenshot, fullscreen, reset, and depth intensity, but frame them as consult tools rather than engineering controls.
- Add visible context recovery and low-memory states for iOS/mobile.

### DICOM

- Replace the product-facing DICOM claim with a staged truth: simple DICOM now, Cornerstone3D-backed DICOM viewer next, DICOMweb later.
- Use Cornerstone3D for transfer syntax support, window/level, physical-space annotations, stack scrolling, and future segmentation rendering.
- Redact patient identifiers by default; expose metadata only behind "show study details" with patient-name fields masked.

### Annotation, Export, and Sharing

- Keep routed annotation as a consult-callout tool; do not upgrade it into diagnostic measurement without DICOM spacing, calibration, and safety copy.
- Keep URL image sharing disabled until there is either no PHI in the payload or a compliant encrypted backend.
- Export should remain a local "consult snapshot" rather than a medical report: 3D snapshot, optional source images, annotations, model provenance, disclaimer, and clinician notes.

### SMART/FHIR

- Treat current SMART code as a sandbox integration only.
- The first marketable version should prove one flow: SMART launch -> patient context -> ImagingStudy list -> DICOMweb retrieval from a demo archive.
- Do not claim Epic/Cerner production support until registration, scopes, redirect URIs, token handling, and imaging endpoints are validated.

## 4. Step-by-Step Execution Plan

### Phase 1: Make the Existing USP Sellable

1. Keep `ConsultWorkspace` as the main routed surface: intake, 2D image, annotation, 3D viewer, provenance, and explanation panel.
2. Keep model provenance in the persistent "Visualization facts" panel.
3. Expand modality/body-region intake into curated explanation templates.
4. Keep sanitized consult snapshot export and source-image-excluded defaults.
5. Add browser tests for upload -> model-ready copy -> viewer placeholder -> annotation -> snapshot enabled states.

Acceptance criteria:

- A clinician can upload a sample image and explain the generated 3D visualization without leaving one workspace.
- The UI says what is real, what is estimated, and what is not diagnostic.
- No PHI is embedded in URLs, console logs, or default local persistence.

### Phase 2: Make Imaging Support Credible

1. Add a Cornerstone3D-backed DICOM viewer path alongside the current image preview.
2. Support window/level, stack scrolling for multi-slice studies, and redacted metadata.
3. Show explicit unsupported states for compressed or complex inputs until supported.
4. Add DICOM smoke fixtures and tests for metadata redaction and failure states.

Acceptance criteria:

- DICOM is no longer a narrow hidden parser claim; it is a visible, honest imaging workflow.
- Unsupported files fail with clear clinical-safety wording.

### Phase 3: Add Marketable Communication Tools

1. Polish routed annotation tools in the consult workspace.
2. Support arrows, circles, text labels, undo/redo, clinician notes, and optional measurement-lite only after safety review.
3. Keep annotations and provenance in consult snapshot export.
4. Add a patient-facing "questions to ask your doctor" section generated from modality/body-region templates.

Acceptance criteria:

- The product can produce a non-diagnostic consult summary that is useful after the appointment.
- Export remains sanitized and explicitly educational.

### Phase 4: Add SOTA Research Differentiators

1. Define a segmentation provider interface: input image/volume, prompt, output mask, confidence/provenance.
2. Start with non-clinical demo masks or de-identified examples.
3. Evaluate MedSAM2 for promptable 3D/video segmentation, TotalSegmentator for CT/MR structure segmentation, and MONAI Label for human-in-the-loop workflows.
4. Render masks as educational overlays and 3D surfaces only after provenance and limitation labels are visible.

Acceptance criteria:

- Segmentation output is never presented as diagnosis.
- Each overlay has source, model, user prompt, and educational limitation metadata.

### Phase 5: Add Integration Story

1. Add a SMART/FHIR sandbox route separate from the public upload flow.
2. Query demo patient context and ImagingStudy metadata.
3. Retrieve demo images via DICOMweb WADO/QIDO.
4. Document exact unsupported production boundaries.

Acceptance criteria:

- The app can demonstrate a standards-based clinical integration path without claiming production EHR readiness.

### Phase 6: Add Demo and Proof Layer

1. Add a de-identified sample case gallery.
2. Add proof labels for each case: image type, supported path, model backend, inference time, and tested browser.
3. Add a visible "what this app can do today" page linked from docs and demo UI.
4. Add mobile/desktop Playwright smoke screenshots.

Acceptance criteria:

- Sales/demo users can evaluate the product without uploading real patient data.
- Feature claims are backed by actual runnable proof.

## 5. What Not to Prioritize Yet

- Diagnostic findings, disease detection, or treatment recommendations.
- Surgical planning, implant design, or regulatory medical-device claims.
- PHI-bearing share links without a compliant encrypted backend and access controls.
- Full PACS replacement.
- Broad anatomy atlas content library before the patient-specific consult workflow is polished.

## 6. Best-In-Class Source Anchors

- OHIF: https://docs.ohif.org/
- Cornerstone3D: https://v3.cornerstonejs.org/docs/getting-started/overview/
- DICOMweb: https://www.dicomstandard.org/using/dicomweb
- SMART App Launch: https://hl7.org/fhir/smart-app-launch/
- BioDigital patient education: https://www.biodigital.com/p/interactive-patient-education
- Sectra Education Portal: https://sectra.com/medical/product/sectra-education-portal
- Materialise Mimics: https://www.materialise.com/en/healthcare/mimics
- RapidAI radiology workflow: https://www.rapidai.com/radiology
- MedSAM2: https://medsam2.github.io/
- TotalSegmentator: https://totalsegmentator.com/
- Visible Body: https://www.visiblebody.com/
- Complete Anatomy: https://www.elsevier.com/products/complete-anatomy
- FDA CDS guidance: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
