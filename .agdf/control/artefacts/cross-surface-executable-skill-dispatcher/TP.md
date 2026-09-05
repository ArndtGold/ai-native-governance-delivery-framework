# Task And Test Plan: Cross-surface Executable Skill Dispatcher

- revision: 2
- status: `approved`
- related_prd: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/PRD.md`
- related_sd: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/SD.md`
- delivery_depth: `structured_delivery`

## Plan Objective

TP Revision 2 was approved by exact `Approval: TP` after same-target/run/gate revalidation against
run revision 19 (`38F9EC31-0A51-42DA-B60E-1EE409BCAB5D`). Installation, restart and release remain
separately bounded.

Revision 2 implements approved SD Revision 2's cross-host invocation correction. TP-01 through
TP-10 remain the original foundation and regression obligations, not instructions to rebuild the
existing dispatcher. TP-11 through TP-16 below are the executable correction plan. Previous TP1
approval and results do not authorize or prove the correction. Exact `Approval: TP` for this
revision and refreshed pre-implementation Brownfield Analysis are required before code changes.

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

## Revision 2 Baseline And Boundaries

- Correction source baseline: `4d38db394d05bf2afb5280dc3af92dfee042a2bb`; runtime version `0.14.5`.
  Tracked source was clean before the SD2 control-only changes. Preserve the unrelated image and
  any later user changes; capture a fresh changed-path baseline before implementation.
- The current dispatcher already exists. CSED-HOST-08 proves the installed Electron Helper
  requires an environment override missing from the binding, followed by a guessed `--cwd` flag.
- The final call omitted both target fields and correctly returned `target_unresolved`. It did
  not perform QA. Restore complete argument transport without making cwd or a bare skill
  invocation target authority.
- Binding schema advances to `2`; dispatcher CLI/input/output contract remains `1`.
- No new hook, native tool, global permission, registry lookup, runtime search, target heuristic,
  daemon, telemetry, permanent capability cache or automatic host installation is in scope.
- `opencode-native-dispatch-tool`, other runs, installed caches and `iself.eu` are not mutation
  targets. Existing instruction-footprint budgets and activation fingerprint remain constraints.

## Historical Revision 1 Baseline

- Canonical registry currently contains ten skills in `plugin/meta/agdf-plugin.definition.json`.
- Canonical `plugin/skills/*/SKILL.md` files currently total 77,232 bytes.
- The existing exact-version runtime supports target, doctor, gate, delivery-map and delivery-path
  commands, but no named skill dispatch.
- The observed Copilot path reached the correct target card only after about three minutes because
  the model searched contracts and entrypoints before executing the target preflight.

## Retained Foundation Tasks

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

## Revision 2 Correction Tasks

### TP-11 Establish The Shared Binding And Launch Contract

- requirements: PRD-02, PRD-03, PRD-10, PRD-12, PRD-13, PRD-16, PRD-17; SD2 Common rule and
  Shared Invocation Owner And Runtime Suitability.
- owners: one small `create-agdf/lib/skill-dispatch/` transport module; existing
  `create-agdf/lib/cli/command-registry.js` and `parse-args.js`; no per-host schema owner.
- implementation: construct and validate binding schema 2 with exact executable, immutable argv
  prefix, expected version, bounded child environment and canonical invocation grammar. Derive
  flag spelling and pairing from the existing CLI owner; keep activation/route identity intact.
- acceptance: known complete schema only; `authorizes: false`; old or unknown/incomplete binding
  rejects with one recovery rather than downgrade. Direct CLI v1 remains compatible. Only the
  necessary AGDF-owned environment override is permitted; inherited secrets never enter context.
- tests: add a focused binding test within the existing script test harness, covering schema
  skew, required fields, invalid absolute paths, unexpected environment keys, immutable prefix,
  paired target options and unchanged CLI grammar. Unknown `--cwd` remains an error.
