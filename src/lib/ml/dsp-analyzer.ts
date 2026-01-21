/**
 * DSP-Based Audio Analyzer (Tier 3)
 *
 * Uses traditional DSP algorithms for audio analysis:
 * - YIN algorithm for pitch detection
 * - Energy-based onset detection
 * - Interval-based BPM calculation
 *
 * Works on all devices, no GPU required.
 */

import PitchFinder from 'pitchfinder';
import { AudioAnalyzer, Note, OnsetEvent } from './audio-analyzer';

export class DSPAnalyzer extends AudioAnalyzer {
  private pitchDetector: (buffer: Float32Array) => number | null;
  private onsetThreshold: number = 1.5; // Energy multiplier for onset detection
  private minTimeBetweenOnsets: number = 100; // Minimum ms between onsets

  constructor(sampleRate: number = 44100) {
    super(sampleRate);

    // YIN is one of the best pitch detection algorithms
    // It works well for monophonic instruments like guitar
    this.pitchDetector = PitchFinder.YIN({
      sampleRate: this.sampleRate,
      threshold: 0.1, // Lower = more sensitive, higher = more accurate
      probabilityThreshold: 0.1
    });
  }

  /**
   * Detect pitch using YIN algorithm
   */
  async detectPitch(audioBuffer: Float32Array): Promise<number | null> {
    // Filter out very quiet audio to avoid noise detection
    const rms = this.calculateRMS(audioBuffer);
    if (rms < 0.01) {
      return null;
    }

    try {
      const frequency = this.pitchDetector(audioBuffer);

      // Filter out unrealistic frequencies for guitar
      // Standard tuning: E2 (82.41 Hz) to E6 (1318.51 Hz)
      // We'll be generous: 60 Hz to 2000 Hz
      if (frequency && frequency >= 60 && frequency <= 2000) {
        return frequency;
      }

      return null;
    } catch (error) {
      console.warn('Pitch detection error:', error);
      return null;
    }
  }

  /**
   * Detect note onsets using energy-based detection
   */
  async detectOnsets(
    audioBuffer: Float32Array,
    energyHistory: number[] = []
  ): Promise<OnsetEvent[]> {
    const onsets: OnsetEvent[] = [];
    const currentEnergy = this.calculateRMS(audioBuffer);

    // Calculate average energy from history
    if (energyHistory.length > 0) {
      const avgEnergy = energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length;

      // Onset detected if current energy is significantly higher than average
      if (currentEnergy > avgEnergy * this.onsetThreshold && currentEnergy > 0.05) {
        onsets.push({
          timestamp: Date.now(),
          energy: currentEnergy
        });
      }
    }

    return onsets;
  }

  /**
   * Calculate BPM from onset events
   */
  calculateBPM(onsets: OnsetEvent[]): number | null {
    if (onsets.length < 4) {
      return null; // Need at least 4 onsets to calculate BPM reliably
    }

    // Filter out onsets that are too close together (likely noise)
    const filteredOnsets = this.filterCloseOnsets(onsets);

    if (filteredOnsets.length < 4) {
      return null;
    }

    // Calculate intervals between consecutive onsets
    const intervals: number[] = [];
    for (let i = 1; i < filteredOnsets.length; i++) {
      const interval = filteredOnsets[i].timestamp - filteredOnsets[i - 1].timestamp;
      intervals.push(interval);
    }

    // Calculate median interval (more robust than mean)
    intervals.sort((a, b) => a - b);
    const medianInterval = intervals[Math.floor(intervals.length / 2)];

    // Convert interval (ms) to BPM
    // BPM = 60000 / interval_in_ms
    const bpm = Math.round(60000 / medianInterval);

    // Sanity check: guitar playing is typically 40-240 BPM
    if (bpm >= 40 && bpm <= 240) {
      return bpm;
    }

    return null;
  }

  /**
   * Calculate accuracy by comparing detected notes with expected notes
   */
  calculateAccuracy(detectedNotes: Note[], expectedNotes: Note[]): number {
    if (expectedNotes.length === 0) {
      return 100; // No expected notes = perfect accuracy
    }

    if (detectedNotes.length === 0) {
      return 0; // No notes detected = 0% accuracy
    }

    let correctNotes = 0;

    // For each expected note, check if there's a matching detected note
    for (const expected of expectedNotes) {
      const match = detectedNotes.find(detected => {
        // Notes match if:
        // 1. Same note name OR
        // 2. Frequencies are within 50 cents (half a semitone)
        const sameNote = detected.note === expected.note;
        const pitchDiff = Math.abs(detected.pitch - expected.pitch);
        const centsOff = 1200 * Math.log2(detected.pitch / expected.pitch);
        const closeEnough = Math.abs(centsOff) < 50;

        // 3. Timing is within reasonable window (±500ms)
        const timeDiff = Math.abs(detected.timestamp - expected.timestamp);
        const timeMatches = timeDiff < 500;

        return (sameNote || closeEnough) && timeMatches;
      });

      if (match) {
        correctNotes++;
      }
    }

    return Math.round((correctNotes / expectedNotes.length) * 100);
  }

  /**
   * Filter out onsets that are too close together
   */
  private filterCloseOnsets(onsets: OnsetEvent[]): OnsetEvent[] {
    const filtered: OnsetEvent[] = [];
    let lastTimestamp = 0;

    for (const onset of onsets) {
      if (onset.timestamp - lastTimestamp >= this.minTimeBetweenOnsets) {
        filtered.push(onset);
        lastTimestamp = onset.timestamp;
      }
    }

    return filtered;
  }
}
