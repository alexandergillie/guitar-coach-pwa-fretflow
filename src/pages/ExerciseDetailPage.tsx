import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SEED_EXERCISES } from '@shared/mock-data';
import { Button } from '@/components/ui/button';
import { TabViewer } from '@/components/ui/tab-viewer';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Play, ChevronLeft, Clock, Zap, Info, MoveHorizontal, Repeat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { generateTablature, getDrillPositions } from '@shared/pattern-utils';

export function ExerciseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exercise = SEED_EXERCISES.find(e => e.id === id);
  
  // Position and drill mode state
  const [position, setPosition] = useState(exercise?.defaultPosition || 1);
  const [drillMode, setDrillMode] = useState(false);
  
  // Generate tablature based on current position
  const displayTab = useMemo(() => {
    if (!exercise) return '';
    if (!exercise.moveable || !exercise.pattern) {
      return exercise.tablature || '';
    }
    return generateTablature(exercise.pattern, position);
  }, [exercise, position]);
  
  // Get drill positions for display
  const drillPositions = useMemo(() => {
    if (!exercise?.drill) return [];
    return getDrillPositions(exercise.drill);
  }, [exercise]);
  
  if (!exercise) return (
    <AppLayout container>
      <div className="text-center py-20">Exercise not found.</div>
    </AppLayout>
  );
  
  const handleStartPractice = () => {
    // Pass position and drill mode via URL search params
    const params = new URLSearchParams();
    params.set('position', position.toString());
    if (drillMode && exercise.drill) {
      params.set('drill', 'true');
    }
    navigate(`/practice/${exercise.id}?${params.toString()}`);
  };
  
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
              {exercise.moveable && (
                <Badge variant="outline" className="border-violet-500/50 text-violet-400">
                  <MoveHorizontal className="h-3 w-3 mr-1" />
                  Moveable
                </Badge>
              )}
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
              {exercise.moveable && (
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs uppercase text-muted-foreground font-semibold">Position Range</div>
                    <div className="text-sm font-medium">
                      {exercise.drill 
                        ? `Frets ${exercise.drill.startPosition}-${exercise.drill.endPosition}`
                        : `Fret ${position}`
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <Button 
              size="lg" 
              className="btn-gradient w-full md:w-64 h-16 text-lg font-bold"
              onClick={handleStartPractice}
            >
              <Play className="mr-3 h-6 w-6 fill-current" /> Start Practice
            </Button>
          </div>
        </div>
        
        {/* Position & Drill Controls for Moveable Exercises */}
        {exercise.moveable && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <MoveHorizontal className="h-4 w-4 text-orange-500" />
                    Starting Position
                  </h3>
                  <p className="text-sm text-muted-foreground">Select which fret to begin the exercise</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-orange-500 w-12 text-center">{position}</span>
                  <span className="text-sm text-muted-foreground">fret</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Slider
                  value={[position]}
                  onValueChange={(v) => setPosition(v[0])}
                  min={1}
                  max={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>1</span>
                  <span>3</span>
                  <span>5</span>
                  <span>7</span>
                  <span>9</span>
                  <span>12</span>
                </div>
              </div>
              
              {exercise.drill && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <div className="space-y-1">
                    <Label htmlFor="drill-mode" className="font-semibold flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-orange-500" />
                      Drill Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Practice across {drillPositions.length} positions ({exercise.drill.direction})
                    </p>
                  </div>
                  <Switch
                    id="drill-mode"
                    checked={drillMode}
                    onCheckedChange={setDrillMode}
                  />
                </div>
              )}
              
              {drillMode && exercise.drill && (
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Positions in this drill:</p>
                  <div className="flex flex-wrap gap-2">
                    {drillPositions.map((pos, idx) => (
                      <span 
                        key={pos} 
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          idx % 2 === 0 
                            ? 'bg-orange-500/20 text-orange-400' 
                            : 'bg-violet-500/20 text-violet-400'
                        }`}
                      >
                        {pos}{exercise.drill?.direction === 'alternate' && (idx % 2 === 0 ? '↑' : '↓')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-500" />
            Tablature
            {exercise.moveable && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Position {position})
              </span>
            )}
          </h2>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0 overflow-x-auto">
              <TabViewer tabString={displayTab} />
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