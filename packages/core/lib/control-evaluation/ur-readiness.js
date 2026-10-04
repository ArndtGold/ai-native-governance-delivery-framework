import { readFileSync } from "node:fs";
import { resolvedArtefactFile } from "./run-state.js";

const sections = ["Problem", "Goal", "Affected Users", "Scope", "Non-Goals", "Acceptance Signals", "Existing Source Of Truth", "Risks And Unknowns", "Next Step"];
const templatePrompts = new Set([
  "What user, business or operational problem should be solved?", "What outcome should become possible?",
  "Which people or roles experience the problem and benefit from the outcome?", "What is included in this first slice?",
  "What is explicitly not part of this UR?", "How will we know the need is clear enough for PRD?",
  "Which existing repository artefacts, docs, code paths or decisions must be respected?",
  "Which questions must Brownfield Review, PRD, SD or later implementation-preparation Brownfield Analysis clarify?",
]);
// Marker absence preserves legacy compatibility; completeness does not prove semantic approval.
export function evaluateUrReadiness(targetDir, runState) {
  const path = resolvedArtefactFile(targetDir, runState.artefacts.get("UR")?.path);
  if (!path) return null;
  const content = readFileSync(path, "utf8");
  const markers = content.match(/^Requirements clarification:[^\r\n]*$/gmu) ?? [];
  if (!markers.length) return { ready: true, legacy: true, open_items: [] };
  const open = markers.length === 1 && markers[0].trim() === "Requirements clarification: complete" ? [] : ["Requirements clarification"];
  const blocks = content.split(/^##[ \t]+/mu).slice(1).map(block => {
    const [heading, ...body] = block.split(/\r?\n/u);
    return { heading: heading.replace(/^\d+\.[ \t]*/u, "").trim(), body: body.join("\n").trim() };
  });
  for (const section of sections) {
    const matches = blocks.filter(block => block.heading === section);
    const body = matches[0]?.body ?? "";
    if (matches.length !== 1 || !body || templatePrompts.has(body) || /<[^>]+>|^(?:tbd|todo|to confirm)[ \t]*$/imu.test(body)) open.push(section);
  }
  return { ready: open.length === 0, legacy: false, open_items: open };
}
