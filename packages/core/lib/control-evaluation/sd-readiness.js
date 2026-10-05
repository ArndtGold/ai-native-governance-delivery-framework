import { readFileSync } from "node:fs";
import { resolvedArtefactFile } from "./run-state.js";

export const SD_DECISIONS_CONTRACT = "Design Decisions contract: sd-decisions-v1";

// Explicit declared decision state only; semantic completeness still needs review.
export function evaluateSdDecisionContent(markdown) {
  const content = markdown.replace(/\r\n?/gu, "\n");
  const markers = [...content.matchAll(/^Design Decisions contract:[ \t]*(.*)$/gmu)];
  const headings = [...content.matchAll(/^## Design Decisions[ \t]*$/gmu)];
  if (!markers.length && !headings.length) return { ready: true, open_decisions: [], contract: "legacy" };
  const fail = message => ({ ready: false, open_decisions: [message], contract: "sd-decisions-v1" });
  if (markers.length !== 1 || markers[0][1].trim() !== "sd-decisions-v1")
    return fail("Declare exactly one supported Design Decisions contract: sd-decisions-v1");
  if (headings.length !== 1) return fail("Declare exactly one Design Decisions section");
  const body = content.slice(headings[0].index + headings[0][0].length).split(/^## /mu)[0];
  const lines = body.split("\n").filter(line => line.trim().startsWith("|"));
  const rows = lines.map(line => line.trim().slice(1, -1).split("|").map(cell => cell.trim()));
  if (rows.length < 3 || rows[0].join("|") !== "Decision|Timing|Status|Resolution|Owner"
      || !/^\|[\s:|-]+\|$/u.test(lines[1].trim()) || lines.some(line => !line.trim().endsWith("|")))
    return fail("Design Decisions table is empty or malformed");
  const incomplete = value => !value || /^(?:<|tbd\b|todo\b|to confirm\b|none\b)/iu.test(value);
  const open = [], seen = new Set();
  for (const [decision, timing, status, resolution, owner, ...extra] of rows.slice(2)) {
    if (incomplete(decision) || seen.has(decision) || extra.length
        || !["before_sd", "later_tp"].includes(timing) || !["resolved", "open", "deferred"].includes(status)) {
      open.push(decision || "Malformed design decision row");
      continue;
    }
    seen.add(decision);
    if (incomplete(owner) || incomplete(resolution) || (timing === "before_sd" && status !== "resolved")) open.push(decision);
  }
  return { ready: open.length === 0, open_decisions: open, contract: "sd-decisions-v1" };
}

export function evaluateSdReadiness(targetDir, runState) {
  const file = resolvedArtefactFile(targetDir, runState.artefacts.get("SD")?.path);
  return file ? evaluateSdDecisionContent(readFileSync(file, "utf8"))
    : { ready: false, open_decisions: ["SD artefact is missing"], contract: "not_linked" };
}
