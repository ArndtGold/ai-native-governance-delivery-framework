import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { BrandMark } from './BrandMark';
import './brand.css';
import { cockpitTitle, type CockpitHost } from './host-label';

export function BrandHeader({ projectPath, contextTitle, variant = 'view', headingRef, children, reviewTitle, host = 'unknown', title = cockpitTitle(host) }: {
  projectPath?: string; contextTitle?: string; variant?: 'card' | 'view' | 'document'; title?: string; reviewTitle?: string;
  headingRef?: RefObject<HTMLHeadingElement | null>; children?: ReactNode; host?: CockpitHost;
}) {
  const project = projectPath?.split(/[\\/]/).filter(Boolean).at(-1) ?? 'Lokales Projekt';
  const header = useRef<HTMLElement>(null);
  const isReview = reviewTitle !== undefined;
  useLayoutEffect(() => {
    if (isReview) return;
    const element = header.current, parent = element?.parentElement;
    if (!element || !parent) return;
    const measure = () => parent.style.setProperty('--cockpit-header-height', `${element.getBoundingClientRect().height}px`);
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    return () => { observer?.disconnect(); parent.style.removeProperty('--cockpit-header-height'); };
  }, [isReview]);
  return <header ref={header} className={`cockpit-brand-header cockpit-brand-header--${variant}${isReview ? ' cockpit-brand-header--review' : ''}`}>
    <BrandMark className="cockpit-brand-mark"/>
    {isReview ? <div className="cockpit-brand-copy">
      <span className="cockpit-brand-kicker">AGDF Cockpit</span>
      <h1 ref={headingRef} tabIndex={-1}>{reviewTitle}</h1>
    </div> : <>
      <div className="cockpit-brand-copy">
        {variant === 'card' ? <h1 ref={headingRef} tabIndex={-1}>{title}</h1> : <strong className="cockpit-brand-title">{title}</strong>}
        <p className="cockpit-brand-project" title={projectPath}>{contextTitle ?? project}</p>
      </div>
      <div className="cockpit-brand-actions">{variant !== 'card' && <span className="read-only">Nur Lesen</span>}{children}</div>
    </>}
  </header>;
}
