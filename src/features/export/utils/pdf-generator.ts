import type { Annotation } from '@/features/annotation';
import type { ConsultContext, VisualizationFacts } from '@/features/builder';

export interface ConsultSnapshotData {
  title: string;
  date: string;
  originalImageUrl?: string;
  enhancedImageUrl?: string;
  depthMapUrl?: string;
  viewer3DUrl?: string;
  notes?: string;
  patientQuestion?: string;
  consultContext?: ConsultContext;
  visualizationFacts?: VisualizationFacts | null;
  annotations?: Annotation[];
  disclaimer: string;
}

export type PdfReportData = ConsultSnapshotData;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeImageSrc(value: string): string {
  const allowed = /^(blob:|data:image\/(?:png|jpeg|jpg|webp);base64,|\/)/i;
  return allowed.test(value) ? escapeHtml(value) : '';
}

function renderImageSection(title: string, src?: string, alt?: string): string {
  const safeSrc = src ? sanitizeImageSrc(src) : '';
  if (!safeSrc) return '';

  return `
  <div class="section">
    <h2>${escapeHtml(title)}</h2>
    <div class="image-container">
      <img src="${safeSrc}" alt="${escapeHtml(alt || title)}" />
    </div>
  </div>`;
}

function renderFact(label: string, value?: string): string {
  if (!value) return '';
  return `
    <div class="fact">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>`;
}

function renderAnnotations(annotations?: Annotation[]): string {
  if (!annotations?.length) {
    return '<p>No consult annotations were added.</p>';
  }

  return `
    <ul>
      ${annotations.map((annotation, index) => `
        <li>
          ${index + 1}. ${escapeHtml(annotation.type)}
          ${annotation.text ? `- ${escapeHtml(annotation.text)}` : ''}
        </li>
      `).join('')}
    </ul>`;
}

export async function generateConsultSnapshot(data: ConsultSnapshotData): Promise<Blob> {
  const title = escapeHtml(data.title);
  const date = escapeHtml(data.date);
  const notes = data.notes ? escapeHtml(data.notes) : '';
  const patientQuestion = data.patientQuestion ? escapeHtml(data.patientQuestion) : '';
  const disclaimer = escapeHtml(data.disclaimer);
  const context = data.consultContext;
  const facts = data.visualizationFacts;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 860px;
      margin: 0 auto;
      padding: 40px;
      color: #111827;
      background: #ffffff;
    }
    .header {
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2563EB;
    }
    .header h1 {
      color: #1D4ED8;
      margin: 0 0 8px 0;
      font-size: 28px;
    }
    .header p {
      color: #6B7280;
      margin: 0;
      line-height: 1.5;
    }
    .section {
      margin-bottom: 28px;
    }
    .section h2 {
      font-size: 18px;
      color: #374151;
      margin-bottom: 12px;
    }
    .facts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
    }
    .fact {
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 10px;
      background: #F9FAFB;
    }
    .fact span {
      display: block;
      color: #6B7280;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .04em;
      margin-bottom: 4px;
    }
    .fact strong {
      color: #111827;
      font-size: 13px;
    }
    .image-container {
      text-align: center;
      margin: 16px 0;
    }
    .image-container img {
      max-width: 100%;
      max-height: 430px;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      background: #F3F4F6;
    }
    .notice {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 8px;
      padding: 14px;
      color: #1E40AF;
      font-size: 13px;
      line-height: 1.55;
    }
    .disclaimer {
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      border-radius: 8px;
      padding: 15px;
      margin-top: 34px;
    }
    .disclaimer h3 {
      color: #92400E;
      margin: 0 0 10px 0;
      font-size: 14px;
    }
    .disclaimer p {
      color: #92400E;
      margin: 0;
      font-size: 12px;
      line-height: 1.55;
    }
    .footer {
      text-align: center;
      margin-top: 36px;
      padding-top: 18px;
      border-top: 1px solid #E5E7EB;
      color: #6B7280;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>Generated: ${date}</p>
    <p>Patient identifiers and raw DICOM metadata are not included in this local snapshot.</p>
  </div>

  <div class="section">
    <h2>Consult Context</h2>
    <div class="facts">
      ${renderFact('Image type', context?.modality)}
      ${renderFact('Body region', context?.bodyRegion)}
      ${renderFact('Audience', context?.intendedAudience)}
      ${renderFact('Review status', context?.reviewStatus)}
      ${renderFact('Confidence', facts?.confidence)}
      ${renderFact('Source', facts?.sourceType)}
      ${renderFact('Enhancement', facts?.enhancementProfile)}
      ${renderFact('Model', facts ? `${facts.modelName} ${facts.modelVariant}` : undefined)}
      ${renderFact('Backend', facts?.backend)}
    </div>
  </div>

  <div class="section">
    <h2>Safety Boundary</h2>
    <div class="notice">
      Educational visualization only. This is not diagnostic interpretation, treatment guidance,
      surgical planning, FDA-cleared AI, or PACS replacement.
    </div>
  </div>

  ${renderImageSection('3D Visualization', data.viewer3DUrl, '3D educational visualization')}
  ${renderImageSection('Enhanced Image', data.enhancedImageUrl, 'Enhanced source image')}
  ${renderImageSection('Source Image', data.originalImageUrl, 'Source image')}
  ${renderImageSection('Depth Map', data.depthMapUrl, 'Depth map visualization')}

  <div class="section">
    <h2>Annotations</h2>
    ${renderAnnotations(data.annotations)}
  </div>

  ${notes ? `
  <div class="section">
    <h2>Consult Notes</h2>
    <p>${notes}</p>
  </div>
  ` : ''}

  ${patientQuestion ? `
  <div class="section">
    <h2>Question For Clinician</h2>
    <p>${patientQuestion}</p>
  </div>
  ` : ''}

  <div class="disclaimer">
    <h3>Important Disclaimer</h3>
    <p>${disclaimer}</p>
  </div>

  <div class="footer">
    <p>Generated by MedVis3D - For Educational Purposes Only</p>
    <p>This document is not intended for diagnostic use.</p>
  </div>
</body>
</html>
  `;

  return new Blob([html], { type: 'text/html' });
}

export async function generatePdfReport(data: PdfReportData): Promise<Blob> {
  return generateConsultSnapshot(data);
}

export function downloadReport(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printReport(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
