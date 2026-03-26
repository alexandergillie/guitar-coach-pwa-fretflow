import { UI_THEMES, useUITheme, type UITheme } from '@/hooks/use-ui-theme';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useUITheme();

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1 backdrop-blur',
        className
      )}
      role="group"
      aria-label="Select UI theme"
    >
      {UI_THEMES.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as UITheme)}
            title={`${t.label}: ${t.description}`}
            aria-pressed={isActive}
            className={cn(
              'group relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {/* Color swatch */}
            <span
              className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10 ring-inset"
              style={{
                background: `linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)`,
              }}
              aria-hidden="true"
            />
            {/* Label — visible on sm+ */}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
