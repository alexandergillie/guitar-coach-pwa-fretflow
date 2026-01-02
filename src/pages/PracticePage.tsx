import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SEED_EXERCISES } from '@shared/mock-data';
import { Button } from '@/components/ui/button';
import { Visualizer } from '@/components/practice/Visualizer';
import { Metronome } from '@/components/practice/Metronome';
import { TabViewer } from '@/components/ui/tab-viewer';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { ChevronLeft, Flag, Info, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
export function PracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exercise = SEED_EXERCISES.find(e => e.id === id);
  const { analyser, isActive, startEngine, stopEngine, error } = useAudioEngine();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
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
    navigate(`/practice/${id}/analysis`, { state: { duration } });
  };
  if (!exercise) return <div>Exercise not found</div>;
  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-64px)] bg-black flex flex-col">
        {/* Top Header */}
        <div className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/50 backdrop-blur">
          <Link to={`/exercise/${id}`} className="flex items-center text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold">{exercise.title}</h1>
            <p className="text-xs text-muted-foreground uppercase">{exercise.difficulty} • {exercise.bpm} BPM</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => toast.info(exercise.description)}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
        {/* Main Interface */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Visual Feedback Area */}
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
                    <Mic className="h-3 w-3" /> LISTENING
                  </div>
                </>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reference Tab</h3>
              <TabViewer tabString={exercise.tablature} variant="compact" />
            </div>
          </div>
          {/* Right Sidebar Controls */}
          <div className="w-full md:w-96 border-l border-zinc-800 p-6 flex flex-col gap-6 bg-zinc-950">
            <Metronome initialBpm={exercise.bpm} />
            <div className="mt-auto space-y-3">
              <Button 
                onClick={handleFinish}
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-lg font-bold"
                disabled={!sessionStartTime}
              >
                <Flag className="mr-2 h-5 w-5" /> Finish Session
              </Button>
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => navigate(`/exercise/${id}`)}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}