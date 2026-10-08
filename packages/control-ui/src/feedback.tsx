import type { ReadingState } from './state';

export const messages: Record<string, string> = {
  persisted_mismatch: 'Die gespeicherte Angabe weicht von der Core-Auswertung ab. Beide Quellen sind getrennt dargestellt; die Core-Auswertung bestimmt den Kontrollstatus.',
  control_absent: 'Für dieses Repository fehlen die Kontrolldaten. Quelle außerhalb des Cockpits einrichten und erneut laden.',
  backlog_partial: 'Einige gespeicherte Vorhaben oder Tabellen sind nicht eindeutig lesbar. Die Übersicht bestätigt keine aktuellen Run-Voraussetzungen.',
  backlog_missing: 'Das Masterbacklog fehlt. Es wird keine Run-Liste als Ersatz geladen.',
  backlog_unsupported: 'Das Masterbacklog ist nicht als UTF-8-Text lesbar.',
  run_missing: 'Der angefragte Run wurde nicht gefunden. Die Run-ID bleibt erhalten; bewusst erneut laden.',
  inventory_partial: 'Die Übersicht enthält ungültige oder nicht auswertbare Einträge. Betroffene Quellen außerhalb des Cockpits prüfen.',
  invalid_run: 'Dieser Run ist ungültig. Die Quelldaten außerhalb des Cockpits prüfen.',
  run_removed: 'Der ausgewählte Run ist nicht mehr vorhanden. Einen anderen Run auswählen.',
  document_missing: 'Das registrierte Dokument fehlt. Quelle prüfen und erneut laden.',
  document_unsupported: 'Dieses Dokument kann nicht als UTF-8-Markdown, JSON oder Text angezeigt werden.',
  resource_denied: 'Dieser Zugriff ist gesperrt. Eine erlaubte, registrierte Kontrollressource auswählen.',
  source_changed: 'Die Quelldaten haben sich geändert. Angezeigte Inhalte gehören zum vorherigen Datenstand. Bewusst neu laden.',
  read_failed: 'Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.',
  resource_limit: 'Ein Ressourcenlimit wurde erreicht. Dateigröße und Umfang außerhalb des Cockpits prüfen.',
  session_invalid: 'Die Sitzung ist nicht gültig. Den aktuellen Startlink aus dem Terminal erneut öffnen.',
  session_expired: 'Die MCP-Sitzung ist abgelaufen. Öffne das Cockpit im Chat erneut für diesen Run. Angezeigte Inhalte gehören zum vorherigen Datenstand.',
  busy: 'Der lokale Lesedienst ist ausgelastet. Den Zugriff wiederholen.',
  timeout: 'Das Lesen hat das Zeitlimit erreicht. Quelle und Umfang prüfen, dann wiederholen.',
  dto_invalid: 'Die Antwort des Dienstes passt nicht zum erwarteten Datenstand. Neu laden oder den Dienst erneut starten.',
};
export const labels: Record<string, string> = { available: 'Verfügbar', empty: 'Keine Einträge', partial: 'Teilweise verfügbar', invalid: 'Ungültig', missing: 'Fehlt', unsupported: 'Vorschau nicht verfügbar', blocked: 'Gesperrt', stale: 'Neuer Stand verfügbar', error: 'Lesefehler', active: 'Aktiv', completed: 'Abgeschlossen', superseded: 'Ersetzt', abandoned: 'Beendet', open: 'Offen', pass: 'Bestanden', passed: 'Bestanden', approved: 'Freigegeben', done: 'Erledigt', revise: 'Überarbeiten', block: 'Blockiert', none: 'Keine', in_progress: 'In Arbeit' };
export const label = (value: string | null | undefined) => value ? labels[value] ?? `Nicht verfügbar · Original: ${value}` : 'Nicht verfügbar';
export function readingStatus(state: ReadingState) {
  const busy = state.phase === 'loading' || state.refreshing;
  const previous = !!state.scope?.data && (state.stale || busy);
  const changed = !!state.scope?.data && state.sourceChanged;
  const expired = state.problem === 'session_expired' || state.scope?.code === 'session_expired';
  const invalid = state.problem === 'session_invalid' || state.scope?.code === 'session_invalid';
  const failed = !!state.problem && (state.problem !== 'source_changed' || state.phase === 'error');
  const title = busy ? 'Stand wird aktualisiert …' : expired ? 'Sitzung abgelaufen' : invalid ? 'Sitzung ungültig'
    : failed ? previous ? 'Aktualisierung fehlgeschlagen' : 'Lesefehler'
    : changed ? 'Neuer Stand verfügbar' : label(state.scope?.state);
  const action = busy || expired || invalid ? title : failed ? `${title} · Wiederholen`
    : changed ? state.route.view === 'document' ? 'Quelle geändert · Neu laden' : 'Neuer Stand verfügbar · Aktualisieren' : 'Neu laden';
  return { busy, previous, changed, title, action };
}
export function ReadState({ code, state, heading, previous = false }: { code?: string | null; state?: string; heading?: string; previous?: boolean }) {
  return <div className="notice" role="status"><strong>{heading ?? (state ? label(state) : 'Hinweis')}</strong><p>{code ? messages[code] ?? 'Die Quelle ist nicht verfügbar. Außerhalb des Cockpits prüfen und neu laden.' : state === 'empty' ? 'Für diese Ansicht sind keine Einträge gespeichert.' : 'Daten werden gelesen.'}</p>{previous && code !== 'session_expired' && <p>Vorheriger Datenstand bleibt sichtbar.</p>}</div>;
}

export function ReadingFeedback({ state, backlogHintsInView = false }: { state: ReadingState; backlogHintsInView?: boolean }) {
  // An ordinary source change is explained by the shared header refresh control.
  // Failed reads and unavailable sources still need visible, actionable feedback.
  const changed = state.phase === 'ready' && state.stale && state.problem === 'source_changed' && !!state.scope?.data;
  const status = readingStatus(state);
  const requestedUnreadable = state.requestedRunId && state.detail?.data?.run_id !== state.requestedRunId
    && (state.problem || state.removed || state.scope?.code);
  return <div aria-live="polite" className="reading-feedback">
    {state.problem && !changed ? <ReadState state="error" heading={status.title} code={state.problem} previous={status.previous}/>
      : state.removed ? <ReadState state="missing" code="run_removed"/>
      : state.stale && state.phase !== 'loading' && !state.refreshing && !changed ? <ReadState state="stale" code="source_changed"/>
      : state.scope?.code && !state.detail && !(backlogHintsInView && state.scope.code === 'backlog_partial') ? <ReadState state={state.scope.state} code={state.scope.code}/> : null}
    {requestedUnreadable && <p role="status">Angefragter Run: <code>{state.requestedRunId}</code> · {state.removed ? 'nicht mehr vorhanden.' : 'Daten noch nicht lesbar.'} Kein anderer Run wurde ausgewählt.</p>}
  </div>;
}
