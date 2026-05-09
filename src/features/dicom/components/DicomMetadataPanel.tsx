'use client';

import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { DicomMetadata } from '../hooks/useDicomParser';

interface DicomMetadataPanelProps {
  metadata: DicomMetadata;
  className?: string;
}

export function DicomMetadataPanel({ metadata, className }: DicomMetadataPanelProps) {
  const items = [
    { label: 'PHI', value: 'PHI redacted' },
    { label: 'Study Date', value: formatDate(metadata.studyDate) },
    { label: 'Modality', value: metadata.modality || 'Unknown' },
    { label: 'Study', value: metadata.studyDescription || '-' },
    { label: 'Series', value: metadata.seriesDescription || '-' },
    { label: 'Dimensions', value: `${metadata.columns || 0} × ${metadata.rows || 0}` },
    { label: 'Bits', value: `${metadata.bitsStored || 0} stored / ${metadata.bitsAllocated || 0} allocated` },
    { label: 'Window', value: `C: ${metadata.windowCenter || 40} / W: ${metadata.windowWidth || 400}` },
    { label: 'Photometric', value: metadata.photometricInterpretation || 'Unknown' },
    { label: 'Transfer Syntax', value: formatTransferSyntax(metadata.transferSyntaxUID) },
    { label: 'Support', value: metadata.unsupportedReason || metadata.supportStatus || 'unknown' },
  ];

  return (
    <Card className={className}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-[--color-medical-text-primary] flex items-center gap-2">
          <Info className="h-4 w-4" />
          DICOM Metadata
        </h3>
      </div>
      <div className="p-4 space-y-2">
        <p className="rounded-md border border-blue-200 bg-blue-50 p-2 text-xs leading-relaxed text-blue-900">
          Patient name and patient ID are redacted by default. This panel is for safe technical
          context only, not diagnostic interpretation.
        </p>
        {items.map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-[--color-medical-text-secondary]">{label}</span>
            <span className="text-[--color-medical-text-primary] font-medium">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  
  // DICOM date format: YYYYMMDD
  if (dateStr.length === 8) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
}

function formatTransferSyntax(uid?: string): string {
  if (!uid) return 'Unknown';
  if (uid === '1.2.840.10008.1.2') return 'Implicit VR Little Endian';
  if (uid === '1.2.840.10008.1.2.1') return 'Explicit VR Little Endian';
  return uid;
}
