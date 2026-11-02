# TP: Host Adapter Ownership and Comparable Compatibility Evidence

Status: approved
Revision: 1
Gate: TP
Gate approval: Exact `Approval: TP` accepted on 2026-09-05 after version-matched gate-check confirmed run `agdf-host-adapter-compatibility`, gate `TP`, durable Revision 1 and revision identity `d2803cf5-c221-4243-9ced-71a24f88dcad`.
Based on: approved SD Revision 1; approved PRD Revision 1, HAC-01 through HAC-12
Date: 2026-09-05
Owner: Arndt Gold / Codex
Run: agdf-host-adapter-compatibility
Delivery depth: Structured Slice

This plan delivers the private ownership refactor, one common deterministic suite and a repository
compatibility reference defined by the approved SD. It preserves existing public behavior and keeps
reporting outside the installed runtime. All tasks and tests below are **planned, not executed**.
SD approval permits this plan. TP approval and passing implementation-preparation Brownfield Analysis
are prerequisites for implementation.

## 1. Task List

Effort is a rough engineering estimate for the bounded work, not elapsed agent time or a delivery
promise: S = 1–2 hours, M = 2–4 hours, L = 4–8 hours. Native environment provisioning and human UAT
are not estimated. Dependencies determine order; the table does not request parallel agents.

