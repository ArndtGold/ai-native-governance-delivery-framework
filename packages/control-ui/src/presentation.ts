import type { Run } from './types';
import { label } from './feedback';

// Display wording only. Core owns evaluation, permission and source identity.
const phases: Record<string, string> = { UR: 'Anforderungen klären', PRD: 'Produktanforderungen', SD: 'Lösung entwerfen', TP: 'Umsetzung planen', 'CD+Tests': 'Umsetzung und Prüfung', CR: 'Code-Prüfung', QA: 'Qualitätsprüfung', UAT: 'Abnahme', OR: 'Abschlussnachweise' };
export const phaseName = (gate?: string | null) => gate ? phases[gate] ?? gate : 'Stand nicht verfügbar';
const documents: Record<string, [string, string]> = {
  UR: ['Anforderungen', 'Beschreibt das Ziel und den vereinbarten Umfang des Vorhabens.'],
  PRD: ['Produktanforderungen', 'Beschreibt das gewünschte Verhalten und seine Akzeptanzkriterien.'],
  SD: ['Lösungskonzept', 'Beschreibt die gewählte Lösung und ihre Entscheidungen.'],
  TP: ['Umsetzungs- und Prüfplan', 'Verbindet die geplanten Aufgaben mit ihren Prüfungen.'],
  QA: ['Qualitätsprüfung', 'Dokumentiert die Qualitätsbewertung und ihre Nachweise.'],
  'Run State': ['Stand des Vorhabens', 'Enthält den gespeicherten Kontrollstand und seine Quellenverweise.'],
  'Brownfield Review': ['Einordnung des Vorhabens', 'Ordnet Umfang, Auswirkungen und den passenden Umsetzungsweg ein.'],
  'Brownfield Analysis': ['Bestandsanalyse', 'Prüft bestehende Bausteine, Wiederverwendung und Umsetzungsrisiken.'],
  'UX Intent Definition': ['Nutzungsziel', 'Beschreibt die beabsichtigte Nutzung und verständliche Rückmeldungen.'],
  'CD+Tests': ['Umsetzungs- und Prüfnachweise', 'Hält Umsetzung, Prüfergebnisse und noch offene Nachweise fest.'],
  CR: ['Code-Prüfung', 'Dokumentiert die Prüfung der konkreten Änderungen.'],
  OR: ['Abschlussnachweise', 'Dokumentiert den Abschlussstand und verbleibende Grenzen.'],
};
export const documentName = (type?: string) => type ? documents[type]?.[0] ?? type : 'Dokument lesen';
export const documentPurpose = (type?: string) => type ? documents[type]?.[1] ?? 'Registrierte Quelle zu diesem Vorhaben.' : 'Registrierte Quelle zu diesem Vorhaben.';
export function runAttention(run: Run): string[] {
  if (!run.valid || run.code) return ['Quelle prüfen'];
  if (!run.attention) return ['Offene Punkte im Detail prüfen'];
  const result = [];
  if (run.attention.blocking_reason !== 'none') result.push('Blocker vorhanden');
  if (run.attention.missing_approval !== 'none') result.push('Freigabe ausstehend');
  if (run.attention.missing_evidence_count) result.push(`${run.attention.missing_evidence_count} offene Nachweise`);
  return result.length ? result : ['Keine offenen Punkte ausgewiesen'];
}
export const runStatus = (run: Run) => !run.valid || run.code ? 'Quelle prüfen' : run.lifecycle !== 'active' ? label(run.lifecycle) : label(run.status);
