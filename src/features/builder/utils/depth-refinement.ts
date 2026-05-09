export interface DepthRefinementOptions {
  width: number;
  height: number;
  smoothPasses?: number;
  edgeThreshold?: number;
  clipPercentile?: number;
}

function percentile(sortedValues: number[], percent: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.floor((percent / 100) * (sortedValues.length - 1)))
  );
  return sortedValues[index];
}

function normalizeClipped(depthMap: Float32Array, clipPercentile: number): Float32Array {
  const values = Array.from(depthMap).filter(Number.isFinite).sort((a, b) => a - b);
  const low = percentile(values, clipPercentile);
  const high = Math.max(low + 0.00001, percentile(values, 100 - clipPercentile));
  const output = new Float32Array(depthMap.length);

  for (let i = 0; i < depthMap.length; i++) {
    const clipped = Math.max(low, Math.min(high, depthMap[i]));
    output[i] = (clipped - low) / (high - low);
  }

  return output;
}

function edgeAwareSmooth(
  depthMap: Float32Array,
  width: number,
  height: number,
  edgeThreshold: number
): Float32Array {
  const output = new Float32Array(depthMap);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const center = depthMap[i];
      let weightedSum = center * 4;
      let weightTotal = 4;

      const neighbors = [
        depthMap[i - 1],
        depthMap[i + 1],
        depthMap[i - width],
        depthMap[i + width],
      ];

      for (const neighbor of neighbors) {
        const weight = Math.abs(neighbor - center) > edgeThreshold ? 0.35 : 1;
        weightedSum += neighbor * weight;
        weightTotal += weight;
      }

      output[i] = weightedSum / weightTotal;
    }
  }

  return output;
}

export function refineDepthMap(
  depthMap: Float32Array,
  options: DepthRefinementOptions
): Float32Array {
  const { width, height, smoothPasses = 1, edgeThreshold = 0.08, clipPercentile = 1 } = options;

  if (depthMap.length !== width * height) {
    return depthMap;
  }

  let refined = normalizeClipped(depthMap, clipPercentile);

  for (let pass = 0; pass < smoothPasses; pass++) {
    refined = edgeAwareSmooth(refined, width, height, edgeThreshold);
  }

  return normalizeClipped(refined, 0);
}

export function estimateDepthConfidence(
  depthMap: Float32Array,
  width: number,
  height: number
): 'high' | 'medium' | 'low' {
  if (depthMap.length !== width * height || depthMap.length === 0) {
    return 'low';
  }

  let gradientEnergy = 0;
  let samples = 0;

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const i = y * width + x;
      gradientEnergy += Math.abs(depthMap[i] - depthMap[i - 1]);
      gradientEnergy += Math.abs(depthMap[i] - depthMap[i + 1]);
      gradientEnergy += Math.abs(depthMap[i] - depthMap[i - width]);
      gradientEnergy += Math.abs(depthMap[i] - depthMap[i + width]);
      samples += 4;
    }
  }

  const meanGradient = gradientEnergy / Math.max(1, samples);
  if (meanGradient > 0.035) return 'high';
  if (meanGradient > 0.012) return 'medium';
  return 'low';
}