| task_id | Task and file boundary | Depends on | Acceptance mapping | Completion and evidence required | Effort |
|---|---|---|---|---|---|
| T01 | Revalidate approved TP, current source and source-of-truth ownership. Produce `BROWNFIELD_ANALYSIS.md` for this run. Inspect the owners in section 3 before any product edit. | Exact TP approval | HAC-09, HAC-10 | Passing pre-implementation analysis identifies reuse, dependencies, exceptional paths, fixture isolation and the preserved slice boundary. Record checkout/diff and available local toolchain. | S |
| T02 | Capture behavior before extraction and establish the shared scenario runner in `create-agdf/scripts/host-compatibility-test.js` with host stimulus fixtures under `create-agdf/scripts/fixtures/host-compatibility/`. Reuse existing installer, lifecycle, consent and dispatch fixtures. | T01 pass | HAC-01, HAC-02, HAC-04, HAC-05, HAC-08, HAC-10, HAC-12 | Baseline regressions and ordered command/filesystem/result observations. Common assertions execute against production entry points for every host, including negative controls. Existing focused tests remain independently runnable. | L |
| T03 | Extract Codex and Claude plugin installation, inspection and recovery into their SD-defined `lib/host-adapters/<host>/plugin.js` owners. Move Codex registration identity to `codex/identity.js`. Keep `plugin-installers.js` and `local-marketplace.js` entry points compatible. Put only shared command/error mechanics in `installers/plugin-command.js`. | T02 | HAC-04, HAC-05, HAC-09, HAC-10 | Before/after effect-order and output comparisons, same-version byte changes, Codex cache identity, Claude reinstall/recovery failures. One implementation per moved mechanism; staging, provenance and rollback transaction owners remain shared. | L |
| T04 | Extract Copilot plugin orchestration into `host-adapters/copilot/plugin.js`, reusing existing Git transport, settings, discovery and launcher owners. Preserve exported helpers and legacy installer facade routing. | T02, T03 shared helper | HAC-02, HAC-04, HAC-05, HAC-09, HAC-10 | Local Git fixture proves matching payload and skill origin, rollback and previous enablement/settings preservation. Captured commands, defaults, original errors and recovery evidence retain their meanings. | M |
| T05 | Extract the four pure `session-command.js` leaves, Claude permission rules and native runtime-check mechanics, Codex trust/execution projection and OpenCode automatic-check mechanics as specified in SD section 2. Keep consent decisions, identity, receipt persistence and their transaction order in current shared owners. | T02 | HAC-03, HAC-07, HAC-09, HAC-10 | Consent/rule/receipt regressions and common negatives pass. Old exports and signatures remain callable. Preserve OpenCode default package root, executor, environment, timeout and result semantics after relocation; host leaves do not depend back on the service facade. | L |
| T06 | Delegate native lifecycle status/disable/uninstall details to the SD host owners. Add `opencode/status.js`; retain OpenCode installation and owned uninstall behavior in `installers/opencode.js`. Preserve routing and result policy in `lifecycle/status.js` and `operations.js`. | T03, T04, T05 | HAC-05, HAC-09, HAC-10 | Lifecycle injection tests, status selection/precedence, exact uninstall plans and postconditions remain equivalent. Preserve foreign files, prior enablement and existing unsupported/ambiguous-input behavior. | M |
| T07 | Extend `scripts/sync-plugin-runtime.js` allowlist with only the four pure session-command leaves and an actually needed shared pure formatter. Generate using existing tooling and extend runtime/package checks. | T05, T06 | HAC-09, HAC-10 | Isolated generated-bundle import and execution succeeds without repository fallback. No installer, receipt writer, CLI application or reporter enters this closure. Full npm package includes production leaves; development evidence tooling stays excluded; portable Skills stay runtime-free. | M |
| T08 | Implement repository-only observation validation and pure evaluation in `scripts/host-compatibility/contract.mjs` and `evaluate.mjs`; declare the fixed inventory and explicit source mappings in `evals/host-compatibility/manifest.json`. | T02 | HAC-01, HAC-02, HAC-03, HAC-06, HAC-11, HAC-12 | One internal vocabulary and proof owner. Tests cover exact identity, lane/capability scope, raw-result preservation, conflict/supersession, missing/invalid input and historical mapping. No public enum/schema or governance decision is changed. | L |
| T09 | Complete common lifecycle scenarios against the final adapters and implement fingerprint, recording, check and deterministic Markdown rendering in `scripts/host-compatibility/{run,render}.mjs`. Add only the three SD-defined root developer scripts. | T03–T08 | HAC-01 through HAC-12 | Real fixture observations, all attempts including failures, closure-checked before/after fingerprints, atomic owned outputs, read-only check and nonzero failure exits. Produce reviewed observations and the dated comparison at the paths in section 2. | L |
| T10 | Link and explain the generated comparison in `INSTALL.md`, existing German/English troubleshooting chapters and `pages/src/data/site.ts` proof links. Integrate read-only comparison checking into the existing community-health check and its tests. | T09 | HAC-01, HAC-02, HAC-03, HAC-07, HAC-11 | Report and documentation clearly separate snapshot, local status, scenario conformance and capability evidence. Dates, limits and bounded next actions are readable. Public references are accessible and redacted. Existing handbook structure and site link contracts pass. | M |
| T11 | Run final focused regression, package/runtime and report checks on the final source snapshot. Complete the HAC evidence map and record the actual execution/native gaps in `CD_TESTS.md`. | T07, T09, T10 | HAC-01 through HAC-12 | Commands, exit codes, counts, failure controls, source identities and evidence paths are recorded. No zero-run pass, fake native matrix or unexecuted test claim. Generated assets and observation/report identities agree. | M |
| T12 | Perform mandatory Code Review, Clean Implementation Review and Task Plan Review; resolve material findings within scope, rerun affected tests, then use QA Gate to produce `QA_REPORT.md` and the applicable Orchestration Report. | T11 | HAC-01 through HAC-12 | Actual final diff reviewed; each task/criterion is fulfilled, revised or blocked with evidence. QA and OR expose native gaps and precise delivered scope. Separate exact QA/UAT decisions remain required by the canonical process. | M |

T03–T06 are bounded extractions, not behavior redesign. Establish the T02 oracle before moving code.
If a current behavior is defective outside this PRD, record the finding and keep it separate. Do not
silently fix it, weaken an assertion or introduce a fallback to make the refactor pass. If a frozen
boundary makes this solution infeasible, revisit sizing and the affected PRD/SD before extending work.

## 2. Test Plan

### Shared Test Ownership and Execution

