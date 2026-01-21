/**
 * React hook for real-time audio analysis
 *
 * Provides pitch detection, BPM detection, and note tracking.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioAnalyzerFactory } from '@/lib/ml/analyzer-factory';
import type { AudioAnalyzer, Note, OnsetEvent, AnalysisResult } from '@/lib/ml';

interface AudioAnalysisState {
  pitch: number | null;
  note: string | null;
  confidence: number;
  bpm: number | null;
  detectedNotes: Note[];
  isAnalyzing: boolean;
}

export function useAudioAnalysis(
  analyser: AnalyserNode | null,
  audioContext: AudioContext | null,
  isActive: boolean
) {
  const [state, setState] = useState<AudioAnalysisState>({
    pitch: null,
    note: null,
    confidence: 0,
    bpm: null,
    detectedNotes: [],
    isAnalyzing: false
  });

  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const detectedNotesRef = useRef<Note[]>([]);
  const onsetsRef = useRef<OnsetEvent[]>([]);
  const energyHistoryRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  // Initialize analyzer
  useEffect(() => {
    const initAnalyzer = async () => {
      if (!audioContext) return;

      try {
        const sampleRate = audioContext.sampleRate;
        analyzerRef.current = await AudioAnalyzerFactory.create(sampleRate);
        console.log('[AudioAnalysis] Analyzer initialized');
      } catch (error) {
        console.error('[AudioAnalysis] Failed to initialize:', error);
      }
    };

    initAnalyzer();
  }, [audioContext]);

  // Analysis loop
  useEffect(() => {
    if (!isActive || !analyser || !analyzerRef.current) {
      setState(prev => ({ ...prev, isAnalyzing: false }));
      return;
    }

    setState(prev => ({ ...prev, isAnalyzing: true }));

    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);

    const analyze = async () => {
      if (!analyser || !analyzerRef.current) return;

      // Get audio data from analyser
      analyser.getFloatTimeDomainData(dataArray);

      // Run analysis
      const result: AnalysisResult = await analyzerRef.current.analyze(
        dataArray,
        energyHistoryRef.current
      );

      // Update energy history for onset detection
      const rms = analyzerRef.current['calculateRMS'](dataArray);
      energyHistoryRef.current.push(rms);
      if (energyHistoryRef.current.length > 20) {
        energyHistoryRef.current.shift(); // Keep only last 20 samples
      }

      // Store detected notes
      if (result.pitch && result.note) {
        const newNote: Note = {
          pitch: result.pitch,
          note: result.note,
          timestamp: Date.now(),
          confidence: result.confidence
        };

        // Only add if it's different from the last note or enough time has passed
        const lastNote = detectedNotesRef.current[detectedNotesRef.current.length - 1];
        if (
          !lastNote ||
          lastNote.note !== newNote.note ||
          newNote.timestamp - lastNote.timestamp > 200
        ) {
          detectedNotesRef.current.push(newNote);
          // Keep only last 50 notes in memory
          if (detectedNotesRef.current.length > 50) {
            detectedNotesRef.current.shift();
          }
        }
      }

      // Store onsets for BPM calculation
      if (result.onsets.length > 0) {
        onsetsRef.current.push(...result.onsets);
        // Keep only last 30 seconds of onsets
        const cutoffTime = Date.now() - 30000;
        onsetsRef.current = onsetsRef.current.filter(o => o.timestamp > cutoffTime);
      }

      // Calculate BPM from accumulated onsets
      const bpm = analyzerRef.current.calculateBPM(onsetsRef.current);

      // Update state
      setState({
        pitch: result.pitch,
        note: result.note,
        confidence: result.confidence,
        bpm: bpm,
        detectedNotes: [...detectedNotesRef.current],
        isAnalyzing: true
      });
    };

    // Run analysis at 10 FPS (every 100ms)
    intervalRef.current = window.setInterval(analyze, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, analyser]);

  // Calculate accuracy for a given exercise
  const calculateAccuracy = useCallback((expectedNotes: Note[]): number => {
    if (!analyzerRef.current) return 0;
    return analyzerRef.current.calculateAccuracy(detectedNotesRef.current, expectedNotes);
  }, []);

  // Reset detection state (useful when starting a new session)
  const reset = useCallback(() => {
    detectedNotesRef.current = [];
    onsetsRef.current = [];
    energyHistoryRef.current = [];
    setState({
      pitch: null,
      note: null,
      confidence: 0,
      bpm: null,
      detectedNotes: [],
      isAnalyzing: false
    });
  }, []);

  return {
    ...state,
    calculateAccuracy,
    reset
  };
}
