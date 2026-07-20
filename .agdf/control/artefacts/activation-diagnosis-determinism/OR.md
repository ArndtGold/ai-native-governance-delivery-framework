# OR: Deterministic Repository-Activation Diagnosis

Gate: OR
Type: Mini-Closeout (Verified Change)
Status: pass
Date: 2026-07-20
Run: activation-diagnosis-determinism
Owner: agent

## Result

AGDF repository-activation diagnosis is now deterministic and tool-shell-safe. The gate-check skill
and control-scaffold contract name `doctor --json` as the sole canonical, code-owned, tool-shell-safe
activation probe and explicitly forbid `AGDF_*` env-only and relative-glob/grep as proof of
`.agdf/control/config.json` presence or absence. Runtime Integrity enforces the new guidance
deterministically via required-phrase and forbidden-phrase assertions.

## Delivered

- `plugin/skills/gate-check/SKILL.md` — new "Repository Activation Diagnosis" section: names `doctor --json` as the sole canonical probe; forbids `AGDF_*` env-only as sole activation proof; forbids relative glob/grep/read as proof of `.agdf/control/config.json` presence/absence; discloses OpenCode `shell.env` host-propagation boundary.
- `plugin/meta/contracts/control-scaffold.md` — new "Repository Activation Diagnosis Boundary" subsection: classifies `AGDF_*` env vars as internal plugin status channel, not agent-facing diagnosis proof; forbids relative glob/grep as proof; requires absolute `read` or canonical CLI probe.
- `plugin/scripts/check-runtime-integrity.mjs` — new required-phrase assertions (gate-check section heading, canonical-probe statement, env-only prohibition, relative-glob prohibition; control-scaffold boundary heading, non-agent-facing classification, relative-glob prohibition) and forbidden-phrase assertions for five anti-pattern instructions.
- Generated surfaces synchronized via `sync-package-assets`: 3 gate-check SKILL.md copies and 3 control-scaffold.md copies across Codex/Claude/Copilot/OpenCode layouts contain the new sections.

## Intentionally Not Delivered

- Change to `create-agdf/opencode-plugin.js` `shell.env` hook (OpenCode-owned host behavior, explicit non-goal).
- Change to `create-agdf/lib/installers/opencode-activation.js` (already correct, explicit non-goal).
- Change to `create-agdf/lib/installers/opencode.js` `opencode-status` consumer (internal channel, explicit non-goal).
- Publication, release, install-cache mutation, commit, push, PR.
- Update to the installed plugin 0.11.0 at `~/.config/opencode/` (requires separate release; explicitly disclosed as unchanged).

## Evidence

| Evidence | Source | Result |
|---|---|---|
| Runtime Integrity (source) | `node plugin/scripts/check-runtime-integrity.mjs` | pass: 10 skills, 16 control files, new assertions active |
| Generated-surface propagation | `npm --prefix create-agdf run sync-package-assets` (run 1) | pass: 6 generated copies contain new sections |
| Idempotent sync | `npm --prefix create-agdf run sync-package-assets` (run 2) | pass: no further drift |
| Routing | `npm --prefix create-agdf run test:routing` | pass |
| Lifecycle (env-var exposure) | `npm --prefix create-agdf run test:lifecycle` | pass: active/inactive env-var exposure unchanged |
| Negative integrity | `node create-agdf/scripts/runtime-integrity-negative-test.js` | pass |
| Whitespace | `git diff --check` | pass |
| Changed paths | `git diff --name-only` | exactly the 3 allowed source paths + 2 control-state files; no path outside the verified_change scope |

## TP Coverage

Verified Change path: no formal TP. The Verified Change compact record
`.agdf/control/artefacts/activation-diagnosis-determinism/VERIFIED_CHANGE.md` records the four
scoped changes, eligibility assertions, execution evidence and mini-closeout.

## Brownfield Fit

- Reuse: gate-check skill already named `doctor --json`; this run added the explicit forbidden-list and boundary, no second owner.
- Pre-implementation Brownfield Analysis confirmed the prose-assertion mechanism (`string.includes()`) is already in deterministic use (lines 356-378); this run extends it with the same pattern.
- Prior related run `opencode-global-install-visibility/OR.md` Limitations already disclosed part of this boundary; this run extends, does not duplicate.

## Solution Integrity

Single-owner, additive guidance + deterministic assertion extension. No parallel structure, no
second policy owner, no SOT drift, no gate/schema/approval-value change, no plugin host behavior
change.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| A future editor adds a novel anti-pattern instruction not in the forbidden-phrase list | low; Runtime Integrity catches the listed anti-patterns but not novel ones | Disclosed scope limitation; future runs may extend the forbidden-phrase list |
| The installed plugin 0.11.0 does not yet reflect the new guidance | medium for users on Windows OpenCode Desktop App until next release | Disclosed; the release is a separate explicit action |
| Phrasing drift in a future edit removes a required phrase | low; Runtime Integrity fails deterministically | Required-phrase assertions are stable and tested |

## Context Graph Impact

- context_graph_impact: link_only (no new node created in this verified_change; the invariant is referenced in the skill/contract prose and enforced by Runtime Integrity; a future structured run may create a Context Graph node if reuse warrants).
- context_graph_reconciliation: not required for verified_change.
- context_graph_gate_effect: none.

## Open Items

None blocking. VCS actions (commit, push, PR, release) require separate explicit user instruction.

## Next Permissible Step

- next_allowed_action: offer delivery closeout; commit/push/PR/release only on separate explicit user instruction.
- forbidden_without_explicit_instruction: commit, push, PR, release, install-cache mutation, publication.

## Quality Outlook

- quality_outlook: the prose-assertion mechanism is now proven for this guidance class; future runs that need to forbid agent-side anti-patterns can reuse the required-phrase + forbidden-phrase pattern without inventing a new assertion class.
