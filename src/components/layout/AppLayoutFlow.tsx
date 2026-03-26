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
  { title: 'Home', icon: Home, url: '/' },
  { title: 'Assess', icon: Target, url: '/assessment' },
  { title: 'Library', icon: Library, url: '/library' },
  { title: 'Roadmaps', icon: Compass, url: '/roadmaps' },
  { title: 'Progress', icon: TrendingUp, url: '/progress' },
];

type AppLayoutFlowProps = {
  children: React.ReactNode;
  container?: boolean;
  contentClassName?: string;
};

/**
 * Flow layout — inspired by Spotify, Duolingo, Headspace.
 * Mobile-first feel: thin top bar, full-width scrollable content,
 * fixed bottom tab bar for navigation.
 */
export function AppLayoutFlow({ children, container = false, contentClassName }: AppLayoutFlowProps) {
  const location = useLocation();
  const { data: user } = useQuery<User>({
    queryKey: ['user/profile'],
    queryFn: () => api('/api/user/profile'),
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Minimal top bar — branding + contextual info + switchers only */}
      <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary shadow-primary">
            <Guitar className="size-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold tracking-tight">FretFlow</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak pill */}
          {(user?.streak ?? 0) > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-500">
              <Flame className="size-3" />
              <span className="text-[10px] font-bold">{user!.streak}</span>
            </div>
          )}
          <LayoutSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      {/* Scrollable content — pad bottom so content isn't hidden behind the tab bar */}
      <main className="flex-1 overflow-auto pb-16">
        {container ? (
          <div
            className={cn(
              'mx-auto max-w-2xl px-4 py-6',
              contentClassName
            )}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 shrink-0 items-center justify-around border-t border-border bg-background/95 px-2 backdrop-blur">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'size-5 transition-transform',
                  isActive && 'scale-110'
                )}
              />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <Toaster richColors closeButton />
    </div>
  );
}
