'use client';

import { useState, useCallback } from 'react';
import dicomParser from 'dicom-parser';

export interface DicomMetadata {
  patientName?: string;
  patientId?: string;
  studyDate?: string;
  modality?: string;
  studyDescription?: string;
  seriesDescription?: string;
  rows?: number;
  columns?: number;
  bitsAllocated?: number;
  bitsStored?: number;
  windowCenter?: number;
  windowWidth?: number;
  rescaleIntercept?: number;
  rescaleSlope?: number;
  photometricInterpretation?: string;
  transferSyntaxUID?: string;
  numberOfFrames?: number;
  supportStatus?: DicomSupportStatus;
  unsupportedReason?: string;
}

export type DicomSupportStatus = 'supported' | 'unsupported' | 'unknown';

export interface DicomParseResult {
  imageData: ImageData | null;
  metadata: DicomMetadata;
  pixelData: Uint8Array | Uint16Array | null;
}

export type DicomParseStatus = 'idle' | 'parsing' | 'success' | 'error';

interface UseDicomParserReturn {
  status: DicomParseStatus;
  result: DicomParseResult | null;
  error: string | null;
  parseDicom: (file: File) => Promise<DicomParseResult | null>;
  reset: () => void;
}

function getStringValue(dataSet: dicomParser.DataSet, tag: string): string | undefined {
  const element = dataSet.elements[tag];
  if (element) {
    return dataSet.string(tag);
  }
  return undefined;
}

function getNumberValue(dataSet: dicomParser.DataSet, tag: string): number | undefined {
  const value = getStringValue(dataSet, tag);
  return value ? parseFloat(value) : undefined;
}

function extractMetadata(dataSet: dicomParser.DataSet): DicomMetadata {
  return {
    patientName: getStringValue(dataSet, 'x00100010'),
    patientId: getStringValue(dataSet, 'x00100020'),
    transferSyntaxUID: getStringValue(dataSet, 'x00020010'),
    studyDate: getStringValue(dataSet, 'x00080020'),
    modality: getStringValue(dataSet, 'x00080060'),
    studyDescription: getStringValue(dataSet, 'x00081030'),
    seriesDescription: getStringValue(dataSet, 'x0008103e'),
    rows: getNumberValue(dataSet, 'x00280010'),
    columns: getNumberValue(dataSet, 'x00280011'),
    bitsAllocated: getNumberValue(dataSet, 'x00280100'),
    bitsStored: getNumberValue(dataSet, 'x00280101'),
    windowCenter: getNumberValue(dataSet, 'x00281050'),
    windowWidth: getNumberValue(dataSet, 'x00281051'),
    rescaleIntercept: getNumberValue(dataSet, 'x00281052'),
    rescaleSlope: getNumberValue(dataSet, 'x00281053'),
    photometricInterpretation: getStringValue(dataSet, 'x00280004'),
    numberOfFrames: getNumberValue(dataSet, 'x00280008'),
  };
}

const SUPPORTED_TRANSFER_SYNTAXES = new Set([
  '1.2.840.10008.1.2',
  '1.2.840.10008.1.2.1',
]);

export function isSupportedTransferSyntax(transferSyntaxUID?: string): boolean {
  if (!transferSyntaxUID) return true;
  return SUPPORTED_TRANSFER_SYNTAXES.has(transferSyntaxUID.trim());
}

function getUnsupportedReason(metadata: DicomMetadata): string | undefined {
  if (!isSupportedTransferSyntax(metadata.transferSyntaxUID)) {
    return `Unsupported DICOM transfer syntax: ${metadata.transferSyntaxUID}. This browser demo currently supports uncompressed little-endian single-frame DICOM only.`;
  }

  if (metadata.numberOfFrames && metadata.numberOfFrames > 1) {
    return `Unsupported multi-frame DICOM: ${metadata.numberOfFrames} frames detected. Use the later Cornerstone3D/DICOMweb path for stack or video workflows.`;
  }

  return undefined;
}

