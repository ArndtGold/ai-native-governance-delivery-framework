import { readAcceptanceCriteria } from "../control-evaluation/traceability-readiness.js";
import { createHash } from "node:crypto";
import { readFileSync } from "../control-read/fs.js";
import { basename } from "node:path";
import { TextDecoder } from "node:util";
import { resolvedArtefactFile } from "../control-evaluation/run-state.js";
import { interactionLocales, resolveArtifactPresentationLanguages } from "../resources/context.js";
import { localePack, resolvePresentationLocale, resolveHumanRunTitle } from "../interaction-presentation.js";
import { readSourceRevisions, SOURCE_GATES } from './run-source-revisions.js';
import { readRunOperations } from './run-operations.js';
import { qaDeviationPresentation } from './qa-deviation-acceptance.js';
import { observeDecisionContent, decisionContentRecovery, localizedDecisionFields } from '../control-evaluation/decision-content-readiness.js';
import { readReportDecision } from '../control-evaluation/report-decision.js';
import { previewForState } from './preview-review.js';
import { readValidatedRevisionArchive, validateRevisionHistory, validateEarlyPrdHistory, earlyPrdHistoryReference, byteDigest } from './run-revision-history.js';

// Compare only an actual immutable prior version from the existing archive owner.
// A current file or an unbound historical Evidence row is never a previous version.
export function presentationVersionComparison(root, state, gate, currentDigest) {
  const unavailable = reason => ({ state: 'unavailable', reason });
  if (!SOURCE_GATES.includes(gate)) return unavailable('no_verified_prior_applicable_version');
  const history = readSourceRevisions(state.content), operations = readRunOperations(state.content);
  if (!history.valid || !operations.valid) return unavailable('historical_source_unconfirmed');
  const candidates = [
    ...history.receipts.filter(row => SOURCE_GATES.indexOf(row.source_gate) <= SOURCE_GATES.indexOf(gate)).map(row => ({ revision: row.revision, row, early: false })),
    ...operations.receipts.filter(row => row.kind === 'prd_revision.reopen' && gate === 'PRD').map(row => ({ revision: row.effect.revision, row, early: true })),
  ].sort((a, b) => b.revision - a.revision);
  if (!candidates.length) return unavailable('no_verified_prior_applicable_version');
  const candidate = candidates[0];
  try {
    if (!(candidate.early ? validateEarlyPrdHistory(root, candidate.row) : validateRevisionHistory(root, candidate.row))) return unavailable('historical_source_unconfirmed');
    const archive = readValidatedRevisionArchive(root, candidate.early ? earlyPrdHistoryReference(candidate.row) : candidate.row);
    const previous = archive?.control.artefacts.get(gate), bytes = previous?.path && archive.archived.get(previous.path);
    if (!bytes || bytes.length > 131072 || !['draft', 'approved'].includes(previous.status)) return unavailable('no_verified_prior_applicable_version');
    const previousText = new TextDecoder('utf-8', { fatal: true }).decode(bytes), previousDigest = byteDigest(bytes);
    return { state: 'available', previous_revision_id: archive.parsed.meta.revision_id,
      previous_digest: previousDigest, current_digest: currentDigest, unchanged: previousDigest === currentDigest, previous_text: previousText };
  } catch { return unavailable('historical_source_unconfirmed'); }
}

