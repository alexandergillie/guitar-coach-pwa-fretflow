import { useState, useEffect } from 'react';

export type UXLayout = 'sidebar' | 'flow' | 'cockpit';

export interface LayoutDefinition {
  id: UXLayout;
  label: string;
  description: string;
}

export const UX_LAYOUTS: LayoutDefinition[] = [
  {
    id: 'sidebar',
    label: 'Sidebar',
    description: 'Classic collapsible side navigation',
  },
  {
    id: 'flow',
    label: 'Flow',
    description: 'Mobile-first with bottom tab bar',
  },
  {
    id: 'cockpit',
    label: 'Cockpit',
    description: 'Inline top nav, command-center feel',
  },
];

const LAYOUT_CHANGE_EVENT = 'ux-layout-change';

export function useUXLayout() {
  const [layout, setLayoutState] = useState<UXLayout>(() => {
    return (localStorage.getItem('ux-layout') as UXLayout) || 'sidebar';
  });

  // Sync all hook instances via a custom event so that switching the layout
  // from within any layout component (e.g. LayoutSwitcher inside AppLayoutFlow)
  // triggers a re-render in the parent AppLayout that actually swaps layouts.
  useEffect(() => {
    const handler = (e: Event) => {
      setLayoutState((e as CustomEvent<UXLayout>).detail);
    };
    window.addEventListener(LAYOUT_CHANGE_EVENT, handler);
    return () => window.removeEventListener(LAYOUT_CHANGE_EVENT, handler);
  }, []);

  const setLayout = (newLayout: UXLayout) => {
    localStorage.setItem('ux-layout', newLayout);
    window.dispatchEvent(new CustomEvent<UXLayout>(LAYOUT_CHANGE_EVENT, { detail: newLayout }));
  };

  return { layout, setLayout };
}
