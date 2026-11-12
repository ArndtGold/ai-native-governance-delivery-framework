// One owner for a Run's human title and orienting Objective. Pure: no `node:` import, so the run
// inventory, the cockpit, the companion run view and the status card share exactly this rule.
// Precedence: registered UR heading, then the authored Objective, then the normalized Run ID.
import { isDecisionContentPlaceholder } from "../control-evaluation/decision-content-placeholder.js";

// The run-ID title every reader shows when no authored title exists.
export function normalizedRunTitle(runId) {
  const words = String(runId ?? "").replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  return words ? words.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase()) : "AGDF run";
}

// A heading as display text: no leading hashes and no inline Markdown marks.
export function plainHeading(value) {
  return String(value ?? "").replace(/^#+\s*/u, "").replace(/[`*_]/gu, "").replace(/\s+/gu, " ").trim();
}

// Lines of one level-two section up to the next heading; an empty section stays empty.
function sectionLines(text, heading) {
  const lines = text.split("\n"), start = lines.findIndex(line => line.trimEnd() === `## ${heading}`);
  if (start < 0) return [];
  const rest = lines.slice(start + 1), end = rest.findIndex(line => /^#{1,2} /u.test(line));
  return end < 0 ? rest : rest.slice(0, end);
}

// The first paragraph of the Objective, so hard-wrapped objectives stay whole. A template prompt,
// a status word or a bare generated Run ID is no orientation and yields null.
export function authoredObjective(runContent) {
  const text = String(runContent ?? "").replace(/^﻿/u, "").replace(/\r\n?/gu, "\n");
  const lines = sectionLines(text, "Objective").map(value => value.trim()), first = lines.findIndex(Boolean);
  if (first < 0) return null;
  const paragraph = lines.slice(first), end = paragraph.indexOf("");
  const value = (end < 0 ? paragraph : paragraph.slice(0, end)).join(" ")
    .replace(/^(?:[-*>]|#+|\d+\.)\s+/u, "").replace(/\*\*|__|`/gu, "").replace(/\s+/gu, " ").trim();
  return isDecisionContentPlaceholder(value) ? null : value;
}

// `urHeading` is the registered UR document heading without its "UR:" prefix, when the caller read it.
export function runIdentity({ runId, runContent, urHeading } = {}) {
  const objective = authoredObjective(runContent), ur = plainHeading(urHeading);
  if (ur) return { title: ur, title_source: "ur", objective };
  if (objective) return { title: objective, title_source: "objective", objective };
  return { title: normalizedRunTitle(runId), title_source: "run_id", objective: null };
}