- evidence: red/green fixtures and documented binding-v2 versus dispatcher-v1 compatibility in
  `CD_TESTS.md`; no generated profile or installed-runtime claims from unit tests alone.

### TP-12 Verify Runtime Suitability And Preserve Child Environment

- requirements: PRD-03, PRD-11, PRD-12, PRD-15, PRD-17; SD2 Shared Invocation Owner.
- owners: shared transport module and `create-agdf/lib/runtime/local-validator.js` process chain.
- implementation: inspect runtime metadata, prepare Node or Electron launch tuple and run a
  fixed repository-free local capability probe. Electron uses child-only `ELECTRON_RUN_AS_NODE=1`.
  Preserve verified overrides through wrapper-to-validator execution without changing parent env.
- acceptance: success requires the exact executable/environment tuple to pass. Probe has a
  bounded timeout/output and same-session exact-identity cache only. Unknown capability, timeout,
  nonzero exit, malformed/oversized output, missing runtime and stale identity all fail closed.
  Do not launch an unmodified Electron Helper just to reproduce a fatal crash in the user's app.
  Use the captured host failure plus isolated regression fixtures as the negative baseline.
- tests: injected probe tables for Node, Electron and unsupported runtime metadata; fresh real
  Node subprocess; exact-launch reuse/invalidation; sentinel parent env unchanged; child-chain
  env retained; resolver/FS/network spies prove no repository inspection or remote lookup.
  Real installed Electron probe is a separately classified read-only runtime check, not a host
  restart or proof of fresh-session model behavior.
- evidence: probe identity, outcome, limits and process observations, excluding secret values.
  Measure Node/Electron differences only with equivalent inputs and available runtimes. Existing
  `wrapper_ms` includes work since wrapper entry; do not label it isolated Electron overhead or
  claim QA duration from a terminal unresolved case.

### TP-13 Integrate Both Binding Producers And Every Consumer

- requirements: PRD-10, PRD-13, PRD-14, PRD-15, PRD-18; SD2 host adapters and distribution.
- owners: `sync-plugin-runtime.js`, `opencode-plugin.js`, global OpenCode projection in
  `lib/installers/opencode.js`, canonical skill entry blocks, and binding consumption in
  `lib/request-activation-evals/composed-profile.js` plus existing integrity consumers.
- implementation: replace both independent binding literals with the shared owner; consume its
  environment and invocation grammar without private flag lists. Preserve existing surface root,
  expected version, activation/route identity, ordinary-chat silence and terminal host-action
  behavior. Apply only compact dispatch-boundary guidance to all canonical skills.
- acceptance: Codex, Claude Code, Copilot and OpenCode receive coherent schema 2 bindings through
  their established profiles. OpenCode inactive context contains no executable binding; invalid
  launch capability does not advertise executable conformance. Automatic repository checks keep
  their current consent gate. No probe or binding presence activates a delivery workflow.
- tests: extend OpenCode hardening, session/local-validator, Copilot profile, composed-profile and
  request-activation tests for success, missing/stale runtime, schema skew and consent on/off.
  Cover all shipped skills from the canonical registry without adding another slug inventory.
- evidence: source-to-generated consumer map and passing positive/negative adapter fixtures;
  public skills-only payload remains runtime-free, with unchanged honest capability boundaries.

### TP-14 Prove Argument, Target And Shell Transport End To End

- requirements: PRD-02, PRD-04 through PRD-10, PRD-12, PRD-16 through PRD-18; SD2 Exact Argument
  And Target Transport.
- owners: shared binding/CLI grammar, existing target resolver/service, host transport fixtures.
- implementation: exercise complete generated-binding invocation with semantic skill, language,
  cwd, paired established target and optional run values. Keep structured argv/env where supported;
  test the existing POSIX and Windows shell transport boundaries without `eval` or new native tools.
- acceptance: first dispatcher attempt uses correct flags and child env without `--help`, file
  discovery or an agent-invented override. Explicit/continued/deictic targets retain both fields;
  absent and ambiguous evidence remain terminal. No cwd-derived target, silent run selection,
  invented QA decision or continuation after terminal output.
