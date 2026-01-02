import React from 'react';
import { cn } from '@/lib/utils';
interface TabViewerProps {
  tabString: string;
  className?: string;
}
export function TabViewer({ tabString, className }: TabViewerProps) {
  // Simple syntax highlighting for ASCII tabs
  const lines = tabString.split('\n');
  return (
    <pre className={cn(
      "font-mono text-sm sm:text-base leading-tight p-6 overflow-x-auto bg-zinc-950 text-zinc-300 selection:bg-orange-500/30",
      className
    )}>
      {lines.map((line, i) => {
        const isStringLine = line.match(/^[A-G]\|/);
        return (
          <div key={i} className="whitespace-pre flex">
            {isStringLine ? (
              <>
                <span className="text-orange-400 font-bold">{line.slice(0, 2)}</span>
                <span className="text-zinc-500">{line.slice(2)}</span>
              </>
            ) : (
              line
            )}
          </div>
        );
      })}
    </pre>
  );
}