import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { PracticeSession, User } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid
} from 'recharts';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';
import { format } from 'date-fns';
export function ProgressPage() {
  const { data: user } = useQuery<User>({ queryKey: ['user/profile'], queryFn: () => api('/api/user/profile') });
  const { data: sessions = [] } = useQuery<PracticeSession[]>({ 
    queryKey: ['sessions'], 
    queryFn: () => api('/api/sessions') 
  });
  const radarData = user?.skillProfile ? Object.entries(user.skillProfile).map(([key, val]) => ({
    subject: key.replace(/([A-Z])/g, ' $1').trim(),
    A: val,
    fullMark: 100,
  })) : [];
  // Aggregated practice time by day (last 30 days)
  const practiceTimeData = React.useMemo(() => {
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return format(d, 'MMM dd');
    });
    const map = new Map();
    sessions.forEach(s => {
      const day = format(new Date(s.timestamp), 'MMM dd');
      map.set(day, (map.get(day) || 0) + (s.duration / 60));
    });
    return last30Days.map(day => ({ day, minutes: Math.round(map.get(day) || 0) }));
  }, [sessions]);
  // BPM progress for the most practiced exercise
  const bpmProgressData = React.useMemo(() => {
    if (sessions.length === 0) return [];
    const exerciseCounts: Record<string, number> = {};
    sessions.forEach(s => { exerciseCounts[s.exerciseId] = (exerciseCounts[s.exerciseId] || 0) + 1; });
    const topExerciseId = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0][0];
    return sessions
      .filter(s => s.exerciseId === topExerciseId)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(s => ({ 
        date: format(new Date(s.timestamp), 'MM/dd'), 
        bpm: s.achievedBpm 
      }));
  }, [sessions]);
  const stats = {
    bestAccuracy: sessions.length > 0 ? Math.max(...sessions.map(s => s.accuracy)) : 0,
    totalMinutes: Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60),
    sessionsCount: sessions.length,
    topBpm: sessions.length > 0 ? Math.max(...sessions.map(s => s.achievedBpm)) : 0
  };
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
          <p className="text-muted-foreground">Detailed analytics of your guitar journey.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Practice" value={`${stats.totalMinutes}m`} sub="All time" icon={Clock} />
          <StatCard title="Best Accuracy" value={`${stats.bestAccuracy}%`} sub="Personal record" icon={Target} />
          <StatCard title="Total Sessions" value={stats.sessionsCount} sub="Completed" icon={TrendingUp} />
          <StatCard title="Peak Speed" value={`${stats.topBpm} BPM`} sub="Max reached" icon={Award} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Skill Distribution</CardTitle>
              <CardDescription>Current technique proficiency levels</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Radar name="Skills" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Practice Consistency</CardTitle>
              <CardDescription>Minutes practiced per day (Last 30 days)</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={practiceTimeData}>
                  <defs>
                    <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <YAxis stroke="#71717a" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                  <Area type="monotone" dataKey="minutes" stroke="#f97316" fillOpacity={1} fill="url(#colorMin)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>BPM Progression Over Time</CardTitle>
              <CardDescription>Speed improvement for your most practiced exercise</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bpmProgressData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                  <Line type="monotone" dataKey="bpm" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
function StatCard({ title, value, sub, icon: Icon }: any) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">{title}</CardTitle>
        <Icon className="h-4 w-4 text-orange-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}