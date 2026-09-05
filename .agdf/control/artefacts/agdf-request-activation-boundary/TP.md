# TP: Request-Intent Activation Boundary

Status: approved
Gate: TP
Gate approval: Exact `Approval: TP` was accepted for Revision 3 on 2026-09-04 after same-target,
same-run, same-gate and same-revision revalidation of run revision
`C11F3392-2A48-41B3-9E48-88188E67A5ED`.
Prior gate approval: Exact `Approval: TP` was accepted for Revision 2 on 2026-09-04 after
same-target, same-run, same-gate and same-revision revalidation of run revision
`FFAB3F33-57EE-4788-BCB0-E9B093A409BE`. It does not approve Revision 3.
Historical gate approval: Exact `Approval: TP` was accepted for Revision 1 on 2026-09-04 after
same-target, same-run, same-gate and same-revision revalidation of run revision
`38CFB34F-F264-4F82-8388-85B9BC7F4F9C`.
Based on: approved SD Revision 5; exact `Approval: SD` accepted on 2026-09-04 against run
revision `2B7A793E-156B-4EBB-BF1E-A644C910517E`
Analysis input: Brownfield Analysis Revision 2 with decision `revise` and open finding
`RAB-BA-01`
Date: 2026-09-04
Owner: Arndt Gold
Revision: 3
Revision reason: correct the composed-profile evidence interface identified by `RAB-BA-01`

## 1. Revision Boundary And Lineage

Revision 3 is a corrective delta over approved Revision 2. It does not reinterpret completed
Revision 1 work as new evidence and it does not expand the approved SD architecture. It separates
the profile being composed from the live evaluator that executes a behavioral probe and adds
closed, non-oracle metadata for the instruction skill included in a composed case.
Existing implementation and tests remain reusable baseline only. Any old result that depends on
the full eager OpenCode router, repeated policy prose, the long discovery boundary or the previous
`gate-check` body is stale for Revision 3.

| Revision 1 tasks | Revision 3 treatment |
|---|---|
| `RAB-TP-01` through `RAB-TP-04` | Semantic and projection baseline is retained. SD Revision 5 changes to kernel, discovery and selected-skill loading are governed by `RAB-TP-17` and `RAB-TP-18`. |
| `RAB-TP-05` through `RAB-TP-08` | Status, missing-control, canonical-init and repository-lifecycle behavior remain unchanged. Run their regression suites; do not reimplement them. |
| `RAB-TP-09` | Hook inventory, no-toast and no-classifier invariants remain. The full-router and repeated-guidance transport is superseded by `RAB-TP-19`. |
| `RAB-TP-10` through `RAB-TP-12` | Corpus, callback order and dispatcher-v1 compatibility remain. `RAB-TP-20` adds composed-profile evidence. |
| `RAB-TP-13` | Existing package and integrity structure remains baseline. Revision 3 projections and proof are regenerated and revalidated by `RAB-TP-20`. |
| `RAB-TP-14` | Existing documentation and graph work remains baseline. The two-stage loading delta is governed by `RAB-TP-21`. |
| `RAB-TP-15` | Retains its ID and reopens for the exact Revision 3 installed profile. Earlier unavailable or partial observations do not satisfy it. |
| `RAB-TP-16` | Retains its ID and reopens for the final Revision 3 diff and evidence. Earlier reviews are historical only. |

No historical task ID is deleted or renumbered. `RAB-CIR-02` is resolved only at its SD routing
target. Revision 3 approval is now recorded. The implementation remains non-conformant until
Brownfield Analysis passes and the active tasks below are completed.