- tests: `gate-check` and `qa-gate` reference paths across four profile fixtures, each with
  context-only, resolved, missing-control, earlier-gate and ambiguous-run scenarios. Use a QA-ready
  isolated fixture to prove bounded judgement continuation, not to manufacture a QA pass.
  Include spaces, Unicode, quotes, apostrophes, dollar signs, backticks, shell metacharacters and
  Windows drive/backslash paths. Injection sentinels must not execute and parent env is unchanged.
  Platform-string fixtures are not a substitute for native OS process execution.
- evidence: exact argv/env shape with safe values, exit/outcome, locale, byte-exact terminal text,
  target/control separation and zero forbidden downstream calls. Preserve existing schema/authority
  assertions rather than weakening them to accept the new transport.

### TP-15 Regenerate And Verify Coherent Distribution

- requirements: PRD-01, PRD-13, PRD-15, PRD-16, PRD-18; SD2 Compatibility And Distribution.
- owners: existing runtime/package generators, inventories, profile validation, instruction budget
  and Runtime Integrity tests. Generated paths remain derived and are never patched directly.
- implementation: propagate the shared owner and consumer changes to all runtime-bearing
  profiles; recompute manifests/digests/inventories using existing generators. Integrate the new
  focused tests into the normal smoke suite. Refresh only measured, required payload expectations.
- acceptance: repeated generation is idempotent; coherent package v2 bindings work and mixed
  generations fail closed; CLI v1 still works; no runtime leaks into the public skills-only
  profile. Kernel fingerprint, hook inventory, permissions and instruction budgets are preserved.
- tests: focused transport/dispatcher/CLI/target/runtime/adapter tests, then instruction footprint,
  request-activation, profile/package contents, release preparation, Runtime Integrity and complete
  smoke. Verify rollback in an isolated fixture by restoring the prior coherent binding/consumer
  set together, never resetting the user's checkout or control state.
- evidence: exact commands, changed-path ownership, before/after instruction and package bytes,
  digest/idempotence/rollback results and explicit failures in `CD_TESTS.md`. Do not increase
  instruction budgets or suppress unrelated test failures to produce a pass.

### TP-16 Refresh Reviews And Capture Bounded Host Evidence

- requirements: all PRD/SD2 acceptance obligations; extends TP-09 and TP-10.
- implementation: refresh Task Plan Review, Clean Implementation Review and mandatory Code Review
  on the actual correction diff; route normalized gaps at their owner. Run QA after CD+Tests and
  reviews. Retain historical results but never carry their pass state onto untested new bindings.
- host evidence: after separate lifecycle authorization, install/restart coherent profiles and
  capture context-only and target-bound `gate-check` plus context-only and QA-ready `qa-gate` on
  Codex, Claude Code, Copilot and OpenCode. Add OpenCode inactive-repository and ordinary-chat cases.
  Record host/OS/model/runtime/package identity, actual argv/env, first-tool start, first-visible
  output, duration, outcome, terminal transfer and activity after termination.
- acceptance: no improvised runtime or flags and no lost established target. Native Windows,
  Linux/macOS process fixtures, real Electron runtime and model-visible fresh-host evidence remain
  separate evidence classes. Missing authorization, host access or authentication stays an explicit
  evidence gap, not another host's inferred pass. Do not launch an external model evaluation with
  repository content without the required authorization.
- evidence: refresh `HOST_EVIDENCE.md`, `CD_TESTS.md`, review reports, QA and OR for this revision;
  reconcile Context Graph design versus implemented evidence. No commit, push, PR, installation or
  release follows automatically from TP approval, test success or a ready package.

## Revision 2 Execution Order And Verification Commands

