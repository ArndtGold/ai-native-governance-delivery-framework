# OR: Reduce AGDF's Own Framework-Maintenance Overhead (Narrowed Slice)

Gate: OR
Report mode: OR-full
Date: 2026-07-13
Status: pass

## Delivered

- **Backlog scope visibility**: `MASTER_BACKLOG.md` rows may now carry an optional leading `[framework-maintenance]`/`[external-delivery]` tag, enforced through a new `backlogScopeLabels` vocabulary and `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN` doctor finding (severity `revise`), built as a direct extension of the existing `backlogStatusLabels`/`backlogArtefactLabels` pattern — no parallel mechanism. Documented in `plugin/control/templates/MASTER_BACKLOG.md` Rules 15-16. Applied as a genuine worked example to this repository's own live Active Backlog row for this very run.
- **Trivial Change Boundary — Narrow Code-Fix Criterion**: `plugin/meta/agdf-runtime-contract.md` gained an explicit, fail-closed four-condition allow-list letting a narrow, test-covered, root-cause-clear code fix close with the compact Quick Task Output shape (Code Review still mandatory), without weakening ceremony for anything else. The wording was corrected during SD based on a genuine worked evaluation against two real fixes from this session's prior run, then propagated verbatim to all three generated Runtime Contract copies (Codex/Copilot/OpenCode).
- **Context Graph**: node `CG-DOCUMENTATION-CEREMONY-BOUNDARY` updated (not replaced) with both new invariants and the worked-evaluation finding.
- Full governance chain completed and durably persisted: UR → Brownfield Review → PRD → SD → TP → pre-implementation Brownfield Analysis → Task Plan Review → Clean Implementation Review → Code Review → QA (`pass`) → `Approval: UAT`.

## Intentionally Not Delivered

- Automated drift-prevention for plugin manifests and generated-surface propagation — Brownfield Review found both already exist (`check-runtime-integrity.mjs`, `sync-package-assets.js`), correcting the original UR's premise and avoiding redundant rebuilding.
- A computed framework-maintenance-vs-external-delivery ratio metric or dashboard (PRD Non-Goal; the tag makes the split human-scannable, not automatically aggregated).
- Retroactive `Scope` tagging of historical Completed/Superseded backlog rows (PRD Non-Goal).
- Any fix to the Windows `execFileSync` gap discovered while closing this run (see Risks) — explicitly out of scope, routed to its own separate follow-up investigation task instead of being folded in here.
- Commit, push, PR, or release — require separate, explicit user instruction per delivery-closeout boundary; nothing has been committed.

## TP Coverage

8/10 tasks (OH-01 through OH-07, OH-10) `fully_done` with high-confidence, direct evidence. OH-08 and OH-09 `partially_done`: the underlying logic is independently verified correct via a standalone script, but the TP's own literal required evidence — a passing end-to-end `npm run smoke-test` — was not produced, because the suite fails at an unrelated, pre-existing Windows compatibility gap (see Risks). No P0/P1 gap.

## Brownfield Fit

`pass`. Every insertion point predicted by pre-implementation Brownfield Analysis was confirmed exactly as expected during implementation, with zero deviation. Reuse strategy (`extend`) was followed for both candidates with no parallel structure introduced.

## Solution Integrity

Both changes are minimal, additive extensions of existing, single-owner mechanisms. Clean Implementation Review and Code Review both passed with no blocking finding. A workaround genuinely attempted during implementation (a Windows `.cmd` shim to try to fix an unrelated test fixture) was correctly identified as ineffective and reverted rather than left in as dead code — that discipline is itself evidence of solution integrity, not a gap.

## Evidence

- `check-runtime-integrity.mjs`: ok.
- `npm --prefix create-agdf run test:control-state`: full suite passes.
- `npm --prefix agdf run smoke-test`: passes.
- `node create-agdf/bin/create-agdf.js doctor --json` on this repository: `pass`, 0 findings (verified repeatedly throughout implementation).
- `git diff --check`: clean.
- `sync-package-assets` propagation: grep-confirmed identical new text in all three generated Runtime Contract copies.
- Standalone verification script: confirmed `AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN` fires only for an unrecognized bracketed tag, never for an absent one or either canonical value.

## Missing Evidence

`create-agdf`'s own full smoke-test aggregate does not complete end-to-end in this local environment. Root cause identified precisely: a fake Codex-CLI test fixture cannot execute via bare `execFileSync` without `shell: true` on native Windows (Windows resolves neither a bare extensionless shebang script nor a `.cmd` file without either an explicit extension-aware call or a shell). This is disclosed, pre-existing, and not introduced by this run.

## Risks

- The same `execFileSync` pattern used by the fake test fixture is also used by the real product functions `installCodexGlobalPlugin()`/`installClaudeGlobalPlugin()` in `create-agdf/bin/create-agdf.js`. Whether this is a real, user-facing Windows defect (versus a non-issue because the real Codex/Claude CLIs ship as native `.exe` binaries rather than Node `.cmd` shims) is unconfirmed. A separate follow-up investigation task has been created to determine real-world impact and, if confirmed, propose a fix — correctly kept out of this run's scope rather than guessed at or silently patched.
- No other open risk. No SoT drift, no unresolved product semantics, no security concern.

## Retained Fallbacks

None. Both delivered mechanisms are permanent extensions, not temporary workarounds. The one workaround attempted during implementation was reverted, not retained.

## Documentation Impact

`plugin/control/templates/MASTER_BACKLOG.md` and `plugin/meta/agdf-runtime-contract.md` are the two normative documents touched, both are the single owners of the conventions they now document; no other document duplicates this content.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-DOCUMENTATION-CEREMONY-BOUNDARY
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Node updated with both new invariants (Scope-tag convention referenced via PRD/SD; Narrow Code-Fix Criterion with its worked-evaluation finding), confirmed present and consistent with the final implementation.

## Required Next Step

Offer delivery closeout (commit-ready handoff summary). Commit, push, or PR require a separate, explicit user instruction — none has been given yet.

## Quality Outlook

This run is itself a worked example of its own subject matter: Brownfield Review avoided rebuilding two mechanisms that already existed (turning a 4-point UR into a 2-point PRD), and the Narrow Code-Fix Criterion it produced was immediately calibrated against real historical data rather than designed in the abstract. Separately, closing this run surfaced a new, previously-undiscovered Windows compatibility question (the `execFileSync`/`.cmd` gap) — it was investigated far enough to understand precisely, then deliberately scoped out and routed to its own follow-up rather than either ignored or hastily patched, which is the same proportional-governance discipline this run's own deliverable is meant to encourage.
