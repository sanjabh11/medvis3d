'use client';

import { useState, useCallback } from 'react';
import { Sparkles, FileText, Loader2, Copy, Check, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAIReportGenerator, analyzeDepthMap, type AIReportContent } from '../hooks/useAIReportGenerator';

interface AIReportPanelProps {
  depthMap: Float32Array | null;
  modality?: string;
  bodyPart?: string;
  className?: string;
}

export function AIReportPanel({ depthMap, modality, bodyPart, className }: AIReportPanelProps) {
  const { status, report, error, generateReport, reset } = useAIReportGenerator();
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    explanation: true,
    findings: false,
    recommendations: false,
    disclaimer: false,
  });

  const handleGenerate = useCallback(async () => {
    const depthAnalysis = analyzeDepthMap(depthMap);
    await generateReport({
      modality,
      bodyPart,
      depthAnalysis,
    });
  }, [depthMap, modality, bodyPart, generateReport]);

  const handleCopy = useCallback(async () => {
    if (!report) return;
    
    const text = `
AI-Generated Medical Visualization Report
==========================================

SUMMARY
${report.summary}

PATIENT EXPLANATION
${report.patientExplanation}

KEY FINDINGS
${report.keyFindings.map(f => `• ${f}`).join('\n')}

RECOMMENDATIONS
${report.recommendations.map(r => `• ${r}`).join('\n')}

DISCLAIMER
${report.disclaimer}

Generated: ${new Date(report.generatedAt).toLocaleString()}
    `.trim();

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [report]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Idle state
  if (status === 'idle' && !report) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-[--color-medical-text-primary] mb-2">
            AI Report Generator
          </h3>
          <p className="text-sm text-[--color-medical-text-secondary] mb-4">
            Generate a patient-friendly explanation of this visualization
          </p>
          <Button
            onClick={handleGenerate}
            disabled={!depthMap}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate AI Report
          </Button>
          {!depthMap && (
            <p className="text-xs text-[--color-medical-text-secondary] mt-2">
              Generate a 3D view first to enable AI reports
            </p>
          )}
        </div>
      </Card>
    );
  }

  // Generating state
  if (status === 'generating') {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-[--color-medical-text-primary] font-medium">
            Generating AI Report...
          </p>
          <p className="text-sm text-[--color-medical-text-secondary] mt-1">
            Creating patient-friendly explanation
          </p>
        </div>
      </Card>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <Card className={`p-6 border-red-300 bg-red-50 ${className}`}>
        <div className="text-center">
          <p className="text-red-800 font-medium mb-2">Report Generation Failed</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Report display
  if (!report) return null;

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-purple-50 border-b border-purple-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-[--color-medical-text-primary]">
            AI-Generated Report
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerate}>
            Regenerate
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Summary */}
        <Section
          title="Summary"
          expanded={expandedSections.summary}
          onToggle={() => toggleSection('summary')}
        >
          <p className="text-sm text-[--color-medical-text-secondary]">
            {report.summary}
          </p>
        </Section>

        {/* Patient Explanation */}
        <Section
          title="Understanding Your Visualization"
          expanded={expandedSections.explanation}
          onToggle={() => toggleSection('explanation')}
        >
          <div className="text-sm text-[--color-medical-text-secondary] whitespace-pre-line">
            {report.patientExplanation}
          </div>
        </Section>

        {/* Key Findings */}
        <Section
          title="Key Findings"
          expanded={expandedSections.findings}
          onToggle={() => toggleSection('findings')}
        >
          <ul className="text-sm text-[--color-medical-text-secondary] space-y-1">
            {report.keyFindings.map((finding, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                {finding}
              </li>
            ))}
          </ul>
        </Section>

        {/* Recommendations */}
        <Section
          title="Recommendations"
          expanded={expandedSections.recommendations}
          onToggle={() => toggleSection('recommendations')}
        >
          <ul className="text-sm text-[--color-medical-text-secondary] space-y-1">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-600">{i + 1}.</span>
                {rec}
              </li>
            ))}
          </ul>
        </Section>

        {/* Disclaimer */}
        <Section
          title="Important Disclaimer"
          expanded={expandedSections.disclaimer}
          onToggle={() => toggleSection('disclaimer')}
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
          className="bg-amber-50 border-amber-200"
        >
          <div className="text-sm text-amber-800 whitespace-pre-line">
            {report.disclaimer}
          </div>
        </Section>
      </div>
    </Card>
  );
}

interface SectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

function Section({ title, expanded, onToggle, children, icon, className }: SectionProps) {
  return (
    <div className={`border rounded-lg overflow-hidden ${className || 'border-gray-200'}`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm text-[--color-medical-text-primary]">
            {title}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {expanded && (
        <div className="px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}
