import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SEED_EXERCISES } from '@shared/mock-data';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Trophy, Clock, Zap, CheckCircle2, RotateCcw, Home } from 'lucide-react';
export function SessionAnalysisPage() {
  const { id } = useParams();
  const location = useLocation();
  const exercise = SEED_EXERCISES.find(e => e.id === id);
  const sessionData = location.state as { duration: number } || { duration: 0 };
  const mockData = [
    { name: 'Accuracy', value: 85, color: '#f97316' },
    { name: 'Consistency', value: 72, color: '#f97316' },
    { name: 'Clarity', value: 90, color: '#f97316' },
  ];
  if (!exercise) return <div>Exercise not found</div>;
  return (
    <AppLayout container>
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-green-500/10 rounded-full mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Practice Complete!</h1>
          <p className="text-xl text-muted-foreground">Great work on <span className="text-foreground font-semibold">{exercise.title}</span></p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardHeader className="pb-2">
              <Clock className="h-5 w-5 mx-auto text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(sessionData.duration / 60)}m {sessionData.duration % 60}s</div>
              <p className="text-xs text-muted-foreground">Total Duration</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardHeader className="pb-2">
              <Zap className="h-5 w-5 mx-auto text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exercise.bpm}</div>
              <p className="text-xs text-muted-foreground">BPM Goal</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardHeader className="pb-2">
              <Trophy className="h-5 w-5 mx-auto text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gold</div>
              <p className="text-xs text-muted-foreground">Earned Badge</p>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Session Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{ fill: 'transparent' }}
                   contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                  {mockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
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