The common suite owns expectations and grading once. Each fixture exposes `setup`, `perform`,
`observe` and `dispose`, drives real production functions through existing injection points and
returns observed filesystem/command/result facts. A fixture may describe a supported operation or
an explicit current mechanism limitation; it may not return a precomputed pass or duplicate policy.

Run every five-outcome group for Codex, Claude Code, GitHub Copilot and OpenCode. Require at least one
executed assertion per host/outcome pair, all required negative cases, no missing fixtures and nonzero
evaluations. Thus at least 20 host/outcome pairs are covered, plus the negative and policy cases below.
Report actual case counts rather than treating this lower bound as the complete suite. A scenario
with expected discovery failure passes conformance only if it records observed discovery as failed.
Unexpected failures, missing groups and empty inputs return nonzero.

| test_id | Stimulus and decisive assertion | Required execution / evidence |
|---|---|---|
| HC-C01 | Install intended payload. Observe its actual provenance/content at the fixture installation surface; success text alone is insufficient. | All four hosts; common installed group with host-specific setup. |
| HC-C02 | Discover intended enabled skills. Repeat with plugin-only visibility, missing/disabled skill and wrong payload origin. Only the matching discovery facts demonstrate this outcome. | All four hosts; observed list/origin facts and deliberate mismatches. Never infer live discovery from copied files. |
| HC-C03 | Invoke equal normal, unresolved-target, missing-approval and invalid-input cases through each existing dispatcher/binding path. Compare canonical target, gate, result and terminal/continuation semantics after removing only transport metadata. A terminal result never continues. | All four hosts; real dispatcher fixtures, protocol 1/binding 2 unchanged, bounded invocation trace and normalized result. |
| HC-C04 | Change bytes while retaining canonical version, then update. Verify intended observed content and registration identity. Repeat with old cache, wrong digest and pending fresh-session evidence after apparent command success. | All four hosts; before/after byte identities and the existing host update boundary. No simulated host claims fresh effective update. |
| HC-C05 | Interrupt/fail an update after a meaningful mutation, exercise existing recovery, then fail a recovery step. Verify prior or target content, owned/foreign files and prior permission/enablement. Partial recovery retains both failures and cannot report recoverable/pass. | All four hosts; ordered effects and before/after snapshots. Explicit unsupported/partial mechanics remain visible and evaluated. |
| HC-C06 | Deny or revoke automatic checks; accept hook trust without any executed check; induce transient failure and then a bounded retry. Preserve manual mode, host ask/deny and original receipt/rollback order. Retry success requires actual new evidence. | Shared negative assertions with relevant native fixture stimuli for all hosts; no new grants or automatic lifecycle repair. |
| HC-E01 | Validate complete inventory and observation fields. Reject empty/malformed input, duplicate observation IDs, internally inconsistent identity, missing reference/hash, unknown producer or missing required scope. Unknown host version/OS/digest never matches a known tuple. | Evaluator fixtures; missing OS coverage stays visible rather than becoming a successful omission. |
| HC-E02 | Attempt promotion between installed, discovered, callable, automatic checks, observed governance and enforcement. Attempt promotion from source fixtures to installed/fresh/UAT, primary agent to subagent, or one model/SDK/path to another. | Positive controls plus independent adversarial cases; no score, global support boolean or whole-host tier. |
| HC-E03 | Vary each applicable payload/host/OS/path/permission/trust identity dimension. Supply matching pass+failure, older pass+current failure, explicit valid retry, missing retry evidence, cross-tuple and cyclic supersession. | Affected claims downgrade correctly; failed references remain visible. Time alone never resolves conflict. Unaffected claims retain applicable evidence. |
| HC-E04 | Import only explicitly mapped historical HC evidence while retaining original run/case/version, raw enums, references and hashes. Missing identity prevents a current positive claim. | Historical inputs unchanged byte-for-byte; no schema rewrite or broad scan/import of other runs. |
| HC-F01 | Change a participating shared source, one host leaf and one fixture separately. Add an unlisted participating helper. Change sources during recording. | Dependency-closure validation and before/after fingerprints reject missing/drifting evidence; shared changes invalidate consumers, host-local changes affect only relevant claims. |
| HC-F02 | Inject a runner/input/publication failure and interruption before atomic output replacement. Supply an unexpected scenario failure. Check retains diagnostic/negative attempts and returns nonzero; previous accepted report is not replaced by partial success. | Temporary output roots, captured exit codes and before/after files. Accepted snapshot is still explicitly dated and drift is detected. |
| HC-F03 | Render identical recorded input twice. Check comparison without recording and after source/evidence/report tampering. | Stable bytes/order/dates; check detects drift without subprocess host execution or source/evidence writes. Separate consistency, conformance and capability results. |
| HC-F04 | Exercise path traversal, symlink escape, private local paths/content and unreviewed evidence references in observation/publication inputs. | Owned output roots and publication allowlist hold; unsafe references are rejected/redacted. No positive public claim without accessible reviewed evidence. |
| HC-A01 | Compare legacy imports, CLI flags/result keys and meaningful order, errors/exits, facade defaults, command/recovery order, persisted markers/receipts and path resolution before/after extraction. | Existing independent regressions and captured T02 baselines remain valid without weakened assertions. Include exceptional/failure branches, not only snapshots of happy output. |
| HC-A02 | Apply a temporary representative host-local stimulus/change in an isolated copy through the real production adapter, then run the unchanged common oracle and other host/control cases. Deliberately corrupt a discovery or recovery fact. | Only relevant observed facts/applicability change; other hosts and canonical decisions remain equal. Shared assertions detect the corruption. Review imports/callers for one owner and no cycles; regex/file counts alone do not establish isolation. |
| HC-R01 | Import and execute the consent command contract from an isolated generated runtime with no source checkout fallback; run generated skill/dispatcher consumers. | Four pure host command leaves available, exact legacy commands preserved, runtime integrity passes and no installer/reporter dependencies load. |
| HC-R02 | Build/inspect all affected package profiles with existing package checks. | Full npm includes required production modules; repository evidence scripts/data do not ship; portable Skills remain runtime-free. Source/generated payload provenance agrees. |
| HC-D01 | Inspect rendered report with a demonstrated row, failed discovery, stale update, conflict, manual/retry state and unavailable native tuple. Check documentation and Pages link integration. | Reader can locate evidence, understand its date/lane/limits and identify the next existing action. Four-host/three-OS coverage is visible without claiming twelve supported combinations. |

