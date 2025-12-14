export interface DeviceInfo {
  isMobile: boolean;
  isIOS: boolean;
  isSafari: boolean;
  isIOSSafari: boolean;
  hasLowMemory: boolean;
  maxTextureSize: number;
  recommendedResolution: number;
  devicePixelRatio: number;
}

export function detectDevice(): DeviceInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isIOSSafari = isIOS && isSafari;
  
  // Estimate memory constraints
  // iOS Safari has strict canvas memory limits (~288-384MB)
  const hasLowMemory = isIOSSafari || (isMobile && !(/Android/i.test(ua) && parseInt(ua.match(/Android (\d+)/)?.[1] || '0') >= 10));
  
  // Determine max texture size based on device
  let maxTextureSize = 4096;
  if (isIOSSafari) {
    maxTextureSize = 2048; // Conservative for iOS Safari
  } else if (isMobile) {
    maxTextureSize = 2048;
  }
  
  // Recommended resolution for depth map
  let recommendedResolution = 518; // Model native resolution
  if (hasLowMemory) {
    recommendedResolution = 256; // Lower for memory-constrained devices
  }
  
  const devicePixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  
  return {
    isMobile,
    isIOS,
    isSafari,
    isIOSSafari,
    hasLowMemory,
    maxTextureSize,
    recommendedResolution,
    devicePixelRatio,
  };
}

export function getMemoryWarning(device: DeviceInfo): string | null {
  if (device.isIOSSafari) {
    return 'iOS Safari has memory limitations. Large images may cause issues.';
  }
  if (device.hasLowMemory) {
    return 'Your device has limited memory. Performance may be affected.';
  }
  return null;
}

export function shouldShowMemoryWarning(device: DeviceInfo): boolean {
  return device.hasLowMemory;
}
