import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SEED_EXERCISES } from '@shared/mock-data';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Trophy, Clock, Zap, CheckCircle2, RotateCcw, Home, Star } from 'lucide-react';
import { PracticeSession } from '@shared/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
export function SessionAnalysisPage() {
  const { id } = useParams();
  const location = useLocation();
  const exercise = SEED_EXERCISES.find(e => e.id === id);
  const session = (location.state as { session: PracticeSession })?.session;
  const { data: allSessions = [] } = useQuery<PracticeSession[]>({ 
    queryKey: ['sessions'], 
    queryFn: () => api('/api/sessions') 
  });
  const personalBest = React.useMemo(() => {
    const relevant = allSessions.filter(s => s.exerciseId === id);
    if (relevant.length === 0) return 0;
    return Math.max(...relevant.map(s => s.achievedBpm));
  }, [allSessions, id]);
  const comparisonData = [
    { name: 'This Session', bpm: session?.achievedBpm || 0, color: '#f97316' },
    { name: 'Exercise Goal', bpm: exercise?.bpm || 0, color: '#27272a' },
    { name: 'Personal Best', bpm: personalBest, color: '#71717a' },
  ];
  if (!exercise) return <div>Exercise not found</div>;
  const isNewRecord = session?.achievedBpm && session.achievedBpm >= personalBest;
  return (
    <AppLayout container>
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-green-500/10 rounded-full mb-4 relative">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            {isNewRecord && (
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 shadow-glow animate-bounce">
                <Star className="h-4 w-4 fill-current" />
              </div>
            )}
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            {isNewRecord ? "New Personal Best!" : "Practice Complete!"}
          </h1>
          <p className="text-xl text-muted-foreground">Great work on <span className="text-foreground font-semibold">{exercise.title}</span></p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardHeader className="pb-2">
              <Clock className="h-5 w-5 mx-auto text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {session ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` : "0s"}
              </div>
              <p className="text-xs text-muted-foreground">Total Duration</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardHeader className="pb-2">
              <Zap className="h-5 w-5 mx-auto text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session?.achievedBpm || 0} BPM</div>
              <p className="text-xs text-muted-foreground">Achieved Speed</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardHeader className="pb-2">
              <Trophy className="h-5 w-5 mx-auto text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session?.accuracy || 0}%</div>
              <p className="text-xs text-muted-foreground">Accuracy Score</p>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" hide domain={[0, 'dataMax + 20']} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} width={100} axisLine={false} tickLine={false} />
                <Tooltip
                   cursor={{ fill: 'transparent' }}
                   contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                />
                <Bar dataKey="bpm" radius={[0, 4, 4, 0]} barSize={40}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <ReferenceLine x={exercise.bpm} stroke="#E55A1B" strokeDasharray="3 3" label={{ position: 'top', value: 'Goal', fill: '#E55A1B', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button asChild className="flex-1 h-14 text-lg font-bold btn-gradient">
            <Link to={`/practice/${id}`}>
              <RotateCcw className="mr-2 h-5 w-5" /> Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 h-14 text-lg font-bold border-zinc-800 hover:bg-zinc-900">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" /> Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}