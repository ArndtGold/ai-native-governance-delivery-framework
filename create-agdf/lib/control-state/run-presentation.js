import { createHash, randomUUID } from "node:crypto";
import { closeSync, constants, fstatSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { runPath } from "./run-state-reader.js";
import { readRun, rejected } from "./run-state-edits.js";
import { resolvedArtefactFile } from "../control-evaluation/run-state.js";
import { APPROVAL_GATES, runSealState } from "./run-seal.js";
import { TextDecoder } from "node:util";
import { interactionLocales } from "../cli/runtime-context.js";
import { localePack, resolvePresentationLocale } from "../interaction-presentation.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
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
const hash = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const recovery = "Run run-present for the current run/gate/revision, show its exact presentation, then wait for a NEW deliberate user response. Never bind an earlier reply retroactively.";

function directory(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error("presentation_path_invalid");
  return stat;
}

function checkedRunDirectory(root, runId) {
  const path = dirname(runPath(root, runId));
  for (const dir of [root, join(root, ".agdf"), join(root, ".agdf", "control"), join(root, ".agdf", "control", "runs"), path]) directory(dir);
  const state = lstatSync(join(path, "RUN_STATE.md"));
  if (state.isSymbolicLink() || !state.isFile()) throw new Error("presentation_path_invalid");
  return path;
}

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

function binding(root, { runId, gate, revisionId, language }, evaluateGateCheck) {
  checkedRunDirectory(root, runId);
  const run = readRun(root, runId);
  if (run.rejection) throw new Error(run.rejection.reason);
  if (run.meta.revision_id !== revisionId) throw new Error("stale_revision");
  const seal = runSealState(root, run.content);
  if (seal.status !== "valid") throw new Error("presentation_state_changed");
  const report = evaluateGateCheck(root, { runId, ...(language ? { presentationLanguage: language } : {}) });
  const artefactPresentation = report.approval_presentation;
  const text = artefactPresentation?.markdown;
  if (report.status !== "open" && report.blocking_reason && report.blocking_reason !== "none") {
    const error = new Error(report.blocking_reason);
    error.recovery = report.next_allowed_action;
    throw error;
  }
  if (report.status !== "open" || report.current_gate !== gate || report.missing_approval !== `Approval: ${gate}`
      || report.approval_presentation?.revision_id !== revisionId || !text) throw new Error("approval_presentation_unavailable");
  return { run_id: runId, gate, revision_id: revisionId, content_digest: seal.actual.content_seal,
    artefact_digest: artefactPresentation.artefact_digest,
    summary_digest: artefactPresentation.summary_digest,
    presentation_language: report.approval_presentation.presentation_language, presentation_digest: hash(text), text };
}

// Evidence of a prepared presentation, NOT a signature or proof of human visibility.
export function prepareRunPresentation(root, input, { evaluateGateCheck }) {
  const { runId, gate } = input;
  if (!APPROVAL_GATES.includes(gate)) return rejected(runId, "gate_invalid");
  try {
    const prepared = binding(root, input, evaluateGateCheck);
    const dir = join(checkedRunDirectory(root, runId), "presentations");
    try { mkdirSync(dir); } catch (error) { if (error.code !== "EEXIST") throw error; }
    const identity = directory(dir);
    const presentationId = randomUUID();
    const { text, ...bindingRecord } = prepared;
    const record = { schema_version: 1, presentation_id: presentationId, created_at: new Date().toISOString(), ...bindingRecord };
    const body = JSON.stringify(record);
    const envelope = JSON.stringify({ record, digest: hash(body) }, null, 2) + "\n";
    const fd = openSync(join(dir, `${presentationId}.json`), "wx", 0o600);
    try { writeFileSync(fd, envelope); fsyncSync(fd); } finally { closeSync(fd); }
    const after = directory(dir);
    if (after.dev !== identity.dev || after.ino !== identity.ino) throw new Error("presentation_path_invalid");
    const fresh = binding(root, input, evaluateGateCheck);
    if (JSON.stringify(fresh) !== JSON.stringify(prepared)) throw new Error("presentation_state_changed");
    return Object.freeze({ ...record, schema_version: "1", outcome: "prepared", text, record_digest: hash(body),
      next_action: "Show text verbatim before waiting for a deliberate response. Pass this presentation_id to run-approve only for that response." });
  } catch (error) {
    return rejected(runId, error.code ?? error.message, { recovery: error.recovery ?? recovery });
  }
}

export function validateRunPresentation(root, { runId, gate, revisionId, presentationId }, { evaluateGateCheck }) {
  if (!UUID.test(presentationId ?? "")) return { reason: "presentation_required", recovery };
  try {
    const dir = join(checkedRunDirectory(root, runId), "presentations");
    directory(dir);
    const path = join(dir, `${presentationId}.json`);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 262144) throw new Error("presentation_path_invalid");
    const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    let envelope;
    try {
      const actual = fstatSync(fd);
      if (!actual.isFile() || actual.dev !== stat.dev || actual.ino !== stat.ino || actual.size > 262144) throw new Error("presentation_path_invalid");
      envelope = JSON.parse(readFileSync(fd, "utf8"));
    } finally { closeSync(fd); }
    const { record, digest } = envelope;
    if (!record || record.schema_version !== 1 || record.presentation_id !== presentationId
        || record.run_id !== runId || record.gate !== gate || record.revision_id !== revisionId
        || digest !== hash(JSON.stringify(record)) || !Number.isFinite(Date.parse(record.created_at))) throw new Error("presentation_binding_invalid");
    const fresh = binding(root, { runId, gate, revisionId, language: record.presentation_language }, evaluateGateCheck);
    if (Object.entries(fresh).some(([key, value]) => key !== "text" && record[key] !== value)) throw new Error("presentation_state_changed");
    return { presentationId, digest };
  } catch (error) {
    return { reason: error.code === "ENOENT" ? "presentation_missing" : error.message, recovery: error.recovery ?? recovery };
  }
}
