import { useLayoutEffect, useRef, useState } from 'react';
import { condensedGateBar, fullGateBar, type GateMark } from '../../../../plugins/agdf/host-templates/claude/companion/gate-bar.mjs';

const markLabel = { done: 'Erledigt', current: 'Aktuell', open: 'Offen' };

export function CompanionProgress({ marks, previous }: { marks: GateMark[]; previous: boolean }) {
  const root = useRef<HTMLDivElement>(null), measureFull = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(false);
  const full = fullGateBar(marks);
  useLayoutEffect(() => {
    const element = root.current, sample = measureFull.current;
    if (!element || !sample) return;
    // Measure the actual font, including symbol fallbacks, rather than assuming a character width.
    const measure = () => setFits(sample.getBoundingClientRect().width <= element.clientWidth);
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    observer?.observe(sample);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [full]);

  return <div ref={root} className="companion-gates" title={full}>
    <span className="companion-gates-text" aria-hidden="true">{fits ? full : condensedGateBar(marks)}</span>
    <span ref={measureFull} className="companion-gates-measure" aria-hidden="true">{full}</span>
    <ol className="companion-gates-accessible" aria-label="Gate-Fortschritt">
      {marks.map(({ gate, mark }) => <li key={gate} aria-current={mark === 'current' && !previous ? 'step' : undefined}>
        {gate}, {markLabel[mark]}
      </li>)}
    </ol>
  </div>;
}
