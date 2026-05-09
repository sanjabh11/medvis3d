import type {
  EnhancedImageResult,
  EnhancementProfile,
  ImageQualityOverall,
  ImageQualityReport,
} from '../types';

const SAMPLE_TARGET = 180_000;

function clamp(value: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, value));
}

function roundScore(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100) / 100;
}

function luminanceAt(data: Uint8ClampedArray, pixelIndex: number): number {
  const offset = pixelIndex * 4;
  return data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
}

function percentile(sortedValues: number[], percent: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.floor((percent / 100) * (sortedValues.length - 1)))
  );
  return sortedValues[index];
}

function computeBlurScore(imageData: ImageData, step: number): number {
  const { width, height, data } = imageData;
  let edgeEnergy = 0;
  let samples = 0;

  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const i = y * width + x;
      const center = luminanceAt(data, i);
      const left = luminanceAt(data, y * width + x - step);
      const right = luminanceAt(data, y * width + x + step);
      const top = luminanceAt(data, (y - step) * width + x);
      const bottom = luminanceAt(data, (y + step) * width + x);
      edgeEnergy += Math.abs(4 * center - left - right - top - bottom);
      samples += 1;
    }
  }

  if (samples === 0) return 0;
  return roundScore((edgeEnergy / samples) / 42);
}

function classifyQuality(
  width: number,
  height: number,
  contrastScore: number,
  blurScore: number,
  exposureScore: number
): ImageQualityOverall {
  const minDimension = Math.min(width, height);

  if (minDimension < 160 || contrastScore < 0.08 || exposureScore < 0.08 || blurScore < 0.05) {
    return 'insufficient';
  }

  if (minDimension < 320 || contrastScore < 0.22 || exposureScore < 0.22 || blurScore < 0.16) {
    return 'low-confidence';
  }

  if (contrastScore < 0.42 || exposureScore < 0.42 || blurScore < 0.32) {
    return 'enhanceable';
  }

  return 'good';
}

export function getQualityLabel(overall: ImageQualityOverall): string {
  switch (overall) {
    case 'good':
      return 'Good input';
    case 'enhanceable':
      return 'Enhanced input';
    case 'low-confidence':
      return 'Low confidence visualization';
    case 'insufficient':
      return 'Insufficient image quality';
  }
}

export function analyzeImageQuality(imageData: ImageData): ImageQualityReport {
  const { width, height, data } = imageData;
  const pixelCount = width * height;
  const step = Math.max(1, Math.floor(Math.sqrt(pixelCount / SAMPLE_TARGET)));
  const luminanceValues: number[] = [];
  let colorDelta = 0;
  let samples = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const pixelIndex = y * width + x;
      const offset = pixelIndex * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      luminanceValues.push(r * 0.299 + g * 0.587 + b * 0.114);
      colorDelta += Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
      samples += 1;
    }
  }

  luminanceValues.sort((a, b) => a - b);
  const p1 = percentile(luminanceValues, 1);
  const p5 = percentile(luminanceValues, 5);
  const p50 = percentile(luminanceValues, 50);
  const p95 = percentile(luminanceValues, 95);
  const p99 = percentile(luminanceValues, 99);

  const contrastScore = roundScore((p95 - p5) / 180);
  const lowExposureBalance = Math.min(p50, 255 - p50) / 90;
  const clippedRangePenalty = (p1 <= 2 || p99 >= 253) ? 0.85 : 1;
  const exposureScore = roundScore(lowExposureBalance * clippedRangePenalty);
  const blurScore = computeBlurScore(imageData, step);
  const grayscaleLikelihood = roundScore(1 - Math.min(1, colorDelta / Math.max(1, samples * 54)));
  const overall = classifyQuality(width, height, contrastScore, blurScore, exposureScore);
  const warnings: string[] = [];

  if (Math.min(width, height) < 320) {
    warnings.push('Low resolution limits surface detail.');
  }
  if (contrastScore < 0.42) {
    warnings.push('Low contrast image; local contrast enhancement will be applied.');
  }
  if (blurScore < 0.32) {
    warnings.push('Soft or blurred edges; depth relief may be less reliable.');
  }
  if (exposureScore < 0.42) {
    warnings.push('Exposure is clipped or unbalanced; visualization confidence is reduced.');
  }

  return {
    resolution: { width, height },
    blurScore,
    contrastScore,
    exposureScore,
    grayscaleLikelihood,
    overall,
    warnings,
  };
}

