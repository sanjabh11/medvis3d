# MedVis3D Segmentation Research Track

Segmentation is a research extension for educational overlays only. It must not be
marketed as lesion detection, diagnosis, treatment guidance, surgical planning, or
FDA-cleared analysis.

## Provider Direction

| Provider | Best use | MedVis3D decision |
|---|---|---|
| MedSAM2 | Promptable medical image and video segmentation research | Evaluate as a server-assisted research option after demo overlays prove useful. |
| TotalSegmentator | Broad CT/MR anatomical segmentation | Evaluate for de-identified CT/MR demo datasets only; not browser-default. |
| MONAI Label | Human-in-the-loop annotation and active learning | Consider for clinician-reviewed research workflows, not patient-facing default use. |

## Current Implementation

- `demo-mask` is the only enabled provider.
- All overlays carry `nonDiagnostic: true`.
- UI labels every overlay as experimental and non-diagnostic.
- Future server providers must show source, model, prompt, confidence, limitations, and validation status.

## Claim Boundary

Allowed:

- Educational demo overlay.
- Research provider architecture.
- Non-diagnostic visual highlighting.

Not allowed:

- Disease detection.
- Diagnostic segmentation.
- Treatment recommendations.
- Surgical planning.
- Any claim that a single 2D image proves anatomical truth.