## 2. Active Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| `RAB-TP-17` | Establish the compact canonical owners. Replace the old marked guard in `plugin/meta/contracts/request-activation.md` with the maximum 1,100-byte Activation Kernel and one compact discovery-boundary projection while preserving request classes, precedence, operation catalog and failure semantics. Add the versioned `instructionFootprint` object with every SD section 8.1 budget to `plugin/meta/agdf-plugin.definition.json`. Keep `skillSet.useFor`, `boundary` and `discovery` as the only skill-specific discovery metadata. | `RAB-01`–`RAB-06`, `RAB-10`–`RAB-14`, `RAB-16`, `RAB-18`, `RAB-20` | Exactly one semantic kernel owner, valid fingerprint, unchanged operation catalog and no new classifier or route owner. Missing or invalid budget fields fail. A budget increase or weakened structural condition is not authorized by this TP. |
| `RAB-TP-18` | Implement compact canonical projections and selected-skill bootstrap. Update `sync-request-activation-projections.js` to project the kernel byte-for-byte into the router and all ten skills and generate compact frontmatter from definition metadata plus the short boundary. Reduce `gate-check/SKILL.md` to purpose, kernel, delivery-intake branch, direct-skill dispatch and terminal transfer. Load the existing focused contracts only for an explicitly declared `instruction_only` fallback. | `RAB-01`–`RAB-06`, `RAB-10`–`RAB-14`, `RAB-18`, `RAB-20` | One kernel before dispatch, descriptions within individual and aggregate budgets, and `gate-check/SKILL.md` within budget. Missing, duplicate, partial or manually changed markers fail. The normal terminal dispatch path contains no second gate handbook. |
| `RAB-TP-19` | Move existing host transports to the two-stage model without adding a hook. `sync-plugin-runtime.js` emits one kernel, one minimal version-bound dispatcher binding and optional compact runtime facts for Codex, Claude and Copilot. `session-start.sh` remains a non-configured compatibility helper without policy. `opencode-plugin.js` emits only active/version/binding facts, emits nothing for an inactive repository and is content-idempotent. Compaction contains at most one kernel-only recovery block. `sync-package-assets.js` and `lib/installers/opencode.js` generate an OpenCode micro-bootstrap while packaging the full router separately for on-demand access. | `RAB-01`, `RAB-05`, `RAB-06`, `RAB-13`–`RAB-16`, `RAB-19`, `RAB-20` | Existing hook inventories remain exact. Every host surface meets its budget and structural condition. No second hook, `tool.execute.before`, duplicate kernel/binding, inactive output, full eager router or immutable policy prose in dynamic facts exists. |
| `RAB-TP-20` | Create deterministic footprint and truthfully labelled composed-profile evidence. Add `plugin/scripts/instruction-footprint.mjs`, `create-agdf/scripts/instruction-footprint-test.js`, `create-agdf/lib/request-activation-evals/composed-profile.js` and `test:instruction-footprint`. Use one pure measurement helper for the focused test and Runtime Integrity. Extend the corpus with optional closed `composed_profile.instruction_skill` metadata and keep it separate from `expected.selected_skill`. Extend evaluation with independent `profile_surface` and `evaluator_surface` identities so real bootstrap, SessionStart, discovery and selected-skill content is used without presenting the complete contract or expected result as an oracle. Replace redundant sentence assertions in Runtime Integrity with identity, order, fingerprint, absence, budget and conflict checks. Regenerate all profiles only through canonical generators. | `RAB-01`–`RAB-06`, `RAB-10`–`RAB-16`, `RAB-18`–`RAB-20` | Raw and normalized bytes for every budget; independent negative fixtures for every overflow, second kernel/binding, conflicting activation text, full eager router, dynamic policy prose and non-empty inactive output. Case metadata is schema-validated, never model-visible and can name an instruction skill when expected selection is `none`. Reports distinguish profile surface, evaluator surface, source-composed evidence and loaded-host evidence. Composed-profile pairs cover negative, positive, mixed, explicit-operation and continuation cases. Two generation runs are byte- and digest-stable. |
| `RAB-TP-21` | Reconcile documentation and the existing Context Graph node with the two-stage model. Update `create-agdf/README.md`, the German and English quickstart/workflow pages and `CG-REQUEST-ACTIVATION-AUTHORITY`. Reference `INSTRUCTION_FOOTPRINT_AUDIT.md`. | `RAB-14`, `RAB-16`, `RAB-20` | One eager kernel, on-demand detail, budgets and host evidence limits are consistent. No second SoT entry and no claim that `skillSet.discovery` is technically enforced by every host. |
| `RAB-TP-15` | Re-execute the existing Fresh-Host responsibility for the exact Revision 3 profile. Install, read back, restart and observe Codex, Claude Code, GitHub Copilot and OpenCode independently. Add OpenCode probes `system_transform_reapplied_after_compaction` and `current_binding_available_after_compaction` to the host observation schema and validation. Cover direct and automatic selection separately. | `RAB-01`–`RAB-20` | No host substitutes for another. Fixture, source-composed behavioral evidence or another host does not satisfy installed evidence. Until both compaction probes pass for the same installed version and digest, retain the maximum 1,100-byte kernel-only recovery block and make no retention claim. |
| `RAB-TP-16` | Re-run CD+Tests, Task Plan Review, Clean Implementation Review, mandatory Code Review and QA Gate for the final Revision 3 diff. | `RAB-01`–`RAB-20` | Old reviews are not reused. `RAB-CIR-02` design resolution and `RAB-BA-01` plan resolution are linked, `RAB-TPR-01` remains open until four-host evidence is complete, and no QA, UAT or release claim is made without all required evidence. |

