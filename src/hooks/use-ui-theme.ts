import { useState, useEffect } from 'react';

export type UITheme = 'default' | 'studio' | 'acoustic' | 'neon';

export interface ThemeDefinition {
  id: UITheme;
  label: string;
  description: string;
  bg: string;
  accent: string;
  isDark: boolean;
}

export const UI_THEMES: ThemeDefinition[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'The original dark theme',
    bg: '#18181b',
    accent: '#f97316',
    isDark: true,
  },
  {
    id: 'studio',
    label: 'Studio',
    description: 'Dark DAW-inspired with teal accents',
    bg: '#0a0f1e',
    accent: '#00c897',
    isDark: true,
  },
  {
    id: 'acoustic',
    label: 'Acoustic',
    description: 'Warm & cozy light theme',
    bg: '#fdf6e9',
    accent: '#c2410c',
    isDark: false,
  },
  {
    id: 'neon',
    label: 'Neon',
    description: 'Electric stage with neon glow',
    bg: '#080010',
    accent: '#e040fb',
    isDark: true,
  },
];

export function useUITheme() {
  const [theme, setThemeState] = useState<UITheme>(() => {
    return (localStorage.getItem('ui-theme') as UITheme) || 'default';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove previous theme attribute
    root.removeAttribute('data-theme');

    // Manage dark class
    const themeDefinition = UI_THEMES.find(t => t.id === theme);
    if (themeDefinition?.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set data-theme attribute for CSS variable overrides (skip for 'default')
    if (theme !== 'default') {
      root.setAttribute('data-theme', theme);
    }

    localStorage.setItem('ui-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: UITheme) => {
    setThemeState(newTheme);
  };

  const currentTheme = UI_THEMES.find(t => t.id === theme) ?? UI_THEMES[0];

  return { theme, setTheme, currentTheme };
}
