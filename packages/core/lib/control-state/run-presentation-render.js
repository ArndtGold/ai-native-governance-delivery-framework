import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { TextDecoder } from "node:util";
import { resolvedArtefactFile } from "../control-evaluation/run-state.js";
import { interactionLocales, resolveConfiguredArtifactLanguage } from "../resources/context.js";
import { localePack, resolvePresentationLocale } from "../interaction-presentation.js";

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
    ["Entscheidung", /qa decision|entscheidung/iu], ["TP-Abdeckung", /tp coverage|abdeckung/iu],
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
});
export const hash = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;

function compactSummaryText(value) {
  return value.replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1").replace(/`([^`]+)`/gu, "$1")
    .replace(/<[^>]+>/gu, "").replace(/\s+/gu, " ").trim();
}

function userFacingSummaryText(value) {
  const text = compactSummaryText(value);
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
  const lines = substantiveMarkdown(markdown).replace(/\r\n?/gu, "\n").split("\n");
  const entries = [];
  let current = null;
  for (const line of lines) {
    const criterion = line.match(/^\s*[-*]\s*criterion_id\s*:\s*([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?:\s*;\s*(.*))?\s*$/iu);
    if (criterion) {
      if (current) entries.push(current);
      current = { id: criterion[1], fields: {} };
      for (const clause of String(criterion[2] ?? "").split(/;\s*/u)) {
        const field = clause.match(/^([a-z][a-z0-9_-]*(?:\s+[a-z][a-z0-9_-]*)*)\s*:\s*(.*)$/iu);
        if (field) current.fields[field[1].replace(/\s+/gu, "_")] = field[2].trim();
      }
      continue;
    }
    if (!current) continue;
    if (/^#{1,6}\s/u.test(line)) {
      entries.push(current);
      current = null;
      continue;
    }
    const field = line.match(/^\s*[-*]\s*([a-z][a-z0-9_-]*(?:\s+[a-z][a-z0-9_-]*)*)\s*:\s*(.*)$/iu);
    if (field && !current.fields[field[1].replace(/\s+/gu, "_")]) current.fields[field[1].replace(/\s+/gu, "_")] = field[2].trim();
  }
  if (current) entries.push(current);
  return entries;
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

function artifactSummary(gate, markdown, { runId, revisionId, language, sourceLanguage }) {
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
    const blocks = localizedSummaryBlocks(markdown).filter((block) => block.locale === locale);
    if (blocks.length !== 1) throw new Error(blocks.length ? "approval_summary_locale_duplicate" : "approval_summary_locale_missing");
    const block = blocks[0];
    validateLocalizedSummaryBlock(gate, block, source, sourceLanguage);
    const summary = `## ${german ? "Kurzfassung" : "Review summary"} · ${gate}\n\nRun: \`${runId}\` · Gate: \`${gate}\` · Revision: \`${revisionId}\`\n\n${[sourceLanguageNote, block.body].filter(Boolean).join("\n")}`;
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
  const summary = `## ${german ? "Kurzfassung" : "Review summary"} · ${gate}\n\nRun: \`${runId}\` · Gate: \`${gate}\` · Revision: \`${revisionId}\`\n\n${[sourceLanguageNote, ...items].filter(Boolean).join("\n")}`;
  return { markdown: summary, digest: hash(summary) };
}

export function renderReviewableApproval(root, report, { runId, gate, revisionId }, runState) {
  const p = report.approval_presentation;
  if (!p) return null;
  const german = String(p.presentation_language ?? "").toLowerCase().startsWith("de");
  let artifactSection;
  let artefactDigest;
  let summaryDigest;
  if (gate === "UAT") {
    const evidence = runState?.evidence_refs;
    if (!Array.isArray(evidence) || evidence.length === 0) return null;
    const summaryLines = evidence.slice(0, 3).map((item) => `- ${item.evidence} · ${item.covers} (${item.strength})`);
    if (evidence.length > 3) summaryLines.push(`- ${german ? "Weitere Evidenz" : "Additional evidence"}: ${evidence.length - 3} ${german ? "Einträge" : "items"}`);
    const summaryText = summaryLines.join("\n");
    summaryDigest = hash(summaryText);
    artefactDigest = hash(JSON.stringify(evidence));
    artifactSection = `## ${german ? "Kurzfassung" : "Review summary"} · ${gate}\n\nRun: \`${runId}\` · Gate: \`${gate}\` · Revision: \`${revisionId}\`\n\n${summaryText}\n\n## ${german ? "Vorliegende UAT-Evidenz" : "Available UAT evidence"}\n\n${evidence.map((item) => `- ${item.evidence} · Quelle: ${item.source} · Deckt ab: ${item.covers} · Stärke: ${item.strength}`).join("\n")}`;
  } else {
    const artefact = runState?.artefacts?.get(gate);
    const path = resolvedArtefactFile(root, artefact?.path);
    if (!path) return null;
    if (/[<>\r\n]/u.test(path)) throw new Error("approval_artefact_path_invalid");
    const content = readFileSync(path);
    if (content.byteLength > MAX_APPROVAL_ARTEFACT_BYTES) throw new Error("approval_artefact_too_large");
    artefactDigest = hash(content);
    let contentText;
    try { contentText = new TextDecoder("utf-8", { fatal: true }).decode(content); }
    catch { throw new Error("approval_artefact_encoding_invalid"); }
    let summary;
    const sourceLanguage = resolveConfiguredArtifactLanguage(root);
    try {
      summary = artifactSummary(gate, contentText, { runId, revisionId, language: p.presentation_language, sourceLanguage });
    } catch (error) {
      if (String(error?.message ?? "").startsWith("approval_summary_")) {
        const locale = resolvePresentationLocale(interactionLocales, p.presentation_language);
        const pack = localePack(interactionLocales, locale);
        const languageName = pack.statusCard[locale.split("-")[0] === "de" ? "languageGerman" : "languageEnglish"];
        const artifactLabel = german ? "Artefakt" : "Artefact";
        const requiredHeading = `AGDF Approval Summary (${locale}; source=${sourceLanguage})`;
        error.recovery = [
          `## ${pack.statusCard.summaryRecovery}`,
          `Run: \`${runId}\` · Gate: \`${gate}\` · Revision: \`${revisionId}\``,
          pack.operationalValues.approvalSummaryRecovery.replace("{language}", languageName),
          `${german ? "Erforderlicher Abschnitt" : "Required section"}: \`${requiredHeading}\``,
          `${artifactLabel}: [${basename(path)}](<${path}>)`,
          pack.operationalValues.completeMissingApprovalSummary,
        ].join("\n\n");
      }
      throw error;
    }
    if (!summary) return null;
    summaryDigest = summary.digest;
    artifactSection = `${summary.markdown}\n\n## ${german ? "Prüfartefakt" : "Review artefact"} · ${gate}\n\nRun: \`${runId}\` · Gate: \`${gate}\` · Revision: \`${revisionId}\`\n\n${german ? "Artefakt" : "Artefact"}: [${basename(path)}](<${path}>)\n\nSHA-256: \`${artefactDigest}\`\n\n${german ? "Bitte öffne die verlinkte Fassung vor deiner Entscheidung." : "Open the linked version before deciding."}`;
  }
  const parts = [p.blocks?.run_status_card?.markdown, report.status_presentation?.markdown,
    artifactSection, p.blocks?.gate_transition_card?.markdown,
    p.approval_interaction?.exact_text_fallback];
  return parts.every((part) => typeof part === "string" && part.trim())
    ? { markdown: parts.join("\n\n"), preview_markdown: artifactSection,
        artefact_digest: artefactDigest, summary_digest: summaryDigest } : null;
}
