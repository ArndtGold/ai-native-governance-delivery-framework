# Task And Test Plan: Cross-surface Executable Skill Dispatcher

- revision: 1
- status: `approved`
- related_prd: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/PRD.md`
- related_sd: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/SD.md`
- delivery_depth: `structured_delivery`

## Plan Objective

Implement one version-matched local `skill-dispatch --json` path that performs the shared AGDF
preflight for every shipped canonical skill on Copilot, Codex, Claude Code and OpenCode. The work
must reduce model-owned discovery and repeated skill instructions without moving target, gate,
approval, QA, locale or presentation authority into the dispatcher.

## Scope Boundary

Included:

- dispatcher schema, validation and orchestration in the existing local runtime;
- registry metadata derived from the canonical plugin definition;
- CLI parsing, handler integration, wrapper timing and typed results;
- exact installed binding projection for all supported surfaces;
- compaction of duplicated operational instructions in all ten canonical skills;
- deterministic, package, Windows and loaded-host evidence;
- Context Graph reconciliation for the new orchestration authority.

Excluded:

- a daemon, remote service, second workflow engine or new approval store;
- changes to target, gate, QA, approval, locale or presentation semantics;
- automatic repository checks without existing consent;
- claims that a host is executable without direct loaded-host evidence;
- release, installation, commit, push or PR actions.

The unrelated asset `assets/agdf-von-agentenarbeit-zu-verantwortbarer-auslieferung.png` and all prior
runs remain outside this plan.

## Baseline

- Canonical registry currently contains ten skills in `plugin/meta/agdf-plugin.definition.json`.
- Canonical `plugin/skills/*/SKILL.md` files currently total 77,232 bytes.
- The existing exact-version runtime supports target, doctor, gate, delivery-map and delivery-path
  commands, but no named skill dispatch.
- The observed Copilot path reached the correct target card only after about three minutes because
  the model searched contracts and entrypoints before executing the target preflight.

## Tasks

### TP-01 Define The Dispatch Contract And Derived Registry

- requirements: PRD-01, PRD-02, PRD-07, PRD-12, PRD-17, PRD-18
- implementation:
  - add `create-agdf/lib/skill-dispatch/contract.js` for schema version, enums, limits, normalized
    input/output and typed error validation;
  - derive registry membership from `pluginDefinition.skillSet` and add only the minimal
    `dispatch_mode`, deterministic command, control-snapshot and contract-version metadata;
  - reject missing, duplicate, unknown or per-host registry definitions.
- acceptance:
  - all ten shipped skills resolve exactly once;
  - unknown skill, surface, language shape, relative working directory, unpaired target fields and
    oversized fields fail before target or repository access;
  - registry generation is deterministic and contains no second slug list.
- tests:
  - unit table for every valid registry entry and every invalid input class;
  - mutation fixtures for missing metadata, duplicate slug and unsupported dispatch mode.

### TP-02 Implement The Single Orchestration Service

- requirements: PRD-03, PRD-04, PRD-05, PRD-06, PRD-07, PRD-08, PRD-09, PRD-12, PRD-17
- implementation:
  - add `create-agdf/lib/skill-dispatch/service.js` with injected resolver, gate evaluator, renderer
    and monotonic clock;
  - call the existing target resolver first and return its canonical localized orientation
    unchanged when unresolved;
  - return the existing deterministic gate result for `gate-check` and an immutable bounded
    continuation packet for judgement skills;
  - enforce `terminal`, `authorizes: false`, output size and one-action recovery semantics.
- acceptance:
  - unresolved target triggers no activation, run selection, control read or skill callback;
  - resolved continuation contains exactly one governance target and no artefact body, source
    snapshot, prompt, hidden reasoning, secret or unrelated path;
  - dispatcher never persists approval or control state and never makes a QA decision.
- tests:
  - dependency spies that throw on every forbidden post-terminal callback;
  - deterministic snapshots for `target_unresolved`, `control_result`, `skill_continuation`,
    `dispatcher_unavailable`, `invalid_input` and `evaluator_error`;
  - security and output-boundary negative fixtures.

### TP-03 Add The CLI And Runtime Wrapper Path

- requirements: PRD-02, PRD-03, PRD-11, PRD-12, PRD-15, PRD-16
- implementation:
  - add `skill-dispatch`, `--skill`, `--surface` and the approved compatible options to the existing
    parser and command registry;
  - register one handler through `validation-handlers.js` and `validator-application.js`;
  - pass validated installed-runtime identity and wrapper timing through `local-validator.js` and
    the generated runtime without weakening version, digest or provenance enforcement;
  - preserve all existing public command grammar and output.
