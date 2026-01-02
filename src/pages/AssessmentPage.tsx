import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle2, ChevronRight, ChevronLeft, Target } from 'lucide-react';
import { toast } from 'sonner';
const CATEGORIES = [
  { id: 'alternatePicking', label: 'Alternate Picking' },
  { id: 'sweepPicking', label: 'Sweep Picking' },
  { id: 'legato', label: 'Legato' },
  { id: 'tapping', label: 'Tapping' },
  { id: 'rhythm', label: 'Rhythm / Timing' },
  { id: 'bending', label: 'Bending Accuracy' },
  { id: 'vibrato', label: 'Vibrato Control' },
  { id: 'theory', label: 'Theory Knowledge' },
];
export function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map(c => [c.id, 50]))
  );
  const [isFinished, setIsFinished] = useState(false);
  const handleNext = () => {
    if (step < CATEGORIES.length - 1) {
      setStep(step + 1);
    } else {
      setIsFinished(true);
      toast.success('Assessment complete! Skill profile updated.');
    }
  };
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };
  const currentCategory = CATEGORIES[step];
  const radarData = CATEGORIES.map(c => ({
    subject: c.label,
    A: scores[c.id],
    fullMark: 100,
  }));
  if (isFinished) {
    return (
      <AppLayout container>
        <div className="max-w-4xl mx-auto space-y-8 animate-scale-in">
          <div className="text-center space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="text-4xl font-bold">Your Guitar Profile</h1>
            <p className="text-muted-foreground text-lg">We've mapped your skills. Based on this, we've unlocked personalized roadmaps for you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle>Skill Visualization</CardTitle>
                <CardDescription>Your strengths and opportunities at a glance.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Key Insights</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-sm font-medium text-orange-500">Strongest Area</div>
                  <div className="text-lg font-bold">{CATEGORIES.find(c => scores[c.id] === Math.max(...Object.values(scores)))?.label}</div>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-sm font-medium text-orange-500">Growth Focus</div>
                  <div className="text-lg font-bold">{CATEGORIES.find(c => scores[c.id] === Math.min(...Object.values(scores)))?.label}</div>
                </div>
              </div>
              <Button asChild className="w-full btn-gradient" size="lg">
                <a href="/">Go to Dashboard</a>
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500">
            <Target className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Skill Assessment</span>
          </div>
          <h1 className="text-3xl font-bold">Evaluate your level</h1>
          <p className="text-muted-foreground">This helps us recommend the right exercises for your current level.</p>
        </div>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <span>Step {step + 1} of {CATEGORIES.length}</span>
              <span>{Math.round(((step + 1) / CATEGORIES.length) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-300" 
                style={{ width: `${((step + 1) / CATEGORIES.length) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-8 py-8">
            <div className="space-y-4">
              <Label className="text-2xl font-semibold block text-center mb-8">
                How would you rate your <span className="text-orange-500">{currentCategory.label}</span>?
              </Label>
              <Slider
                value={[scores[currentCategory.id]]}
                onValueChange={(v) => setScores({ ...scores, [currentCategory.id]: v[0] })}
                max={100}
                step={5}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Pro</span>
              </div>
            </div>
            <div className="flex justify-between gap-4 pt-4">
              <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 px-8">
                {step === CATEGORIES.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}