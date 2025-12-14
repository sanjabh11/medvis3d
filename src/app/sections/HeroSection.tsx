'use client';

import { Sparkles, Lock, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="text-center py-12">
      <div className="inline-flex items-center gap-2 bg-blue-50 text-[--color-medical-primary] px-4 py-2 rounded-full text-sm font-medium mb-6">
        <Sparkles className="h-4 w-4" />
        AI-Powered Visualization
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-[--color-medical-text-primary] mb-4 tracking-tight">
        See Your Anatomy in{' '}
        <span className="text-[--color-medical-primary]">3D</span>
      </h1>
      
      <p className="text-xl text-[--color-medical-text-secondary] max-w-2xl mx-auto mb-8 leading-relaxed">
        Transform medical images into interactive 3D visualizations instantly. 
        Understand your health better with AI-powered depth estimation.
      </p>
      
      <div className="flex flex-wrap justify-center gap-6 text-sm text-[--color-medical-text-secondary]">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-[--color-medical-success]" />
          <span>100% Private - Data stays on your device</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[--color-medical-warning]" />
          <span>Instant Results - Powered by WebGPU</span>
        </div>
      </div>
    </section>
  );
}
