import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={className}>
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 backdrop-blur">
          <div className="flex w-full items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="h-4 w-[1px] bg-border mx-2" />
              <h2 className="text-sm font-semibold tracking-tight">FretFlow</h2>
            </div>
            <ThemeToggle className="static" />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {container ? (
            <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10" + (contentClassName ? ` ${contentClassName}` : "")}>
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