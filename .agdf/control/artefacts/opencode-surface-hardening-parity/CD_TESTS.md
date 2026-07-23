# Code Deliverables and Tests: OpenCode Surface Hardening and Evaluator Parity

Status: done
Gate: CD+Tests
Date: 2026-07-23
Derived from: `.agdf/control/artefacts/opencode-surface-hardening-parity/TP.md`

## Delivered

- Added bounded installed-package resolution and additive OpenCode host, SDK, experimental-hook and
  version-divergence status evidence.
- Strengthened the canonical global static instruction boundary and made both experimental hook
  callbacks tolerate malformed output while logging bounded degradation.
- Added the ownership-protected `agdf-evaluator` Primary Agent and uninstall handling.
- Added an invocation-local deny profile, process-local capability preflight, OpenCode evaluator
  adapter, shared evaluator prompt, strict JSON-event parsing and fatal transport mapping.
- Added conditional OpenCode enforcement and typed CLI recovery. Preflight alone or zero completed
  evaluations cannot produce a final `tool_enforced` claim.
- Updated capability truth, INSTALL, package documentation, CLI examples, Runtime Contract and
  generated assets. Candidate Generation remains Codex/Claude-only.

## Deterministic Evidence

| Evidence | Result |
|---|---|
| `npm --prefix create-agdf run test:opencode-hardening` | pass |
| `npm --prefix create-agdf run test:lifecycle` | pass |
| Delivery Path Search focused, unit and generator tests | pass |
| `npm --prefix create-agdf run smoke-test` | pass |
| Skill evaluations | pass, 39/39 deterministic replay cases |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass, source mode |
| Package build and contents checks | pass |
| `npm --prefix pages run check` and `npm --prefix pages run build` | pass |
| `git diff --check` | pass |
| Selected-run `doctor` | pass, zero findings |
| Selected-run `gate-check` | open at CD+Tests before review artefacts |

## Live OpenCode Evidence

- Installed status probe: OpenCode host `1.18.3`; installed `@opencode-ai/plugin` `1.17.11`;
  divergence `divergent` with `warn_only`; both required hook declarations
  `declared_supported`; `live_invocation_observed: false`.
- Temporary, non-global OpenCode config: generated `agdf-evaluator` was discovered by OpenCode as
  `primary`; preflight passed under the exact deny environment.
- A bounded real evaluator call reached OpenCode but returned HTTP 401 `No provider available`.
  The adapter classifies this as `OPENCODE_EVALUATOR_AUTHENTICATION_FAILED`; repository status was
  byte-stable before and after.
- A preflight-only/no-candidate CLI run reports `instruction_only`, proving that preflight evidence
  alone is not surfaced as a completed `tool_enforced` evaluation.

## Scope

No gate order, approval value, Interaction Contract, scoring policy, Candidate Generation, VCS,
release or publish state was changed. Existing unrelated worktree changes were not modified.

