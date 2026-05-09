# MedVis3D Proof Pack Manifest

Last updated: 2026-05-08

Proof gates: Source, Runtime, Data, Provenance, Buyer Workflow, Artifact

## Proof Packs

| Proof pack | Route | Screenshot | Gates | Caveat | Verification command |
|---|---|---|---|---|---|
| patient_specific_3d_consult_builder | `/` | `screenshots/01-consult-workspace.png` | Source, Runtime, Data, Provenance, Buyer Workflow, Artifact | Educational visualization, not diagnostic output | `npm run proof:screenshots` |
| demo_case_gallery | `/` | `screenshots/02-demo-case-gallery.png` | Source, Runtime, Data, Provenance, Buyer Workflow, Artifact | Synthetic non-PHI demo cases only | `npm run proof:screenshots` |
| dicom_trust_pack | `/` | `screenshots/03-cornerstone-dicom-viewer.png` | Source, Runtime, Data, Provenance, Buyer Workflow, Artifact | Cornerstone3D local viewer foundation, not PACS replacement | `npm run proof:screenshots` |
| standards_sandbox_pack | `/` | `screenshots/04-smart-fhir-dicomweb-sandbox.png` | Source, Runtime, Data, Provenance, Buyer Workflow, Artifact | SMART/FHIR/DICOMweb sandbox only | `npm run proof:screenshots` |
| segmentation_research_pack | `/` | `screenshots/05-segmentation-research-overlay.png` | Source, Runtime, Data, Provenance, Buyer Workflow, Artifact | Demo overlay only; non-diagnostic | `npm run proof:screenshots` |

## Outreach Rule

Any outreach claim must point to one screenshot, one route, one verification command,
and one caveat. Do not claim FDA clearance, HIPAA compliance, diagnostic findings,
secure PHI sharing, PACS replacement, or true anatomical reconstruction from any
unclear single 2D image.