function resolveProfile(profile: EnhancementProfile, report: ImageQualityReport): EnhancementProfile {
  if (profile !== 'auto') return profile;
  if (report.grayscaleLikelihood > 0.82) return 'xray';
  if (report.blurScore < 0.2) return 'ultrasound-like';
  return 'general-photo';
}

function getProfileSettings(profile: EnhancementProfile) {
  switch (profile) {
    case 'xray':
      return { gamma: 0.9, contrast: 1.18, sharpen: 0.38, denoise: 0.12, grayscale: true };
    case 'ct-mri-slice':
      return { gamma: 1, contrast: 1.1, sharpen: 0.3, denoise: 0.1, grayscale: true };
    case 'ultrasound-like':
      return { gamma: 0.96, contrast: 1.08, sharpen: 0.16, denoise: 0.24, grayscale: true };
    case 'general-photo':
      return { gamma: 0.94, contrast: 1.12, sharpen: 0.22, denoise: 0.08, grayscale: false };
    case 'auto':
      return { gamma: 0.94, contrast: 1.12, sharpen: 0.22, denoise: 0.08, grayscale: false };
  }
}

export function enhanceImageData(
  imageData: ImageData,
  profile: EnhancementProfile,
  report = analyzeImageQuality(imageData)
): EnhancedImageResult {
  const resolvedProfile = resolveProfile(profile, report);
  const settings = getProfileSettings(resolvedProfile);
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const sourceLuma = new Float32Array(width * height);
  const values: number[] = [];

  for (let i = 0; i < width * height; i++) {
    const luma = luminanceAt(data, i);
    sourceLuma[i] = luma;
    values.push(luma);
  }

  values.sort((a, b) => a - b);
  const low = percentile(values, 2);
  const high = Math.max(low + 1, percentile(values, 98));
  const appliedSteps = ['contrast stretch'];

  appliedSteps.push('local contrast approximation');
  if (settings.grayscale) appliedSteps.push('grayscale normalization');
  if (settings.denoise > 0) appliedSteps.push('light denoise');
  if (settings.sharpen > 0) appliedSteps.push('edge-preserving sharpen');

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const offset = i * 4;
      let localAverage = sourceLuma[i];

      if (settings.denoise > 0 && x > 0 && y > 0 && x < width - 1 && y < height - 1) {
        const neighborhood =
          sourceLuma[i - 1] +
          sourceLuma[i + 1] +
          sourceLuma[i - width] +
          sourceLuma[i + width];
        localAverage = sourceLuma[i] * (1 - settings.denoise) + (neighborhood / 4) * settings.denoise;
      }

      let normalized = (localAverage - low) / (high - low);
      normalized = Math.max(0, Math.min(1, normalized));
      normalized = Math.pow(normalized, settings.gamma);
      let enhancedLuma = clamp((normalized - 0.5) * settings.contrast * 255 + 127.5);
      enhancedLuma = clamp(enhancedLuma + (sourceLuma[i] - localAverage) * 0.14);

      if (settings.sharpen > 0 && x > 0 && y > 0 && x < width - 1 && y < height - 1) {
        const neighborhood =
          sourceLuma[i - 1] +
          sourceLuma[i + 1] +
          sourceLuma[i - width] +
          sourceLuma[i + width];
        enhancedLuma = clamp(enhancedLuma + (sourceLuma[i] - neighborhood / 4) * settings.sharpen);
      }

      if (settings.grayscale) {
        output.data[offset] = enhancedLuma;
        output.data[offset + 1] = enhancedLuma;
        output.data[offset + 2] = enhancedLuma;
      } else {
        const originalLuma = Math.max(1, sourceLuma[i]);
        const scale = enhancedLuma / originalLuma;
        output.data[offset] = clamp(data[offset] * scale);
        output.data[offset + 1] = clamp(data[offset + 1] * scale);
        output.data[offset + 2] = clamp(data[offset + 2] * scale);
      }
      output.data[offset + 3] = data[offset + 3];
    }
  }

  return {
    imageData: output,
    profile: resolvedProfile,
    appliedSteps,
  };
}
