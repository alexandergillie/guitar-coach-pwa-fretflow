import React from 'react';
import { cn } from '@/lib/utils';

interface TabViewerProps {
  tabString: string;
  className?: string;
  variant?: 'default' | 'compact';
  /** String number (1-6) to highlight, where 1=high E, 6=low E */
  highlightString?: number;
  /** Strings that have been completed (shown in green) */
  completedStrings?: number[];
}

export function TabViewer({ 
  tabString, 
  className, 
  variant = 'default',
  highlightString,
  completedStrings = []
}: TabViewerProps) {
  const lines = tabString.split('\n');
  const isCompact = variant === 'compact';
  
  // Tab lines are ordered high E (string 1) to low E (string 6) from top to bottom
  // Line index 0 = string 1 (high e), Line index 5 = string 6 (low E)
  // We use line index to determine which string it is, not the letter
  
  return (
    <pre className={cn(
      "font-mono leading-tight p-6 overflow-x-auto bg-zinc-950 text-zinc-300 selection:bg-orange-500/30 rounded-xl border border-zinc-800",
      isCompact ? "text-xs sm:text-sm p-4" : "text-sm sm:text-base",
      className
    )}>
      {lines.map((line, lineIndex) => {
        const isStringLine = line.match(/^[eEADGB]\|/);
        
        // Convert line index to string number (1-6)
        // Line 0 = string 1 (high e), Line 5 = string 6 (low E)
        const stringNumber = lineIndex + 1;
        
        // Check if this line should be highlighted or shown as completed
        const isHighlighted = isStringLine && highlightString === stringNumber;
        const isCompleted = isStringLine && completedStrings.includes(stringNumber);
        
        return (
          <div 
            key={lineIndex} 
            className={cn(
              "whitespace-pre flex transition-all duration-200",
              isHighlighted && "bg-violet-500/20 -mx-2 px-2 rounded",
              isCompleted && !isHighlighted && "opacity-50"
            )}
          >
            {isStringLine ? (
              <>
                <span className={cn(
                  "font-bold",
                  isHighlighted ? "text-violet-400" : isCompleted ? "text-green-400" : "text-orange-400"
                )}>
                  {line.slice(0, 2)}
                </span>
                <span className={cn(
                  isHighlighted ? "text-violet-300" : isCompleted ? "text-green-300/50" : "text-zinc-500"
                )}>
                  {line.slice(2)}
                </span>
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