import type { Envelope, Detail } from './types';
import { Icon } from './mcp/Icon';

export interface DraftCheckAction { busy: boolean; problem: string | null; check: () => Promise<void> }
export function DraftCheck({ result, action, current, onReload, inline = false, automatic = false, detailsOnly = false }: {
  result: Envelope<Detail>; action: DraftCheckAction; current: boolean; onReload: () => void; inline?: boolean; automatic?: boolean; detailsOnly?: boolean;
}) {
  const data = result.data, draft = data?.draft_check;
  const state = !current || inline && action.problem === 'source_changed' ? 'stale' : action.busy ? 'checking' : action.problem ? 'unavailable' : draft?.display.state ?? 'unavailable';
  const title = { stale: 'Prüfstand nicht aktuell', checking: 'Prüfung läuft', unavailable: 'Prüfung nicht verfügbar',
    unchecked: 'Noch nicht geprüft', passed: 'Entwurfsprüfung bestanden', corrections_required: 'Korrekturen erforderlich' }[state];
  const retry = action.problem === 'busy' || automatic && action.problem === 'timeout';
  const reopen = ['session_expired', 'session_invalid'].includes(action.problem ?? '');
  const findings = draft?.display.findings?.length ? draft.display.findings : draft?.result?.diagnostics ?? [];
  const findingList = !!findings.length && <ul>{findings.map((d, i) => <li key={`${d.code}:${i}`}><code>{d.code}</code>{d.message && <p>{d.message}</p>}</li>)}</ul>;
  const technicalDetails = <details><summary>Prüfquelle und Originalbefunde</summary>
      <p>Die Prüfung gilt für diese Fassung und ersetzt keine inhaltliche Freigabe. Sie prüft die vorhandenen Autorenregeln; semantische Prüfung und QA erfolgen im bestehenden Ablauf.</p>
      <dl><dt>Gate</dt><dd>{draft?.source.gate ?? 'Nicht verfügbar'}</dd><dt>Revision</dt><dd><code>{draft?.source.revision_id ?? 'Nicht verfügbar'}</code></dd>
        <dt>Quelle</dt><dd><code>{draft?.source.artifact_path ?? 'Nicht verfügbar'}</code></dd><dt>SHA-256</dt><dd><code>{draft?.source.artifact_digest ?? 'Nicht verfügbar'}</code></dd>
        <dt>Beobachtet</dt><dd>{result.observed_as_of ?? 'Nicht verfügbar'}</dd></dl>
      {(action.problem ?? draft?.source.reason) && <p>Originalgrund: <code>{action.problem ?? draft?.source.reason}</code></p>}
      {inline && current && !action.problem && findingList}
      {current && !action.problem && draft?.result && <pre>{JSON.stringify(draft.result, null, 2)}</pre>}
    </details>;
  if (detailsOnly) return technicalDetails;
  if (inline) {
    // Busy preserves the capture. A technical read failure can invalidate it.
    const retryWithReload = ['timeout', 'read_failed', 'dto_invalid'].includes(action.problem ?? '');
    const canRetry = current && draft?.source.available && (action.problem === 'busy' || retryWithReload);
    const status = state === 'passed' ? 'Formale Prüfung bestanden'
      : state === 'checking' || state === 'unchecked' ? 'Formale Prüfung läuft …' : title;
    return <div className="draft-check-inline">
      <div className="draft-check-status" data-check-state={state} role="status">{state === 'passed' && <Icon name="check"/>}{status}</div>
      {canRetry && <button type="button" className="text-link" data-focus-id={`draft-check:${data?.run_id}`}
        onClick={retryWithReload ? onReload : () => void action.check()}>Erneut prüfen</button>}
      {current && reopen && <p className="muted">Öffne das Cockpit erneut, um die Prüfung wieder aufzunehmen.</p>}
      {current && !action.problem && !!findings.length && technicalDetails}
    </div>;
  }
  const quietSuccess = automatic && state === 'passed' && !draft?.display.findings?.length && !draft?.result?.diagnostics.length;
  if (quietSuccess) return <><div className="draft-check-success" role="status"><Icon name="check"/>Formale Prüfung bestanden</div>{technicalDetails}</>;
  return <section className="draft-check panel agdf-surface" aria-label="Entwurfsprüfung" aria-busy={action.busy}>
    <h2>Entwurfsprüfung{draft?.source.gate && ['UR', 'PRD', 'SD', 'TP'].includes(draft.source.gate) ? ` · ${draft.source.gate}` : ''}</h2>
    <p role="status" aria-live="polite"><strong>{title}</strong></p>
    <p className="muted">Prüft die vorhandenen Autorenregeln. Freigabe, semantische Prüfung und QA erfolgen im bestehenden Ablauf.</p>
    {draft?.source.available && (!automatic || retry) && <button type="button" data-focus-id={`draft-check:${data?.run_id}`}
      aria-disabled={!current || action.busy || !!action.problem && !retry}
      onClick={() => { if (current && !action.busy && (!action.problem || retry)) void action.check(); }}>{action.busy ? 'Prüfung läuft …' : retry ? automatic ? 'Erneut prüfen' : 'Prüfung wiederholen' : 'Entwurf prüfen'}</button>}
    {action.problem && <p>{retry ? 'Die Prüfung konnte nicht abgeschlossen werden. Du kannst sie erneut starten.' : reopen
      ? 'Die Sitzung ist abgelaufen oder nicht verfügbar. Öffne das Cockpit erneut.' : 'Die Prüfung konnte nicht zuverlässig abgeschlossen werden. Lade den Stand neu und prüfe danach ausdrücklich erneut.'}</p>}
    {(!current || action.problem && !retry && !reopen || draft?.display.recovery === 'reload') && <button type="button" onClick={onReload}>Stand neu laden</button>}
    {current && !action.problem && !draft?.source.available && <p>Für diesen Stand ist keine unterstützte Entwurfsprüfung verfügbar. Folge dem angezeigten nächsten Schritt des Vorhabens.</p>}
    {current && !action.problem && draft?.result && <>
      {findingList}
      <p className="source-text">Nächster Schritt · Core-Original: {draft.result.next_action}</p>
    </>}
    {technicalDetails}

  </section>;
}
