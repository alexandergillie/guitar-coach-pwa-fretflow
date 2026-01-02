import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, Play, ArrowRight, Zap, Target } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
const mockActivityData = [
  { day: 'Mon', bpm: 120 },
  { day: 'Tue', bpm: 125 },
  { day: 'Wed', bpm: 122 },
  { day: 'Thu', bpm: 130 },
  { day: 'Fri', bpm: 135 },
  { day: 'Sat', bpm: 140 },
  { day: 'Sun', bpm: 138 },
];
export function HomePage() {
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, Shredder!</h1>
            <p className="text-muted-foreground">You've practiced for 12 days straight. Keep the flow!</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="btn-gradient">
              <Link to="/practice/ex1">
                <Play className="mr-2 h-4 w-4" /> Start Daily Routine
              </Link>
            </Button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 Days</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Mastery</CardTitle>
              <Trophy className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level 14</div>
              <p className="text-xs text-muted-foreground">340 XP until next level</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Focus Skill</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Sweep Picking</div>
              <p className="text-xs text-muted-foreground">Ready for next milestone</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Peak BPM Progress</CardTitle>
              <CardDescription>Your max tempo performance over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockActivityData}>
                  <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}bpm`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    itemStyle={{ color: '#f97316' }}
                  />
                  <Line type="monotone" dataKey="bpm" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Up Next</CardTitle>
              <CardDescription>Recommended for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'Minor 3rd Intervals', time: '10 min', icon: Zap },
                { title: 'Tapping Etude #1', time: '15 min', icon: Target },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 group hover:bg-zinc-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-zinc-900 group-hover:text-orange-500 transition-colors">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.time}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
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