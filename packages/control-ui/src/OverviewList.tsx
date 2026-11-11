import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

// Compact views use their own scroll viewport. The hint follows geometry, not row count.
export function OverviewList({ compact, label, children }: { compact?: boolean; label: string; children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [more, setMore] = useState(false);
  const description = useId();
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!compact || !element) return;
    const measure = () => {
      const canScroll = element.scrollHeight > element.clientHeight + 1;
      setScrollable(canScroll);
      setMore(canScroll && element.scrollTop + element.clientHeight < element.scrollHeight - 1);
    };
    measure();
    element.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    if (element.firstElementChild) observer?.observe(element.firstElementChild);
    return () => { element.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); observer?.disconnect(); };
  }, [compact, children]);
  const content = <div ref={viewport} id="backlog-list" role="region" aria-label={label} tabIndex={0}
    aria-describedby={compact && scrollable ? description : undefined}>{children}</div>;
  if (!compact) return content;
  return <div className={`backlog-scroll-wrap${scrollable ? ' backlog-scroll-wrap--scrollable' : ''}`}>
    {content}
    {scrollable && <span id={description} className="backlog-scroll-description">Liste ist scrollbar.</span>}
    {more && <div className="backlog-scroll-edge" aria-hidden="true"><span>⌄</span></div>}
  </div>;
}
