import type { Run, Detail, RunClosure } from './types';
import { label } from './feedback';

// Display wording only. Core owns evaluation, permission and source identity.
const phases: Record<string, string> = { UR: 'Anforderungen klären', PRD: 'Produktanforderungen', SD: 'Lösung entwerfen', TP: 'Umsetzung planen', 'CD+Tests': 'Umsetzung und Prüfung', CR: 'Code-Prüfung', QA: 'Qualitätsprüfung', UAT: 'Abnahme', OR: 'Abschlussnachweise' };
export const phaseName = (gate?: string | null) => gate ? phases[gate] ?? gate : 'Stand nicht verfügbar';
// Gate names identify the current work without turning the figure into the only label.
const gateLabels: Record<string, string> = { UR:'Nutzeranforderungen', PRD:'Produktanforderungen', SD:'Systemdesign', TP:'Arbeits- und Testplan', 'CD+Tests':'Umsetzung und Tests', CR:'Code-Prüfung', QA:'Qualitätsprüfung', UAT:'Abnahme', OR:'Abschlussnachweise' };
export const gateLabel = (gate: string) => `${gateLabels[gate] ?? 'Arbeitsschritt'} · ${gate}`;
const documents: Record<string, [string, string]> = {
  UR: ['Anforderungen', 'Beschreibt das Ziel und den vereinbarten Umfang des Vorhabens.'],
  PRD: ['Produktanforderungen', 'Beschreibt das gewünschte Verhalten und seine Akzeptanzkriterien.'],
  SD: ['Lösungskonzept', 'Beschreibt die gewählte Lösung und ihre Entscheidungen.'],
  TP: ['Umsetzungs- und Prüfplan', 'Verbindet die geplanten Aufgaben mit ihren Prüfungen.'],
  QA: ['Qualitätsprüfung', 'Dokumentiert die Qualitätsbewertung und ihre Nachweise.'],
  UAT: ['Abnahme', 'Dokumentiert die Prüfung aus Nutzersicht.'],
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
// Presentation of the existing Core assessment, never a second gate evaluator.
// The one UI rule for a completed assessment without fulfilled completion: summaries never confirm it.
export const completionUnconfirmed = (data: Detail) => data.evaluation?.control_assessment?.state === 'completed' && data.evaluation.completion?.fulfilled !== true;
export function observedAssessment(data: Detail, current: boolean) {
  const e = data.evaluation;
  // An ended Run stores "none, run ended"; Core evaluates its outcome. Both describe the same final history.
  if (current && e?.control_assessment?.state === 'ended' && data.closure && (!data.persisted || data.persisted.current_gate === e.current_gate)) return 'ended';
  const matches = !data.persisted || data.persisted.current_gate === e?.current_gate && data.persisted.next_allowed_action === e?.next_allowed_action;
  return current && matches ? e?.control_assessment?.state ?? 'unconfirmed' : 'unconfirmed';
}

const reviewQuestions: Record<string, string> = {
  UR: 'Prüfe, ob Ziel und Umfang deinem Auftrag entsprechen.',
  PRD: 'Prüfe, ob das gewünschte Verhalten und die Akzeptanzkriterien stimmen.',
  SD: 'Prüfe, ob die vorgeschlagene Lösung zum Vorhaben passt.',
  TP: 'Prüfe, ob der Plan die vereinbarten Aufgaben und Prüfungen abdeckt.',
  QA: 'Prüfe das Qualitätsergebnis und die zugehörigen Nachweise.',
  UAT: 'Prüfe, ob das Ergebnis die vereinbarten Abnahmekriterien erfüllt.',
};

const reviewBlockerReasons: Record<string, string> = {
  AGDF_RUN_SEAL_INVALID: 'Der gespeicherte Stand des Vorhabens konnte nicht verifiziert werden.',
  approved_material_sources_changed: 'Eine Quelle zu einer bereits erteilten Freigabe hat sich geändert.',
  presentation_version_decided: 'Zu dieser Fassung wurde bereits eine Entscheidung gespeichert.',
  qa_blocked: 'Die Qualitätsprüfung blockiert die Weiterarbeit.',
  qa_revise_required: 'Die Qualitätsprüfung verlangt eine Überarbeitung oder weitere Nachweise.',
};

export function reviewBlocker(data: Detail, current: boolean) {
  const evaluation = data.evaluation;
  // A fresh blocking observation can explain why the stored workflow is unconfirmed.
  if (!current || evaluation?.control_assessment?.state !== 'blocked' || evaluation.blocking_reason === 'none') return null;
  const reason = evaluation.blocking_reason;
  const explanation = Object.hasOwn(reviewBlockerReasons, reason) ? reviewBlockerReasons[reason]
    : 'Die Weiterarbeit ist gesperrt. Der genaue Grund steht hier nicht als Kurztext zur Verfügung.';
  return `${explanation} Prüfe „Arbeitsstand und Quellen“ in der Vollansicht.`;
}

export function reviewTask(data: Detail, current: boolean, hasSource: boolean) {
  const assessment = observedAssessment(data, current);
  if (assessment === 'unconfirmed') return 'Der aktuelle Stand konnte nicht bestätigt werden.';
  if (assessment === 'completed') return 'Das Vorhaben ist abgeschlossen.';
  if (assessment === 'ended') return 'Das Vorhaben ist beendet.';
  const evaluation = data.evaluation, operation = evaluation?.next_operation;
  if (hasSource && evaluation?.blocking_reason === 'none' && operation?.actor === 'human' && operation.effect === 'decision'
    && operation.operation_key === 'approval.record' && operation.gate === evaluation?.current_gate) {
    return reviewQuestions[operation.gate] ?? 'Prüfe die vorgelegte Fassung.';
  }
  if (assessment === 'blocked') {
    return evaluation?.missing_approval.startsWith('Approval: ')
      ? 'Die Freigabe steht aus. Die Prüfgrundlage ist hier noch nicht verfügbar.'
      : 'Die Weiterarbeit ist gesperrt. Öffne den Arbeitsstand für die verfügbaren Angaben.';
  }
  const phase = phases[evaluation?.current_gate ?? ''];
  return phase ? `Aktueller Schritt · ${phase}` : 'Sieh dir den Stand des Vorhabens an.';
}
// Reuse an explicitly authored German summary. Never infer or translate source facts.
export function sourceSummary(content: string): string | null {
  const lines = content.split(/\r?\n/), headings: number[] = [];
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const marker = lines[i].match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker) { if (!fence) fence = marker[1]; else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null; continue; }
    if (!fence && /^## AGDF Approval Summary \(de; source=en\)\s*$/.test(lines[i])) headings.push(i);
  }
  if (headings.length !== 1) return null;
  const start = headings[0] + 1;
  const next = lines.findIndex((line, i) => i >= start && /^#{1,2} /.test(line));
  const paragraphs = lines.slice(start, next < 0 ? undefined : next).join('\n').trim().split(/\n\s*\n/).filter(Boolean);
  const summary = paragraphs[0] ?? '';
  return summary && summary.length <= 1200 ? summary : null;
}
export function runAttention(run: Run): string[] {
  if (!run.valid || run.code) return ['Quelle prüfen'];
  if (!run.attention) return ['Offene Punkte im Detail prüfen'];
  const result = [];
  if (run.attention.blocking_reason !== 'none') result.push('Blocker vorhanden');
  if (run.attention.missing_approval !== 'none') result.push('Freigabe ausstehend');
  if (run.attention.missing_evidence_count) result.push(`${run.attention.missing_evidence_count} offene Nachweise`);
  return result.length ? result : ['Keine offenen Punkte ausgewiesen'];
}
export const closurePerson = (closure: RunClosure) => !closure.confirmed_by || closure.confirmed_by.statement === 'unknown' ? 'Unbekannt (keine lokale Git-Identität)'
  : `${[closure.confirmed_by.name, closure.confirmed_by.email && `<${closure.confirmed_by.email}>`].filter(Boolean).join(' ')} · kooperative Angabe`;
export const closureSuccessor = (closure: RunClosure) => !closure.successor ? 'Kein Nachfolger'
  : `${closure.successor.value}${closure.successor.verified ? ' · geprüfte Run-ID' : ' · ungeprüfter Verweis'}`;
export const runStatus = (run: Run) => !run.valid || run.code ? 'Quelle prüfen' : run.lifecycle !== 'active' ? label(run.lifecycle) : label(run.status);
export function reportFindingsLabel(count: number) {
  return `${count} ${count === 1 ? 'offener Berichtsbefund' : 'offene Berichtsbefunde'}`;
}
