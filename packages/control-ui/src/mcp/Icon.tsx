// Same 24px canvas and 1.5px stroke convention as pages/src/components/Icon.astro.
export function Icon({ name }: { name: 'reload' | 'expand' | 'check' | 'panel' | 'close' | 'search' | 'active' | 'planned' | 'completed' | 'archive' | 'back' | 'info' }) {
  const paths = {
    reload: 'M20 7v5h-5 M20 12a8 8 0 1 0-2.34 5.66',
    expand: 'M14 4h6v6 M20 4l-9 9 M10 4H4v16h16v-6',
    check: 'M5 12l4 4L19 6',
    panel: 'M4 4h16v16H4z M4 9h16 M9 9v11',
    close: 'M6 6l12 12 M18 6L6 18',
    search: 'M20 20l-4.2-4.2 M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
    active: 'M12 3v3 M12 18v3 M3 12h3 M18 12h3 M6 6l2 2 M16 16l2 2 M18 6l-2 2 M8 16l-2 2 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    planned: 'M5 4h14v16H5z M8 2v4 M16 2v4 M5 9h14 M9 13h6 M12 10v6',
    completed: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M8 12l2.5 2.5L16 9',
    archive: 'M4 8h16v12H4z M3 4h18v4H3z M9 12h6',
    back: 'M15 18l-6-6 6-6',
    info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 11v5 M12 8h.01',

  };
  return <svg className="cockpit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
