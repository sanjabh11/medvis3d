'use client';

import { useState, useCallback, useRef } from 'react';
import dicomParser from 'dicom-parser';
import type { DicomMetadata } from './useDicomParser';

export interface DicomFrame {
  frameIndex: number;
  imageData: ImageData;
  timestamp?: number;
}

export interface MultiframeDicomResult {
  frames: DicomFrame[];
  metadata: DicomMetadata;
  numberOfFrames: number;
  frameRate?: number;
}

export type MultiframeDicomStatus = 'idle' | 'parsing' | 'success' | 'error';

interface UseMultiframeDicomReturn {
  status: MultiframeDicomStatus;
  result: MultiframeDicomResult | null;
  error: string | null;
  currentFrameIndex: number;
  parseMultiframeDicom: (file: File) => Promise<MultiframeDicomResult | null>;
  setCurrentFrameIndex: (index: number) => void;
  getCurrentFrame: () => DicomFrame | null;
  nextFrame: () => void;
  prevFrame: () => void;
  reset: () => void;
}

function getNumberOfFrames(dataSet: dicomParser.DataSet): number {
  const numFrames = dataSet.string('x00280008');
  return numFrames ? parseInt(numFrames, 10) : 1;
}

function extractFramePixelData(
  dataSet: dicomParser.DataSet,
  frameIndex: number,
  metadata: DicomMetadata
): Uint8Array | Uint16Array | null {
  const pixelDataElement = dataSet.elements.x7fe00010;
  if (!pixelDataElement) return null;

  const { rows = 512, columns = 512, bitsAllocated = 16 } = metadata;
  const frameSize = rows * columns;
  const bytesPerPixel = bitsAllocated / 8;
  const frameOffset = frameIndex * frameSize * bytesPerPixel;

  const byteArray = dataSet.byteArray;
  const pixelDataOffset = pixelDataElement.dataOffset;

  if (bitsAllocated === 16) {
    return new Uint16Array(
      byteArray.buffer,
      pixelDataOffset + frameOffset,
      frameSize
    );
  } else {
    return new Uint8Array(
      byteArray.buffer,
      pixelDataOffset + frameOffset,
      frameSize
    );
  }
}

function pixelDataToImageData(
  pixelData: Uint8Array | Uint16Array,
  metadata: DicomMetadata
): ImageData {
  const { rows = 512, columns = 512, windowCenter = 40, windowWidth = 400 } = metadata;
  const imageData = new ImageData(columns, rows);
  const data = imageData.data;

  const minValue = windowCenter - windowWidth / 2;
  const maxValue = windowCenter + windowWidth / 2;

  for (let i = 0; i < pixelData.length; i++) {
    let pixelValue = pixelData[i];

    if (metadata.rescaleSlope !== undefined && metadata.rescaleIntercept !== undefined) {
      pixelValue = pixelValue * metadata.rescaleSlope + metadata.rescaleIntercept;
    }

    let displayValue: number;
    if (pixelValue <= minValue) {
      displayValue = 0;
    } else if (pixelValue >= maxValue) {
      displayValue = 255;
    } else {
      displayValue = Math.round(((pixelValue - minValue) / windowWidth) * 255);
    }

    const idx = i * 4;
    data[idx] = displayValue;
    data[idx + 1] = displayValue;
    data[idx + 2] = displayValue;
    data[idx + 3] = 255;
  }

  return imageData;
}

export function useMultiframeDicom(): UseMultiframeDicomReturn {
  const [status, setStatus] = useState<MultiframeDicomStatus>('idle');
  const [result, setResult] = useState<MultiframeDicomResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const dataSetRef = useRef<dicomParser.DataSet | null>(null);

  const parseMultiframeDicom = useCallback(async (file: File): Promise<MultiframeDicomResult | null> => {
    setStatus('parsing');
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const byteArray = new Uint8Array(arrayBuffer);
      const dataSet = dicomParser.parseDicom(byteArray);
      dataSetRef.current = dataSet;

      // Extract metadata
      const metadata: DicomMetadata = {
        patientName: dataSet.string('x00100010'),
        patientId: dataSet.string('x00100020'),
        studyDate: dataSet.string('x00080020'),
        modality: dataSet.string('x00080060'),
        rows: parseInt(dataSet.string('x00280010') || '512', 10),
        columns: parseInt(dataSet.string('x00280011') || '512', 10),
        bitsAllocated: parseInt(dataSet.string('x00280100') || '16', 10),
        bitsStored: parseInt(dataSet.string('x00280101') || '12', 10),
        windowCenter: parseFloat(dataSet.string('x00281050') || '40'),
        windowWidth: parseFloat(dataSet.string('x00281051') || '400'),
        rescaleIntercept: parseFloat(dataSet.string('x00281052') || '0'),
        rescaleSlope: parseFloat(dataSet.string('x00281053') || '1'),
      };

      const numberOfFrames = getNumberOfFrames(dataSet);
      const frameTime = dataSet.string('x00181063');
      const frameRate = frameTime ? 1000 / parseFloat(frameTime) : undefined;

      console.log(`[DICOM] Multi-frame: ${numberOfFrames} frames`);

      // Extract all frames
      const frames: DicomFrame[] = [];
      for (let i = 0; i < numberOfFrames; i++) {
        const pixelData = extractFramePixelData(dataSet, i, metadata);
        if (pixelData) {
          const imageData = pixelDataToImageData(pixelData, metadata);
          frames.push({
            frameIndex: i,
            imageData,
            timestamp: frameTime ? i * parseFloat(frameTime) : undefined,
          });
        }
      }

      const multiframeResult: MultiframeDicomResult = {
        frames,
        metadata,
        numberOfFrames,
        frameRate,
      };

      setResult(multiframeResult);
      setCurrentFrameIndex(0);
      setStatus('success');
      
      return multiframeResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse multi-frame DICOM';
      console.error('[DICOM] Multi-frame parse error:', err);
      setError(message);
      setStatus('error');
      return null;
    }
  }, []);

  const getCurrentFrame = useCallback((): DicomFrame | null => {
    if (!result || currentFrameIndex >= result.frames.length) return null;
    return result.frames[currentFrameIndex];
  }, [result, currentFrameIndex]);

  const nextFrame = useCallback(() => {
    if (result && currentFrameIndex < result.numberOfFrames - 1) {
      setCurrentFrameIndex(prev => prev + 1);
    }
  }, [result, currentFrameIndex]);

  const prevFrame = useCallback(() => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex(prev => prev - 1);
    }
  }, [currentFrameIndex]);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setCurrentFrameIndex(0);
    dataSetRef.current = null;
  }, []);

  return {
    status,
    result,
    error,
    currentFrameIndex,
    parseMultiframeDicom,
    setCurrentFrameIndex,
    getCurrentFrame,
    nextFrame,
    prevFrame,
    reset,
  };
}
