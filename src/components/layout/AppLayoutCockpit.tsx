import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Library, Target, TrendingUp, Compass, Guitar, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LayoutSwitcher } from '@/components/LayoutSwitcher';
import { Toaster } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { User } from '@shared/types';

const NAV_ITEMS = [
  { title: 'Dashboard', short: 'Home', icon: Home, url: '/' },
  { title: 'Assessment', short: 'Assess', icon: Target, url: '/assessment' },
  { title: 'Exercises', short: 'Library', icon: Library, url: '/library' },
  { title: 'Roadmaps', short: 'Maps', icon: Compass, url: '/roadmaps' },
  { title: 'Progress', short: 'Stats', icon: TrendingUp, url: '/progress' },
];

const RANK_LABELS: [number, string][] = [
  [30, 'Guitar Sage'],
  [15, 'Virtuoso'],
  [5, 'Shredder'],
  [0, 'Apprentice'],
];

function getRank(streak: number) {
  return RANK_LABELS.find(([min]) => streak > min)?.[1] ?? 'Apprentice';
}

type AppLayoutCockpitProps = {
  children: React.ReactNode;
  container?: boolean;
  contentClassName?: string;
};

/**
 * Cockpit layout — inspired by Linear, Notion, Logic Pro, and pro SaaS tools.
 * All navigation lives in a single persistent top bar alongside user info and
 * the two switchers. No sidebar, no bottom bar — full vertical height for content.
 */
export function AppLayoutCockpit({ children, container = false, contentClassName }: AppLayoutCockpitProps) {
  const location = useLocation();
  const { data: user } = useQuery<User>({
    queryKey: ['user/profile'],
    queryFn: () => api('/api/user/profile'),
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Full-width top bar */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2 mr-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary shadow-primary">
            <Guitar className="size-4 text-primary-foreground" />
          </div>
          <span className="hidden text-sm font-bold tracking-tight sm:block">FretFlow</span>
        </Link>

        <div className="h-5 w-px shrink-0 bg-border" />

        {/* Inline nav */}
        <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="size-3.5 shrink-0" />
                {/* Full label on md+, short label on sm, icon-only below sm */}
                <span className="hidden sm:inline md:hidden">{item.short}</span>
                <span className="hidden md:inline">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side: user + switchers */}
        <div className="flex shrink-0 items-center gap-2">
          {/* User badge */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-muted/40 py-1 pl-1.5 pr-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10">
                <span className="text-[9px] font-bold text-orange-500">
                  {user.name?.[0] ?? 'G'}
                </span>
              </div>
              <span className="text-xs font-medium">{user.name ?? 'Guitar God'}</span>
              <span className="text-[10px] text-muted-foreground">
                {getRank(user.streak ?? 0)}
              </span>
              {(user.streak ?? 0) > 0 && (
                <>
                  <div className="h-3 w-px bg-border" />
                  <Flame className="size-3 text-orange-500" />
                  <span className="text-[10px] font-bold">{user.streak}</span>
                </>
              )}
            </div>
          )}

          <LayoutSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      {/* Full-height content area */}
      <main className="flex-1 overflow-auto">
        {container ? (
          <div
            className={cn(
              'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-10',
              contentClassName
            )}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </main>

      <Toaster richColors closeButton />
    </div>
  );
}
