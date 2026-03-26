import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LayoutSwitcher } from '@/components/LayoutSwitcher';
import { Toaster } from '@/components/ui/sonner';
import { useUXLayout } from '@/hooks/use-ux-layout';
import { AppLayoutFlow } from '@/components/layout/AppLayoutFlow';
import { AppLayoutCockpit } from '@/components/layout/AppLayoutCockpit';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { WifiOff } from 'lucide-react';

function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 text-yellow-400 text-sm font-medium">
      <WifiOff className="h-4 w-4 flex-shrink-0" />
      You're offline — changes won't sync until you reconnect.
    </div>
  );
}

type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};

export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const { layout } = useUXLayout();

  if (layout === 'flow') {
    return (
      <>
        <OfflineBanner />
        <AppLayoutFlow container={container} contentClassName={contentClassName}>
          {children}
        </AppLayoutFlow>
      </>
    );
  }

  if (layout === 'cockpit') {
    return (
      <>
        <OfflineBanner />
        <AppLayoutCockpit container={container} contentClassName={contentClassName}>
          {children}
        </AppLayoutCockpit>
      </>
    );
  }

  // Default: sidebar layout
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={className}>
        <OfflineBanner />
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 backdrop-blur">
          <div className="flex w-full items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="h-4 w-[1px] bg-border mx-2" />
              <h2 className="text-sm font-semibold tracking-tight">FretFlow</h2>
            </div>
            <div className="flex items-center gap-2">
              <LayoutSwitcher />
              <ThemeSwitcher />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {container ? (
            <div className={'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10' + (contentClassName ? ` ${contentClassName}` : '')}>
              {children}
            </div>
          ) : (
            children
          )}
        </main>
        <Toaster richColors closeButton />
      </SidebarInset>
    </SidebarProvider>
  );
}