Negative sensitivity is demonstrated with bounded fixture corruption or isolated temporary source
copies. Do not persist intentionally broken production code or build a general mutation framework.
Shared assertion changes must run for every applicable host. Existing standalone tests keep their
focused assertions; the new common suite does not replace them with duplicated host grading tables.

### Commands and Check Order

Commands below are run from the repository root after TP approval and T01 pass. The three root
compatibility scripts are **planned additions** from the approved SD; they do not exist as delivered
features at TP creation. Read scripts for execution side effects during T01 and keep fixture home,
config, cache, package-manager and executable paths isolated. Use installed toolchains; missing
dependencies are recorded, not silently installed or fetched as part of a reporting check.

1. **Pre-extraction baseline, then affected-task regressions.** Run the relevant existing suites
   below before their mechanisms move. Retain baseline failure evidence separately. After an
   extraction, rerun its affected suites and common cases. A pre-existing failure is not a pass and
   cannot excuse a missing proof required by an acceptance criterion.

   ```bash
   npm --prefix create-agdf run test:local-marketplace
   npm --prefix create-agdf run test:claude-cache-recovery
   npm --prefix create-agdf run test:copilot-installer
   npm --prefix create-agdf run test:cli-modularization
   npm --prefix create-agdf run test:runtime-check-consent
   node create-agdf/scripts/codex-hook-observation-test.js
   npm --prefix create-agdf run test:lifecycle
   npm --prefix create-agdf run test:copilot-repository-retention
   npm --prefix create-agdf run test:opencode-hardening
   npm --prefix create-agdf run test:skill-dispatch
   npm --prefix create-agdf run test:task-target-resolution
   npm --prefix create-agdf run test:interaction-presentation
   ```