1. After TP2 approval, revalidate scope/baseline and refresh pre-implementation Brownfield Analysis.
2. Establish TP-11 red tests and common contract, then TP-12 runtime launch preparation.
3. Integrate TP-13 producers/consumers and TP-14 end-to-end transport; run focused tests as changed.
4. Complete TP-15 generation, package, rollback and aggregate regression verification.
5. Complete TP-16 reviews and separately authorized evidence collection; keep QA `revise` when
   required evidence is missing rather than representing planning or unit fixtures as host proof.

Existing verification entrypoints, augmented by the new focused binding test in TP-11:

```text
node create-agdf/scripts/skill-dispatch-test.js
npm --prefix create-agdf run test:cli-modularization
npm --prefix create-agdf run test:local-validator
npm --prefix create-agdf run test:opencode-hardening
npm --prefix create-agdf run test:copilot-profile
npm --prefix create-agdf run test:task-target-resolution
npm --prefix create-agdf run test:request-activation
npm --prefix create-agdf run test:package-contents
npm --prefix create-agdf run release:prepare
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run smoke-test
git diff --check
```

The commands are planned, not execution evidence. Isolate fixture config/cache/temp paths and
prevent user-installation mutation. The existing two-second local and 15-second loaded-host
criteria remain evidence obligations; do not silently relax them to accommodate probing.

## Historical Revision 1 Execution Order

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

- approved TP Revision 2 and refreshed passing pre-implementation Brownfield Analysis;
- implementation and test record mapped to every TP task;
- per-skill instruction compaction report with retained-semantics review;
- deterministic target/run/terminality/locale/approval tests;
- complete Runtime Integrity, generation, package, release-preparation and regression results;
- direct native-Windows evidence;
- distinct loaded-host evidence for Copilot, Codex, Claude Code and OpenCode, including honest
  `instruction_only` outcomes;
- Task Plan Review, Clean Implementation Review and Code Review without unresolved blocking gaps;
- reconciled Context Graph node and rollback evidence.

## Revision 2 Design Coverage

| Approved SD2 obligation | Correction tasks | Required proof |
|---|---|---|
| Shared binding schema 2; unchanged dispatcher v1 | TP-11, TP-13, TP-15 | schema, CLI compatibility, coherent producer/consumer and mixed-version negatives |
| Runtime suitability and child-only environment | TP-12, TP-14, TP-16 | bounded probe, Node/Electron chain, parent isolation and actual runtime evidence |
| Canonical argument grammar and immutable prefix | TP-11, TP-13, TP-14 | flag-owner parity, exact first invocation and shell injection negatives |
| Established target transport without new authority | TP-14, TP-16 | explicit/continued/deictic, unresolved/ambiguous and target/run separation cases |
| No hook, permission, consent or activation expansion | TP-13, TP-15 | inactive/ordinary-chat, consent, fingerprint and hook/permission invariants |
| Coherent generated/runtime-free profiles and byte budgets | TP-13, TP-15 | idempotence, inventories, provenance, footprint and rollback |
| Honest OS, runtime and fresh-host evidence | TP-12, TP-14, TP-16 | clearly separated fixture/runtime/host records and open gaps |
| Mandatory reviews and controlled delivery | TP-16 | current TP/clean/code reports, QA decision, OR and no automatic lifecycle/VCS actions |

## Stop And Escalation Conditions

Stop and route back to the named owner if implementation would:

- add new target, gate, approval, QA, locale or presentation semantics;
- require a per-host registry or duplicate skill list;
- require automatic repository access without existing consent;
- make an unresolved result non-terminal;
- exceed output/privacy bounds or weaken runtime provenance;
- preserve skill brevity only by deleting a normative judgement or evidence rule;
- require release or host capability claims not covered by direct evidence.

For Revision 2, also stop and route to SD if executable/environment selection requires PATH search,
a daemon, arbitrary environment overrides, a new native tool or a second transport policy; if a
host cannot carry the approved argv/env tuple; or if probe/binding emission would inspect a
repository without consent. Route budget or compatibility conflicts to their approved owner rather
than widening limits, changing dispatcher v1 or silently accepting stale binding context.
