/**
 * Audio Analyzer Factory
 *
 * Creates the appropriate audio analyzer based on device capabilities.
 * Currently only instantiates DSPAnalyzer (Tier 3).
 *
 * Future: Add TFLiteAnalyzer (Tier 2) and TFFullAnalyzer (Tier 1).
 */

import { AudioAnalyzer } from './audio-analyzer';
import { DSPAnalyzer } from './dsp-analyzer';
import { detectMLCapabilities, MLTier } from './capabilities';

export class AudioAnalyzerFactory {
  private static instance: AudioAnalyzer | null = null;

  /**
   * Create or get singleton analyzer instance
   */
  static async create(sampleRate: number = 44100): Promise<AudioAnalyzer> {
    if (this.instance) {
      return this.instance;
    }

    const capabilities = await detectMLCapabilities();
    const analyzer = await this.createForTier(capabilities.tier, sampleRate);

    this.instance = analyzer;
    return analyzer;
  }

  /**
   * Create analyzer for specific tier
   */
  private static async createForTier(tier: MLTier, sampleRate: number): Promise<AudioAnalyzer> {
    switch (tier) {
      case 'low':
        console.log('[AudioAnalyzer] Using DSP-based analysis (Tier 3)');
        return new DSPAnalyzer(sampleRate);

      case 'medium':
        // TODO: Implement when TensorFlow.js WebGL backend is added
        console.warn('[AudioAnalyzer] Tier 2 (WebGL ML) not yet implemented, falling back to DSP');
        return new DSPAnalyzer(sampleRate);

      case 'high':
        // TODO: Implement when TensorFlow.js WebGPU backend is added
        console.warn('[AudioAnalyzer] Tier 1 (WebGPU ML) not yet implemented, falling back to DSP');
        return new DSPAnalyzer(sampleRate);

      default:
        return new DSPAnalyzer(sampleRate);
    }
  }

  /**
   * Reset instance (useful for testing or forcing re-initialization)
   */
  static reset(): void {
    this.instance = null;
  }
}