// Read-only approval rendering. gate-check (and with it the MCP dispatcher) imports this module;
// writing presentation records stays in run-presentation.js.
const MAX_APPROVAL_ARTEFACT_BYTES = 131072;
const MAX_LOCALIZED_SUMMARY_ITEM_CHARS = 1200;
const MAX_LOCALIZED_SUMMARY_CHARS = 24000;
const SUMMARY_SECTIONS = Object.freeze({
  UR: [
    ["Problem", /problem|need|anlass/iu], ["Ziel", /goal|objective|ziel/iu],
    ["Umfang", /scope|umfang/iu], ["Abnahme", /acceptance|abnahme|success signal/iu],
    ["Offen", /risk|unknown|open question|offen/iu],
  ],
  PRD: [
    ["Nutzerziel", /ux intent and success|user intent/iu, /^primary_user_intent\s*:/iu],
    ["Erfolg", /ux intent and success|user intent/iu, /^success_signal\s*:/iu],
    ["Produktumfang", /product scope|umfang/iu],
    ["Abnahme", /acceptance criteria|abnahmekriterien/iu], ["Abgrenzung", /non-goal|out of scope|nichtumfang/iu],
    ["Offen", /risk|open question|offen/iu],
  ],
  SD: [
    ["Lösung", /solution overview|lösung/iu], ["Verantwortung", /ownership|source of truth|verantwortung|so?t/iu],
    ["Entscheidungen", /architecture decision|design decision|architekturentscheidung/iu],
    ["Integration", /integration point|integration/iu], ["Offen", /risk|open question|offen/iu],
  ],
  TP: [
    ["Aufgaben", /task list|aufgaben/iu], ["Tests", /test plan|tests?/iu],
    ["Abgrenzung", /out of scope|nichtumfang/iu], ["Risiken", /risk|blocker|risik|blocker/iu],
  ],
  QA: [
    ['Ergebnis', /tp coverage/iu, /^delivered_result:/iu],
    ["Entscheidung", /qa decision|entscheidung/iu], ["TP-Abdeckung", /tp coverage|abdeckung/iu, /^(?!delivered_result:)/iu],
    ["Belege", /evidence|belege/iu], ["Fehlt", /missing evidence|fehlende belege/iu],
    ["Risiken", /risk|risik/iu], ["Nächster Schritt", /required next step|next step|nächster schritt/iu],
  ],
});
const SUMMARY_LABELS_EN = Object.freeze({
  Problem: "Problem", Ziel: "Goal", Umfang: "Scope", Abnahme: "Acceptance", Offen: "Open questions",
  Produktumfang: "Product scope", Nutzerziel: "User intent", Erfolg: "Success", "Abgrenzung": "Non-goals", Lösung: "Solution",
  Verantwortung: "Ownership", Entscheidungen: "Design decisions", Integration: "Integration",
  Aufgaben: "Tasks", Tests: "Tests", Risiken: "Risks", Entscheidung: "Decision",
  "TP-Abdeckung": "Task plan coverage", Belege: "Evidence", Fehlt: "Missing evidence", "Nächster Schritt": "Next step",
  Ergebnis: 'Delivered result',
});
export const hash = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;

function compactSummaryText(value) {
  return value.replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1").replace(/`([^`]+)`/gu, "$1")
    .replace(/<[^>]+>/gu, "").replace(/\s+/gu, " ").trim();
}

function userFacingSummaryText(value) {
  const text = compactSummaryText(value);
  const content = text.match(/^(?:delivered_result|qualification_limits|delivery_risks):\s*(.+)$/iu);
  if (content) return content[1];
  const intent = text.match(/^(?:primary_user_intent|success_signal)\s*:\s*(.+)$/iu);
  if (intent) return capitalizeSummary(intent[1].trim());
  if (/^(?:ui_ux_impact|ux_intent_definition|primary_decision_or_action)\s*:/iu.test(text)) return "";
  if (!/^criterion_id\s*:/iu.test(text)) return text;
  const clauses = text.split(/;\s*/u);
  for (const field of ["visible feedback", "observable success", "expected effective state"]) {
    const clause = clauses.find((item) => item.match(new RegExp(`^${field}\\s*:`, "iu")));
    if (clause) return capitalizeSummary(clause.replace(new RegExp(`^${field}\\s*:\\s*`, "iu"), "").trim());
  }
  return "";
}

function capitalizeSummary(value) {
  return value.replace(/^\p{Ll}/u, (letter) => letter.toUpperCase());
}

