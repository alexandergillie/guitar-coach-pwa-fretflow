/**
 * Audio Analyzer Interface
 *
 * Abstract interface for audio analysis implementations.
 * All tier implementations (DSP, WebGL ML, WebGPU ML) implement this interface.
 */

export interface Note {
  pitch: number; // Frequency in Hz
  note: string; // Note name (e.g., "E2", "A3")
  timestamp: number; // When the note was detected (ms)
  confidence: number; // 0-1, how confident we are in the detection
}

export interface OnsetEvent {
  timestamp: number; // When the onset occurred (ms)
  energy: number; // Energy level of the onset
}

export interface AnalysisResult {
  pitch: number | null; // Current pitch in Hz
  note: string | null; // Current note name
  confidence: number; // Confidence in pitch detection (0-1)
  bpm: number | null; // Detected BPM
  onsets: OnsetEvent[]; // Recent onset events
}

/**
 * Abstract base class for all audio analyzers
 */
export abstract class AudioAnalyzer {
  protected sampleRate: number;

  constructor(sampleRate: number = 44100) {
    this.sampleRate = sampleRate;
  }

  /**
   * Detect pitch from audio buffer
   */
  abstract detectPitch(audioBuffer: Float32Array): Promise<number | null>;

  /**
   * Detect note onsets (attacks) in audio buffer
   */
  abstract detectOnsets(audioBuffer: Float32Array, energyHistory: number[]): Promise<OnsetEvent[]>;

  /**
   * Calculate BPM from onset events
   */
  abstract calculateBPM(onsets: OnsetEvent[]): number | null;

  /**
   * Calculate accuracy by comparing detected notes with expected notes
   */
  abstract calculateAccuracy(detectedNotes: Note[], expectedNotes: Note[]): number;

  /**
   * Analyze audio buffer and return comprehensive results
   */
  async analyze(
    audioBuffer: Float32Array,
    energyHistory: number[] = []
  ): Promise<AnalysisResult> {
    const pitch = await this.detectPitch(audioBuffer);
    const note = pitch ? this.frequencyToNote(pitch) : null;
    const onsets = await this.detectOnsets(audioBuffer, energyHistory);
    const bpm = this.calculateBPM(onsets);

    return {
      pitch,
      note,
      confidence: pitch ? 0.85 : 0, // Base confidence, can be improved per tier
      bpm,
      onsets
    };
  }

  /**
   * Convert frequency to note name
   */
  protected frequencyToNote(frequency: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);

    const halfSteps = Math.round(12 * Math.log2(frequency / C0));
    const octave = Math.floor(halfSteps / 12);
    const noteIndex = halfSteps % 12;

    return `${noteNames[noteIndex]}${octave}`;
  }

  /**
   * Convert note name to frequency
   */
  protected noteToFrequency(note: string): number {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const match = note.match(/^([A-G]#?)(\d+)$/);

    if (!match) return 0;

    const noteName = match[1];
    const octave = parseInt(match[2]);
    const noteIndex = noteNames.indexOf(noteName);

    if (noteIndex === -1) return 0;

    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    const halfSteps = octave * 12 + noteIndex;

    return C0 * Math.pow(2, halfSteps / 12);
  }

  /**
   * Calculate RMS (Root Mean Square) energy of audio buffer
   */
  protected calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }
}
