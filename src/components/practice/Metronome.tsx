import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface MetronomeProps {
  initialBpm: number;
  onBeat?: (count: number) => void;
  isPlaying?: boolean; // External control for auto-start/stop
  lockBpm?: boolean; // Prevent BPM changes during drill
}
export function Metronome({ initialBpm, onBeat, isPlaying: externalIsPlaying, lockBpm = false }: MetronomeProps) {
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlayingInternal, setIsPlayingInternal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [beat, setBeat] = useState(0);

  // Use external control if provided, otherwise use internal state
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : isPlayingInternal;
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const lookahead = 25.0; // ms
  const scheduleAheadTime = 0.1; // seconds
  const playClick = useCallback((time: number, isFirstBeat: boolean) => {
    if (!audioContextRef.current || isMuted) return;
    const osc = audioContextRef.current.createOscillator();
    const envelope = audioContextRef.current.createGain();
    osc.frequency.value = isFirstBeat ? 1000 : 800;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(envelope);
    envelope.connect(audioContextRef.current.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  }, [isMuted]);
  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;
    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      const isFirst = beat % 4 === 0;
      playClick(nextNoteTimeRef.current, isFirst);
      const secondsPerBeat = 60.0 / bpm;
      nextNoteTimeRef.current += secondsPerBeat;
      setBeat(prev => (prev + 1) % 4);
      onBeat?.(beat);
    }
    timerRef.current = window.setTimeout(scheduler, lookahead);
  }, [bpm, beat, playClick, onBeat]);
  const togglePlay = () => {
    if (externalIsPlaying !== undefined) return; // Disabled when externally controlled

    if (!isPlayingInternal) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      nextNoteTimeRef.current = audioContextRef.current.currentTime;
      setIsPlayingInternal(true);
      scheduler();
    } else {
      setIsPlayingInternal(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  // Handle external isPlaying control
  useEffect(() => {
    if (externalIsPlaying !== undefined) {
      if (externalIsPlaying && !isPlayingInternal) {
        // Start metronome
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        nextNoteTimeRef.current = audioContextRef.current.currentTime;
        setIsPlayingInternal(true);
        scheduler();
      } else if (!externalIsPlaying && isPlayingInternal) {
        // Stop metronome
        setIsPlayingInternal(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    }
  }, [externalIsPlaying]);
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);
  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl w-full max-w-md">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Metronome</span>
        <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex items-center gap-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={beat}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className={`w-12 h-12 rounded-full ${beat === 0 ? 'bg-orange-500 shadow-glow' : 'bg-zinc-700'}`}
          />
        </AnimatePresence>
        <div className="text-5xl font-black text-foreground">{bpm}</div>
      </div>
      <Slider
        value={[bpm]}
        onValueChange={(v) => setBpm(v[0])}
        min={40} max={240} step={1}
        className="w-full"
        disabled={lockBpm}
      />
      {externalIsPlaying === undefined ? (
        <Button onClick={togglePlay} className={`w-full h-14 text-lg font-bold ${isPlaying ? 'bg-zinc-800' : 'btn-gradient'}`}>
          {isPlaying ? <><Pause className="mr-2" /> Stop</> : <><Play className="mr-2" /> Start</>}
        </Button>
      ) : (
        <div className="w-full text-center text-sm text-muted-foreground">
          {isPlaying ? '🎵 Synced with drill' : 'Start drill to begin'}
        </div>
      )}
    </div>
  );
}