2. **Generate and verify the final distribution before recording its comparison.** Use existing
   generators rather than editing bundles/caches. `release:prepare` here is build/integrity validation,
   not release authorization. Run it once for the final source, then invoke standalone checks to
   avoid repeating its full preparation through wrapper scripts.

   ```bash
   npm --prefix create-agdf run release:prepare
   npm --prefix create-agdf run test:runtime-integrity-layout
   npm --prefix create-agdf run test:runtime-integrity-negative
   npm --prefix create-agdf run test:local-validator
   npm --prefix create-agdf run test:package-build
   npm --prefix create-agdf run test:package-contents
   npm --prefix create-agdf run test:copilot-profile
   node create-agdf/scripts/local-development-install-test.js
   npm --prefix create-agdf run test:agent-skills-conformance
   node create-agdf/scripts/smoke-test.js
   node create-agdf/scripts/test-routing.js
   ```

   Extend the appropriate runtime/package tests with HC-R01/02. Smoke/local-install tests must use
   their bounded fixture installation paths. Any generator activity completes before the final
   fingerprint capture; a later source/payload change invalidates affected recorded observations.

3. **Validate evidence logic, record isolated deterministic observations and check documentation.**

   ```bash
   npm run test:host-compatibility
   npm run compatibility:record
   npm run compatibility:check
   npm run test:community-health
   npm run check:community-health
   npm --prefix pages run check
   npm --prefix pages run test:landing
   git diff --check
   ```

   The shared test command covers HC-C, HC-E, HC-F and HC-A02; existing tests supply HC-A01 and
   baseline regression evidence. Community-health consumes check mode only. T10 changes an existing
   Pages proof link, so its check and landing test are required; no site deployment is performed.
   Direct public-documents checks are added only if that generation path is actually changed.

4. **Final evidence and reviews.** Run one final affected regression set on the reviewed source,
   record its identity and compare it with the earlier successful runs. Repeat only tests affected
   by new changes, failures or unresolved concerns. Do not claim a stale earlier run as final proof.
   Resolve the active version-matched validator, run selected-run `gate-check`, and compare
   `doctor --all-active --json` with the captured baseline to detect control regressions separately.
   Preserve unrelated findings and approvals. Review and QA use the existing applicable skills.

### Environment and Native Evidence Obligations

Every observation distinguishes actual execution OS from simulated target platform. Deterministic
fixtures use temporary roots, injected processes or bounded test executables, and local Git where
needed. Snapshot touched roots and verify disposal and absence of writes to actual host configuration.
Unexpected host/network/package-manager execution must fail the fixture, not silently fall through.

The visible native inventory is Codex, Claude Code, GitHub Copilot and OpenCode across macOS, Linux
and native Windows. An inventory row with unknown variant/version is a gap. It is not an executable
tuple or a wildcard. Each live claim needs the exact installed variant/version, actual OS, AGDF
version and applicable source/runtime digests, execution path, activation/permissions/trust, date,
evidence reference and relevant model/runtime/SDK versions. Validate historical input applicability
again on the final snapshot. Keep the original evidence lane and result vocabulary.