- acceptance:
  - successful dispatch exits 0; typed terminal failure exits 2 with one JSON document;
  - `--json` is mandatory and no malformed invocation reaches repository access;
  - dispatcher local process duration is at most two seconds in deterministic CI tests;
  - existing CLI regression suites remain unchanged in behavior.
- tests:
  - parser/help/handler tests, exact-version mismatch tests, output-limit tests and timing tests;
  - POSIX and native-Windows argv/path fixtures including spaces and drive-letter paths.

### TP-04 Project An Exact Runtime Binding Per Surface

- requirements: PRD-03, PRD-10, PRD-13, PRD-14, PRD-15, PRD-16
- implementation:
  - emit the exact absolute surface-local command prefix and expected version from the existing
    session runtime for Codex, Claude Code and Copilot;
  - emit the config-local verified command prefix from the OpenCode system transform;
  - keep binding emission repository-free and read-only;
  - start the existing optional doctor/control inspection only after binding emission and only
    under its current consent and capability identity.
- acceptance:
  - every generated profile contains one coherent binding to its packaged runtime;
  - binding absence or mismatch produces `dispatcher_unavailable`, never runtime search or `npx`;
  - OpenCode subagent and other host limitations remain explicitly disclosed;
  - instruction-only hosts do not claim executable conformance.
- tests:
  - hook/system-transform fixtures for consent on/off, missing runtime and version mismatch;
  - generated-profile path and manifest integrity checks on POSIX and Windows fixtures.

### TP-05 Compact Canonical Skill Instructions

- requirements: PRD-10, PRD-13, PRD-18
- implementation:
  - add one compact dispatcher-first block to every canonical `plugin/skills/*/SKILL.md`;
  - remove only operational discovery, runtime-location, common target-preflight and manual renderer
    reconstruction instructions now enforced by the executable path;
  - retain each skill's judgement rules, evidence obligations, authority boundaries, gate-specific
    behavior and supported instruction-only recovery;
  - regenerate Codex, Copilot and OpenCode projections from canonical skills.
- acceptance:
  - every one of the ten skills invokes dispatch as its first operational action;
  - terminal output is transmitted unchanged and stops the skill; continuation is bound to the
    returned target, run and snapshot;
  - canonical skill bytes and estimated tokens are lower than the 77,232-byte baseline, with a
    per-skill before/after report and zero lost normative rule in the conformance matrix;
  - no skill searches for an alternate runtime or maintains a private target/status-card template.
- tests:
  - structural conformance for exactly one dispatcher block per skill;
  - semantic checklist mapping retained skill-specific rules before and after compaction;
  - adversarial weak-model corpus for terminal stopping, wrong target, stale run and missing binding.

### TP-06 Preserve Locale, Presentation And Approval Authority

- requirements: PRD-08, PRD-09, PRD-12, PRD-14
- implementation:
  - pass the resolved language through the dispatcher without adding localized prose;
  - consume existing task orientation, status and approval presentation objects unchanged;
  - keep exact approval validation and same-run/gate/revision persistence outside dispatch.
- acceptance:
  - German interactions contain reviewed German explanatory values and canonical machine tokens;
  - unsupported locales use the complete English fallback and invalid registries fail closed;
  - no dispatch result can authorize a gate or substitute host permission for approval.
- tests:
  - locale parity and mixed-language negative cases;
  - stale revision, wrong gate, wrong run and decorated approval negative cases;
  - byte-equality assertion for existing renderer Markdown returned through dispatch.

### TP-07 Strengthen Generation, Package And Runtime Integrity

- requirements: PRD-01, PRD-13, PRD-15, PRD-16, PRD-18
- implementation:
  - extend canonical runtime, plugin and package generators for dispatcher files, registry metadata,
    binding and compacted skills;
  - update declared inventories and payload baseline only from measured final generated bytes;
  - add negative integrity fixtures for missing/tampered dispatcher, stale binding and divergent
    generated skills.
- acceptance:
  - repeated generation is idempotent;
  - source, generated surface, package and installed-profile digests are coherent;
  - `release:prepare`, public-plugin validation, package contents and complete smoke pass;
  - rollback restores command, bindings and skills as one coherent generated set.
- tests:
  - generation/integrity suites, exact tarball inspection and payload growth validation;
  - release-bump fixtures that remain safe on native Windows without requiring symlink privilege.

### TP-08 Run Deterministic Integration And Regression Evidence

- requirements: PRD-04 through PRD-18
- implementation:
  - add direct `gate-check` and `qa-gate` dispatcher reference scenarios;
  - cover all ten skills, six outcomes, target ambiguity, run ambiguity, stale identity, consent and
    capability paths;
  - run focused tests first, then complete repository and distribution suites.
