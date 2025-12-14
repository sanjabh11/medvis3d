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
}

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
      
      // Extract metadata
      const metadata = extractMetadata(dataSet);
      console.log('[DICOM] Metadata:', metadata);

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
      console.log('[DICOM] Parse complete:', rows, 'x', columns);

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