## 3. Dependency And Execution Order

1. After exact TP approval, run `brownfield-analysis` in `pre_implementation_analysis` mode against
   the current worktree and overlapping owners.
2. `RAB-TP-17` establishes the canonical kernel, metadata and measurement contract.
3. `RAB-TP-18` and `RAB-TP-19` may proceed in parallel after `RAB-TP-17`.
4. `RAB-TP-20` completes only after both projection paths are available.
5. `RAB-TP-21` uses the measured and validated result from `RAB-TP-20`.
6. `RAB-TP-15` uses only the exact generated and packaged profile that passed `RAB-TP-20`.
7. `RAB-TP-16` runs last.

Implementation remains forbidden until step 1 passes. A changed owner, conflicting active run or
unattributable dirty path stops before code changes.

## 4. Test Plan

### 4.1 Gate And Baseline Preconditions

Before implementation:

- accept exact `Approval: TP` after same-target, same-run, same-gate and same-revision revalidation;
- run focused pre-implementation Brownfield Analysis and record owner reuse, overlap and stop
  conditions;
- capture exact HEAD, index, working-tree and untracked paths;
- classify all existing Revision 1 implementation as baseline, not proof of Revision 3 compliance;
- exclude unrelated user files, especially
  `assets/agdf-von-agentenarbeit-zu-verantwortbarer-auslieferung.png`;
- preserve dispatcher v1 and the independently governed dispatcher/OpenCode work lines.

### 4.2 Instruction Footprint Measurement Contract

Measure UTF-8 bytes after LF normalization. Report raw bytes as well. For normalized dynamic
measurements replace only absolute executable, validator and working-directory values with
`<executable>`, `<validator>` and `<working-directory>`. Do not remove headings, policy prose,
markers or repeated content.

For a discovery description, measure the serialized frontmatter scalar after `description: `,
including its quotes and excluding the key and line ending. Sum ten values without an added
separator. The upstream 1,024-character Agent Skills limit remains independently applicable.

| Surface | Maximum normalized UTF-8 bytes | Deterministic condition |
|---|---:|---|
| Activation Kernel including markers and fingerprint | 1,100 | one semantic source; every projection byte/fingerprint-equal; at most one instance per composed surface |
| One skill discovery description | 420 | one skill purpose/boundary plus the compact common boundary |
| All ten discovery descriptions | 3,000 | exactly ten in definition order; no full exclusion taxonomy or operation catalog |
| Common SessionStart base context | 1,900 | one kernel and one binding; no router, target, gate, quality or closeout handbook |
| Consented runtime-check supplement | 320 | separately measurable variable facts only |
| OpenCode eager `AGDF.md` | 4,000 | one kernel; no binding or full-router target, mode, gate, quality or closeout sections |
| OpenCode active dynamic context | 1,000 | one binding and active/version facts; no kernel or immutable policy prose |
| OpenCode inactive dynamic context | 0 | no binding, notice, policy or runtime supplement |
| OpenCode composed static plus active dynamic | 5,000 | one kernel and one binding across repository and global variants |
| OpenCode compaction addition | 1,100 | at most one kernel-only recovery block; no binding or active/inactive guidance |
| Selected `gate-check/SKILL.md` | 6,500 | one kernel before unchanged terminal dispatch; detailed fallback only through focused contracts |

### 4.3 Required Structural Negative Cases

Each fixture changes exactly one condition and must fail independently:

- every budget exceeds its normalized limit by at least one byte;
- a second kernel or dispatcher binding is present;
- activation language conflicts with the canonical kernel;
- the previous full router appears in eager OpenCode `AGDF.md`;
- immutable policy prose appears in dynamic facts;
- inactive OpenCode produces one or more bytes;
- compaction contains a binding or repeats active/inactive guidance;
- a budget ID, schema version or declared surface is missing or unknown;
- marker state is missing, duplicate, partial, reordered or manually changed.

Runtime Integrity must verify identities, markers, fingerprints, order, allowed structure and budgets.
It must not recreate a second measurement algorithm or require redundant natural-language sentences.

### 4.4 Deterministic Acceptance Sequence

Run in this order and stop at the first owner, projection, budget or safety failure:

```bash
node create-agdf/scripts/sync-request-activation-projections.js --write
node create-agdf/scripts/sync-request-activation-projections.js --check

npm --prefix create-agdf run test:instruction-footprint
npm --prefix create-agdf run test:request-activation
npm --prefix create-agdf run test:runtime-check-consent
npm --prefix create-agdf run test:opencode-hardening
npm --prefix create-agdf run test:lifecycle
npm --prefix create-agdf run test:skill-dispatch
npm --prefix create-agdf run test:task-target-resolution
npm --prefix create-agdf run test:interaction-presentation
npm --prefix create-agdf run test:gate-check-missing-control
npm --prefix create-agdf run test:canonical-init

node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run test:runtime-integrity-layout
npm --prefix create-agdf run test:runtime-integrity-negative
npm --prefix create-agdf run test:agent-skills-conformance

npm --prefix create-agdf run sync-package-assets
npm --prefix create-agdf run test:package-build
npm --prefix create-agdf run test:package-contents
npm --prefix create-agdf run test:public-plugin
npm --prefix create-agdf run test:copilot-profile
npm --prefix create-agdf run test:release-bootstrap
npm --prefix create-agdf run smoke-test
```

Add `test:instruction-footprint` early in both `test:request-activation` and the aggregate smoke script.
After the sequence, run projection check and package sync again. Compare canonical source hashes,
all named generated roots and profile digests. The second pass must be stable and must not edit
canonical source.

### 4.5 Composed-Profile Behavioral Evidence

The case schema may declare the following optional closed metadata only for composed-profile
evidence:

```json
"composed_profile": {
  "instruction_skill": "gate-check"
}
```

`instruction_skill` must resolve through the existing closed skill registry. It names the real
skill body composed into the instruction profile and may intentionally differ from
`expected.selected_skill`, including negative cases whose expected selection is `none`. Neither
`composed_profile` nor any `expected` value is passed to the model.

Profile identity and evaluator identity are independent:

- `--profile-surface codex|claude|copilot|opencode` selects the source-composed instruction
  surface;
- `--evaluator-surface codex|claude` selects the existing supported live-agent adapter;
- legacy `--surface` remains an evaluator-only alias and cannot be combined with
  `--evaluator-surface`; it never labels the composed profile.

After deterministic checks pass, run:

```bash
npm --prefix create-agdf run eval:request-activation -- --input-mode composed_profile --profile-surface codex --evaluator-surface codex
npm --prefix create-agdf run eval:request-activation -- --input-mode composed_profile --profile-surface claude --evaluator-surface claude
npm --prefix create-agdf run eval:request-activation -- --input-mode composed_profile --profile-surface copilot --evaluator-surface codex
npm --prefix create-agdf run eval:request-activation -- --input-mode composed_profile --profile-surface opencode --evaluator-surface codex
```

`request-activation-evals-test.js` validates the mode deterministically without a live model.
Behavioral output records `profile_surface`, `evaluator_surface`, `loaded_profile: false` and
`evidence_plane: source_composed`. The Copilot and OpenCode commands therefore mean that their
source-composed profiles are evaluated through Codex. They are not Copilot or OpenCode live-host
evidence. No new Copilot or OpenCode live-agent adapter is in scope. Recording remains a separate
explicitly authorized mutation.

### 4.6 Fresh-Host And Compaction Evidence

For each host, obtain the existing lifecycle consent, install the exact staged profile, read back
version, identity and digest, start a fresh session and record the same negative, positive, mixed,
explicit-operation, continuation and ambiguity families. Keep source, generated, package, installed
and loaded-session evidence separate.

For OpenCode, a real compaction on the same installed version and digest must prove both that the
system transform is reapplied and that the current binding remains available. Unit tests, temporary
plugin execution, package digest or behavioral evaluation do not satisfy the exit criterion.
Missing, unavailable or negative evidence retains the kernel-only recovery block. Reducing it to a
fingerprint-only reminder is a later explicit source change with a fresh evidence cycle.

### 4.7 Stop Conditions

Stop implementation or packaging when any applies:

- a normalized budget or structural condition fails;
- a second hook, classifier, policy owner or dispatcher-v1 change appears;
- request classes, precedence, operation catalog, exact approvals, status, lifecycle, canonical-init
  or interaction semantics drift;
- a positive route cannot reach the packaged on-demand router or focused contract;
- a compact kernel loses any approved false-positive or positive boundary;
- the first generation pass edits canonical semantic source outside the projector-owned derived
  `guard_fingerprint`, the second pass edits any canonical source, or generation is not
  byte/digest-stable;
