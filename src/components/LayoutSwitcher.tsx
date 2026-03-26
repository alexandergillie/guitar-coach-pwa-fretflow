import { PanelLeft, Smartphone, MonitorDot } from 'lucide-react';
import { UX_LAYOUTS, useUXLayout, type UXLayout } from '@/hooks/use-ux-layout';
import { cn } from '@/lib/utils';

const ICONS: Record<UXLayout, React.ElementType> = {
  sidebar: PanelLeft,
  flow: Smartphone,
  cockpit: MonitorDot,
};

interface LayoutSwitcherProps {
  className?: string;
}

export function LayoutSwitcher({ className }: LayoutSwitcherProps) {
  const { layout, setLayout } = useUXLayout();

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1 backdrop-blur',
        className
      )}
      role="group"
      aria-label="Select UX layout"
    >
      {UX_LAYOUTS.map((l) => {
        const isActive = layout === l.id;
        const Icon = ICONS[l.id];
        return (
          <button
            key={l.id}
            onClick={() => setLayout(l.id)}
            title={`${l.label}: ${l.description}`}
            aria-pressed={isActive}
            className={cn(
              'group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline">{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
