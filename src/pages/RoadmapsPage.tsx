import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Roadmap, RoadmapWeek } from '@shared/types';
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
} from 'lucide-react';

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  Intermediate: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function WeekCard({ week }: { week: RoadmapWeek }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">
          {week.weekNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">Week {week.weekNumber}: {week.title}</span>
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
        </div>
      )}
    </div>
  );
}

function RoadmapCard({ roadmap }: { roadmap: Roadmap }) {
  const [expanded, setExpanded] = useState(false);

  const totalExercises = roadmap.weeks.reduce((s, w) => s + w.exercises.length, 0);
  const totalMinutes = roadmap.weeks.reduce(
    (sum, w) => sum + w.exercises.reduce((s, e) => s + e.durationMinutes, 0),
    0
  );

  return (
    <Card className="bg-zinc-900/40 border-zinc-800 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Map className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{roadmap.title}</CardTitle>
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
            <span className="font-medium text-zinc-400">0 / {roadmap.durationWeeks} weeks</span>
          </div>
          <Progress value={0} className="h-1.5" />
        </div>

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
            {roadmap.weeks.map((week) => (
              <WeekCard key={week.weekNumber} week={week} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RoadmapsPage() {
  const { data: roadmaps = [], isLoading } = useQuery<Roadmap[]>({
    queryKey: ['roadmaps'],
    queryFn: () => api('/api/roadmaps'),
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
              <RoadmapCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
