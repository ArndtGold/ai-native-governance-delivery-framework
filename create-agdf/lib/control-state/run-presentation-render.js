import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { TextDecoder } from "node:util";
import { resolvedArtefactFile } from "../control-evaluation/run-state.js";
import { interactionLocales } from "../cli/runtime-context.js";
import { localePack, resolvePresentationLocale } from "../interaction-presentation.js";

// Read-only approval rendering. gate-check (and with it the MCP dispatcher) imports this module;
// writing presentation records stays in run-presentation.js.
const MAX_APPROVAL_ARTEFACT_BYTES = 131072;
const MAX_SUMMARY_ITEM_CHARS = 280;
const SUMMARY_SECTIONS = Object.freeze({
  UR: [
    ["Problem", /problem|need|anlass/iu], ["Ziel", /goal|objective|ziel/iu],
    ["Umfang", /scope|umfang/iu], ["Abnahme", /acceptance|abnahme|success signal/iu],
    ["Offen", /risk|unknown|open question|offen/iu],
  ],
  PRD: [
    ["Nutzerziel", /ux intent and success|user intent/iu, /^primary_user_intent\s*:/iu],
    ["Erfolg", /ux intent and success|user intent/iu, /^success_signal\s*:/iu],
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

function clipSummary(value) {
  if (value.length <= MAX_SUMMARY_ITEM_CHARS) return value;
  const clipped = value.slice(0, MAX_SUMMARY_ITEM_CHARS - 1);
  return `${clipped.slice(0, Math.max(0, clipped.lastIndexOf(" ")))}…`;
}

function sectionBody(markdown, pattern, contentPattern = null) {
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
      if (body.length >= 3) break;
    }
    if (body.length) return body;
  }
  return [];
}

function artifactSummary(gate, markdown, { runId, revisionId, language }) {
  const german = String(language ?? "").toLowerCase().startsWith("de");
  const locale = resolvePresentationLocale(interactionLocales, language);
  const pack = localePack(interactionLocales, locale);
  const sections = SUMMARY_SECTIONS[gate] ?? [];
  const items = [];
  for (const [label, pattern, contentPattern] of sections) {
    const values = sectionBody(markdown, pattern, contentPattern);
    if (!values.length) continue;
    const value = clipSummary(values.slice(0,
      gate === "TP" && label === "Aufgaben" ? 3
        : gate === "PRD" && label === "Abnahme" ? 2
          : 1).join("; "));
    const displayLabel = gate === "PRD" && label === "Offen"
      ? german ? "Für SD/TP" : "For SD/TP"
      : german ? label : (SUMMARY_LABELS_EN[label] ?? label);
    items.push(`- ${displayLabel}: ${value}`);
    if (items.length >= 5) break;
  }
  if (gate === "PRD") {
    const decisionSection = markdown.split(/^## Approval Decisions\s*$/mu)[1]?.split(/^## /mu)[0] ?? "";
    const resolved = decisionSection.split(/\r?\n/u).filter((line) => line.trim().startsWith("|"))
      .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
      .filter((cells) => cells[1] === "before_prd" && cells[2] === "resolved")
      .map((cells) => `${cells[0]}: ${cells[3]}`);
    if (resolved.length) items.push(`- ${german ? "Vor PRD geklärt" : "Resolved before PRD"}: ${clipSummary(resolved.slice(0, 2).join("; "))}`);
  }
  if (!items.length) {
    const fallback = markdown.replace(/\r\n?/gu, "\n").split("\n")
      .filter((line) => !/^#{1,6}\s/u.test(line.trim()))
      .map((line) => compactSummaryText(line.replace(/^(?:[-*+]\s+|\d+[.)]\s+)/u, "")))
      .find((line) => line && !/^(?:status|gate|date|owner|based on):/iu.test(line) && !/^(?:what|which|how|who)\b/iu.test(line));
    if (fallback) items.push(`- ${german ? "Inhalt" : "Content"}: ${clipSummary(fallback)}`);
  }
  if (!items.length) return null;
  const sourceLanguage = detectSourceLanguage(markdown);
  const presentationLanguage = locale.split("-")[0];
  const sourceLanguageNote = sourceLanguage && sourceLanguage !== presentationLanguage
    ? `- ${pack.statusCard.sourceLanguage}: ${pack.statusCard[sourceLanguage === "en" ? "languageEnglish" : "languageGerman"]} · ${pack.statusCard.originalLanguageExcerpts}`
    : "";
  const summaryItems = [sourceLanguageNote, ...items].filter(Boolean);
  const summary = `## ${german ? "Kurzfassung" : "Review summary"} · ${gate}\n\nRun: \`${runId}\` · Gate: \`${gate}\` · Revision: \`${revisionId}\`\n\n${summaryItems.join("\n")}`;
  return { markdown: summary, digest: hash(summaryItems.join("\n")) };
}

function detectSourceLanguage(markdown) {
  const text = ` ${compactSummaryText(markdown).toLowerCase()} `;
  const markers = {
    en: ["the", "and", "before", "after", "this", "user", "users", "review", "draft", "scope", "success", "approval", "linked", "must", "should", "with", "from", "for"],
    de: ["der", "die", "das", "und", "vor", "nach", "diese", "dieser", "du", "nutzer", "prüfen", "entwurf", "umfang", "erfolg", "freigabe", "mit", "für", "aus", "wird", "soll", "darf"],
  };
  const score = Object.fromEntries(Object.entries(markers).map(([language, words]) => [language,
    words.reduce((count, word) => count + (text.match(new RegExp(`\\b${word}\\b`, "gu"))?.length ?? 0), 0),
  ]));
  if (score.en >= 3 && score.en >= score.de + 3) return "en";
  if (score.de >= 3 && score.de >= score.en + 3) return "de";
  return "";
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
    const summary = artifactSummary(gate, contentText, { runId, revisionId, language: p.presentation_language });
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

