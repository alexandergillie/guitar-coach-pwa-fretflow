import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SEED_EXERCISES } from '@shared/mock-data';
import { Button } from '@/components/ui/button';
import { Visualizer } from '@/components/practice/Visualizer';
import { Metronome } from '@/components/practice/Metronome';
import { TabViewer } from '@/components/ui/tab-viewer';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { useAudioAnalysis } from '@/hooks/use-audio-analysis';
import { parseTablature } from '@/lib/tablature-parser';
import { ChevronLeft, Flag, Info, Mic, Loader2, MoveHorizontal, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { generateTablature, getDrillPositions, shouldReversePattern, getPatternAtPosition } from '@shared/pattern-utils';
import { Badge } from '@/components/ui/badge';

export function PracticePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exercise = SEED_EXERCISES.find(e => e.id === id);
  
  // Get position and drill mode from URL params
  const initialPosition = parseInt(searchParams.get('position') || String(exercise?.defaultPosition || 1), 10);
  const isDrillMode = searchParams.get('drill') === 'true' && !!exercise?.drill;
  
  // Drill state
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [positionTimeRemaining, setPositionTimeRemaining] = useState<number | null>(null);
  
  const drillPositions = useMemo(() => {
    if (!isDrillMode || !exercise?.drill) return [initialPosition];
    return getDrillPositions(exercise.drill);
  }, [isDrillMode, exercise?.drill, initialPosition]);
  
  const currentPosition = isDrillMode ? drillPositions[currentPositionIndex] : initialPosition;
  const positionsCompleted = useMemo(() => 
    drillPositions.slice(0, currentPositionIndex), 
    [drillPositions, currentPositionIndex]
  );
  
  // Get the strings used in this pattern (in order they appear)
  const patternStrings = useMemo(() => {
    if (!exercise?.pattern) return [6, 5, 4, 3, 2, 1]; // default all strings
    const strings: number[] = [];
    for (const [string] of exercise.pattern) {
      if (!strings.includes(string)) {
        strings.push(string);
      }
    }
    return strings;
  }, [exercise?.pattern]);
  
  // Get current strings order based on direction (may be reversed for descending)
  const currentStringsOrder = useMemo(() => {
    if (!isDrillMode || !exercise?.drill) return patternStrings;
    const shouldReverse = shouldReversePattern(exercise.drill, currentPositionIndex);
    return shouldReverse ? [...patternStrings].reverse() : patternStrings;
  }, [isDrillMode, exercise?.drill, currentPositionIndex, patternStrings]);
  
  const totalStrings = currentStringsOrder.length;
  
  // Calculate position duration based on BPM and total notes
  // Assuming 16th notes: each note = (60 / BPM) / 4 seconds
  const positionDurationMs = useMemo(() => {
    if (!exercise?.pattern || !exercise.bpm) return 5000; // fallback 5 seconds
    const noteCount = exercise.pattern.length;
    const beatDuration = 60 / exercise.bpm; // seconds per beat
    const noteDuration = beatDuration / 4; // 16th note duration
    const totalSeconds = noteCount * noteDuration;
    // Add a small buffer for position transition
    return Math.round((totalSeconds + 0.5) * 1000);
  }, [exercise?.pattern, exercise?.bpm]);
  
  // Calculate current string index based on time elapsed within position
  const currentStringIndex = useMemo(() => {
    if (positionTimeRemaining === null || positionDurationMs === 0) return 0;
    const elapsed = positionDurationMs - positionTimeRemaining;
    const timePerString = positionDurationMs / totalStrings;
    const index = Math.floor(elapsed / timePerString);
    return Math.min(index, totalStrings - 1);
  }, [positionTimeRemaining, positionDurationMs, totalStrings]);
  
  const currentString = currentStringsOrder[currentStringIndex] || currentStringsOrder[0];
  
  // Generate dynamic tablature
  const displayTab = useMemo(() => {
    if (!exercise) return '';
    if (!exercise.moveable || !exercise.pattern) {
      return exercise.tablature || '';
    }
    
    // In drill mode with alternate direction, we may need to reverse STRING ORDER
    // (not the fret pattern - that stays 1-2-3-4 on each string)
    let pattern = exercise.pattern;
    if (isDrillMode && exercise.drill) {
      pattern = getPatternAtPosition(exercise.pattern, exercise.drill, currentPositionIndex);
    }
    
    const tab = generateTablature(pattern, currentPosition);
    console.log('[PracticePage] Tab generation:', {
      isDrillMode,
      currentPositionIndex,
      currentPosition,
      patternFirst4: pattern.slice(0, 4),
      tabPreview: tab.split('\n')[0]
    });
    return tab;
  }, [exercise, currentPosition, currentPositionIndex, isDrillMode]);
  const { analyser, isActive, startEngine, stopEngine, error, audioContext } = useAudioEngine();
  const { pitch, note, bpm, detectedNotes, calculateAccuracy, reset: resetAnalysis } = useAudioAnalysis(
    analyser,
    audioContext,
    isActive
  );
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
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
  
  // Auto-advance timer for drill mode - advances through positions
  useEffect(() => {
    // Only run in drill mode, when session is active
    if (!isDrillMode || !sessionStartTime || countdown !== null) {
      return;
    }
    
    const isLastPosition = currentPositionIndex >= drillPositions.length - 1;
    
    // If we're on the last position, let timer run to completion but don't advance
    if (isLastPosition) {
      // Still run timer for string highlighting on last position
      setPositionTimeRemaining(positionDurationMs);
      
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, positionDurationMs - elapsed);
        setPositionTimeRemaining(remaining);
        
        if (remaining <= 0) {
          clearInterval(interval);
          setPositionTimeRemaining(null);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
    
    // Start countdown for this position
    setPositionTimeRemaining(positionDurationMs);
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, positionDurationMs - elapsed);
      setPositionTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        // Move to next position
        setCurrentPositionIndex(prev => prev + 1);
      }
    }, 100); // Update every 100ms for smooth progress
    
    return () => clearInterval(interval);
  }, [isDrillMode, sessionStartTime, countdown, currentPositionIndex, drillPositions.length, positionDurationMs]);
  const handleStart = async () => {
    await startEngine();
    resetAnalysis(); // Reset audio analysis state
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
  // Handle advancing to next position in drill mode
  const handleNextPosition = () => {
    if (currentPositionIndex < drillPositions.length - 1) {
      setCurrentPositionIndex(prev => prev + 1);
      toast.success(`Moving to position ${drillPositions[currentPositionIndex + 1]}`);
    }
  };
  
  const handleFinish = () => {
    stopEngine();
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;

    // Parse tablature to get expected notes
    const expectedNotes = parseTablature(displayTab, exercise!.bpm);

    // Calculate real accuracy using tablature parser
    const calculatedAccuracy = calculateAccuracy(expectedNotes);

    console.log('[Practice Session]', {
      duration,
      detectedNotes: detectedNotes.length,
      expectedNotes: expectedNotes.length,
      accuracy: calculatedAccuracy,
      bpm,
      position: currentPosition,
      drillMode: isDrillMode,
      positionsCompleted: isDrillMode ? [...positionsCompleted, currentPosition] : undefined
    });

    sessionMutation.mutate({
      userId: 'u1',
      exerciseId: id!,
      duration,
      accuracy: calculatedAccuracy,
      achievedBpm: bpm || exercise?.bpm || 120,
      position: currentPosition,
      drillMode: isDrillMode,
      positionsCompleted: isDrillMode ? [...positionsCompleted, currentPosition] : undefined
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
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground uppercase">
              <span>{exercise.difficulty}</span>
              <span>•</span>
              <span>{exercise.bpm} BPM</span>
              {exercise.moveable && (
                <>
                  <span>•</span>
                  <span className="text-orange-500">Fret {currentPosition}</span>
                </>
              )}
              {isDrillMode && (
                <Badge variant="outline" className="ml-2 text-[10px] border-violet-500/50 text-violet-400">
                  <Repeat className="h-2.5 w-2.5 mr-1" />
                  {currentPositionIndex + 1}/{drillPositions.length}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {sessionStartTime && bpm && (
              <div className="hidden sm:block text-orange-500 font-mono text-sm font-bold">
                DETECTED: {bpm} BPM
              </div>
            )}
            {sessionStartTime && note && (
              <div className="hidden md:block text-violet-400 font-mono text-sm font-bold">
                NOTE: {note}
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => toast.info(exercise.description)}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col p-6 gap-4">
            <div className="relative flex-1 min-h-0 rounded-3xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-center overflow-hidden">
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
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Reference Tab
                  {exercise.moveable && (
                    <span className="text-orange-500 ml-2">(Position {currentPosition})</span>
                  )}
                </h3>
                {isDrillMode && exercise.drill?.direction === 'alternate' && (
                  <Badge variant="outline" className="text-[10px] border-zinc-700">
                    {shouldReversePattern(exercise.drill, currentPositionIndex) ? '↓ Descending' : '↑ Ascending'}
                  </Badge>
                )}
              </div>
              <TabViewer 
                tabString={displayTab} 
                variant="compact"
                highlightString={isDrillMode && sessionStartTime ? currentString : undefined}
                completedStrings={isDrillMode && sessionStartTime ? currentStringsOrder.slice(0, currentStringIndex) : undefined}
              />
            </div>
          </div>
          <div className="w-full md:w-96 border-l border-zinc-800 p-6 flex flex-col bg-zinc-950">
            <div className="flex-shrink-0">
              <Metronome initialBpm={exercise.bpm} />
            </div>
            <div className="mt-auto pt-6 space-y-3 flex-shrink-0">
              {/* Drill mode position progress */}
              {isDrillMode && sessionStartTime && (
                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Drill Progress</span>
                    <span>{currentPositionIndex + 1} of {drillPositions.length}</span>
                  </div>
                  
                  {/* Overall drill progress */}
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${((currentPositionIndex + 1) / drillPositions.length) * 100}%` }}
                    />
                  </div>
                  
                  {/* Current position timer */}
                  {positionTimeRemaining !== null && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Position {currentPosition}</span>
                        <span>{Math.ceil(positionTimeRemaining / 1000)}s</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500 transition-all duration-100"
                          style={{ width: `${(positionTimeRemaining / positionDurationMs) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* String indicators for current position */}
                  <div className="flex gap-1 mb-3">
                    {currentStringsOrder.map((stringNum, idx) => {
                      const stringNames = ['', 'e', 'B', 'G', 'D', 'A', 'E'];
                      return (
                        <span 
                          key={stringNum}
                          className={`flex-1 h-6 flex items-center justify-center rounded text-[10px] font-mono transition-all ${
                            idx < currentStringIndex 
                              ? 'bg-green-500/20 text-green-400'
                              : idx === currentStringIndex
                                ? 'bg-violet-500 text-white'
                                : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {stringNames[stringNum]}
                        </span>
                      );
                    })}
                  </div>
                  
                  {/* Position indicators */}
                  <div className="flex flex-wrap gap-1">
                    {drillPositions.map((pos, idx) => (
                      <span 
                        key={pos}
                        className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-mono transition-all ${
                          idx < currentPositionIndex 
                            ? 'bg-green-500/20 text-green-400'
                            : idx === currentPositionIndex
                              ? 'bg-orange-500 text-white scale-110'
                              : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                  
                  {/* Drill complete message */}
                  {currentPositionIndex >= drillPositions.length - 1 && positionTimeRemaining === null && (
                    <div className="mt-3 text-center text-sm text-green-400 font-medium">
                      Drill complete! Tap Finish to save.
                    </div>
                  )}
                </div>
              )}
              
              {/* Skip to next position button (optional, for skipping ahead) */}
              {isDrillMode && sessionStartTime && currentPositionIndex < drillPositions.length - 1 && (
                <Button
                  onClick={handleNextPosition}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-violet-400"
                >
                  <MoveHorizontal className="mr-1 h-3 w-3" />
                  Skip to Fret {drillPositions[currentPositionIndex + 1]}
                </Button>
              )}
              
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