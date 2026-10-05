export const messages: Record<string, string> = {
  persisted_mismatch: 'Die gespeicherte Angabe weicht von der Core-Auswertung ab. Beide Quellen sind getrennt dargestellt; die Core-Auswertung bestimmt den Kontrollstatus.',
  control_absent: 'Für dieses Repository fehlen die Kontrolldaten. Quelle außerhalb des Cockpits einrichten und erneut laden.',
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
  busy: 'Der lokale Lesedienst ist ausgelastet. Den Zugriff wiederholen.',
  timeout: 'Das Lesen hat das Zeitlimit erreicht. Quelle und Umfang prüfen, dann wiederholen.',
  dto_invalid: 'Die Antwort des Dienstes passt nicht zum erwarteten Datenstand. Neu laden oder den Dienst erneut starten.',
};
export const labels: Record<string, string> = { available: 'Verfügbar', empty: 'Keine Runs', partial: 'Teilweise verfügbar', invalid: 'Ungültig', missing: 'Fehlt', unsupported: 'Vorschau nicht verfügbar', blocked: 'Gesperrt', stale: 'Veraltet', error: 'Lesefehler', active: 'Aktiv', completed: 'Abgeschlossen', superseded: 'Ersetzt', abandoned: 'Beendet', open: 'Offen', pass: 'Bestanden', passed: 'Bestanden', approved: 'Freigegeben', done: 'Erledigt', revise: 'Überarbeiten', block: 'Blockiert', none: 'Keine', in_progress: 'In Arbeit' };
export const label = (value: string | null | undefined) => value ? labels[value] ?? `Nicht verfügbar · Original: ${value}` : 'Nicht verfügbar';
export function ReadState({ code, state }: { code?: string | null; state?: string }) {
  return <div className="notice" role="status"><strong>{state ? label(state) : 'Hinweis'}</strong><p>{code ? messages[code] ?? 'Die Quelle ist nicht verfügbar. Außerhalb des Cockpits prüfen und neu laden.' : state === 'empty' ? 'Der Kontrollbaum enthält keine Runs.' : 'Daten werden gelesen.'}</p></div>;
}
