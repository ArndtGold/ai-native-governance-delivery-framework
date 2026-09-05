# Brownfield Analysis: Copilot Task-Target Binding

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- revision: 4
- artefact: `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md`
- based_on: approved TP revision 4

## Scope And Evidence

The approved correction fits the existing CLI, runtime, interaction and generated-profile owners.
No second target model, validator, skill source or approval authority is required.

| Existing owner | Current behavior | Revision 4 use |
|---|---|---|
| `create-agdf/lib/cli/parse-args.js` | Owns normalized command options and absolute `--dir` resolution | Extend with explicit target-source, primary-target and candidate inputs without treating parser cwd as authority |
| `create-agdf/lib/cli/command-registry.js` | Owns public command inventory, usage and option compatibility | Register `target-check` and reject target-only options on unrelated commands |
| `create-agdf/lib/runtime/validator-application.js` | Owns the exact surface-local runtime command allowlist | Admit `target-check` beside the existing read-only validation commands |
| `create-agdf/lib/cli/validation-handlers.js` | Owns validator command dispatch | Invoke one target resolver and emit its normalized JSON result |
| `create-agdf/lib/interaction-presentation.js` | Projects a normalized Task Target Orientation | Reuse unchanged as presentation only; it must not resolve paths or store target state |
| `plugin/meta/contracts/task-target-resolution.md` | Owns precedence, normalized states and fail-closed semantics | Keep as the semantic contract for the resolver and Copilot routing instructions |
| `plugin/skills/gate-check/SKILL.md` | Owns instruction-only gate routing | Require executable target preflight before doctor or gate-check and stop on unresolved output |
| `create-agdf/scripts/sync-plugin-runtime.js` | Owns the generated local runtime and SessionStart hook | Bundle the resolver and classify physical repository context before doctor/config checks |
| Existing CLI, consent, profile, routing and integrity suites | Cover parser, runtime closure, generated hooks and projected skills | Extend these owners with the target-state and SessionStart matrix |

## Call Paths And Authority Boundaries

### Explicit task-target preflight

`agdf-local.js` resolves the exact installed validator, then
`validator-application.js` accepts `target-check`, `parse-args.js` normalizes explicit inputs,
`validation-handlers.js` invokes the resolver, and the resolver returns one machine-readable result.
The resolver may use the process working directory only as the reported execution context. It may
not promote it to `primary_target` or `governance_target` unless the caller explicitly supplies the
`current_repository` target source.

The resolver verifies accessible real paths and Git repository membership. It never scans parent or
neighbor directories for a plausible governance target. Contradictory or multiple inputs produce an
unresolved result and no downstream repository activation.

### Copilot gate routing

The generated `agdf-gate-check` skill remains `instruction_only`. It first calls `target-check
--json` with a semantically selected source and target. Only a resolved result may supply the
absolute governance root to `doctor` or `gate-check` through `--dir`. Unresolved output forbids run,
gate, approval and synthetic-UR output. A resolved but ungoverned repository is a distinct later
state; without concrete user intent it requests intent clarification instead of inventing a UR.

### SessionStart physical context

The generated hook verifies physical repository membership with Git. A repo-less context emits a
non-authorizing orientation and skips doctor and project-config lookup. A repository-bound context
runs both against the verified repository root, not the raw event cwd. SessionStart never selects a
semantic task target and never grants gate authority.

## Impact And Minimal Clean Path

1. Add one small target-resolution module to the existing bundled runtime.
2. Add `target-check` to the existing command registry, parser and validator dispatch.
3. Strengthen the canonical gate-check skill instructions and behavioral fixtures.
4. Refine only the generated SessionStart source and regenerate the Copilot profile.
5. Extend existing CLI, runtime-consent, profile and Runtime Integrity tests.
6. Preserve all installer, marketplace, provenance, consent and other-host behavior.

## Regression And Migration Boundaries

- Existing `doctor`, `gate-check`, delivery and lifecycle commands keep their current behavior.
- `--dir` remains the repository root input for existing validators; Copilot routing must obtain it
  from a resolved target rather than the host cwd.