- acceptance:
  - no existing command, gate transition, renderer, installation consent or host package regression;
  - repo-less unresolved cases make zero post-terminal repository calls;
  - weak-model cases do not perform discovery before the dispatcher and obey terminality;
  - deterministic evidence distinguishes executable duration from model and host latency.
- tests:
  - focused unit/contract/CLI suites;
  - Runtime Integrity and canonical skill evals;
  - full package, release preparation and repository regression commands recorded in `CD_TESTS.md`.

### TP-09 Capture Loaded-host And Native-Windows Evidence

- requirements: PRD-11, PRD-13, PRD-14, PRD-15, PRD-18
- implementation:
  - install or refresh a built profile only after separate explicit lifecycle authorization;
  - restart each host and run one repo-less plus one repository-bound `gate-check` case and one
    repo-less plus one QA-ready `qa-gate` case;
  - record runtime version, OS, model, binding, tool-start latency, dispatcher duration,
    first-visible latency, locale, outcome, terminality and post-terminal activity.
- acceptance:
  - a conforming executable host shows its first visible AGDF result within 15 seconds;
  - Copilot no longer performs preliminary contract/entrypoint searches;
  - unavailable hosts are recorded as `instruction_only`, not silently omitted or promoted;
  - native Windows proves real command invocation and package/install path separately from CI.
- evidence:
  - one host-evidence record per surface and OS; user-attested evidence remains labelled as such.

### TP-10 Reviews, QA, Rollback And Delivery Readiness

- requirements: all PRD requirements and SD decisions
- implementation:
  - run Task Plan Review, Clean Implementation Review and mandatory Code Review;
  - resolve normalized requirements, design, plan, implementation and evidence gaps at their owner;
  - run QA only after implementation, tests and reviews are complete;
  - verify rollback by regenerating the prior coherent command/binding/skill set in an isolated
    fixture;
  - keep commit, push, PR, installation and release actions outside automatic execution.
- acceptance:
  - TP coverage, solution integrity and code quality evidence contain no open applicable finding;
  - QA is the sole `pass | revise | block` owner;
  - Context Graph node and links match the implemented boundary;
  - OR and delivery closeout state only evidence actually obtained.

## Execution Order

1. TP-01 and TP-02 establish the closed contract and service boundary.
2. TP-03 integrates the existing runtime and public CLI.
3. TP-04 adds generated host bindings without enabling automatic repository checks.
4. TP-05 compacts instructions only after the executable replacement is testable.
5. TP-06 verifies authority, locale and presentation invariants.
6. TP-07 regenerates and validates distributable profiles.
7. TP-08 runs deterministic integration and regression evidence.
8. TP-09 captures separately authorized loaded-host and native-Windows evidence.
9. TP-10 performs mandatory reviews, QA preparation, rollback proof and closeout.

TP-01 through TP-08 are implementation work after TP approval and passing pre-implementation
Brownfield Analysis. TP-09 installation and host lifecycle mutations still require separate explicit
authorization. TP-10 cannot claim QA pass before its evidence exists.

## Requirement Coverage

| Requirement range | Primary tasks | Evidence owner |
|---|---|---|
| PRD-01–03 | TP-01, TP-03, TP-04 | contract, registry, parser and runtime tests |
| PRD-04–07 | TP-02, TP-08 | orchestration and terminality tests |
| PRD-08–10 | TP-02, TP-05, TP-06 | authority, presentation and skill conformance |
| PRD-11–12 | TP-02, TP-03, TP-09 | timing and failure matrix |
| PRD-13–16 | TP-04, TP-07, TP-09 | generation, package, Windows and host evidence |
| PRD-17–18 | TP-01, TP-02, TP-05, TP-08 | security boundary and complete skill corpus |

## Required Evidence Before QA

- approved TP Revision 1 and passing pre-implementation Brownfield Analysis;
- implementation and test record mapped to every TP task;
- per-skill instruction compaction report with retained-semantics review;
- deterministic target/run/terminality/locale/approval tests;
- complete Runtime Integrity, generation, package, release-preparation and regression results;
- direct native-Windows evidence;
- distinct loaded-host evidence for Copilot, Codex, Claude Code and OpenCode, including honest
  `instruction_only` outcomes;
- Task Plan Review, Clean Implementation Review and Code Review without unresolved blocking gaps;
- reconciled Context Graph node and rollback evidence.

## Stop And Escalation Conditions

Stop and route back to the named owner if implementation would:

- add new target, gate, approval, QA, locale or presentation semantics;
- require a per-host registry or duplicate skill list;
- require automatic repository access without existing consent;
- make an unresolved result non-terminal;
- exceed output/privacy bounds or weaken runtime provenance;
- preserve skill brevity only by deleting a normative judgement or evidence rule;
- require release or host capability claims not covered by direct evidence.
