# Medical Imaging 3D Top 20 Features and Gap Plan

Last updated: 2026-05-08

Related plans: see `docs/Top10_Marketability_Plan.md` for the sharper best-in-class top 10 roadmap and `docs/MEDVIS3D_BEST_IN_CLASS_GAP_AND_IMPLEMENTATION_FREEZE.md` for the current proof-pack freeze.

## 1. Product USP and Current Truth

The defensible USP is a privacy-first, browser-based workflow that turns a 2D medical image into an interactive 3D educational visualization for patient communication. The product should stay positioned as educational and non-diagnostic until clinical validation, regulatory review, and compliant clinical integrations exist.

The current routed app supports a consult-builder workflow: image upload, camera capture, simple DICOM parsing, image quality review, enhancement profiles, model loading, depth inference, a 3D mesh viewer, material/view controls, fullscreen, screenshot capture, routed annotations, patient explanation notes, visualization facts, local consult snapshot export, synthetic demo cases, a Cornerstone3D DICOM viewer foundation, a SMART/FHIR + DICOMweb sandbox, demo segmentation overlays, and proof-pack screenshots. Still-larger features remain code-only or roadmap: QR/share, session restore, production SMART/FHIR registration, production DICOMweb retrieval, compressed/multi-frame DICOM workflows, AI report panel, and validated segmentation.

## 2. Implementation Status by Feature

| # | Feature | Current status | Need | Priority | Score |
|---|---|---|---|---|---|
| 1 | Upload JPEG/PNG images | Routed and useful | Keep; fix object URL cleanup and clearer CTA | Critical | 5 |
| 2 | Camera capture | Routed and useful | Keep; add mobile/browser smoke coverage | High | 4 |
| 3 | Basic DICOM upload | Routed but limited | Support only simple uncompressed DICOM today; upgrade to Cornerstone3D path | Critical | 5 |
| 4 | DICOM metadata display | Safer code path, not primary routed panel | Keep patient identifiers redacted; route technical metadata after DICOM UX is upgraded | High | 4 |
| 5 | ONNX depth inference | Routed but runtime-unverified | Keep; disclose remote model fetch or ship local model asset | Critical | 5 |
| 6 | WebGPU/WASM fallback | Code exists | Verify import/session behavior and browser fallback | Critical | 5 |
| 7 | 3D displaced mesh viewer | Routed and useful | Keep; fix reset, memory cleanup, and context recovery | Critical | 5 |
| 8 | Viewer controls | Routed but partial | Reset must actually reset camera; preserve screenshot/fullscreen | Critical | 5 |
| 9 | Provenance and limitations panel | Routed | Keep visible; include source, model, backend, confidence, privacy status, and limitations | Critical | 5 |
| 10 | Privacy/PHI safety | Improved, needs browser/security regression | Keep blocking PHI in URLs and avoid raw DICOM metadata in default artifacts | Critical | 5 |
| 11 | Annotation tools | Routed for consult callouts | Keep non-diagnostic; add persistence/export review only after privacy checks | Medium | 3 |
| 12 | Consult snapshot export | Routed as local HTML snapshot | Keep source image excluded by default; avoid PDF claims until true PDF exists | High | 4 |
| 13 | QR/share | Code-only and unsafe | Disable image-bearing URLs; redesign around non-PHI or compliant backend sharing | Critical | 5 |
| 14 | Session restore | Code-only and PHI-sensitive | Make opt-in with explicit local-storage warning | Medium | 3 |
| 15 | SMART on FHIR | Routed sandbox only | Keep sandbox copy; production requires app registration, scopes, redirects, and test server proof | Medium | 3 |
| 16 | DICOMweb | Sandbox utilities and UI | QIDO-RS/WADO-RS demo path exists; do not imply PACS integration today | High | 4 |
| 17 | Multi-frame DICOM/video | Code-only | Route only after still-image core and memory tests pass | Medium | 3 |
| 18 | Guided patient education | First routed notes panel | Add structured templates, question prompts, and demo case narratives | High | 4 |
| 19 | SOTA segmentation | Demo-mask provider routed | Keep non-diagnostic; explore MedSAM/TotalSegmentator/MONAI Label only as research/server-assisted providers | Medium | 3 |
| 20 | Test and security baseline | Unit, type, lint, build, e2e, and proof screenshots implemented | Keep browser/mobile smoke, proof screenshots, and PHI safety checks as release gates | Critical | 5 |

## 3. Best-in-Class Gap Analysis

