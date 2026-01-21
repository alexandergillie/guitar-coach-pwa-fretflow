/**
 * ML Capabilities Detection
 *
 * Detects device capabilities for audio ML processing.
 * Currently returns 'low' tier (DSP-based analysis).
 *
 * Future: Add WebGPU/WebGL detection for Tier 1/2.
 */

export type MLTier = 'high' | 'medium' | 'low';

export interface MLCapabilities {
  tier: MLTier;
  backends: {
    webgpu: boolean;
    webgl: boolean;
    wasm: boolean;
  };
  deviceInfo: {
    memory?: number;
    cores: number;
    isMobile: boolean;
  };
}

/**
 * Detect available ML backends and classify device tier
 */
export async function detectMLCapabilities(): Promise<MLCapabilities> {
  // Check for GPU backends (for future tier implementations)
  const hasWebGPU = 'gpu' in navigator;
  const hasWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  })();

  // Device info
  const deviceMemory = (navigator as any).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 2;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Tier classification (for now, always use 'low' - DSP-based)
  // Future: Uncomment to enable higher tiers when implemented
  let tier: MLTier = 'low';

  // if (hasWebGPU && deviceMemory >= 4 && cores >= 4) {
  //   tier = 'high'; // Full ML with WebGPU
  // } else if (hasWebGL && deviceMemory >= 2) {
  //   tier = 'medium'; // Lite ML with WebGL
  // } else {
  //   tier = 'low'; // DSP algorithms only
  // }

  return {
    tier,
    backends: {
      webgpu: hasWebGPU,
      webgl: hasWebGL,
      wasm: typeof WebAssembly !== 'undefined'
    },
    deviceInfo: {
      memory: deviceMemory,
      cores,
      isMobile
    }
  };
}

/**
 * Get human-readable description of current tier
 */
export function getTierDescription(tier: MLTier): string {
  switch (tier) {
    case 'high':
      return 'GPU-Accelerated ML (WebGPU)';
    case 'medium':
      return 'WebGL-Accelerated ML';
    case 'low':
      return 'DSP-Based Analysis';
  }
}
