# MedVis3D Best-In-Class Gap And Implementation Freeze

## Positioning Freeze

MedVis3D should be marketed as a privacy-first, browser-based 2D medical image to
interactive 3D educational consult builder. The strongest USP is patient-specific visual
explanation from ordinary 2D inputs, with image enhancement, depth visualization,
annotations, provenance, confidence, and clear limitations.

Do not position the app as diagnostic reconstruction, FDA-cleared AI, PACS replacement,
secure PHI sharing, surgical planning, or a guarantee that unclear single images produce
true anatomy.

## Proof Gates

No feature or outreach proof pack is ready-to-sell until all six gates are visible:

Source, Runtime, Data, Provenance, Buyer Workflow, Artifact

- Source: input type, demo status, and PHI boundary are clear.
- Runtime: route works in the browser without hidden backend assumptions.
- Data: no patient identifiers, raw DICOM metadata, or image pixels leak into URLs by default.
- Provenance: model, enhancement, confidence, and limitations are visible.
- Buyer Workflow: a clinician or patient-experience buyer can complete the intended action.
- Artifact: there is a consult snapshot, demo evidence, or documented output to review.

## Proof Packs

| Proof pack | Buyer lane | Current status | Claim boundary | Next gate |
|---|---|---|---|---|
| patient_specific_3d_consult_builder | Imaging centers, clinics, patient experience | Implemented with proof screenshots | Educational visualization, not diagnostic output | Larger device/performance proof |
| xray_explanation_pack | Orthopedics, sports medicine, dental, spine | Synthetic demo cases implemented | Helps explain ordinary 2D images visually | Specialty-specific consult scripts |
| patient_portal_explanation_pack | Hospital digital health and patient engagement | Consult snapshot proof implemented | Patient-friendly context layer after clinician workflow | True PDF/export hardening if buyers require it |
| dicom_trust_pack | Imaging informatics and PACS teams | Cornerstone3D foundation implemented | Local DICOM viewer foundation, not PACS replacement | Isolate compressed decoder path and add real DICOM fixtures |
| standards_sandbox_pack | EHR/integration teams | SMART/FHIR + DICOMweb sandbox implemented | SMART/FHIR/DICOMweb sandbox only | Real sandbox server registration and WADO-RS retrieval proof |
| education_case_library_pack | Medical education and simulation | De-identified synthetic library implemented | De-identified educational cases only | Curated specialty case narratives |

## Remaining Gap Register

| Gap | Priority | Score | Implementation decision |
|---|---:|---:|---|
| Routed consult workspace | Critical | 5 | Main app route must be upload to enhancement to 3D to annotation to snapshot. |
| Annotation and callouts | Critical | 5 | Use routed annotation tools for education only, not diagnostic measurement. |
| Sanitized consult snapshot | Critical | 5 | Local HTML artifact, source image excluded by default, no raw DICOM metadata. |
| DICOM credibility layer | High | 4 | Cornerstone3D foundation is routed; compressed syntax decoding and real stack fixtures remain next. |
| Demo case library | High | 4 | Synthetic non-PHI examples are routed for xray, CT/MRI-like, ultrasound-like, low contrast, camera-captured, and general-photo inputs. |
| Proof dashboard | High | 4 | Proof manifest and screenshots now map claims to route, artifact, verification command, and caveat. |
| SMART/FHIR + DICOMweb sandbox | Medium | 3 | Sandbox UI and QIDO-RS/WADO-RS utilities are routed; production registration remains future. |
| Segmentation overlays | Medium | 3 | Demo-mask provider and research overlay UI are routed; clinical/server providers remain future. |
| SOTA backend path | Medium | 3 | Experimental server mode only for Depth Pro, Metric3D, VGGT, MedSAM2, MONAI, or TotalSegmentator. |

## Implementation Freeze

Phase 1 is frozen as:

1. Consult builder as the primary routed product surface.
2. Context capture: modality, body region, audience, review status, and limitation.
3. Routed annotation panel and patient explanation notes.
4. Local consult snapshot export with image inclusion controls.
5. DICOM PHI redaction and unsupported syntax messaging.
6. Proof-pack docs and outreach plan.
7. Tests, build, lint, and browser smoke before any market-ready claim.

Phase 2 foundation now implemented:

1. Synthetic demo-case gallery with non-PHI proof inputs.
2. Cornerstone3D DICOM viewer foundation with safe metadata and explicit unsupported states.
3. SMART/FHIR + DICOMweb sandbox panel showing the standards chain.
4. Demo segmentation overlay provider with non-diagnostic labeling.
5. Proof-pack manifest and generated browser screenshots under `docs/growth/proof/screenshots/`.

## Claim Rules

Allowed:

- Browser-local educational 3D visualization.
- Image enhancement for clearer educational viewing.
- Confidence-labeled consult snapshot.
- Non-diagnostic patient communication tool.

Not allowed:

- Diagnostic findings.
- Treatment recommendations.
- FDA-cleared or HIPAA-compliant claims.
- Secure PHI sharing.
- PACS replacement.
- True anatomical reconstruction from any unclear 2D image.
