// Same 24px canvas and 1.5px stroke convention as pages/src/components/Icon.astro.
export function Icon({ name }: { name: 'reload' | 'expand' | 'check' | 'panel' | 'close' }) {
  const paths = {
    reload: 'M20 7v5h-5 M20 12a8 8 0 1 0-2.34 5.66',
    expand: 'M14 4h6v6 M20 4l-9 9 M10 4H4v16h16v-6',
    check: 'M5 12l4 4L19 6',
    panel: 'M4 4h16v16H4z M4 9h16 M9 9v11',
    close: 'M6 6l12 12 M18 6L6 18',
  };
  return <svg className="cockpit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
