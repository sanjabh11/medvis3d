'use client';

import { useState, useCallback } from 'react';

export type ReportGenerationStatus = 'idle' | 'generating' | 'complete' | 'error';

export interface AIReportContent {
  summary: string;
  keyFindings: string[];
  patientExplanation: string;
  recommendations: string[];
  disclaimer: string;
  generatedAt: string;
}

interface UseAIReportGeneratorReturn {
  status: ReportGenerationStatus;
  report: AIReportContent | null;
  error: string | null;
  generateReport: (context: ReportContext) => Promise<AIReportContent | null>;
  reset: () => void;
}

interface ReportContext {
  modality?: string;
  bodyPart?: string;
  depthAnalysis?: {
    hasSignificantDepthVariation: boolean;
    maxDepth: number;
    minDepth: number;
  };
  userNotes?: string;
}

// Template-based report generation (client-side, no API required)
// For production LLM integration, this would call an API endpoint
function generateTemplateReport(context: ReportContext): AIReportContent {
  const modality = context.modality || 'medical image';
  const bodyPart = context.bodyPart || 'anatomical region';
  
  const depthInfo = context.depthAnalysis;
  const hasVariation = depthInfo?.hasSignificantDepthVariation ?? true;
  
  const summary = `This AI-generated 3D visualization represents a topological analysis of your ${modality}. The depth estimation algorithm has processed the 2D image to create an interactive 3D surface that helps visualize the relative depth and structure of the ${bodyPart}.`;
  
  const keyFindings = [
    `The visualization shows the ${bodyPart} with enhanced depth perception`,
    hasVariation 
      ? 'Significant depth variation detected, indicating distinct anatomical structures'
      : 'Relatively uniform depth distribution observed',
    'The 3D model allows viewing from multiple angles for better understanding',
    'Interactive controls enable detailed examination of specific areas',
  ];
  
  const patientExplanation = `Think of this 3D image like a map with hills and valleys. The "hills" (lighter/raised areas) represent structures that appear closer or more prominent in your scan, while the "valleys" (darker/lower areas) show deeper or less prominent areas. This helps you and your doctor see the shape and structure of your ${bodyPart} in a way that's easier to understand than a flat 2D image.

**What you can do:**
- Rotate the model to see different angles
- Zoom in to examine specific areas
- Adjust the depth slider to emphasize or flatten the 3D effect
- Use the wireframe mode to see the underlying structure

Remember: This is a visualization tool to help you understand your scan better. Your doctor will explain what the actual medical findings mean for your health.`;

  const recommendations = [
    'Discuss this visualization with your healthcare provider',
    'Ask your doctor to point out specific areas of interest',
    'Use the screenshot feature to save views for future reference',
    'Bring any questions about the visualization to your next appointment',
  ];

  const disclaimer = `⚠️ IMPORTANT DISCLAIMER

This AI-generated 3D visualization is created for EDUCATIONAL and COMMUNICATION purposes only. It is NOT intended for:
- Medical diagnosis
- Treatment planning
- Clinical decision-making

The depth estimation is a mathematical approximation and may not accurately reflect true anatomical structures. The visualization may contain artifacts or inaccuracies inherent to AI-based image processing.

ALWAYS consult your qualified healthcare provider for proper medical interpretation and advice. Do not make any health decisions based solely on this visualization.

This tool is designed to enhance patient-provider communication, not replace professional medical judgment.`;

  return {
    summary,
    keyFindings,
    patientExplanation,
    recommendations,
    disclaimer,
    generatedAt: new Date().toISOString(),
  };
}

// Analyze depth map to extract insights
function analyzeDepthMap(depthMap: Float32Array | null): ReportContext['depthAnalysis'] | undefined {
  if (!depthMap || depthMap.length === 0) return undefined;
  
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  
  for (let i = 0; i < depthMap.length; i++) {
    const val = depthMap[i];
    if (val < min) min = val;
    if (val > max) max = val;
    sum += val;
  }
  
  const avg = sum / depthMap.length;
  const range = max - min;
  
  return {
    hasSignificantDepthVariation: range > 0.3,
    maxDepth: max,
    minDepth: min,
  };
}

export function useAIReportGenerator(): UseAIReportGeneratorReturn {
  const [status, setStatus] = useState<ReportGenerationStatus>('idle');
  const [report, setReport] = useState<AIReportContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (context: ReportContext): Promise<AIReportContent | null> => {
    setStatus('generating');
    setError(null);

    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedReport = generateTemplateReport(context);
      
      setReport(generatedReport);
      setStatus('complete');
      
      return generatedReport;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setReport(null);
    setError(null);
  }, []);

  return {
    status,
    report,
    error,
    generateReport,
    reset,
  };
}

export { analyzeDepthMap };
