import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Roadmap, PracticeSession, Exercise } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Compass, CheckCircle2, ChevronRight, Lock, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
export function RoadmapsPage() {
  const { data: roadmaps = [] } = useQuery<Roadmap[]>({ queryKey: ['roadmaps'], queryFn: () => api('/api/roadmaps') });
  const { data: sessions = [] } = useQuery<PracticeSession[]>({ queryKey: ['sessions'], queryFn: () => api('/api/sessions') });
  const { data: exercises = [] } = useQuery<Exercise[]>({ queryKey: ['exercises'], queryFn: () => api('/api/exercises') });
  const getRoadmapProgress = (roadmap: Roadmap) => {
    const completedSteps = roadmap.steps.filter(step => 
      sessions.some(s => s.exerciseId === step.exerciseId && s.achievedBpm >= step.targetBpm)
    );
    return Math.round((completedSteps.length / roadmap.steps.length) * 100);
  };
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Roadmaps</h1>
            <p className="text-muted-foreground">Curated paths to guide you from basics to mastery.</p>
          </div>
          <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/10 border-orange-500/20 px-4 py-1">
            <Compass className="w-4 h-4 mr-2" /> 2 Active Paths
          </Badge>
        </header>
        <div className="grid grid-cols-1 gap-6">
          {roadmaps.map((roadmap) => {
            const progress = getRoadmapProgress(roadmap);
            return (
              <Card key={roadmap.id} className="bg-zinc-900/40 border-zinc-800 overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  <div className="p-8 lg:col-span-1 bg-zinc-900/60 border-r border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-orange-500 mb-4">
                        <Map className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Technique Path</span>
                      </div>
                      <CardTitle className="text-2xl mb-2">{roadmap.title}</CardTitle>
                      <CardDescription className="mb-6">{roadmap.description}</CardDescription>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Path Progress</span>
                        <span className="font-bold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                  <div className="p-8 lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Milestones</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roadmap.steps.map((step, idx) => {
                        const exercise = exercises.find(e => e.id === step.exerciseId);
                        const isCompleted = sessions.some(s => s.exerciseId === step.exerciseId && s.achievedBpm >= step.targetBpm);
                        const isLocked = idx > 0 && !sessions.some(s => s.exerciseId === roadmap.steps[idx-1].exerciseId && s.achievedBpm >= roadmap.steps[idx-1].targetBpm);
                        return (
                          <div 
                            key={step.exerciseId}
                            className={`p-4 rounded-xl border transition-all ${
                              isCompleted 
                                ? 'bg-green-500/5 border-green-500/20' 
                                : isLocked 
                                  ? 'bg-zinc-950 border-zinc-900 opacity-60' 
                                  : 'bg-zinc-800/50 border-zinc-700 hover:border-orange-500/50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="p-2 rounded-lg bg-zinc-900">
                                {isCompleted ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : isLocked ? <Lock className="w-4 h-4 text-zinc-600" /> : <ChevronRight className="w-4 h-4 text-orange-500" />}
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground">GOAL: {step.targetBpm} BPM</span>
                            </div>
                            <h4 className="font-semibold text-sm truncate mb-1">{exercise?.title || 'Loading...'}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-4">{exercise?.category}</p>
                            {!isLocked && (
                              <Button asChild variant="ghost" size="sm" className="w-full h-8 text-xs hover:bg-orange-500/10 hover:text-orange-500">
                                <Link to={`/exercise/${step.exerciseId}`}>View Details</Link>
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}