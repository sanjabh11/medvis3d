export interface GPUCapabilities {
  hasWebGPU: boolean;
  hasWASM: boolean;
  hasSIMD: boolean;
  recommendedBackend: 'webgpu' | 'wasm';
  adapterInfo?: {
    vendor: string;
    architecture: string;
    device: string;
    description: string;
  };
  performanceEstimate: 'high' | 'medium' | 'low';
}

export async function detectGPUCapabilities(): Promise<GPUCapabilities> {
  const hasWASM = typeof WebAssembly !== 'undefined';
  
  // Check SIMD support for WASM
  let hasSIMD = false;
  try {
    hasSIMD = WebAssembly.validate(new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
    ]));
  } catch {
    hasSIMD = false;
  }

  // Check WebGPU support
  if (!navigator.gpu) {
    console.log('[GPU] WebGPU API not available in this browser');
    return {
      hasWebGPU: false,
      hasWASM,
      hasSIMD,
      recommendedBackend: 'wasm',
      performanceEstimate: hasSIMD ? 'medium' : 'low',
    };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance',
    });

    if (!adapter) {
      console.log('[GPU] No WebGPU adapter found');
      return {
        hasWebGPU: false,
        hasWASM,
        hasSIMD,
        recommendedBackend: 'wasm',
        performanceEstimate: hasSIMD ? 'medium' : 'low',
      };
    }

    // Get adapter info (use adapter.info for compatibility)
    const info = (adapter as unknown as { info?: GPUAdapterInfo }).info;
    const adapterInfo = {
      vendor: info?.vendor || 'Unknown',
      architecture: info?.architecture || 'Unknown',
      device: info?.device || 'Unknown',
      description: info?.description || 'WebGPU Adapter',
    };

    console.log('[GPU] WebGPU available:', adapterInfo);

    // Try to request device to confirm it works
    try {
      const device = await adapter.requestDevice();
      device.destroy(); // Clean up test device
      
      return {
        hasWebGPU: true,
        hasWASM,
        hasSIMD,
        recommendedBackend: 'webgpu',
        adapterInfo,
        performanceEstimate: 'high',
      };
    } catch (deviceError) {
      console.warn('[GPU] Failed to create WebGPU device:', deviceError);
      return {
        hasWebGPU: false,
        hasWASM,
        hasSIMD,
        recommendedBackend: 'wasm',
        adapterInfo,
        performanceEstimate: hasSIMD ? 'medium' : 'low',
      };
    }
  } catch (error) {
    console.error('[GPU] WebGPU detection failed:', error);
    return {
      hasWebGPU: false,
      hasWASM,
      hasSIMD,
      recommendedBackend: 'wasm',
      performanceEstimate: hasSIMD ? 'medium' : 'low',
    };
  }
}

export function getExpectedInferenceTime(capabilities: GPUCapabilities): string {
  switch (capabilities.performanceEstimate) {
    case 'high':
      return '< 1.5 seconds';
    case 'medium':
      return '2-5 seconds';
    case 'low':
      return '5-10 seconds';
    default:
      return 'Unknown';
  }
}

export function getBackendDisplayName(backend: 'webgpu' | 'wasm'): string {
  return backend === 'webgpu' ? 'WebGPU (GPU Accelerated)' : 'WebAssembly (CPU)';
}
