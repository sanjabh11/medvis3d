'use client';

import { useCallback, useState } from 'react';
import { Upload, FileImage, X, Loader2, Camera, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/stores';
import { cn } from '@/lib/utils';
import { useDicomParser } from '@/features/dicom';
import { CameraCapture } from '@/features/camera';
import {
  analyzeImageQuality,
  enhanceImageData,
  ImageQualityPanel,
  type EnhancementProfile,
  type SourceType,
} from '@/features/builder';

type InputMode = 'upload' | 'camera' | 'dicom';

export function UploadSection() {
  const {
    file,
    imageData,
    previewUrl,
    qualityReport,
    enhancementProfile,
    enhancedPreviewUrl,
    enhancedResult,
    setFile,
    setPreviewUrl,
    setImageData,
    setSourceType,
    setQualityReport,
    setEnhancementProfile,
    setEnhancedImageData,
    setEnhancedPreviewUrl,
    setEnhancedResult,
    setDepthMap,
    setVisualizationFacts,
    reset,
  } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode | null>(null);
  const { parseDicom } = useDicomParser();

  const createPreviewFromImageData = useCallback((data: ImageData) => {
    const canvas = document.createElement('canvas');
    canvas.width = data.width;
    canvas.height = data.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.putImageData(data, 0, 0);
    return canvas.toDataURL('image/png');
  }, []);

  const applyEnhancement = useCallback((
    sourceImageData: ImageData,
    profile: EnhancementProfile
  ) => {
    const report = analyzeImageQuality(sourceImageData);
    const enhanced = enhanceImageData(sourceImageData, profile, report);
    const enhancedPreview = createPreviewFromImageData(enhanced.imageData);

    setQualityReport(report);
    setEnhancedImageData(enhanced.imageData);
    setEnhancedResult(enhanced);
    if (enhancedPreview) {
      setEnhancedPreviewUrl(enhancedPreview);
    }
  }, [
    createPreviewFromImageData,
    setEnhancedImageData,
    setEnhancedPreviewUrl,
    setEnhancedResult,
    setQualityReport,
  ]);

  const handleImageData = useCallback((
    sourceImageData: ImageData,
    preview: string,
    fileName: string,
    sourceType: SourceType
  ) => {
    // Create a dummy file for display purposes
    const dummyFile = new File([], fileName, { type: 'image/png' });
    setFile(dummyFile);
    setPreviewUrl(preview);
    setImageData(sourceImageData);
    setSourceType(sourceType);
    setDepthMap(null);
    setVisualizationFacts(null);
    applyEnhancement(sourceImageData, enhancementProfile);
    setInputMode(null);
  }, [
    applyEnhancement,
    enhancementProfile,
    setDepthMap,
    setFile,
    setImageData,
    setPreviewUrl,
    setSourceType,
    setVisualizationFacts,
  ]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    // Check if DICOM
    const isDicom = selectedFile.name.toLowerCase().endsWith('.dcm') || 
                    selectedFile.name.toLowerCase().endsWith('.dicom');
    
    if (isDicom) {
      setIsLoading(true);
      const result = await parseDicom(selectedFile);
      if (result?.imageData) {
        const canvas = document.createElement('canvas');
        canvas.width = result.metadata.columns || 512;
        canvas.height = result.metadata.rows || 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(result.imageData, 0, 0);
          const preview = canvas.toDataURL('image/png');
          handleImageData(result.imageData, preview, selectedFile.name, 'dicom');
        }
      }
      setIsLoading(false);
      return;
    }

    // Regular image handling
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload a JPEG, PNG, or DICOM file');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('File size must be under 50MB');
      return;
    }

    setIsLoading(true);
    const objectUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const loadedImageData = ctx.getImageData(0, 0, img.width, img.height);
        setImageData(loadedImageData);
        setSourceType('image');
        setDepthMap(null);
        setVisualizationFacts(null);
        applyEnhancement(loadedImageData, enhancementProfile);
      }
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      reset();
      alert('Failed to load image');
    };
    img.src = objectUrl;
  }, [
    applyEnhancement,
    enhancementProfile,
    handleImageData,
    parseDicom,
    reset,
    setDepthMap,
    setFile,
    setImageData,
    setPreviewUrl,
    setSourceType,
    setVisualizationFacts,
  ]);

  const handleCameraCapture = useCallback((imageData: ImageData, preview: string) => {
    handleImageData(imageData, preview, 'camera-capture.png', 'camera');
  }, [handleImageData]);

  const handleProfileChange = useCallback((profile: EnhancementProfile) => {
    setEnhancementProfile(profile);
    setDepthMap(null);
    setVisualizationFacts(null);
    if (imageData) {
      applyEnhancement(imageData, profile);
    }
  }, [applyEnhancement, imageData, setDepthMap, setEnhancementProfile, setVisualizationFacts]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  if (file && previewUrl) {
    return (
      <section>
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
              <div className="grid gap-3 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[--color-medical-text-secondary]">
                    Original
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Uploaded medical image"
                    className="h-64 w-full rounded-lg bg-gray-100 object-contain md:h-80"
                  />
                </div>
                {enhancedPreviewUrl && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[--color-medical-text-secondary]">
                      Enhanced for 3D
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={enhancedPreviewUrl}
                      alt="Enhanced medical image prepared for 3D visualization"
                      className="h-64 w-full rounded-lg bg-gray-100 object-contain md:h-80"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={reset}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="flex flex-col justify-center gap-4 md:w-64">
              <div className="text-sm text-[--color-medical-text-secondary]">
                <p className="font-medium text-[--color-medical-text-primary] mb-1">
                  {file.name}
                </p>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[--color-medical-success]">
                <div className="h-2 w-2 rounded-full bg-[--color-medical-success]" />
                Ready for educational 3D visualization
              </div>
              <Button 
                className="w-full bg-[--color-medical-primary] hover:bg-[--color-medical-primary-hover]"
                disabled={isLoading}
                onClick={() => document.getElementById('builder-inference')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Generate 3D View'
                )}
              </Button>
            </div>
          </div>
          {qualityReport && (
            <div className="mt-5">
              <ImageQualityPanel
                report={qualityReport}
                selectedProfile={enhancementProfile}
                enhancedResult={enhancedResult}
                onProfileChange={handleProfileChange}
              />
            </div>
          )}
        </Card>
      </section>
    );
  }

  // Camera capture mode
  if (inputMode === 'camera') {
    return (
      <section>
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setInputMode(null)}
        />
      </section>
    );
  }

  return (
    <section>
      <Card
        className={cn(
          "border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all",
          isDragging 
            ? "border-[--color-medical-primary] bg-blue-50" 
            : "border-gray-300 hover:border-[--color-medical-primary] hover:bg-gray-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-[--color-medical-text-primary] mb-2">
          Drop your medical image here
        </p>
        <p className="text-sm text-[--color-medical-text-secondary] mb-6">
          Supports JPEG, PNG, and DICOM formats
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            variant="outline" 
            className="border-[--color-medical-primary] text-[--color-medical-primary] hover:bg-blue-50"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <FileImage className="h-4 w-4 mr-2" />
            Select Image
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setInputMode('camera')}
            className="border-gray-300 hover:border-[--color-medical-primary]"
          >
            <Camera className="h-4 w-4 mr-2" />
            Use Camera
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => document.getElementById('dicom-input')?.click()}
            className="border-gray-300 hover:border-[--color-medical-primary]"
          >
            <FileType className="h-4 w-4 mr-2" />
            DICOM File
          </Button>
        </div>
        
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png"
          onChange={handleInputChange}
        />
        <input
          id="dicom-input"
          type="file"
          className="hidden"
          accept=".dcm,.dicom"
          onChange={handleInputChange}
        />
      </Card>
    </section>
  );
}
