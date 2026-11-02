# UAT Report: Cross-Surface Skill Target Preflight

- revision: 1
- decision: `pending`
- date: 2026-09-04
- selected_run: `cross-surface-skill-target-preflight`
- qa_approval: accepted by exact `Approval: QA` after revalidation of run, gate and revision

## Observed User Outcome

The installed GitHub Copilot plugin 0.14.5 was invoked directly with `/agdf-qa-gate` in a
repo-less chat. Installed-root provenance was subsequently machine-validated as matched.

## Passed

- Copilot recognized that no reliable task target was selected.
- The chat working directory did not become repository or governance authority.
- Copilot did not select a run, inspect repository QA evidence, emit a QA decision or request an
  unrelated AGDF approval.
- The invocation stopped at task-target clarification.

## Disclosed Limitations

- The German conversation was evaluated with `--language en` and the visible result remained
  English, so CSTP-05 is not demonstrated on the loaded Copilot model path.
- Copilot reconstructed the orientation instead of consuming
  `task_target_orientation.markdown` verbatim. The reconstructed table contained the malformed
  `FieldValue` header.
- Copilot added its own three-option explanation and broad question instead of requesting only the
  normalized smallest recovery action.
- Copilot searched for non-existent orientation files and attempted an incorrect internal CLI path
  before using a nested validator. The installed canonical entrypoint
  `runtime/agdf-local.js` was present and returned the correct German projection when invoked
  directly.
- A resolved-repository `qa-gate` observation and direct observations on Codex, Claude Code and
  OpenCode remain unavailable.

## Acceptance Boundary

This run delivers and validates the shared instruction contract, generated host profiles, package
projection and deterministic fail-closed cases. It does not technically force a model to execute
the canonical entrypoint or transmit the renderer output verbatim. A technically enforced skill
dispatcher is explicitly reserved for a separate future run.

## Decision Required

The user may accept this instruction-layer slice with the disclosed loaded-host limitations, request
revision inside the approved scope, or decline it. No dispatcher scope is inferred from acceptance.

## Next Step

Request the exact UAT decision for this run. Commit, push, PR, release and creation of the separate
dispatcher run remain unperformed.
