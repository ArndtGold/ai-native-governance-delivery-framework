# AGDF Master Backlog

## Lifecycle Rules

- Keep an item in **Active Backlog** while work, required evidence, a required approval, or delivery closeout remains open.
- Move an item to **Completed / Superseded Pointers** only when its scoped work is delivered, required validation and QA have passed, required user approvals including UAT are recorded, and the OR states the final outcome.
- A commit alone is not completion evidence. The artefact chain and required approvals decide completion.
- Quick Tasks without a formal QA or UAT gate may move to Completed after their relevant checks and compact closeout are recorded.
- Use **superseded** instead of **completed** when another artefact or scope replaces the item; retain the historical link and name the replacement.

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Planned / Parking Lot

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|
| 1 | `delivery-path-search-ai-candidate-generation` | Add AI-native generation of multiple concrete delivery-path candidates before deterministic validation and evaluation | Needs UR |  | [PRD](artefacts/agdf-delivery-path-search/PRD.md) | After the current release, formulate a separate UR for AI-native candidate generation while keeping AGDF legality and gates deterministic |
| 3 | `claude-evaluator-enforcement-decision` | Decide and document whether Claude Code stays a permanent `instruction_only` Delivery Path Search evaluator or gets a technical evidence substitute | Needs UR |  |  | Formulate a UR when prioritized |
| 3 | `npm-publish-qa-caveat-closure` | Close the QA caveat "unverified: live GitHub Actions publish execution of the new npm readiness step" with real evidence | Parked, contingent | [QA_REPORT](artefacts/codex-bootstrap-release-readiness/QA_REPORT.md) | Not startable now; needs the next real npm publish run as trigger, not a UR right now |

## Completed / Superseded Pointers

| Key | Work item | Final status | Historical record | Outcome |
|---|---|---|---|---|
| `plugin-author-consistency-fix` | Fix Codex plugin manifest author mismatch that failed `check-runtime-integrity.mjs` and blocked `agdf-guardrails.yml` before package smoke tests ran | Completed | [Brownfield Review](artefacts/plugin-author-consistency-fix/BROWNFIELD_REVIEW.md) | Quick task completed; `Approval: UR` recorded on 2026-07-10; Brownfield Review confirmed commit `12f9cd3`'s intent and expanded scope to `.claude-plugin/plugin.json`; canonical definition and Claude manifest author fields aligned to "Arndt Gold"; integrity check and focused tests pass locally; CI confirmation still pending next push |
| `gate-state-clarity` | Make AGDF gate status show current gate, required approval, and next gate after approval without ambiguous open or blocked wording | Completed | [OR](artefacts/gate-state-clarity/OR.md) | QA passed and `Approval: UAT` recorded on 2026-07-10; gate-check/status-card output now includes explicit post-approval transition guidance while preserving current-authority semantics |
| `create-agdf-lib-test-coverage` | Add unit-test coverage for `create-agdf/lib` (Delivery Path Search core: scoring, candidate-policy, contracts) beyond smoke/fixture tests | Completed | [Brownfield Review](artefacts/create-agdf-lib-test-coverage/BROWNFIELD_REVIEW.md) | Quick task completed; `Approval: UR` recorded on 2026-07-10; Brownfield Review narrowed scope to scoring.js/candidate-policy.js/contracts.js since search-engine.js was already well covered; new `delivery-path-search-unit-test.js` wired into `smoke-test`; focused checks passed |
| `codex-bootstrap-release-readiness` | Make Codex, Claude Code and Copilot AGDF updates reliable, and wait for npm package readiness after publish | Completed | [OR](artefacts/codex-bootstrap-release-readiness/OR.md) | QA passed and `Approval: UAT` recorded on 2026-07-10; Codex, Claude Code, Copilot and npm readiness improvements implemented with focused smoke/runtime checks passed |
| `doctor-semantic-consistency` | Make AGDF doctor detect semantic control-state inconsistencies before gate-check fails later | Completed | [OR](artefacts/doctor-semantic-consistency/OR.md) | Quick task completed; doctor now reports QA durable artefact status mismatches before later gate-check confusion, and focused smoke/runtime checks passed on 2026-07-09 |
| `context-graph-closeout-guard` | Prevent Governance-Closeout-Gaps by enforcing Context Graph reconciliation before clean handoff | Completed | [OR](artefacts/context-graph-closeout-guard/OR.md) | QA passed and `Approval: UAT` recorded on 2026-07-09; Runtime Contract, OR/delivery-closeout skills, AGDF_RUN/OR templates and Runtime Integrity now enforce visible Context Graph reconciliation before clean handoff |
| `agdf-delivery-path-search` | Portable delivery-path search across coding-agent surfaces | Completed | [OR](artefacts/agdf-delivery-path-search/OR.md) | QA passed and `Approval: UAT` recorded on 2026-07-09; first-release Delivery Path Search delivered with Codex as executable reference evaluator and non-Codex surfaces as contract-ready pending conforming evaluators |
| `opencode-compact-gate-output` | Make AGDF gate/status output compact for interactive OpenCode use | Completed | [OR](artefacts/opencode-compact-gate-output/OR.md) | Quick task completed; compact status-card output implemented and focused checks passed on 2026-07-09 |
| `opencode-global-install-visibility` | Make OpenCode global AGDF install visibly checkable | Completed | [OR](artefacts/opencode-global-install-visibility/OR.md) | Quick task completed; OpenCode global install/status visibility implemented and focused checks passed on 2026-07-09 |
| `fresh-request-control-state-docs` | Clarify fresh request vs durable control state documentation | Completed | [Brownfield Review](artefacts/fresh-request-control-state-docs/BROWNFIELD_REVIEW.md) | Quick task completed; user docs clarified and review returned no findings on 2026-07-09 |
| `master-backlog-human-readable` | Make the Master Backlog human-readable with compact status labels and Markdown links | Completed | [OR](artefacts/master-backlog-human-readable/OR.md) | QA passed and `Approval: UAT` recorded on 2026-07-09 |
| `agdf-operating-model-sharpening` | Sharpen the AGDF operating model and public explanation | Completed | [OR](artefacts/agdf-operating-model-sharpening/OR.md) | QA passed and `Approval: UAT` recorded on 2026-07-09 |
| `run-status-card-quality-outlook` | Add Run Status Card and quality outlook | Completed | [OR](artefacts/run-status-card-quality-outlook/OR.md) | UAT approved; implementation committed in `bf3f9ec`; readability refinement committed in `c4c9d64` |
