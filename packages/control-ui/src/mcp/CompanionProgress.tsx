import type { GateMark } from '../../../../plugins/agdf/host-templates/claude/companion/gate-bar.mjs';
import { Icon } from './Icon';

const markLabel = { done: 'Abgeschlossen', current: 'Aktuell', open: 'Offen' };
const statusOf = (mark: GateMark['mark'], previous: boolean) => mark === 'current' && previous ? 'Zuletzt aktuell' : markLabel[mark];

export function CompanionProgress({ marks, previous }: { marks: GateMark[]; previous: boolean }) {
  const currentIndex = marks.findIndex(({ mark }) => mark === 'current');
  const currentGate = marks[currentIndex];
  const completedGate = (currentGate ? marks.slice(0, currentIndex) : marks).filter(({ mark }) => mark === 'done').at(-1);
  const nextGate = currentGate ? marks.slice(currentIndex + 1).find(({ mark }) => mark === 'open') : undefined;
  if (!currentGate && !completedGate) return null;

  return <ol className="companion-gates" role="list" aria-label="Gate-Fortschritt">
    {[completedGate, currentGate, nextGate].map(step => step && <li key={step.gate} data-mark={step.mark}
      aria-current={step.mark === 'current' && !previous ? 'step' : undefined}>
      <span className="companion-gate-marker" aria-hidden="true">{step.mark === 'done' && <Icon name="check"/>}</span>
      <span><strong>{step.gate}</strong>{' '}
        <span className="companion-gate-status">{step.mark === 'open' ? 'Danach' : statusOf(step.mark, previous)}</span>
      </span>
    </li>)}
  </ol>;
}

export function CompanionGatePath({ marks, previous }: { marks: GateMark[]; previous: boolean }) {
  return <ol className="companion-gate-path" role="list" aria-label="Vollständige Gate-Reihenfolge">
    {marks.map(({ gate, mark }) => <li key={gate} aria-current={mark === 'current' && !previous ? 'step' : undefined}>
      <span>{gate}</span>{' '}<span>{statusOf(mark, previous)}</span>
    </li>)}
  </ol>;
}