- The target result is transient. It does not create a global target store or override durable run
  scope.
- The SessionStart change alters capability bytes, so an installed refresh requires the existing
  consent identity revalidation. Consent semantics are not weakened.
- Generated, packaged, staged, installed and loaded-session evidence remain separate.
- Codex, Claude and OpenCode continue to consume the shared canonical skills and runtime behavior.

## Stop Conditions

Stop before or during implementation if the correction requires:

- a second editable task-target contract or presentation template;
- inference of semantic target authority from cwd, Git membership or an evidence source;
- a Copilot-chat-directory name heuristic;
- repository activation after an unresolved target result;
- new approval authority, native-interaction claims or hidden persistent target state;
- post-install network access, broad user-data cleanup or weakened Runtime Integrity.

None of these conditions is present in the approved implementation path.

## Risks And Tests

| Risk | Required control |
|---|---|
| Symlink or relative-path ambiguity | Require absolute inputs, canonicalize accessible paths and repeat the verified root |
| Worktree `.git` file is missed | Use `git -C <path> rev-parse --show-toplevel`, not directory-name heuristics |
| `current_repository` becomes an implicit fallback | Require that source explicitly and cover missing primary-target behavior |
| Repo-less hook repeats the stale config defect | Assert doctor/config are absent from repo-less execution and output |
| Skill still invents a UR | Behavioral fixture requires unresolved orientation only, with no gate or approval request |
| Generated profile drifts | Regenerate through existing profile owner and run semantic inventory/integrity tests |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`

## Required Next Step

Proceed to CD+Tests for CPI4-T15 through CPI4-T18 through the identified owners. Start with the
pure target resolver and its matrix, then wire the validator command, skill routing and SessionStart
classification. Regenerate only after focused source tests pass.

## 2026-09-05 Installer correction: native marketplace transport and skill discovery

- mode: `pre_implementation_analysis`
- decision: `pass`
- scope: corrective work within approved CPI3-T06, T07, T09, T10 and T12. The user requires the normal installer to restore visible skills without a manual installation path.
- evidence: Copilot 1.0.83-5 lists local directory-marketplace plugins but its global skill-discovery API returns no plugin skills, including a minimal plugin using the default `skills/` convention. A fresh SDK session in that exact runtime can load the same skills. The earlier 1.0.80 SDK result must not be attributed to 1.0.83-5. Native Git-marketplace installation exposes the same ten skills through both APIs.
- existing coverage: `prepareCopilotMarketplace` already owns atomic staging, provenance, rollback and a separate canonical root. `installCopilotGlobalPlugin` only verifies plugin registration and version, so it can incorrectly report a usable installation when discovery is empty.
- reuse strategy: extend the existing Copilot staging transaction with generated Git transport metadata and a content-derived branch. Register that same canonical root with Copilot's supported Git marketplace transport. No additional editable payload, direct plugin identity, persistent recovery snapshot or alternate skill source is introduced.
- verification: consume the existing `copilot skill list --json` command, supported by both tested CLI versions. Verify all expected prefixed skills, enabled plugin origin, one installed root and matching package content before reporting healthy. Discovery evidence remains distinct from rendered desktop UAT.
- migration: accept the proven AGDF-owned directory registration and keep foreign registrations protected. The temporary source created during this task is removed through a separately verified local restoration before exercising the corrected normal installer; arbitrary recovery directories do not become a product migration allowlist.
- regression boundaries: unchanged `agdf@agdf`, commands, consent, opt-out selectors, source version, payload inventory, Codex/Claude roots and repository files. Git metadata stays outside `plugins/agdf`; checkout attributes preserve package bytes on Windows.
- required tests: initial install; idempotent repeat; same-version changed payload; branch/source refresh; registration and filesystem rollback; foreign source refusal; missing/disabled/shadowed/stale skills; Git checkout byte identity; both tested Copilot runtimes; fresh SDK discovery and session inspection after the actual installer.
- context_graph_impact: `link_only`, existing public-plugin-distribution and CLI-composition owners.
