import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SEED_EXERCISES } from '@shared/mock-data';
import { Button } from '@/components/ui/button';
import { TabViewer } from '@/components/ui/tab-viewer';
import { Badge } from '@/components/ui/badge';
import { Play, ChevronLeft, Clock, Zap, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
export function ExerciseDetailPage() {
  const { id } = useParams();
  const exercise = SEED_EXERCISES.find(e => e.id === id);
  if (!exercise) return (
    <AppLayout container>
      <div className="text-center py-20">Exercise not found.</div>
    </AppLayout>
  );
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
        <Link to="/library" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Library
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">{exercise.difficulty}</Badge>
              <Badge variant="secondary">{exercise.category}</Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{exercise.title}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">{exercise.description}</p>
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs uppercase text-muted-foreground font-semibold">Suggested Tempo</div>
                  <div className="text-sm font-medium">{exercise.bpm} BPM</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs uppercase text-muted-foreground font-semibold">Intensity</div>
                  <div className="text-sm font-medium">Medium-High</div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <Button size="lg" className="btn-gradient w-full md:w-64 h-16 text-lg font-bold" asChild>
              <Link to={`/practice/${exercise.id}`}>
                <Play className="mr-3 h-6 w-6 fill-current" /> Start Practice
              </Link>
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-500" />
            Tablature
          </h2>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0 overflow-x-auto">
              <TabViewer tabString={exercise.tablature} />
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
            <h3 className="font-semibold text-lg">Pro Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Keep your fingers close to the fretboard to minimize movement.</li>
              <li>Use a metronome and start at 50% speed.</li>
              <li>Focus on clean articulation before increasing speed.</li>
            </ul>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
            <h3 className="font-semibold text-lg">Goal Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accuracy Threshold</span>
                <span className="font-medium text-foreground">95%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full">
                <div className="h-full bg-orange-500 w-[95%]" />
              </div>
              <p className="text-xs text-muted-foreground italic">
                * Mastery is achieved when you play this perfectly 3 times in a row at target tempo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}