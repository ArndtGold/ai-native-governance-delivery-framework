import type { Envelope, Detail } from './types';

export interface DraftCheckAction { busy: boolean; problem: string | null; check: () => Promise<void> }
export function DraftCheck({ result, action, current, onReload }: {
  result: Envelope<Detail>; action: DraftCheckAction; current: boolean; onReload: () => void;
}) {
  const data = result.data, draft = data?.draft_check;
  const state = !current ? 'stale' : action.busy ? 'checking' : action.problem ? 'unavailable' : draft?.display.state ?? 'unavailable';
  const title = { stale: 'Prüfstand nicht aktuell', checking: 'Prüfung läuft', unavailable: 'Prüfung nicht verfügbar',
    unchecked: 'Noch nicht geprüft', passed: 'Entwurfsprüfung bestanden', corrections_required: 'Korrekturen erforderlich' }[state];
  const retry = action.problem === 'busy';
  const reopen = ['session_expired', 'session_invalid'].includes(action.problem ?? '');
  return <section className="draft-check panel agdf-surface" aria-label="Entwurfsprüfung" aria-busy={action.busy}>
    <h2>Entwurfsprüfung{draft?.source.gate && ['UR', 'PRD', 'SD', 'TP'].includes(draft.source.gate) ? ` · ${draft.source.gate}` : ''}</h2>
    <p role="status" aria-live="polite"><strong>{title}</strong></p>
    <p className="muted">Prüft die vorhandenen Autorenregeln. Freigabe, semantische Prüfung und QA erfolgen im bestehenden Ablauf.</p>
    {draft?.source.available && <button type="button" data-focus-id={`draft-check:${data?.run_id}`}
      aria-disabled={!current || action.busy || !!action.problem && !retry}
      onClick={() => { if (current && !action.busy && (!action.problem || retry)) void action.check(); }}>{action.busy ? 'Prüfung läuft …' : retry ? 'Prüfung wiederholen' : 'Entwurf prüfen'}</button>}
    {action.problem && <p>{retry ? 'Der Lesedienst ist beschäftigt. Du kannst die Prüfung wiederholen.' : reopen
      ? 'Die Sitzung ist abgelaufen oder nicht verfügbar. Öffne das Cockpit erneut.' : 'Die Prüfung konnte nicht zuverlässig abgeschlossen werden. Lade den Stand neu und prüfe danach ausdrücklich erneut.'}</p>}
    {(!current || action.problem && !retry && !reopen || draft?.display.recovery === 'reload') && <button type="button" onClick={onReload}>Stand neu laden</button>}
    {current && !action.problem && !draft?.source.available && <p>Für diesen Stand ist keine unterstützte Entwurfsprüfung verfügbar. Folge dem angezeigten nächsten Schritt des Vorhabens.</p>}
    {current && !action.problem && draft?.result && <>
      {!!draft.result.diagnostics.length && <ul>{draft.result.diagnostics.map((d, i) => <li key={`${d.code}:${i}`}><code>{d.code}</code>{d.message && <p>{d.message}</p>}</li>)}</ul>}
      <p className="source-text">Nächster Schritt · Core-Original: {draft.result.next_action}</p>
    </>}
    <details><summary>Prüfquelle und Originalbefunde</summary>
      <dl><dt>Gate</dt><dd>{draft?.source.gate ?? 'Nicht verfügbar'}</dd><dt>Revision</dt><dd><code>{draft?.source.revision_id ?? 'Nicht verfügbar'}</code></dd>
        <dt>Quelle</dt><dd><code>{draft?.source.artifact_path ?? 'Nicht verfügbar'}</code></dd><dt>SHA-256</dt><dd><code>{draft?.source.artifact_digest ?? 'Nicht verfügbar'}</code></dd>
        <dt>Beobachtet</dt><dd>{result.observed_as_of ?? 'Nicht verfügbar'}</dd></dl>
      {(action.problem ?? draft?.source.reason) && <p>Originalgrund: <code>{action.problem ?? draft?.source.reason}</code></p>}
      {current && !action.problem && draft?.result && <pre>{JSON.stringify(draft.result, null, 2)}</pre>}
    </details>
  </section>;
}
