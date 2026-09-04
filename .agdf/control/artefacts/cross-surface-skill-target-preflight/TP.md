# TP: Cross-Surface Skill Target Preflight

Status: draft
Gate: TP
Gate approval: open
Based on: approved SD Revision 1
Date: 2026-09-03
Owner: Arndt Gold

## 1. Task List

### CSTP-T01 — Pre-implementation Brownfield Analysis

- Inspect the approved TP against the current contract, skill, generator, test and package owners.
- Record exact reuse boundaries, affected files, protected behavior and newly discovered conflicts in
  `BROWNFIELD_ANALYSIS.md` before changing implementation files.
- Stop and route upstream if implementation would require a new resolver, renderer, public schema,
  gate semantic or host-specific owner.
- Acceptance mapping: CSTP-01 through CSTP-08.

### CSTP-T02 — Define the shared Direct Skill Invocation Preflight

- Extend `plugin/meta/contracts/task-target-resolution.md` with one normative Direct Skill
  Invocation Preflight.
- Preserve existing target result schema, reason codes, CLI forms, authority precedence and exit
  behavior.
- Specify target resolution before repository, run, gate or evidence access; cwd remains context
  only; unresolved renders the canonical orientation and terminates the current skill invocation.
- Acceptance mapping: CSTP-01, CSTP-02, CSTP-05.

### CSTP-T03 — Refactor gate-check onto the shared preflight

- Replace duplicated operational target-preflight wording in `plugin/skills/gate-check/SKILL.md`
  with a focused reference to the shared contract.
- Preserve gate-check ownership of run selection, gate legality, approval projection and the Run
  Status Card.
- Acceptance mapping: CSTP-01, CSTP-04.

### CSTP-T04 — Make every canonical skill direct-invocation safe

- Update the ten skills declared by `plugin/meta/agdf-plugin.definition.json`: `gate-check`,
  `brownfield-analysis`, `ux-intent-definition`, `delivery-path-search`,
  `task-plan-review`, `clean-implementation-review`, `code-review`, `qa-gate`, `release-or` and
  `delivery-closeout`.
- Each skill must consume the Target and Interaction contracts, perform or revalidate target
  resolution first, use only the derived governance target and stop terminally on unresolved.
- Keep the shared semantics in the contract; skill files contain only their focused consumption and
  skill-specific continuation.
- Acceptance mapping: CSTP-01, CSTP-02, CSTP-05, CSTP-06.

### CSTP-T05 — Add QA evidence self-discovery

- Extend `plugin/skills/qa-gate/SKILL.md` so a resolved invocation selects exactly one eligible run
  and reads available TP, Brownfield Analysis, Task Plan Review, Clean Review, Code Review, tests,
  normalized findings and Context Graph evidence from `.agdf/control/`.
- Stop at run clarification before making a QA decision when selection is ambiguous.
- For an eligible, selected run, emit exactly one `pass | revise | block` decision; missing or
  contradictory evidence lowers the decision through the Quality Contract.
- Never ask the user to reproduce repository evidence that is readable by the skill.
- Acceptance mapping: CSTP-03, CSTP-04, CSTP-07.

### CSTP-T06 — Enforce presentation and approval ownership

- Keep Task Target Orientation in the Interaction renderer, operational status and approval
  orientation in gate-check, and QA readiness and decision in the Quality/QA owners.
- Prohibit qa-gate from reconstructing a Run Status Card or promising a native or interactive QA
  card.
- Preserve exact `Approval: <GateName>` plus same-target, run, gate and revision revalidation as the
  only approval authority.
- Acceptance mapping: CSTP-04, CSTP-07.

### CSTP-T07 — Extend Runtime Integrity invariants

- Make Runtime Integrity enumerate the canonical skill set and verify each skill's shared preflight,
  contract dependencies and terminal unresolved boundary.
- Add negative assertions for local resolver copies, cwd authority, QA status-card reconstruction,
  implicit approval and hand-maintained host-specific semantic forks.
- Acceptance mapping: CSTP-01, CSTP-02, CSTP-04, CSTP-05, CSTP-06.

### CSTP-T08 — Add deterministic and adversarial skill evaluations

- Add at least one unresolved direct-invocation case per canonical skill.
- Add QA cases for repo-less/no-target, resolved unique QA run, resolved ambiguous runs, missing
  review evidence, contradictory evidence, manual-evidence deflection, interactive-card claims and
  host-permission/approval bait.
- Cover German and English outputs and require one complete locale per rendered interaction.
- Update deterministic observations, fingerprints and corpus version only through the existing eval
  workflow.
- Acceptance mapping: CSTP-01 through CSTP-07.

### CSTP-T09 — Generate and compare all supported profiles

- Use the existing sync path to project canonical changes to Codex, Claude Code, GitHub Copilot and
  OpenCode.
- Verify relative contract links, semantic equivalence and sync idempotence; do not add manual host
  forks.
- Acceptance mapping: CSTP-01, CSTP-05, CSTP-06.

### CSTP-T10 — Run focused, package and aggregate validation

- Run focused target, interaction, QA, Runtime Integrity, conformance, profile and skill-eval tests.
- Run package build and the complete `create-agdf` smoke suite.
- Measure generated skill/profile payload changes; change a baseline only when the measured increase
  is necessary, bounded and reviewed.
- Run `git diff --check` and keep the excluded untracked image untouched.
- Acceptance mapping: CSTP-03, CSTP-06, CSTP-08.

### CSTP-T11 — Perform mandatory reviews and reconcile control evidence

- Produce Task Plan Review, Clean Implementation Review and Code Review after implementation and
  tests.
