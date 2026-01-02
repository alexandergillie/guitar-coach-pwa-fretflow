import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SEED_EXERCISES } from '@shared/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Music, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export function ExerciseLibraryPage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const filtered = SEED_EXERCISES.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(search.toLowerCase()) || 
                          ex.technique.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesDiff = difficulty ? ex.difficulty === difficulty : true;
    return matchesSearch && matchesDiff;
  });
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore 200+ exercises curated by master instructors. Filter by technique or difficulty to find your next challenge.
          </p>
        </header>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search techniques, titles..." 
              className="pl-10 bg-zinc-900 border-zinc-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full overflow-x-auto pb-1 no-scrollbar">
            {['Beginner', 'Intermediate', 'Advanced', 'Master'].map(lvl => (
              <Button 
                key={lvl}
                variant={difficulty === lvl ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setDifficulty(difficulty === lvl ? null : lvl)}
                className="whitespace-nowrap rounded-full border-zinc-800"
              >
                {lvl}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ex) => (
            <Link key={ex.id} to={`/exercise/${ex.id}`}>
              <Card className="h-full bg-zinc-900/40 border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900/60 transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase border-zinc-700 bg-zinc-800">
                      {ex.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{ex.bpm} BPM</span>
                  </div>
                  <CardTitle className="group-hover:text-orange-500 transition-colors">{ex.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{ex.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {ex.technique.map(t => (
                      <Badge key={t} variant="secondary" className="bg-zinc-800 text-muted-foreground text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-zinc-800 pt-3">
                    <div className="flex items-center gap-1">
                      <Music className="h-3 w-3" />
                      {ex.difficulty}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No exercises found matching your search.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}