export function redactDicomMetadata(metadata: DicomMetadata): DicomMetadata {
  const unsupportedReason = getUnsupportedReason(metadata);

  return {
    ...metadata,
    patientName: undefined,
    patientId: undefined,
    supportStatus: unsupportedReason ? 'unsupported' : 'supported',
    unsupportedReason,
  };
}

function getSafeMetadataSummary(metadata: DicomMetadata) {
  return {
    modality: metadata.modality,
    rows: metadata.rows,
    columns: metadata.columns,
    bitsAllocated: metadata.bitsAllocated,
    bitsStored: metadata.bitsStored,
    photometricInterpretation: metadata.photometricInterpretation,
    transferSyntaxUID: metadata.transferSyntaxUID,
    numberOfFrames: metadata.numberOfFrames,
    supportStatus: metadata.supportStatus,
  };
}

function convertToImageData(
  pixelData: Uint8Array | Uint16Array,
  metadata: DicomMetadata
): ImageData {
  const { rows = 512, columns = 512, windowCenter = 40, windowWidth = 400 } = metadata;
  const imageData = new ImageData(columns, rows);
  const data = imageData.data;

  // Calculate window level
  const minValue = windowCenter - windowWidth / 2;
  const maxValue = windowCenter + windowWidth / 2;

  for (let i = 0; i < pixelData.length; i++) {
    let pixelValue = pixelData[i];

    // Apply rescale if available
    if (metadata.rescaleSlope !== undefined && metadata.rescaleIntercept !== undefined) {
      pixelValue = pixelValue * metadata.rescaleSlope + metadata.rescaleIntercept;
    }

    // Apply window level
    let displayValue: number;
    if (pixelValue <= minValue) {
      displayValue = 0;
    } else if (pixelValue >= maxValue) {
      displayValue = 255;
    } else {
      displayValue = Math.round(((pixelValue - minValue) / windowWidth) * 255);
    }

    const idx = i * 4;
    data[idx] = displayValue;     // R
    data[idx + 1] = displayValue; // G
    data[idx + 2] = displayValue; // B
    data[idx + 3] = 255;          // A
  }

  return imageData;
}

export function useDicomParser(): UseDicomParserReturn {
  const [status, setStatus] = useState<DicomParseStatus>('idle');
  const [result, setResult] = useState<DicomParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseDicom = useCallback(async (file: File): Promise<DicomParseResult | null> => {
    setStatus('parsing');
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const byteArray = new Uint8Array(arrayBuffer);
      
      // Parse DICOM file
      const dataSet = dicomParser.parseDicom(byteArray);
      
      // Extract metadata, then remove direct identifiers before storing or logging.
      const metadata = redactDicomMetadata(extractMetadata(dataSet));
      if (process.env.NODE_ENV !== 'production') {
        console.info('[DICOM] Parsed image summary:', getSafeMetadataSummary(metadata));
      }

      if (metadata.unsupportedReason) {
        throw new Error(metadata.unsupportedReason);
      }

      // Get pixel data
      const pixelDataElement = dataSet.elements.x7fe00010;
      if (!pixelDataElement) {
        throw new Error('No pixel data found in DICOM file');
      }

      const { rows = 512, columns = 512, bitsAllocated = 16 } = metadata;
      let pixelData: Uint8Array | Uint16Array;

      if (bitsAllocated === 16) {
        pixelData = new Uint16Array(
          arrayBuffer,
          pixelDataElement.dataOffset,
          rows * columns
        );
      } else {
        pixelData = new Uint8Array(
          arrayBuffer,
          pixelDataElement.dataOffset,
          rows * columns
        );
      }

      // Convert to ImageData
      const imageData = convertToImageData(pixelData, metadata);

      const parseResult: DicomParseResult = {
        imageData,
        metadata,
        pixelData,
      };

      setResult(parseResult);
      setStatus('success');

      return parseResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse DICOM file';
      console.error('[DICOM] Parse error:', err);
      setError(message);
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    parseDicom,
    reset,
  };
}
