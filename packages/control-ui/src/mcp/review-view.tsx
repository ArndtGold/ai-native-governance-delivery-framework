import { useCallback, useRef, useState, type RefObject } from 'react';
import type { CockpitBridge } from './transport';
import { BrandHeader } from '../BrandHeader';

type Role = 'card' | 'reader' | 'workspace';
type Mode = 'inline' | 'pip' | 'fullscreen';
const roleFor = { inline: 'card', pip: 'reader', fullscreen: 'workspace' } as const;
const modeFor = { card: 'inline', reader: 'pip', workspace: 'fullscreen' } as const;

export function useReviewView(bridge: CockpitBridge) {
  const [role, setRole] = useState<Role>('card');
  const [fallback, setFallback] = useState(false);
  const [busy, setBusy] = useState(false);
  const [openedExpanded, setOpenedExpanded] = useState(false);
  const hasEntry = useRef(false);
  const pending = useRef(false);
  const actual = useRef<Mode | undefined>(undefined);
  const observe = useCallback(() => {
    const mode = bridge.app.getHostContext()?.displayMode;
    if (!mode || mode === actual.current) return;
    actual.current = mode;
    if (!hasEntry.current) {
      hasEntry.current = true;
      setOpenedExpanded(mode !== 'inline');
    }
    if (!pending.current) { setRole(roleFor[mode]); setFallback(false); }
  }, [bridge]);
  const show = useCallback(async (next: Role) => {
    if (pending.current) return;
    pending.current = true;
    hasEntry.current = true;
    setOpenedExpanded(false);
    setBusy(true);
    setRole(next);
    const requested = modeFor[next];
    let confirmed = bridge.app.getHostContext()?.displayMode === requested;
    try {
      if (!confirmed && bridge.app.getHostContext()?.availableDisplayModes?.includes(requested)) {
        const result = await bridge.request(() => bridge.app.requestDisplayMode({ mode: requested }, { timeout: 10_000 }));
        actual.current = result.mode;
        confirmed = result.mode === requested;
      }
    } catch { /* Keep reading in the existing frame. */ }
    finally { pending.current = false; setBusy(false); setFallback(!confirmed && next !== 'card'); }
  }, [bridge]);
  return { role, fallback, busy, openedExpanded, observe, show };
}

export type ReviewView = ReturnType<typeof useReviewView>;

export function newReviewPositionNotice(language = 'de') {
  return language.startsWith('de')
    ? 'Eine frühere Lesestelle ist in dieser neu geöffneten Ansicht nicht verfügbar.'
    : 'This view was opened again. The previous reading position is unavailable.';
}

export function ReviewHeader({ title, headingRef, role }: {
  title: string; headingRef?: RefObject<HTMLHeadingElement | null>; role: Role;
}) {
  return <BrandHeader variant={role === 'card' ? 'card' : 'document'} headingRef={headingRef} reviewTitle={title}/>;
}

export function ReviewControls({ view, language = 'de', onCard }: { view: ReviewView; language?: string; onCard?: () => void }) {
  const de = language.startsWith('de');
  return <>
    <nav className="review-controls" aria-label={de ? 'Leseansicht' : 'Reading view'}>
      <button type="button" className="text-link" disabled={view.busy} onClick={() => {
        if (view.role === 'workspace') void view.show('reader');
        else { onCard?.(); void view.show('card'); }
      }}>{view.role === 'workspace' ? de ? 'Zurück zur Prüfung' : 'Back to review' : de ? 'Zurück zur Karte' : 'Back to card'}</button>
      {view.role !== 'workspace' && <button type="button" className="text-link" disabled={view.busy} onClick={() => void view.show('workspace')}>
        {de ? 'Vollansicht öffnen' : 'Open workspace'}</button>}
    </nav>
    {view.fallback && <p role="status">{de ? 'Der Host hat die gewählte Ansicht nicht bestätigt. Du kannst hier weiterlesen.'
      : 'The host did not confirm that view. You can keep reading here.'}</p>}
  </>;
}

export interface ReadingAnchor { index: number; text: string; offset: number }
const paragraphs = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>(
  '[data-review-source] h1, [data-review-source] h2, [data-review-source] h3, [data-review-source] h4, [data-review-source] p, [data-review-source] pre, [data-review-source] li')];
const anchorText = (node: HTMLElement) => node.textContent?.trim().slice(0, 120) ?? '';
export function captureReviewAnchor(root: HTMLElement): ReadingAnchor | undefined {
  const nodes = paragraphs(root);
  const pane = root.querySelector<HTMLElement>('[data-review-source]');
  const start = Math.max(0, pane?.getBoundingClientRect().top ?? 0);
  const index = nodes.findIndex(node => node.getBoundingClientRect().bottom > start);
  if (index < 0) return;
  const node = nodes[index];
  return { index, text: anchorText(node), offset: node.getBoundingClientRect().top - start };
}
export function restoreReviewAnchor(root: HTMLElement, anchor: ReadingAnchor) {
  const node = paragraphs(root)[anchor.index];
  if (!node || anchorText(node) !== anchor.text) return false;
  const pane = root.querySelector<HTMLElement>('[data-review-source]');
  const delta = node.getBoundingClientRect().top - Math.max(0, pane?.getBoundingClientRect().top ?? 0) - anchor.offset;
  if (Math.abs(delta) > 1) {
    if (pane && pane.scrollHeight > pane.clientHeight) pane.scrollTop += delta;
    else window.scrollBy(0, delta);
  }
  return true;
}