| Benchmark | What best-in-class has | Current gap | Decision |
|---|---|---|---|
| OHIF | DICOMweb/OpenID Connect, measurement tools, workflow modes, annotation, segmentation, MPR/fusion, GPU rendering | No DICOMweb; no MPR/fusion; DICOM metadata not primary workflow | Use as clinical-viewer integration benchmark, not direct product clone |
| Cornerstone3D | Compressed transfer syntax rendering, volume streaming, window/level, measurements, segmentation, synchronization, CPU fallback | Foundation viewer is routed; compressed decoder isolation and real stack fixtures remain | Upgrade from foundation to verified multi-file/transfer-syntax support |
| DICOMweb | QIDO-RS, WADO-RS, STOW-RS, UPS-RS, capabilities discovery | Sandbox utilities exist; no production archive connection | Keep standards sandbox separate from clinical claims |
| SMART App Launch | OAuth-based FHIR launch, launch context, scopes, discovery | Sandbox route exists; no production app registration | Keep sandbox-only until app registration and EHR workflow are proven |
| BioDigital / Complete Anatomy / Visible Body | Guided 3D patient/anatomy education, content libraries, tours, multilingual support | No guided explanation layer | Build a guided patient-education mode around uploaded images |
| Sectra Education Portal | Real patient cases, clinical-grade visualization, lessons, progress tracking | No case library or learning workflow | Consider later education mode, not P0 |
| 3D Slicer / Materialise Mimics | Segmentation, analysis, planning, case management, XR, patient-specific models | Current output is approximate monocular depth, not anatomical segmentation | Avoid planning/diagnostic claims; use as long-term reference |
| RapidAI | Worklist prioritization, PACS/reporting integration, validated AI measurements, 3D CTA reconstruction | No clinical workflow integration or validated findings | Do not pursue diagnostic AI in immediate scope |
| MedSAM / TotalSegmentator / MONAI Label | Foundation or automated segmentation, active learning, broad modality support | Demo-mask provider exists; no clinical/server segmentation yet | Research-only until validation and infrastructure exist |
| FDA CDS guidance | Clear split between non-device CDS and device software functions | Existing docs overstate HIPAA/FDA-readiness | Maintain educational-only labeling and avoid diagnosis/treatment outputs |

## 4. Action Plan

### Wave 1: P0 Stabilization

1. Install dependencies and verify `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
2. Fix live workflow correctness: upload cleanup, viewer reset, viewer material lifecycle, context recovery, and model-source transparency.
3. Block unsafe PHI-sharing defaults: no image data in URLs, no patient identifiers in logs, no unlabelled local persistence.
4. Maintain provenance UI: model source, backend, educational-only disclaimer, and limitations of monocular depth from medical images.
5. Add minimum automated checks for safety utilities and routed smoke paths.

### Wave 2: Product-Ready Feature Wiring

1. Expand redacted DICOM metadata into a full routed technical panel.
2. Add guided patient education templates and structured compare mode: original image, depth map, and 3D view.
3. Convert SMART on FHIR to a documented sandbox workflow only after launch and callback paths are verified.
4. Add DICOMweb architecture notes and sample integration targets.

### Wave 3: Differentiation Research

1. Evaluate Cornerstone3D for robust DICOM rendering and measurement tools.
2. Evaluate MedSAM, TotalSegmentator, and MONAI Label as optional segmentation backends.
3. Assess whether any segmentation output can be safely presented as educational overlays without implying diagnosis.
4. Add browser/mobile performance benchmarks before enabling large models or multi-frame workflows.

## 5. Sources Used for Industry Baseline

- OHIF feature baseline: https://ohif.org/features/
- Cornerstone3D overview: https://v3.cornerstonejs.org/docs/getting-started/overview/
- DICOMweb services: https://www.dicomstandard.org/using/dicomweb
- SMART App Launch: https://hl7.org/fhir/smart-app-launch/
- ONNX Runtime WebGPU: https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html
- 3D Slicer capabilities and clinical-use caveat: https://slicer.readthedocs.io/en/latest/user_guide/about.html
- BioDigital patient education: https://www.biodigital.com/p/interactive-patient-education
- Materialise Mimics platform: https://www.materialise.com/en/healthcare/mimics
- RapidAI radiology workflow: https://www.rapidai.com/radiology
- MedSAM paper: https://www.nature.com/articles/s41467-024-44824-z
- TotalSegmentator repository: https://github.com/wasserth/TotalSegmentator
- FDA CDS guidance: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