| Evidence obligation | Required observation for a positive claim | Missing evidence treatment |
|---|---|---|
| Installed payload | Identify intended distribution and bytes in the actual installation surface. | Installed lane unverified; no inferred discovery or invocation. |
| Fresh discovery and invocation | A fresh exact host session exposes intended enabled skills and invokes the bounded canonical entry point from the matching payload. | Fresh callable/discovery remains unverified, including after package-level success. |
| Effective update | Record prior payload, same-version changed target bytes and fresh observed payload/behavior after the existing restart/reload boundary. | Pending restart or unobserved effective bytes cannot demonstrate a fresh update. |
| Native recovery | Exercise a defined failure and the existing recovery path on that actual OS, recording state/ownership/enablement before and after. | Simulated platform branches establish only deterministic conformance. Partial/failed recovery remains explicit. |
| Automatic checks | Observe actual authorized check execution and result on the claimed trigger/path, not only accepted trust or a receipt. | Manual/denied/unexecuted state remains visible with its existing verification action. |
| Governance and enforcement | Observe the scoped canonical decision. For technical enforcement, identify the actual intercepted action/mechanism/path and a blocked disallowed action. | No promotion from observed compliance to enforcement or from primary agent to subagent. |
| Human UAT | Human judges the supplied report's meaning and relevant workflow against the exact final evidence. | Agent tests and older approvals cannot supply human approval. |

Recording/checking the comparison does not install, remove, restart or widen permissions in a user's
host. Direct lifecycle experiments require an expressly authorized exact host environment and use
existing recovery paths. Initial native rows may all remain unverified: truthful gaps do not block QA
of the implemented report and deterministic adapter contract. They do block stronger support claims.
An actual unsupported restriction must be evidenced and scoped; missing access alone is unverified.

### Traceability and Evidence Destinations

| PRD criterion | Tasks | Decisive checks |
|---|---|---|
| HAC-01 | T02, T08–T11 | HC-C01–05, HC-E01, HC-F03, HC-D01; complete nonempty inventory |
| HAC-02 | T02, T04, T08–T11 | HC-C02, HC-E02, HC-D01; visible plugin with missing/wrong skill |
| HAC-03 | T05, T08–T11 | HC-C06, HC-E02–03, HC-D01; independent evidence dimensions |
| HAC-04 | T02–T04, T09, T11 | HC-C04, HC-E03, HC-A01; same-version byte and cache negatives |
| HAC-05 | T02–T04, T06, T09, T11 | HC-C05, HC-A01; recovery failures and owned/foreign state |
| HAC-06 | T08–T11 | HC-E01, HC-E03–04, HC-F01–03; identity, history and conflict |
| HAC-07 | T05, T09–T11 | HC-C06, HC-D01; manual/deny and observed bounded retry |
| HAC-08 | T02, T09, T11 | HC-C03, HC-A02; same canonical semantics through all bindings |
| HAC-09 | T01, T03–T07, T09, T11 | HC-A01–02, HC-R01; owner/caller review and host-isolation evidence |
| HAC-10 | T01–T07, T09, T11 | HC-A01, HC-R01–02; actual unchanged contract and package regressions |
| HAC-11 | T08–T11 | HC-E02–04, HC-F04, HC-D01; historical integrity and publishable references |
| HAC-12 | T02, T08–T11 | All HC-C groups, HC-E01, HC-A02; one shared oracle with negative sensitivity |

T12 reviews the whole map and records omissions as findings; a linked test name is not execution.

- Run-local preparation, execution and review evidence stays under
  `.agdf/control/artefacts/agdf-host-adapter-compatibility/`. `CD_TESTS.md` records actual task/test
  status, commands/exits, counts, source snapshot and relative log references. Keep full useful test
  logs in a bounded `evidence/` subdirectory. Record original failures and any rerun/resolution.
- `evals/host-compatibility/observations/` holds explicitly scoped machine observations, including
  negative and unavailable results. These are evidence, never another gate or support authority.
- `docs/compatibility/HOST_COMPATIBILITY.md` is the generated dated reference.
  `docs/compatibility/evidence/` contains only reviewed publishable redacted extracts. Reject absolute
  private paths/content from public output. If no accessible proof can be supplied, remove the
  positive public claim while retaining its explicit gap and internal evidence boundary.
- Existing historical reports and unrelated run/control evidence remain intact. The selected
  run's chain links CD+Tests, CR, Task Plan Review, Clean Review, QA and OR when actually completed.

## 3. Brownfield Scope