- an overlapping dirty owner cannot be attributed safely;

Raw bytes above a normalized budget are non-blocking only when the normalized result passes and the
entire excess is caused by permitted machine-path length. Report both values. Stop QA pass, UAT and
release when required installed or fresh-host evidence is missing. Missing host evidence does not
invalidate implementation, packaging or deterministic evidence, but it keeps QA at least `revise`.

## 5. Brownfield Scope

The post-TP Brownfield Analysis must revalidate:

- `request-activation.md`, `agdf-plugin.definition.json`, the router, all ten skills and the projection
  scripts as existing owners;
- generated SessionStart, OpenCode installer/plugin, package sync, Runtime Integrity and their tests;
- the selected-skill terminal dispatcher path and availability of focused contracts on every
  generated profile;
- the current staged, unstaged and untracked worktree against this run, the dispatcher run, the
  OpenCode native-tool run and unrelated user work;
- the compaction fallback owner and exact exit criterion;
- whether one shared pure measurement helper is sufficient. No second production policy owner is
  permitted.

New implementation owners are limited to the definition-owned budget object, the existing
contract-owned kernel/discovery projections, a focused deterministic measurement/test helper and
one evidence-only composed-profile loader under the existing request-activation evaluation owner.
The loader composes declared evidence inputs and never owns production policy. Generated and
installed surfaces remain evidence targets only.

## 6. Protected Owners And Out Of Scope

Revision 3 must not change:

- dispatcher v1 schema, CLI grammar, outcomes or target-before-control order;
- existing live-agent adapter support in `create-agdf/lib/live-agent/read-only-structured.js`;
- request classes, precedence, operation catalog or failure semantics;
- `create-agdf/lib/control-evaluation/gate-check.js`;
- status, lifecycle, canonical-init, control-state or interaction semantics;
- exact approval and same-target/run/gate/revision rules;
- hook manifests or hook count;
- approved UR or PRD.

Also excluded:

- a second SessionStart, per-prompt or pre-tool hook;
- keyword, regex, remote or raw-prompt classification;
- persisted request applicability;
- manual edits under `create-agdf/generated/**`;
- direct installed-host edits without lifecycle consent;
- automatic initialization, commit, push, PR, tag or release;
- any change to `assets/agdf-von-agentenarbeit-zu-verantwortbarer-auslieferung.png`;
- a new Copilot or OpenCode behavioral evaluator adapter;
- raising a budget or weakening a structural condition without a new SD revision and approval.

## 7. Risks And Required Responses

| Risk | Gate effect | Required response |
|---|---|---|
| Compact wording loses approved semantics. | block | Keep the complete semantic contract on demand and prove adversarial composed-profile pairs before packaging. |
| Micro-bootstrap cannot reach the full router or focused contracts. | block | Repair packaged resource paths and positive-route tests; do not restore the full eager router. |
| A direct selected skill lacks a proven common pre-selection kernel. | block | Retain the skill-local kernel backstop until all four hosts prove the guarantee. |
| Dynamic context or compaction becomes another policy owner. | block | Reduce it to facts or the bounded kernel-only recovery block and rerun duplicate/conflict tests. |
| Machine paths make raw values unstable. | warn | Report raw and normalized bytes and replace only the three approved absolute-path fields. |
| Profile surface and evaluator surface are conflated. | block | Report both identities and the source-composed evidence plane; never label Codex execution as Copilot or OpenCode live-host evidence. |
| Case expectations leak into composed instructions. | block | Load the instruction skill only from closed `composed_profile` metadata and never pass metadata or expected values to the model. |
| Old Revision 1 evidence is mistaken for Revision 3 completion. | block | Keep all post-TP artefacts stale until Revision 3 implementation and evidence are reviewed again. |
| Required Fresh-Host evidence is missing. | revise; blocks QA pass | Complete each host independently; do not substitute fixture, package or another host. |
| Another active run changes an overlapping owner. | block | Stop, rebaseline and repeat Brownfield/TP fit review before merging scope. |

## 8. Next Step

Task/Test Plan Revision 3 is approved. The exact approval accepted for Revision 2 remains historical
and did not transfer; Revision 3 received its own same-target, same-run, same-gate and same-revision
approval. The next permissible step is the focused pre-implementation Brownfield Analysis against
Revision 3. Implementation remains forbidden until that analysis passes.
