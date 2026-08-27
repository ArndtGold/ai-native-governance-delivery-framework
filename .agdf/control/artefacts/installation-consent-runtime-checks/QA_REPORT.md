# QA Report: Installation Consent for Automatic Runtime Checks

Status: `revise`; revision 9

Gate: QA

Run: `installation-consent-runtime-checks`
Date: 2026-08-27

## Quality Readiness

| Dimension | Owner | Outcome | Evidence |
|---|---|---|---|
| Plan coverage | task-plan-review | revise | 15/16 fully done; IRC-12 and direct-host cells remain partial |
| Solution integrity | clean-implementation-review | pass | retained-consent bypass removed in the existing owner; no parallel authority |
| Code quality | code-review | pass | QA-UX-01 through QA-UX-05 resolved; version identity, truthful intent and beginner recovery regressions green |
| QA decision | qa-gate, sole decision owner | revise | TPR-01 remains open for required evidence planes |

Decisive reason: the approved interaction behavior is implemented and repository-tested, but the
required revised live-host rendering, Codex trust cycle, native Windows and public rendered evidence
remain incomplete.

Permissible next action: collect the remaining direct-host evidence without inferring parity or
changing host state beyond separately authorized evidence runs.

## QA Gate

- decision: `revise`
- evidence: approved TP; Brownfield pass; CD+Tests; all reviews; final full smoke; Runtime Integrity;
  compact/default and verbose diagnostic contracts; 66/66 skill cases; 313-file package; 43-file
  public candidate; direct Claude hook, OpenCode enabled/manual sessions and Codex review
- missing_evidence: revised interactive install/update rendering on Codex, Claude Code and OpenCode;
  Codex trust plus enabled/change/disable cycle; IRC-H04 through H06; IRC-H07; deliberately induced
  managed conflict/rollback
- risks: Windows PowerShell, ACL and locked-file behavior cannot be inferred; rendered wording can drift;
  Codex native trust belongs to the user
- required_next_step: complete the authorized direct-host evidence cells; do not request
  `Approval: QA` while TPR-01 remains open
- impact_codes: none registered

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | open | `HOST_EVIDENCE_MACOS.md` proves only its stated cells | Complete remaining direct-host cells without inferred parity. |
| QA-UX-01 | requirements_gap | PRD | resolved | PRD Revision 2, SD Revision 3 and TP Revision 2 are approved; the shared CLI owner now always prompts in interactive first-install and enabled/manual update fixtures. | None; retain as resolved traceability evidence. |
| QA-UX-02 | implementation_gap | CD+Tests | resolved | The user-provided terminal output exposed noisy release tests and dense disclosure; successful preparation is now quiet, the complete disclosure is structured, and cancel/preview titles are truthful and regression-tested. | Obtain revised live-host rendering as part of TPR-01. |
| QA-UX-03 | implementation_gap | CD+Tests | resolved | The TTY choice accepts 1/E, 2/M and immediate Esc without Enter; raw mode and stdin lifecycle are regression-tested and a mutation-forbidden pseudoterminal Esc run exited 0. | Obtain installed-host rendering as part of TPR-01. |
| QA-UX-04 | implementation_gap | CD+Tests | resolved | The user-provided screen exposed excessive technical density; the primary view now uses plain language, preserves material consent facts, offers D for technical details and ends with a compact effective-state card and concrete Codex permission action. | Obtain installed-host rendering as part of TPR-01. |
| QA-UX-05 | implementation_gap | CD+Tests | resolved | The follow-up exposed missing version identity and residual beginner ambiguity; target and verified/update versions, previous intent versus host permission, manual-mode explanation, quiet progress and invalid-key recovery are now regression-tested. | Obtain installed-host rendering as part of TPR-01. |

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: existing nodes retain receipt, native authority, verified-package and evidence-plane boundaries

## QA Boundary

QA Revision 9 does not authorize UAT, publication, release, commit, push or pull-request creation.
