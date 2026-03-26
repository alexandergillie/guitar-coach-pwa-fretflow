import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Roadmap, RoadmapWeek, User } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Compass,
  Map,
  ChevronDown,
  ChevronRight,
  Target,
  Clock,
  BookOpen,
  Trophy,
  Lightbulb,
  CalendarDays,
  Dumbbell,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  Intermediate: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function WeekCard({
  week,
  isActive,
  isCompleted,
  isCurrent,
  onCompleteWeek,
  isPending,
}: {
  week: RoadmapWeek;
  isActive: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  onCompleteWeek: () => void;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = useState(isCurrent);

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${
      isCompleted ? 'border-green-500/30 bg-green-500/5' :
      isCurrent ? 'border-orange-500/40 bg-orange-500/5' :
      'border-zinc-800'
    }`}>
      <button
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-zinc-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
          isCompleted
            ? 'bg-green-500/20 border-green-500/40 text-green-400'
            : isCurrent
              ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
        }`}>
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : week.weekNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">Week {week.weekNumber}: {week.title}</span>
            {isCurrent && (
              <Badge variant="outline" className="text-[10px] px-2 py-0 border-orange-500/40 text-orange-400">
                Current
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-2 py-0 border-zinc-700 text-zinc-400">
              <Clock className="w-3 h-3 mr-1" />{week.targetBpmRange}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{week.focus}</p>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 p-4 space-y-4 bg-zinc-950/50">
          {/* Theory bite */}
          <div className="flex gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-yellow-400 uppercase tracking-wider mb-1">Theory Bite</p>
              <p className="text-xs text-zinc-300 leading-relaxed">{week.theoryBite}</p>
            </div>
          </div>

          {/* Exercise list */}
          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Exercises</h4>
            <div className="space-y-2">
              {week.exercises.map((ex, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{ex.name}</span>
                      {ex.targetBpm && (
                        <span className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-1.5 py-0.5 rounded">
                          {ex.targetBpm}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ex.description}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 text-[10px] text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {ex.durationMinutes}m
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theory homework */}
          {week.theoryHomework && (
            <div className="flex gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Theory Homework</p>
                <p className="text-xs text-zinc-300 leading-relaxed">{week.theoryHomework}</p>
              </div>
            </div>
          )}

          {/* Milestone */}
          <div className="flex gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <Trophy className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-green-400 uppercase tracking-wider mb-1">Week Milestone</p>
              <p className="text-xs text-zinc-300 leading-relaxed">{week.milestone}</p>
            </div>
          </div>

          {/* Complete week button */}
          {isActive && isCurrent && (
            <Button
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={(e) => { e.stopPropagation(); onCompleteWeek(); }}
              disabled={isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark Week {week.weekNumber} Complete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function RoadmapCard({
  roadmap,
  user,
  onStart,
  onCompleteWeek,
  isStartPending,
  isCompletePending,
}: {
  roadmap: Roadmap;
  user?: User;
  onStart: (id: string) => void;
  onCompleteWeek: (id: string) => void;
  isStartPending: boolean;
  isCompletePending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const isActive = user?.activeRoadmapId === roadmap.id;
  const weeksCompleted = user?.roadmapProgress?.[roadmap.id] ?? 0;
  const progressPct = (weeksCompleted / roadmap.durationWeeks) * 100;
  const isFinished = weeksCompleted >= roadmap.durationWeeks;
  const currentWeekNumber = weeksCompleted + 1;

  const totalExercises = roadmap.weeks.reduce((s, w) => s + w.exercises.length, 0);
  const totalMinutes = roadmap.weeks.reduce(
    (sum, w) => sum + w.exercises.reduce((s, e) => s + e.durationMinutes, 0),
    0
  );

  return (
    <Card className={`bg-zinc-900/40 border-zinc-800 overflow-hidden transition-colors ${isActive ? 'border-orange-500/40' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${isActive ? 'bg-orange-500/20 border-orange-500/40' : 'bg-orange-500/10 border-orange-500/20'}`}>
              <Map className={`w-5 h-5 ${isActive ? 'text-orange-400' : 'text-orange-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                {isActive && !isFinished && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/20">
                    Active
                  </Badge>
                )}
                {isFinished && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{roadmap.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={DIFFICULTY_COLORS[roadmap.difficulty]}>
              {roadmap.difficulty}
            </Badge>
            {roadmap.theoryFocus && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                <BookOpen className="w-3 h-3 mr-1" /> Theory
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50">
            <CalendarDays className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-[10px] text-muted-foreground">Duration</p>
              <p className="text-sm font-semibold">{roadmap.durationWeeks} weeks</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50">
            <Clock className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-[10px] text-muted-foreground">Per session</p>
              <p className="text-sm font-semibold">{roadmap.timePerSessionMinutes} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50">
            <Dumbbell className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-[10px] text-muted-foreground">Exercises</p>
              <p className="text-sm font-semibold">{totalExercises} total</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50">
            <Target className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-[10px] text-muted-foreground">Practice time</p>
              <p className="text-sm font-semibold">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
            </div>
          </div>
        </div>

        {/* Techniques */}
        <div className="flex items-center gap-2 flex-wrap">
          {roadmap.targetTechniques.map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 bg-zinc-800/30">
              {t.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>

        {/* Approach */}
        <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/50">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">The Approach</p>
          <p className="text-xs text-zinc-300 leading-relaxed">{roadmap.approach}</p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-zinc-400">{weeksCompleted} / {roadmap.durationWeeks} weeks</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>

        {/* Action button */}
        {!isActive && !isFinished && (
          <Button
            className="w-full btn-gradient"
            size="sm"
            onClick={() => onStart(roadmap.id)}
            disabled={isStartPending}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Roadmap
          </Button>
        )}

        {/* Weekly breakdown toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-9 text-xs hover:bg-orange-500/10 hover:text-orange-400 border border-zinc-800"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronDown className="w-3 h-3 mr-2" /> Hide weekly breakdown
            </>
          ) : (
            <>
              <ChevronRight className="w-3 h-3 mr-2" /> View {roadmap.durationWeeks}-week breakdown
            </>
          )}
        </Button>

        {expanded && (
          <div className="space-y-2 pt-1">
            {roadmap.weeks.map((week) => {
              const done = week.weekNumber <= weeksCompleted;
              const current = isActive && !isFinished && week.weekNumber === currentWeekNumber;
              return (
                <WeekCard
                  key={week.weekNumber}
                  week={week}
                  isActive={isActive}
                  isCompleted={done}
                  isCurrent={current}
                  onCompleteWeek={() => onCompleteWeek(roadmap.id)}
                  isPending={isCompletePending}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RoadmapsPage() {
  const queryClient = useQueryClient();

  const { data: roadmaps = [], isLoading } = useQuery<Roadmap[]>({
    queryKey: ['roadmaps'],
    queryFn: () => api('/api/roadmaps'),
  });

  const { data: user } = useQuery<User>({
    queryKey: ['user/profile'],
    queryFn: () => api('/api/user/profile'),
  });

  const startMutation = useMutation({
    mutationFn: (roadmapId: string) => api(`/api/roadmaps/${roadmapId}/start`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user/profile'] });
      toast.success('Roadmap started! Work through it week by week.');
    },
    onError: () => toast.error('Failed to start roadmap'),
  });

  const completeMutation = useMutation({
    mutationFn: (roadmapId: string) => api(`/api/roadmaps/${roadmapId}/week/complete`, { method: 'POST' }),
    onSuccess: (updatedUser: User) => {
      queryClient.invalidateQueries({ queryKey: ['user/profile'] });
      const active = updatedUser.activeRoadmapId;
      const completed = active ? (updatedUser.roadmapProgress?.[active] ?? 0) : 0;
      const roadmap = roadmaps.find(r => r.id === active);
      if (roadmap && completed >= roadmap.durationWeeks) {
        toast.success('Roadmap complete! Amazing work.');
      } else {
        toast.success(`Week ${completed} complete! Keep it up.`);
      }
    },
    onError: () => toast.error('Failed to mark week complete'),
  });

  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Roadmaps</h1>
            <p className="text-muted-foreground">
              Curated multi-week programs to build technique systematically.
            </p>
          </div>
          <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/10 border-orange-500/20 px-4 py-1">
            <Compass className="w-4 h-4 mr-2" /> {roadmaps.length} paths available
          </Badge>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-zinc-800/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {roadmaps.map((roadmap) => (
              <RoadmapCard
                key={roadmap.id}
                roadmap={roadmap}
                user={user}
                onStart={(id) => startMutation.mutate(id)}
                onCompleteWeek={(id) => completeMutation.mutate(id)}
                isStartPending={startMutation.isPending}
                isCompletePending={completeMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