function substantiveMarkdown(markdown) {
  return markdown.replace(/^## AGDF Approval Summary \([^\r\n]*\)\s*\r?\n[\s\S]*?(?=^#{1,2}\s|(?![\s\S]))/gmu, "");
}

function criterionEntries(markdown) {
  const parsed = readAcceptanceCriteria(substantiveMarkdown(markdown));
  if (parsed.diagnostics.length) throw Object.assign(new Error("approval_summary_source_criteria_invalid"), { diagnostics: parsed.diagnostics });
  return parsed.entries;
}

function criterionDescription(entry) {
  for (const field of ["observable_success", "visible_feedback", "expected_effective_state"]) {
    const value = String(entry.fields[field] ?? "").trim();
    if (value) return capitalizeSummary(compactSummaryText(value));
  }
  return "";
}

function approvalDecisionEntries(markdown) {
  const source = substantiveMarkdown(markdown);
  const section = source.split(/^## Approval Decisions\s*$/mu)[1]?.split(/^## /mu)[0] ?? "";
  return section.split(/\r?\n/u).filter((line) => line.trim().startsWith("|"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => compactSummaryText(cell.trim())))
    .filter((cells) => cells.length >= 4 && cells[0] && cells[0] !== "Decision" && !/^[-:]+$/u.test(cells[0]))
    .map((cells) => ({ id: cells[0], timing: cells[1] ?? "", status: cells[2] ?? "", resolution: cells[3] ?? "" }));
}

function localizedSummaryBlocks(markdown) {
  const source = markdown.replace(/\r\n?/gu, "\n");
  const matches = [...source.matchAll(/^## AGDF Approval Summary \(([^;\n]+);\s*source=([A-Za-z][A-Za-z0-9-]*)\)\s*\n([\s\S]*?)(?=^#{1,2}\s|(?![\s\S]))/gmu)];
  return matches.map((match) => ({ locale: match[1].trim(), source: match[2].trim().toLowerCase(), body: match[3].trim() }));
}

function validateLocalizedSummaryBlock(gate, block, sourceMarkdown, sourceLanguage) {
  if (!block || !block.body) throw new Error("approval_summary_locale_missing");
  if (block.source !== sourceLanguage) throw new Error("approval_summary_source_language_mismatch");
  if (block.body.length > MAX_LOCALIZED_SUMMARY_CHARS || /(?:…|\.\.\.)/u.test(block.body))
    throw new Error("approval_summary_truncated_or_overlong");
  const lines = block.body.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  if (lines.some((line) => line.length > MAX_LOCALIZED_SUMMARY_ITEM_CHARS))
    throw new Error("approval_summary_field_overlong");
  if (gate === "PRD") {
    const sourceIds = criterionEntries(sourceMarkdown).map((entry) => entry.id);
    const summaryIds = lines.flatMap((line) => [...line.matchAll(/^\s*[-*]\s*([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)\s*:/giu)].map((match) => match[1]));
    if (!sourceIds.length) throw new Error("approval_summary_criteria_missing");
    if (new Set(sourceIds).size !== sourceIds.length) throw new Error("approval_summary_source_criteria_duplicate");
    if (new Set(summaryIds).size !== summaryIds.length) throw new Error("approval_summary_criteria_duplicate");
    const sourceSet = new Set(sourceIds);
    if (summaryIds.some((id) => !sourceSet.has(id))) throw new Error("approval_summary_criteria_unknown");
    if (summaryIds.length !== sourceIds.length || sourceIds.some((id) => !summaryIds.includes(id)))
      throw new Error("approval_summary_criteria_incomplete");
    if (!lines.some((line) => /^(?:[-*]\s*)?(?:Nutzerziel|User intent|Ziel|Goal)\s*:/iu.test(line)))
      throw new Error("approval_summary_user_goal_missing");
    if (!lines.some((line) => /^(?:[-*]\s*)?(?:Umfang|Scope|Produktumfang|Product scope)\s*:/iu.test(line)))
      throw new Error("approval_summary_scope_missing");
    const decisions = approvalDecisionEntries(sourceMarkdown);
    if (decisions.length && !lines.some((line) => /^(?:[-*]\s*)?(?:Entscheidungen|Decisions|Geklärte Entscheidungen|Resolved decisions|Offene Entscheidungen|Open decisions)\s*:/iu.test(line)))
      throw new Error("approval_summary_decisions_missing");
  }
}

function requiredLocalizedSummary(gate, markdown, languages, { path } = {}) {
  if (!languages.approval_summary_required) return null;
  const blocks = localizedSummaryBlocks(markdown).filter(block => block.locale === languages.presentation_language);
  if (blocks.length !== 1) throw new Error(blocks.length ? "approval_summary_locale_duplicate" : "approval_summary_locale_missing");
  const block = blocks[0];
  validateLocalizedSummaryBlock(gate, block, substantiveMarkdown(markdown), languages.artifact_language);
  // UAT reads these fields later with the same owner and the same locale choice.
  const locale = String(languages.presentation_language ?? "").toLowerCase().startsWith("de") ? "de" : "en";
  const { gaps } = localizedDecisionFields(gate, markdown, { locale, sourceLanguage: languages.artifact_language, path });
  if (gaps.length) throw Object.assign(new Error("approval_summary_field_unreadable"),
    { diagnostics: gaps.map(({ field, expected }) => ({ field, expected })) });
  return block;
}

// Reuse the presentation validator before authoring is considered complete.
export function evaluateApprovalSummaryReadiness(gate, markdown, languages, { path } = {}) {
  try {
    requiredLocalizedSummary(gate, markdown, languages, { path });
    return Object.freeze({ ready: true, required_heading: languages.approval_summary_heading, reason: null });
  } catch (error) {
    if (!String(error.message).startsWith("approval_summary_")) throw error;
    return Object.freeze({ ready: false, required_heading: languages.approval_summary_heading, reason: error.message, ...(error.diagnostics ? { diagnostics: error.diagnostics } : {}) });
  }
}

// Diagnosis shares the validator's owner. It describes a failed constraint, never relaxes it.
export function renderApprovalSummaryIssue(summary, { path, presentationLanguage }) {
  const locale = resolvePresentationLocale(interactionLocales, presentationLanguage);
  const pack = localePack(interactionLocales, locale), german = locale.split("-")[0] === "de";
  const expected = {
    approval_summary_user_goal_missing: german ? "- Ziel:" : "- Goal:",
    approval_summary_scope_missing: german ? "- Umfang:" : "- Scope:",
    approval_summary_decisions_missing: german ? "- Entscheidungen:" : "- Decisions:",
    approval_summary_field_unreadable: summary.diagnostics?.map(row => row.expected).join("` · `") || undefined,
  }[summary.reason] ?? summary.required_heading;
  return [
    `${pack.statusCard.summaryRecovery}: \`${path}\``,
    `${pack.statusCard.summaryReason}: \`${summary.reason}\``,
    `${pack.statusCard.summaryExpected}: \`${expected}\`${expected !== summary.required_heading ? ` · \`${summary.required_heading}\`` : ""}`,
  ].join("\n");
}

function sectionBody(markdown, pattern, contentPattern = null, maxItems = 3) {
  const lines = markdown.replace(/\r\n?/gu, "\n").split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^(#{2,6})\s+(?:\d+\.\s*)?(.+?)\s*#*\s*$/u);
    if (!heading || !pattern.test(heading[2])) continue;
    const body = [];
    const level = heading[1].length;
    let inTable = false;
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const nextHeading = lines[cursor].match(/^(#{2,6})\s+/u);
      if (nextHeading && nextHeading[1].length <= level) break;
      let line = lines[cursor].trim();
      if (!line) { inTable = false; continue; }
      if (/^\|/u.test(line)) {
        if (!inTable) { inTable = true; continue; }
        if (/^\|?[\s:|-]+\|?$/u.test(line)) continue;
        line = line.replace(/^\||\|$/gu, "").split("|").map((cell) => cell.trim()).filter(Boolean).join(" — ");
      } else {
        inTable = false;
        line = line.replace(/^(?:[-*+]\s+|\d+[.)]\s+)/u, "");
      }
      if (contentPattern && !contentPattern.test(line)) continue;
      const cleaned = userFacingSummaryText(line);
      if (!cleaned || /^(?:what|which|how|who|every field|specify|decision:|status:|gate:|date:|owner:)/iu.test(cleaned)
          || /^(?:ui_ux_impact|ux_intent_definition|primary_user_intent|success_signal|primary_decision_or_action):/iu.test(cleaned)) continue;
      body.push(cleaned);
      if (body.length >= maxItems) break;
    }
    if (body.length) return body;
  }
  return [];
}

function artifactSummary(gate, markdown, { runId, revisionId, language, sourceLanguage, artefactPath }) {
  const locale = resolvePresentationLocale(interactionLocales, language);
  const pack = localePack(interactionLocales, locale);
  const german = locale.split("-")[0] === "de";
  const source = substantiveMarkdown(markdown);
  const presentationLanguage = locale.split("-")[0];
  const sourceLanguageNote = sourceLanguage !== presentationLanguage
    ? `- ${pack.statusCard.sourceLanguage}: ${pack.statusCard[{ en: "languageEnglish", de: "languageGerman" }[sourceLanguage]] ?? sourceLanguage} · ${pack.statusCard.originalLanguageExcerpts}`
    : "";
  const items = [];
  if (sourceLanguage !== presentationLanguage) {
    const block = requiredLocalizedSummary(gate, markdown, {
      approval_summary_required: true, presentation_language: locale, artifact_language: sourceLanguage,
    }, { path: artefactPath });
    const summary = [sourceLanguageNote, block.body].filter(Boolean).join("\n");
    return { markdown: summary, digest: hash(summary) };
  }

  for (const [label, pattern, contentPattern] of SUMMARY_SECTIONS[gate] ?? []) {
    if (gate === "PRD" && label === "Abnahme") continue;
    if (gate === "PRD" && label === "Offen") continue;
    const maxItems = gate === "TP" && label === "Aufgaben" ? Number.POSITIVE_INFINITY : 1;
    const values = sectionBody(source, pattern, contentPattern, maxItems);
    if (!values.length) continue;
    const displayLabel = german ? label : (SUMMARY_LABELS_EN[label] ?? label);
    items.push(`- ${displayLabel}: ${values.join("; ")}`);
  }
  if (gate === 'QA') {
    const decision = readReportDecision(markdown);
    if (decision) items.unshift(`- ${german ? 'Entscheidung' : 'Decision'}: ${decision}`);
  }
  if (gate === "PRD") {
    const criteria = criterionEntries(source);
    if (!criteria.length) throw new Error("approval_summary_criteria_missing");
    if (new Set(criteria.map((entry) => entry.id)).size !== criteria.length) throw new Error("approval_summary_source_criteria_duplicate");
    const criterionRows = criteria.map((entry) => {
      const description = criterionDescription(entry);
      if (!description) throw new Error("approval_summary_criterion_content_missing");
      return `  - ${entry.id}: ${description}`;
    });
    items.push(`- ${german ? "Abnahmekriterien" : "Acceptance criteria"}:\n${criterionRows.join("\n")}`);
    const decisions = approvalDecisionEntries(source);
    if (decisions.length) {
      const rows = decisions.map((decision) => {
        const state = german
          ? ({ resolved: "geklärt", open: "offen" }[decision.status] ?? decision.status)
          : decision.status;
        return `  - ${decision.id} (${state}): ${decision.resolution}`;
      });
      items.push(`- ${german ? "Entscheidungen" : "Decisions"}:\n${rows.join("\n")}`);
    }
  }
  if (!items.length) throw new Error("approval_summary_content_missing");
  const summary = [sourceLanguageNote, ...items].filter(Boolean).join("\n");
  return { markdown: summary, digest: hash(summary) };
}

// A compact decision brief is a projection of the already validated, source-
// authored summary. Missing authored fields stay absent; no agent/UI paraphrase.
export function decisionBriefFromSummary(summary, language) {
  const german = String(language).toLowerCase().startsWith('de');
  const fields = [
    [german ? 'Ziel' : 'Goal', /^(?:Ziel|Goal|Nutzerziel|User intent):\s*(.+)$/iu],
    [german ? 'Vorschlag' : 'Proposal', /^(?:Vorschlag|Proposal|Umfang|Scope|Produktumfang|Product scope|Lösung|Solution):\s*(.+)$/iu],
    [german ? 'Änderungen' : 'Changes', /^(?:Änderungen|Changes):\s*(.+)$/iu],
    [german ? 'Risiken und offene Punkte' : 'Risks and open questions', /^(?:Risiken|Risks|Offen|Open questions):\s*(.+)$/iu],
  ];
  const lines = summary.split(/\r?\n/u).map(line => line.replace(/^\s*[-*]\s+/u, '').trim());
  return fields.flatMap(([label, pattern]) => { const matched = lines.map(line => line.match(pattern)).find(Boolean);
    return matched ? [`- ${label}: ${matched[1]}`] : []; }).join('\n');
}

export function renderReviewableApproval(root, report, { runId, gate, revisionId }, runState) {
  const p = report.approval_presentation;
  if (!p) return null;
  const german = String(p.presentation_language ?? "").toLowerCase().startsWith("de");
  let artifactSection;
  let artefactDigest;
  let summaryDigest;
  let documentContent;
  let summaryMarkdown;
  let decisionMarkdown;
  let documentLanguage = p.presentation_language;
  let documentHeading;
  const qaAcceptance = gate === 'QA' ? qaDeviationPresentation(runState?.qa_acceptance, p.presentation_language) : null;
  if (gate === "UAT") {
    const observation = observeDecisionContent(root, runState, { gate, locale: german ? 'de' : 'en',
      sourceLanguage: resolveArtifactPresentationLanguages(root, p.presentation_language).artifact_language });
    if (!observation.ready) throw Object.assign(Error('AGDF_DECISION_CONTENT_INCOMPLETE'), {
      recovery: decisionContentRecovery(observation, { locale: german ? 'de' : 'en', state: runState }),
    });
    const projection = runState?.evidence_applicability;
    const evidence = projection ? projection.current.map(row => ({ evidence: row.step, source: row.report.path, covers: row.sources.map(s => s.type).join(', '), strength: 'exact cooperative association' })) : [];
    const other = projection ? [...projection.superseded.map(row => ({ evidence: row.step, source: row.report.path, covers: row.reason, strength: german ? 'ersetzt' : 'superseded' })),
      ...projection.applicability_unknown.map(row => ({ evidence: row.step ?? row.evidence, source: row.report?.path ?? row.source, covers: row.reason, strength: german ? 'Zuordnung unbekannt' : 'applicability unknown' }))] : runState?.evidence_refs ?? [];
    const allEvidence = [...evidence, ...other];
    if (allEvidence.length === 0) return null;
    const labels = german ? ['Ziel', 'Geliefertes Ergebnis', 'Technische QA', 'Nachweisgrenzen', 'Risiken und offene Punkte', 'Freigabewirkung']
      : ['Intended outcome', 'Delivered result', 'Technical QA', 'Qualification limits', 'Risks and open issues', 'Approval effect'];
    const { goal, result, qa, limits, risks } = observation.groups;
    const pack = localePack(interactionLocales, resolvePresentationLocale(interactionLocales, p.presentation_language));
    const brief = [goal, result, qa, limits, risks, pack.primary.afterApproval.UAT].map((value, index) => `- ${labels[index]}: ${value}`).join('\n');
    decisionMarkdown = brief;
    const summaryLines = evidence.map((item) => `- ${item.evidence} · ${item.covers} (${item.strength})`);
    if (!evidence.length) summaryLines.push(german ? 'Keine aktuell exakt zugeordneten Nachweise; historische Zuordnung bleibt ausdrücklich unbekannt.' : 'No currently exact associated evidence; historical applicability remains explicitly unknown.');
    summaryLines.push(`- ${german ? 'Ersetzte oder nicht zugeordnete Nachweise' : 'Superseded or unassociated evidence'}: ${other.length}`);
    const attribution = observation.sources.map(s => `- ${s.type}: ${s.path} · ${s.digest}`).join('\n');
    const summaryText = brief + '\n\n' + summaryLines.join("\n") + '\n\n' + attribution;
    summaryDigest = hash(summaryText);
    summaryMarkdown = summaryText;
    artefactDigest = hash(JSON.stringify({ groups: observation.groups, sources: observation.sources, evidence: allEvidence }));
    artifactSection = `## ${german ? "Kurzfassung" : "Review summary"} · ${gate}\n\nRun: \`${runId}\` · Gate: \`${gate}\` · Revision: \`${revisionId}\`\n\n${summaryText}\n\n## ${german ? "Vorliegende UAT-Evidenz" : "Available UAT evidence"}\n\n${allEvidence.map((item) => `- ${item.evidence} · Quelle: ${item.source} · Deckt ab: ${item.covers} · Stärke: ${item.strength}`).join("\n")}`;
    documentContent = artifactSection;
    if (runState?.qa_acceptance?.accepted) {
      const accepted = qaDeviationPresentation(runState.qa_acceptance, p.presentation_language);
      summaryMarkdown += `\n\n${accepted.summary}`;
      decisionMarkdown += `\n\n${accepted.summary}`;
      summaryDigest = hash(summaryMarkdown);
      documentContent += `\n\n${accepted.summary}`;
    }
  } else {
    const artefact = runState?.artefacts?.get(gate);
    const path = resolvedArtefactFile(root, artefact?.path);
    if (!path) return null;
    if (/[<>\r\n]/u.test(path)) throw new Error("approval_artefact_path_invalid");
    const content = readFileSync(path);
    if (content.byteLength > MAX_APPROVAL_ARTEFACT_BYTES) throw new Error("approval_artefact_too_large");
    artefactDigest = hash(content);
    let contentText;
    try { contentText = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(content); }
    catch { throw new Error("approval_artefact_encoding_invalid"); }
    let summary;
    const languages = resolveArtifactPresentationLanguages(root, p.presentation_language);
    const sourceLanguage = languages.artifact_language;
    documentLanguage = sourceLanguage;
    try {
      summary = artifactSummary(gate, contentText, { runId, revisionId, language: p.presentation_language, sourceLanguage,
        artefactPath: String(artefact?.path ?? "").replace(/^`|`$/gu, "") });
    } catch (error) {
      if (String(error?.message ?? "").startsWith("approval_summary_")) {
        const locale = resolvePresentationLocale(interactionLocales, p.presentation_language);
        const pack = localePack(interactionLocales, locale);
        const languageName = pack.statusCard[locale.split("-")[0] === "de" ? "languageGerman" : "languageEnglish"];
        const artifactLabel = german ? "Artefakt" : "Artefact";
        const requiredHeading = languages.approval_summary_heading ?? `AGDF Approval Summary (${locale}; source=${sourceLanguage})`;
        error.recovery = [
          `## ${pack.statusCard.summaryRecovery}`,
          `Run: \`${runId}\` · Gate: \`${gate}\` · Revision: \`${revisionId}\``,
          renderApprovalSummaryIssue({ reason: error.message, required_heading: requiredHeading, diagnostics: error.diagnostics }, {
            path, presentationLanguage: p.presentation_language,
          }),
          pack.operationalValues.approvalSummaryRecovery.replace("{language}", languageName),
          `${german ? "Erforderlicher Abschnitt" : "Required section"}: \`${requiredHeading}\``,
          `${artifactLabel}: [${basename(path)}](<${path}>)`,
          pack.operationalValues.completeMissingApprovalSummary,
        ].join("\n\n");
      }
      throw error;
    }
    if (!summary) return null;
    documentContent = contentText;
    documentHeading = contentText.match(/^#\s+(.+)$/mu)?.[1];
    summaryDigest = summary.digest;
    summaryMarkdown = summary.markdown;
    artifactSection = `${summary.markdown}\n\n## ${german ? "Prüfartefakt" : "Review artefact"} · ${gate}\n\nRun: \`${runId}\` · Gate: \`${gate}\` · Revision: \`${revisionId}\`\n\n${german ? "Artefakt" : "Artefact"}: [${basename(path)}](<${path}>)\n\nSHA-256: \`${artefactDigest}\`\n\n${german ? "Bitte öffne die verlinkte Fassung vor deiner Entscheidung." : "Open the linked version before deciding."}`;
  }
  const pack = localePack(interactionLocales, resolvePresentationLocale(interactionLocales, p.presentation_language));
  if (gate === 'PRD') {
    const preview = previewForState(root, runState);
    if (preview) {
      const d = preview.descriptor, label = pack.decisionCard;
      const inert = value => String(value).replace(/[\\`*_{}\[\]()<>#!|]/gu, '\\$&');
      const review = [`**${label.previewTask} · ${inert(d.version)}**`, inert(d.review_task),
        `${label.previewScenarios}: ${d.scenarios.map(inert).join(' · ')}`,
        `${label.previewCriteria}: ${d.criterion_ids.join(', ')}`, label.previewIllustrative,
        ...(d.open_questions.length ? [d.open_questions.map(inert).join('\n')] : [])].join('\n\n');
      summaryMarkdown += `\n\n${review}`; summaryDigest = hash(summaryMarkdown);
      decisionMarkdown = (decisionMarkdown || decisionBriefFromSummary(summaryMarkdown, p.presentation_language) || '') + `\n\n${review}`;
    }
  }
  // One source-authored summary and one decision moment. Provenance remains
  // available without duplicating the status, transition and approval prompts.
  if (qaAcceptance) { summaryMarkdown = qaAcceptance.summary; summaryDigest = hash(summaryMarkdown); }
  const parts = [`## ${qaAcceptance ? pack.decisionCard.deviationAcceptanceIntro : pack.gateActionTitles[gate]}`, resolveHumanRunTitle({ currentArtefactHeading: documentHeading, runContent: runState?.content, runId }),
    qaAcceptance?.summary || decisionMarkdown || decisionBriefFromSummary(summaryMarkdown, p.presentation_language) || summaryMarkdown, qaAcceptance?.effect || pack.primary.afterApproval[gate],
    german ? 'Antworte „Dokument lesen“, um diese Fassung vollständig im Chat zu lesen. Fragen und Änderungswünsche kannst du hier besprechen. Ohne deine Freigabe bleibt dieser Schritt offen.'
      : 'Reply “Read document” to read this complete version in Chat. Discuss questions and requested changes here. This step remains open until you approve.',
    pack.decisionCard.chatApprovalHint.replace('{gate}', gate),
    `### ${german ? 'Details und Nachweise' : 'Details and evidence'}\n\n${summaryMarkdown}`,
    `### ${german ? 'Fassung und Quellen' : 'Version and sources'}\n\nRun: \`${runId}\` · ${pack.gateTitles[gate]} · Revision: \`${revisionId}\`\n\nSHA-256: \`${artefactDigest}\``];
  return parts.every((part) => typeof part === "string" && part.trim())
    ? { markdown: parts.join("\n\n"), companion_markdown: [german
          ? `Die AGDF-Karte ist geöffnet. Du kannst dort „${qaAcceptance?.approve_label || 'Freigeben'}“ klicken oder hier \`Approval: ${gate}\` eingeben. Beide Wege entscheiden dieselbe vorgelegte Fassung einmal.`
          : `The AGDF card is open. Click “${qaAcceptance?.approve_label || 'Approve'}” there or enter \`Approval: ${gate}\` here. Both paths decide the same presented version once.`, ...parts].join("\n\n"), preview_markdown: artifactSection,
        artefact_digest: artefactDigest, summary_digest: summaryDigest, summary_markdown: summaryMarkdown,
        document_content: documentContent, document_language: documentLanguage,
        ...(qaAcceptance ? { qa_acceptance: { kind: qaAcceptance.kind, digest: qaAcceptance.digest } } : {}) } : null;
}