- Normalize every finding to its canonical owner and rerun affected tests after corrections.
- Update `CG-TASK-TARGET-AUTHORITY` and `CG-NATIVE-INTERACTION-AUTHORITY` only after the delivered
  behavior is verified.
- Execute qa-gate only after the mandatory reviews are complete.
- Acceptance mapping: CSTP-03, CSTP-04, CSTP-07, CSTP-08.

### CSTP-T12 — Record loaded-host evidence without inferred parity

- Maintain a separate matrix for Codex, Claude Code, GitHub Copilot and OpenCode with source,
  generated bundle, installed bytes and fresh-session observation as distinct evidence planes.
- For each authorized and available host, observe one repo-less direct invocation and one resolved
  repository invocation.
- Keep unavailable, unauthenticated, stale-session or uninstalled hosts as explicit evidence gaps;
  do not infer them from another host.
- Acceptance mapping: CSTP-06, CSTP-08.

## 2. Acceptance Coverage

| PRD criterion | Planned tasks | Required completion evidence |
|---|---|---|
| CSTP-01 Target first | T02, T03, T04, T07, T08, T09 | Contract diff, per-skill integrity assertions and unresolved evals |
| CSTP-02 No cwd authority | T02, T04, T07, T08 | Repo-less fixtures show no repository, run, gate or QA access |
| CSTP-03 Self-service repository evidence | T05, T08, T10, T11 | Unique-run QA fixtures and review evidence show repository self-discovery |
| CSTP-04 Skill output ownership | T03, T05, T06, T07, T08, T11 | Owner assertions and QA outputs contain no reconstructed status card |
| CSTP-05 Locale consistency | T02, T04, T07, T08, T09 | Complete German and English fixtures without mixed values |
| CSTP-06 Cross-surface propagation | T04, T07, T09, T10, T12 | Generated-profile parity, conformance, package and host matrix |
| CSTP-07 Approval boundary | T05, T06, T08, T11 | Adversarial approval cases and same-state revalidation evidence |
| CSTP-08 Honest host evidence | T10, T11, T12 | Evidence-plane matrix with explicit gaps and no inferred host pass |

## 3. Test Plan

### Focused contract and behavior checks

- Add or extend the existing target-resolution tests for context-only, selected-target, mismatch,
  unavailable and ambiguous inputs.
- Add one direct unresolved fixture for every canonical skill and QA fixtures for unique-run
  self-discovery, run ambiguity and incomplete evidence.
- Add German and English assertions for the complete target orientation and skill-owned result.
- Verify that an unresolved invocation performs no doctor, run selection, gate evaluation,
  repository evidence read or authority mutation.

### Deterministic repository commands

Run the repository-owned scripts that correspond to the delivered changes, including:

```text
npm --prefix create-agdf run test:runtime-integrity-layout
npm --prefix create-agdf run test:runtime-integrity-negative
npm --prefix create-agdf run test:agent-skills-conformance
npm --prefix create-agdf run test:skill-evals
npm --prefix create-agdf run eval:skills
npm --prefix create-agdf run test:copilot-profile
npm --prefix create-agdf run test:package-build
npm --prefix create-agdf run smoke-test
git diff --check
```

If script names differ at implementation time, the Brownfield Analysis must identify the canonical
equivalent before execution. A missing script is not silently treated as passed.

### QA block conditions

QA cannot pass when any of the following is true:

- one canonical skill lacks the shared target preflight or continues after unresolved;
- cwd, chat storage or a host temp path acquires target authority;
- qa-gate requests repository evidence that it can read, emits no exact QA decision or promises an
  interactive/status card it does not own;
- generated profiles drift semantically or contain hand-maintained host-specific rules;
- any required focused, package, conformance, eval or aggregate test fails;
- an open P0 or P1 review finding exists;
- cross-host behavior is claimed from source, bundle or another host without direct loaded-host
  evidence.

## 4. Brownfield Scope

- Modify only the existing target, interaction, quality, canonical skill, generation, integrity,
  eval and related fixture owners confirmed by CSTP-T01.
- Reuse `target-check`, Task Target Orientation, Quality Readiness, Run Status Card and the existing
  profile generator.
- Preserve public target-check schemas, gate order, approval values and host installation behavior.
- Treat generated profile files as derived outputs and verify their provenance.

## 5. Out Of Scope

- New target resolver, renderer, gate, approval syntax or public CLI result schema.
- A new QA card, a second Run Status Card owner or host-native UI implementation.
- Automatic installation, cache mutation, restart, login, release, publication, commit, push or PR.
- Repair of unrelated active runs or their aggregate doctor findings.
- General redesign of status-card localization; any directly introduced locale regression remains a
  blocker, while the already recorded dynamic status-card warning stays a separate owner finding.
- The untracked `assets/agdf-von-agentenarbeit-zu-verantwortbarer-auslieferung.png` file.

## 6. Risks And Blockers

- Copy-pasted skill wording could become a second target contract; integrity tests must distinguish
  consumption from duplicated semantics.
- Some hosts may route a direct slash command without loading referenced contracts; generated
  profile inspection and fresh-session evidence remain necessary.
- Run ambiguity could be persisted incorrectly as a QA block; it must remain a pre-decision target
  or run clarification.
- Profile payload growth may exceed existing limits; measure before changing any baseline.
- Repository tests can prove source and generated behavior but not installed or loaded host behavior.
- Foreign worktree changes and the excluded image must not enter this run's diff or evidence.

No known blocker prevents implementation preparation after TP approval. New scope, a public schema
change, a new owner or an unresolved Brownfield conflict requires upstream revision before coding.

## 7. Next Step

Review this Task Plan and approve only with:

`Approval: TP`
