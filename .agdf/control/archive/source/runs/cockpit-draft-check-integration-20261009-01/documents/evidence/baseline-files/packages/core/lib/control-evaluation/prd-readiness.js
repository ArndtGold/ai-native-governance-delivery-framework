import { readFileSync } from "../control-read/fs.js";
import { resolvedArtefactFile } from "./run-state.js";
import { evaluatePrdCriteriaReadiness } from "./traceability-readiness.js";
import { resolveArtifactPresentationLanguages } from "../resources/context.js";
import { evaluateApprovalSummaryReadiness, renderApprovalSummaryIssue } from "../control-state/run-presentation-render.js";

// PRD product decisions are explicit data. Free-form risk prose cannot safely establish
// whether a decision was resolved before the user saw an approval card.
export function evaluatePrdReadiness(targetDir, runState, { presentationLanguage } = {}) {
  const path = resolvedArtefactFile(targetDir, runState.artefacts.get("PRD")?.path);
  if (!path) return { ready: false, open_decisions: ["PRD artefact is missing"] };
  const content = readFileSync(path, "utf8");
  const section = content.split(/^## Approval Decisions\s*$/mu)[1]?.split(/^## /mu)[0];
  if (!section) return { ready: false, open_decisions: ["Approval Decisions section is missing"] };
  const rows = section.split(/\r?\n/u).filter((line) => line.trim().startsWith("|"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
  if (rows.length < 3 || rows[0].join("|") !== "Decision|Timing|Status|Resolution|Owner") {
    return { ready: false, open_decisions: ["Approval Decisions table is empty or malformed"] };
  }
  const open = [];
  const seen = new Set();
  const incomplete = (value) => !value || /^(?:<|tbd\b|to confirm\b)/iu.test(value);
  for (const [decision, timing, status, resolution, owner, ...extra] of rows.slice(2)) {
    if (!decision || seen.has(decision) || extra.length || !["before_prd", "later_sd", "later_tp"].includes(timing)
        || !["resolved", "open", "deferred"].includes(status)) {
      open.push(decision || "Malformed decision row");
      continue;
    }
    seen.add(decision);
    if (incomplete(owner) || (timing === "before_prd" && (status !== "resolved" || incomplete(resolution)))
        || (timing !== "before_prd" && incomplete(resolution))) open.push(decision);
  }
  // [ \t] rather than \s: an empty Owner line must not capture the following line.
  const owner = content.match(/^Owner:[ \t]*(.*)$/mu)?.[1]?.trim();
  if (incomplete(owner) || /\bto confirm\b|named individual/iu.test(owner)) open.unshift("Named PRD owner");
  const criteria = evaluatePrdCriteriaReadiness(content);
  open.push(...criteria.open_items);
  // Use the presentation owner's validator before a registered draft can take the ready route.
  // This keeps an own, unapproved formatting correction with the existing PRD authoring owner.
  const languages = resolveArtifactPresentationLanguages(targetDir, presentationLanguage);
  const summary = evaluateApprovalSummaryReadiness("PRD", content, languages);
  if (!summary.ready) open.push(renderApprovalSummaryIssue(summary, {
    path, presentationLanguage: languages.presentation_language,
  }));
  return { ready: open.length === 0, open_decisions: open };
}
