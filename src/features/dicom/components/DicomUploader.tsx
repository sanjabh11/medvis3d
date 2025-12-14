'use client';

import { useCallback, useState } from 'react';
import { FileImage, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDicomParser, type DicomMetadata } from '../hooks/useDicomParser';
import { cn } from '@/lib/utils';

interface DicomUploaderProps {
  onDicomLoaded: (imageData: ImageData, metadata: DicomMetadata) => void;
  className?: string;
}

export function DicomUploader({ onDicomLoaded, className }: DicomUploaderProps) {
  const { status, result, error, parseDicom, reset } = useDicomParser();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    // Check if it's a DICOM file
    const isDicom = file.name.toLowerCase().endsWith('.dcm') || 
                    file.name.toLowerCase().endsWith('.dicom') ||
                    file.type === 'application/dicom';

    if (!isDicom) {
      // Try to parse anyway - some DICOM files don't have extensions
      console.log('[DICOM] File may not be DICOM, attempting parse...');
    }

    const parseResult = await parseDicom(file);
    
    if (parseResult?.imageData) {
      onDicomLoaded(parseResult.imageData, parseResult.metadata);
    }
  }, [parseDicom, onDicomLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  if (status === 'parsing') {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin text-[--color-medical-primary]" />
          <div>
            <p className="font-medium text-[--color-medical-text-primary]">
              Parsing DICOM file...
            </p>
            <p className="text-sm text-[--color-medical-text-secondary]">
              Extracting image and metadata
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (status === 'success' && result) {
    return (
      <Card className={cn("p-6 border-[--color-medical-success] bg-emerald-50", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CheckCircle className="h-6 w-6 text-[--color-medical-success]" />
            <div>
              <p className="font-medium text-[--color-medical-text-primary]">
                DICOM Loaded Successfully
              </p>
              <p className="text-sm text-[--color-medical-text-secondary]">
                {result.metadata.modality} • {result.metadata.rows}x{result.metadata.columns}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={reset}>
            Load Another
          </Button>
        </div>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className={cn("p-6 border-red-300 bg-red-50", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-medium text-red-800">
                Failed to Parse DICOM
              </p>
              <p className="text-sm text-red-600">
                {error || 'Unknown error'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={reset} className="border-red-300">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-2 border-dashed p-8 text-center transition-all cursor-pointer",
        isDragging 
          ? "border-[--color-medical-primary] bg-blue-50" 
          : "border-gray-300 hover:border-[--color-medical-primary]",
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
      onClick={() => document.getElementById('dicom-input')?.click()}
    >
      <FileImage className="h-10 w-10 text-gray-400 mx-auto mb-3" />
      <p className="font-medium text-[--color-medical-text-primary] mb-1">
        Drop DICOM file here
      </p>
      <p className="text-sm text-[--color-medical-text-secondary] mb-4">
        Supports .dcm and .dicom files
      </p>
      <Button variant="outline" size="sm">
        Select File
      </Button>
      <input
        id="dicom-input"
        type="file"
        className="hidden"
        accept=".dcm,.dicom,application/dicom"
        onChange={handleInputChange}
      />
    </Card>
  );
}
