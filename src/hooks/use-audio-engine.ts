import { useState, useEffect, useCallback, useRef } from 'react';
export function useAudioEngine() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startEngine = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microphone access denied');
      setIsActive(false);
    }
  }, []);
  const stopEngine = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);
  useEffect(() => {
    return () => stopEngine();
  }, [stopEngine]);
  return {
    isActive,
    error,
    startEngine,
    stopEngine,
    analyser: analyserRef.current,
    audioContext: audioContextRef.current
  };
}