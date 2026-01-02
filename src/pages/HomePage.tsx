import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, Play, ArrowRight, Zap, Target } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { User, PracticeSession, Exercise } from '@shared/types';
import { format } from 'date-fns';
export function HomePage() {
  const { data: user } = useQuery<User>({ queryKey: ['user/profile'], queryFn: () => api('/api/user/profile') });
  const { data: sessions = [] } = useQuery<PracticeSession[]>({ queryKey: ['sessions'], queryFn: () => api('/api/sessions') });
  const { data: exercises = [] } = useQuery<Exercise[]>({ queryKey: ['exercises'], queryFn: () => api('/api/exercises') });
  const recentPerformanceData = React.useMemo(() => {
    return sessions
      .slice(-7)
      .map(s => ({
        day: format(new Date(s.timestamp), 'EEE'),
        bpm: s.achievedBpm
      }));
  }, [sessions]);
  const recommendedExercise = React.useMemo(() => {
    if (!exercises.length) return null;
    // Simple logic: pick an exercise not yet perfected
    const masteredIds = new Set(sessions.filter(s => s.accuracy > 95).map(s => s.exerciseId));
    return exercises.find(e => !masteredIds.has(e.id)) || exercises[0];
  }, [exercises, sessions]);
  const masteryLevel = Math.floor((sessions.length * 5 + (user?.streak || 0) * 10) / 100);
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user?.name || 'Shredder'}!</h1>
            <p className="text-muted-foreground">
              {user?.streak && user.streak > 0 
                ? `You've practiced for ${user.streak} days straight. Keep the flow!` 
                : "Ready to start a new practice streak today?"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="btn-gradient">
              <Link to={recommendedExercise ? `/practice/${recommendedExercise.id}` : "/library"}>
                <Play className="mr-2 h-4 w-4" /> Start Daily Routine
              </Link>
            </Button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800 shadow-glow hover:shadow-glow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.streak || 0} Days</div>
              <p className="text-xs text-muted-foreground">Keep it up to unlock rewards</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Mastery</CardTitle>
              <Trophy className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level {masteryLevel}</div>
              <p className="text-xs text-muted-foreground">{sessions.length} sessions logged</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Focus Skill</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.skillProfile ? 
                  Object.entries(user.skillProfile).sort((a,b) => a[1] - b[1])[0][0].replace(/([A-Z])/g, ' $1').trim() 
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Your primary area for growth</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Peak BPM Progress</CardTitle>
              <CardDescription>Your max tempo performance over your last 7 sessions</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {recentPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentPerformanceData}>
                    <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}bpm`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                      itemStyle={{ color: '#f97316' }}
                    />
                    <Line type="monotone" dataKey="bpm" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Complete sessions to see your progress chart
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Up Next</CardTitle>
              <CardDescription>Recommended for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {exercises.slice(0, 3).map((item, i) => (
                <Link key={item.id} to={`/exercise/${item.id}`} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 group hover:bg-zinc-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-zinc-900 group-hover:text-orange-500 transition-colors">
                      {i % 2 === 0 ? <Zap className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.difficulty} • {item.bpm} BPM</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/library">View All Exercises</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}