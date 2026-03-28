import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import {
  CheckCircle2, ChevronRight, Mic, MicOff, Loader2,
  Zap, Music2, Fingerprint, Waves, Activity, BookOpen, GitBranch, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { useAudioAnalysis } from '@/hooks/use-audio-analysis';
import { Visualizer } from '@/components/practice/Visualizer';
import type { SkillProfile } from '@shared/types';
import type { Note } from '@/lib/ml';

// ─── Goal Options ─────────────────────────────────────────────────────────────
const GOALS = [
  { id: 'speed', label: 'Speed & Shredding', icon: Zap, color: 'text-orange-400' },
  { id: 'rhythm', label: 'Rhythm & Timing', icon: Music2, color: 'text-blue-400' },
  { id: 'finger_independence', label: 'Finger Independence', icon: Fingerprint, color: 'text-violet-400' },
  { id: 'legato', label: 'Legato & Hammer-ons', icon: Waves, color: 'text-green-400' },
  { id: 'bending', label: 'Bending & Vibrato', icon: Activity, color: 'text-yellow-400' },
  { id: 'theory', label: 'Music Theory', icon: BookOpen, color: 'text-cyan-400' },
  { id: 'chords', label: 'Chord Transitions', icon: GitBranch, color: 'text-pink-400' },
  { id: 'improv', label: 'Improvisation', icon: Sparkles, color: 'text-amber-400' },
] as const;

// ─── Listening Tests ───────────────────────────────────────────────────────────
interface TestConfig {
  id: string;
  title: string;
  instruction: string;
  tip: string;
  duration: number; // seconds
}

const TESTS: TestConfig[] = [
  {
    id: 'timing',
    title: 'Timing Check',
    instruction: 'Play any single note repeatedly in time — aim for a steady beat at roughly 80 BPM.',
    tip: 'Tap your foot or nod your head to keep time. The app is listening for how consistent your rhythm is.',
    duration: 20,
  },
  {
    id: 'chromatic',
    title: 'Chromatic Run',
    instruction: 'Play frets 5–6–7–8 across all six strings, one note at a time — up and back down.',
    tip: 'Go as cleanly as you can. Speed doesn\'t matter here — precision does. Use one finger per fret.',
    duration: 25,
  },
  {
    id: 'freeform',
    title: 'Free Play',
    instruction: 'Play whatever feels natural for 15 seconds. Improvise, solo, strum — just play.',
    tip: 'Don\'t overthink it. Play like nobody\'s watching. This shows us your natural style.',
    duration: 15,
  },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────
function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function scoreRhythm(notes: Note[]): number {
  if (notes.length < 4) return 25;
  const intervals: number[] = [];
  for (let i = 1; i < notes.length; i++) {
    intervals.push(notes[i].timestamp - notes[i - 1].timestamp);
  }
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const stdDev = Math.sqrt(intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length);
  // stdDev of 0 = perfect (100), 300ms = poor (0)
  return clamp(Math.round(100 - stdDev / 3));
}

function avgConfidence(notes: Note[]): number {
  if (notes.length === 0) return 20;
  return clamp(Math.round((notes.reduce((a, b) => a + b.confidence, 0) / notes.length) * 100));
}

function scoreSpeed(notes: Note[], duration: number): number {
  if (duration === 0 || notes.length === 0) return 15;
  // Guitar notes per second: ~1.5 = beginner, 4 = intermediate, 8+ = advanced
  return clamp(Math.round((notes.length / duration) * 12));
}

function scorePitchRange(notes: Note[]): number {
  const classes = new Set(notes.map(n => n.note?.replace(/\d+/g, '') || '').filter(Boolean));
  return clamp(Math.round((classes.size / 12) * 100));
}

function scoreOscillation(notes: Note[]): number {
  // Counts pitch direction reversals — a proxy for vibrato/bending presence
  if (notes.length < 6) return 20;
  let reversals = 0;
  let prevDir: 1 | -1 | 0 = 0;
  for (let i = 1; i < notes.length; i++) {
    if (!notes[i].pitch || !notes[i - 1].pitch) continue;
    const dir = notes[i].pitch! > notes[i - 1].pitch! ? 1 : notes[i].pitch! < notes[i - 1].pitch! ? -1 : 0;
    if (dir !== 0 && prevDir !== 0 && dir !== prevDir) reversals++;
    if (dir !== 0) prevDir = dir;
  }
  return clamp(reversals * 6);
}

function computeSkillProfile(
  timingNotes: Note[],
  chromaticNotes: Note[],
  freeformNotes: Note[],
  chromaticDuration: number,
): SkillProfile {
  const rhythm = scoreRhythm(timingNotes);
  const fingerScore = avgConfidence(chromaticNotes);
  const speedScore = scoreSpeed(chromaticNotes, chromaticDuration);
  const rangeScore = scorePitchRange(freeformNotes);
  const oscillation = scoreOscillation(freeformNotes);

  return {
    rhythm,
    alternatePicking: clamp(Math.round((fingerScore + speedScore) / 2)),
    legato: fingerScore,
    tapping: 0,       // requires dedicated tapping test — not assessable here
    sweepPicking: 0,  // requires dedicated sweep test — not assessable here
    bending: oscillation,
    vibrato: clamp(Math.round((oscillation + fingerScore) / 2)),
    theory: rangeScore,
  };
}

// ─── Phase Types ──────────────────────────────────────────────────────────────
type Phase = 'welcome' | 'goals' | 'test' | 'results';
type TestState = 'idle' | 'countdown' | 'recording' | 'done';

interface CapturedTest {
  notes: Note[];
  bpm: number | null;
  duration: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-xl mx-auto text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 mx-auto">
          <Mic className="w-8 h-8 text-orange-400" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">Let's hear you play</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          We'll listen to you play three short exercises and automatically measure your skill levels. No self-rating — just play.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: 'Tests', value: '3' },
          { label: 'Total time', value: '~2 min' },
          { label: 'Self-rating required', value: 'None' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-2xl font-bold text-orange-400">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <Button size="lg" className="btn-gradient h-14 text-lg px-12" onClick={onNext}>
        Get Started <ChevronRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
}

function GoalsStep({ onNext }: { onNext: (goals: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">What do you want to work on?</h2>
        <p className="text-muted-foreground">Pick everything that applies. This shapes your roadmap recommendations.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {GOALS.map(({ id, label, icon: Icon, color }) => {
          const active = selected.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                active
                  ? 'border-orange-500/60 bg-orange-500/10'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-orange-400' : color}`} />
              <span className={`text-xs font-medium block ${active ? 'text-white' : 'text-zinc-300'}`}>{label}</span>
            </button>
          );
        })}
      </div>
      <Button
        size="lg"
        className="btn-gradient h-14 text-lg px-12"
        onClick={() => onNext(selected)}
        disabled={selected.length === 0}
      >
        Next — Listening Tests <ChevronRight className="ml-2 w-5 h-5" />
      </Button>
      {selected.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">Select at least one goal to continue.</p>
      )}
    </div>
  );
}

function ListeningTest({
  test,
  testIndex,
  totalTests,
  analyser,
  audioContext,
  isEngineActive,
  onStartEngine,
  detectedNotes,
  bpm,
  confidence,
  note,
  onReset,
  onComplete,
}: {
  test: TestConfig;
  testIndex: number;
  totalTests: number;
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
  isEngineActive: boolean;
  onStartEngine: () => Promise<void>;
  detectedNotes: Note[];
  bpm: number | null;
  confidence: number;
  note: string | null;
  onReset: () => void;
  onComplete: (data: CapturedTest) => void;
}) {
  const [testState, setTestState] = useState<TestState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(test.duration);
  const startTimeRef = useRef<number | null>(null);
  const notesSnapshotRef = useRef<Note[]>([]);
  const detectedNotesRef = useRef(detectedNotes);
  detectedNotesRef.current = detectedNotes;

  const handleStart = async () => {
    onReset();
    if (!isEngineActive) {
      await onStartEngine();
    }
    setTestState('countdown');
    setCountdown(3);
    setTimeLeft(test.duration);
  };

  // Countdown 3-2-1
  useEffect(() => {
    if (testState !== 'countdown') return;
    if (countdown <= 0) {
      setTestState('recording');
      startTimeRef.current = Date.now();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [testState, countdown]);

  // Recording timer
  useEffect(() => {
    if (testState !== 'recording') return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - (startTimeRef.current || Date.now())) / 1000;
      const remaining = Math.max(0, test.duration - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        notesSnapshotRef.current = [...detectedNotesRef.current];
        setTestState('done');
      }
    }, 100);
    return () => clearInterval(interval);
  }, [testState, test.duration]);

  const handleSubmit = () => {
    onComplete({
      notes: notesSnapshotRef.current,
      bpm,
      duration: test.duration,
    });
  };

  const progressPct = ((test.duration - timeLeft) / test.duration) * 100;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-orange-400 font-semibold">Test {testIndex + 1} of {totalTests}</span>
        <span>—</span>
        <span>{test.title}</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{test.instruction}</h2>
        <p className="text-sm text-muted-foreground italic">{test.tip}</p>
      </div>

      {/* Visualizer + Status */}
      <div className="relative rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden" style={{ height: 180 }}>
        {isEngineActive ? (
          <>
            <Visualizer analyser={analyser} className="w-full h-full opacity-50" />
            {testState === 'countdown' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <span className="text-8xl font-black text-orange-500">{countdown}</span>
              </div>
            )}
            {testState === 'recording' && (
              <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/20">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                REC
              </div>
            )}
            {testState === 'done' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
                  <p className="text-green-400 font-semibold">{notesSnapshotRef.current.length} notes captured</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <MicOff className="w-8 h-8" />
            <span className="text-sm">Microphone not active</span>
          </div>
        )}
      </div>

      {/* Timer bar */}
      {(testState === 'recording' || testState === 'countdown') && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{testState === 'countdown' ? 'Starting...' : 'Recording'}</span>
            <span>{Math.ceil(timeLeft)}s remaining</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-100"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Live stats during recording */}
      {testState === 'recording' && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-center">
            <div className="text-lg font-bold text-orange-400">{detectedNotes.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Notes</div>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-center">
            <div className="text-lg font-bold text-violet-400">{note || '—'}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Current</div>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-center">
            <div className="text-lg font-bold text-blue-400">{bpm ? `${bpm}` : '—'}</div>
            <div className="text-[10px] text-muted-foreground uppercase">BPM</div>
          </div>
        </div>
      )}

      {/* Action button */}
      {testState === 'idle' && (
        <Button size="lg" className="w-full h-14 btn-gradient text-lg" onClick={handleStart}>
          <Mic className="mr-2 w-5 h-5" /> Start Test
        </Button>
      )}
      {testState === 'done' && (
        <Button size="lg" className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg" onClick={handleSubmit}>
          <CheckCircle2 className="mr-2 w-5 h-5" />
          {testIndex + 1 < totalTests ? 'Next Test' : 'See My Results'}
        </Button>
      )}
    </div>
  );
}

function ResultsStep({
  profile,
  goals,
  isPending,
  onSave,
}: {
  profile: SkillProfile;
  goals: string[];
  isPending: boolean;
  onSave: () => void;
}) {
  const SKILL_LABELS: Record<keyof SkillProfile, string> = {
    alternatePicking: 'Alternate Picking',
    sweepPicking: 'Sweep Picking',
    legato: 'Legato',
    tapping: 'Tapping',
    rhythm: 'Rhythm',
    bending: 'Bending',
    vibrato: 'Vibrato',
    theory: 'Theory',
  };

  const radarData = Object.entries(SKILL_LABELS).map(([key, label]) => ({
    subject: label,
    A: profile[key as keyof SkillProfile],
    fullMark: 100,
  }));

  const sorted = Object.entries(profile).sort(([, a], [, b]) => b - a);
  const strongest = SKILL_LABELS[sorted[0][0] as keyof SkillProfile];
  const weakest = SKILL_LABELS[sorted[sorted.length - 1][0] as keyof SkillProfile];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
        <h2 className="text-4xl font-black tracking-tight">Your Guitar Profile</h2>
        <p className="text-muted-foreground text-lg">Based on what we heard — no guessing, just your actual playing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-0 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                <Radar name="Skills" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            {Object.entries(SKILL_LABELS).map(([key, label]) => {
              const val = profile[key as keyof SkillProfile];
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300">{label}</span>
                    <span className="font-mono text-orange-400">{val}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="text-xs font-semibold text-orange-500 mb-1">Strongest</div>
              <div className="font-bold text-sm">{strongest}</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="text-xs font-semibold text-orange-500 mb-1">Focus Area</div>
              <div className="font-bold text-sm">{weakest}</div>
            </div>
          </div>

          {goals.length > 0 && (
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="text-xs font-semibold text-orange-500 mb-2">Your Goals</div>
              <div className="flex flex-wrap gap-1.5">
                {goals.map(g => {
                  const goal = GOALS.find(x => x.id === g);
                  return goal ? (
                    <Badge key={g} variant="outline" className="text-[10px] border-zinc-700 text-zinc-300">
                      {goal.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full btn-gradient h-12 font-bold"
            onClick={onSave}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            Save Profile & Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AssessmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [testResults, setTestResults] = useState<CapturedTest[]>([]);
  const [computedProfile, setComputedProfile] = useState<SkillProfile | null>(null);

  const { analyser, audioContext, isActive, startEngine, error } = useAudioEngine();
  const { detectedNotes, bpm, note, confidence, reset: resetAnalysis } = useAudioAnalysis(
    analyser, audioContext, isActive
  );

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const saveMutation = useMutation({
    mutationFn: (data: { skillProfile: SkillProfile; goals: string[] }) =>
      api('/api/user/assessment', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user/profile'] });
      navigate('/');
      toast.success('Profile saved! Roadmaps unlocked.');
    },
    onError: () => toast.error('Failed to save profile'),
  });

  const handleGoals = (goals: string[]) => {
    setSelectedGoals(goals);
    setPhase('test');
  };

  const handleTestComplete = useCallback((data: CapturedTest) => {
    const newResults = [...testResults, data];
    setTestResults(newResults);

    if (testIndex + 1 < TESTS.length) {
      setTestIndex(i => i + 1);
      resetAnalysis();
    } else {
      // All tests done — compute profile
      const [t1, t2, t3] = newResults;
      const profile = computeSkillProfile(
        t1?.notes || [],
        t2?.notes || [],
        t3?.notes || [],
        t2?.duration || TESTS[1].duration,
      );
      setComputedProfile(profile);
      setPhase('results');
    }
  }, [testResults, testIndex, resetAnalysis]);

  const handleSave = () => {
    if (!computedProfile) return;
    saveMutation.mutate({ skillProfile: computedProfile, goals: selectedGoals });
  };

  return (
    <AppLayout container>
      <div className="py-8">
        {/* Progress dots */}
        {phase !== 'welcome' && (
          <div className="flex justify-center gap-2 mb-10">
            {(['goals', 'test', 'results'] as const).map((p, i) => (
              <div
                key={p}
                className={`h-1.5 rounded-full transition-all ${
                  phase === p ? 'w-8 bg-orange-500' :
                  i < (['goals', 'test', 'results'] as const).indexOf(phase) ? 'w-4 bg-orange-500/40' :
                  'w-4 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        )}

        {phase === 'welcome' && <WelcomeStep onNext={() => setPhase('goals')} />}

        {phase === 'goals' && <GoalsStep onNext={handleGoals} />}

        {phase === 'test' && (
          <ListeningTest
            key={testIndex}
            test={TESTS[testIndex]}
            testIndex={testIndex}
            totalTests={TESTS.length}
            analyser={analyser}
            audioContext={audioContext}
            isEngineActive={isActive}
            onStartEngine={startEngine}
            detectedNotes={detectedNotes}
            bpm={bpm}
            confidence={confidence}
            note={note}
            onReset={resetAnalysis}
            onComplete={handleTestComplete}
          />
        )}

        {phase === 'results' && computedProfile && (
          <ResultsStep
            profile={computedProfile}
            goals={selectedGoals}
            isPending={saveMutation.isPending}
            onSave={handleSave}
          />
        )}
      </div>
    </AppLayout>
  );
}