T01 refreshes the already completed post-UR review against the approved TP and actual checkout.
It must inspect these reuse boundaries and callers, not perform a general repository redesign:

- `create-agdf/lib/installers/plugin-installers.js`, `local-marketplace.js`, `fs-swap.js`, existing
  Copilot transport/settings/discovery, Claude cache recovery, Codex hooks and OpenCode installer/
  activation. Record transaction ownership and exceptional effect order before extraction.
- `create-agdf/lib/runtime/plugin-provenance.js`, `runtime-check-consent/{contract,adapters,service,
  coordinator,state,claude-settings}.js`. Check shared digest/consent/receipt authority, direct pure
  leaf imports and defaults tied to module location. Preserve current runtime-root resolution.
- `create-agdf/lib/lifecycle/{status,result,presentation,operations}.js`, CLI registry/parser/
  handlers and `skill-dispatch/{service,contract,binding}.js`. Keep canonical decisions, status
  precedence, export/default behavior and dispatcher/binding protocol versions unchanged.
- `create-agdf/scripts/sync-plugin-runtime.js`, package manifests/generators/integrity and the
  existing test entry points named above. Determine isolated runtime closure and fixture dependencies.
- Existing HC evidence/schema, `scripts/check-community-health.mjs`, `scripts/community-health-test.mjs`,
  `INSTALL.md`, handbook language/structure rules and `pages/src/data/site.ts` proof links.

Confirm the linked Context Graph owners for CLI composition, executable dispatch authority and native
interaction authority. They describe existing behavior. Keep approved design and implemented ownership
distinct. Update reusable owner links/SoT only when actual implementation warrants it, within this
scope. The earlier post-UR review does not substitute for this required preparation analysis.

## 4. Out Of Scope

New hosts or host variants; host feature fixes; new native dispatch tools; general adapter registries;
new public CLI/schema/API or runtime report service; stronger permission/enforcement policy; receipt,
marker or runtime-path migrations; host/cache installs and restarts for report generation; historical
evidence rewrites; completing other governed runs; dependency upgrades; version bumps, publication,
deployment, commits or pushes. No approval from another run is reused.

## 5. Risks And Blockers

| Condition | Required disposition |
|---|---|
| Public behavior, effect order, ownership, permission or runtime/persistence boundary cannot be preserved | Stop the affected implementation and revise the earliest affected design/product gate and sizing decision. Do not conceal drift behind a shim or a new fallback. |
| Required common group not executed, unexpected deterministic failure, broken generated runtime/package, lost recovery state or positive claim without admissible evidence | Blocks a QA pass until corrected and evidenced. An expected negative scenario must still assert the failure accurately. |
| Baseline failure or unavailable toolchain affects a required criterion | Identify the exact gap and its scope. Restore valid verification within scope or report revise/block; do not mark the criterion covered by a test name. |
| Source changed after observation or publication evidence is unsafe/missing | Reject stale/unsafe promotion; regenerate matching scoped evidence or render an explicit gap. Keep diagnostic attempt history. |
| Native host/OS or fresh-session access absent | Report unverified with the required next observation. Does not prevent acceptance of correctly bounded deterministic/report work, but prevents the corresponding support claim. |
| Existing unrelated aggregate control finding | Preserve and disclose its independence; do not modify another run or inherit its approval. New findings caused by this work must be resolved. |

At planning time no product tests, new host observations, CD+Tests, reviews, QA or UAT have passed.
T12 must assess the final implementation, not treat this plan or the currently valid control state as
runtime evidence. Human review should verify that a reader can distinguish installation, discovery,
automatic checks and governance, and can find the missing evidence/recovery action without assuming
the comparison describes their current machine.

## 6. Next Step

Review TP Revision 1 and approve only with `Approval: TP`, request revision or decline.
Exact TP approval permits implementation-preparation Brownfield Analysis. After it passes, execute
the approved tasks and tests, complete the mandatory reviews and prepare QA for the next user decision.
