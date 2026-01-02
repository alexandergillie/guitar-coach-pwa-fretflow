import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SEED_EXERCISES } from '@shared/mock-data';
import { Button } from '@/components/ui/button';
import { Visualizer } from '@/components/practice/Visualizer';
import { Metronome } from '@/components/practice/Metronome';
import { TabViewer } from '@/components/ui/tab-viewer';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { ChevronLeft, Flag, Info, Mic, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
export function PracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exercise = SEED_EXERCISES.find(e => e.id === id);
  const { analyser, isActive, startEngine, stopEngine, error, audioContext } = useAudioEngine();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [detectedBpm, setDetectedBpm] = useState<number>(0);
  const queryClient = useQueryClient();
  const sessionMutation = useMutation({
    mutationFn: (data: any) => api('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['user/profile'] });
      navigate(`/practice/${id}/analysis`, { state: { session } });
    },
    onError: () => {
      toast.error('Failed to save session data');
    }
  });
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
  // Mock BPM detection integration for UI demonstration
  // In a real production scenario with 'realtime-bpm-analyzer', 
  // we would hook into the AudioWorklet or ScriptProcessorNode here.
  useEffect(() => {
    let interval: number;
    if (isActive && sessionStartTime) {
      interval = window.setInterval(() => {
        // Simulating real-time BPM detection near the target
        const jitter = Math.random() * 10 - 5;
        setDetectedBpm(Math.round((exercise?.bpm || 120) + jitter));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, sessionStartTime, exercise?.bpm]);
  const handleStart = async () => {
    await startEngine();
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          setSessionStartTime(Date.now());
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };
  const handleFinish = () => {
    stopEngine();
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
    sessionMutation.mutate({
      userId: 'u1',
      exerciseId: id!,
      duration,
      accuracy: 85 + Math.floor(Math.random() * 10), // Mocked calculation
      achievedBpm: detectedBpm || exercise?.bpm || 120
    });
  };
  if (!exercise) return <div>Exercise not found</div>;
  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-64px)] bg-black flex flex-col">
        <div className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/50 backdrop-blur">
          <Link to={`/exercise/${id}`} className="flex items-center text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold">{exercise.title}</h1>
            <p className="text-xs text-muted-foreground uppercase">{exercise.difficulty} • {exercise.bpm} BPM</p>
          </div>
          <div className="flex items-center gap-4">
            {sessionStartTime && (
              <div className="hidden sm:block text-orange-500 font-mono text-sm font-bold">
                DETECTED: {detectedBpm} BPM
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => toast.info(exercise.description)}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="relative aspect-video rounded-3xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-center overflow-hidden">
              {!isActive ? (
                <div className="text-center space-y-4">
                  <Mic className="h-12 w-12 mx-auto text-zinc-700" />
                  <p className="text-muted-foreground">Grant microphone access to see your performance</p>
                  <Button onClick={handleStart} className="btn-gradient">Enable Audio</Button>
                </div>
              ) : (
                <>
                  <Visualizer analyser={analyser} className="w-full h-full opacity-60" />
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <span className="text-8xl font-black text-orange-500 animate-scale-in">{countdown}</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                    <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                    LISTENING
                  </div>
                </>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reference Tab</h3>
              <TabViewer tabString={exercise.tablature} variant="compact" />
            </div>
          </div>
          <div className="w-full md:w-96 border-l border-zinc-800 p-6 flex flex-col gap-6 bg-zinc-950">
            <Metronome initialBpm={exercise.bpm} />
            <div className="mt-auto space-y-3">
              <Button
                onClick={handleFinish}
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-lg font-bold"
                disabled={!sessionStartTime || sessionMutation.isPending}
              >
                {sessionMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <><Flag className="mr-2 h-5 w-5" /> Finish Session</>
                )}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground" 
                onClick={() => navigate(`/exercise/${id}`)}
                disabled={sessionMutation.isPending}
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}