# Code Deliverables and Tests

Run: agdf-host-adapter-compatibility
Revision: 1
Date: 2026-09-05

Status: done
Approved basis: UR, PRD, SD and TP Revision 1; passing pre-implementation Brownfield Analysis.

## Delivered scope

Native installation, inspection, session commands, permissions, status and uninstall mechanics now
have explicit private host owners. Existing installer, lifecycle and consent entry points retain
public routing and shared target, decision, receipt, provenance, transaction and result authority.
The OpenCode installer remains its established owner. No CLI flag, public result vocabulary,
dispatcher protocol 1, binding version 2, permission policy or runtime location changed.

The repository comparison has one contract/evaluator, fixed manifest, shared production-fixture suite,
source/evidence fingerprints, explicit recording and read-only checking. It separates five outcomes
and four capability dimensions. Historical observations retain their original scope and vocabulary.
Installation documentation, German/English troubleshooting and the existing website proof links refer
to the dated comparison. Community health checks it without recording or host lifecycle effects.

## Final identity and evidence

- baseline_commit: 4ae59725fc583b5816334af47b08e446f51739b6
- source_fingerprint: aa8766489bfe22b032456d8be86c9bc8f9bfc1e03d28c5b67132733e570b084c
- source_files: 105
- runtime_digest: b731f8cfc01111a74b1788c2dcc548d4ddb3d2e16099b0399015552561df8a4e
- comparison: ../../../../docs/compatibility/HOST_COMPATIBILITY.md
- complete_identities_and_observations: ../../../../docs/compatibility/evidence/snapshot.json
- structured_facts: ../../../../docs/compatibility/evidence/facts.json
- command_manifest: evidence/FINAL_VERIFICATION.json
- final_command_groups: 31 pass, 0 unresolved failures
- shared_scenarios: 56 evaluated, 0 unexpected failures; 14 per host, including 24 expected negatives
- evidence_logic: 64 named checks, including conflict, supersession, source closure, host isolation,
  missing identity, failed recording, retained attempts and concurrent native-input/evidence drift
- community_health: reviewed fixture baseline plus 29 negative contracts pass; real repository check pass
- native_observations: 0 for this payload; 12 host/OS inventory gaps remain unverified
- historical_metadata: 36 imported observations, no historical approval or current-support promotion

The source closure follows actual local imports and literal file entrypoints with Acorn. The
OpenCode plugin file is an explicit copied/inspected input, not executed as a repository module by
this suite. Relevant generated payload digests are captured independently. Report/control files and
accepted observations are excluded from the source set to avoid self-invalidation. All recording
attempts remain under evals/host-compatibility/observations; accepted output references its exact raw
attempt. Check mode compares sources, inputs, reference hashes and rendered bytes without mutation.

## Executed checks

Commands below are actual successful final groups. FINAL_VERIFICATION.json retains invocations,
exit codes, result excerpts, elapsed time where captured and isolated cache settings.
VERIFICATION_HISTORY.json retains the baseline, failed attempts, corrections and rerun outcomes.
Raw console logs and redundant exports were removed at the user's request on 2026-09-05.

| Command | Final result |
|---|---|
| `node create-agdf/scripts/local-marketplace-test.js` | pass / 0 |
| `node create-agdf/scripts/claude-cache-recovery-test.js` | pass / 0 |
| `node create-agdf/scripts/copilot-installer-test.js` | pass / 0 |
| `node create-agdf/scripts/cli-modularization-test.js` | pass / 0 |
| `node create-agdf/scripts/runtime-check-consent-test.js` | pass / 0 |
| `node create-agdf/scripts/codex-hook-observation-test.js` | pass / 0 |
| `node create-agdf/scripts/lifecycle-test.js` | pass / 0 |
| `node create-agdf/scripts/copilot-repository-retention-test.js` | pass / 0 |
| `node create-agdf/scripts/opencode-hardening-test.js` | pass / 0 |
| `node create-agdf/scripts/skill-dispatch-test.js` | pass / 0 |
| `node create-agdf/scripts/skill-dispatch-binding-test.js` | pass / 0 |
| `node create-agdf/scripts/task-target-resolution-test.js` | pass / 0 |
| `node create-agdf/scripts/interaction-presentation-test.js` | pass / 0 |
| `node create-agdf/scripts/runtime-integrity-layout-test.js` | pass / 0 |
| `node create-agdf/scripts/runtime-integrity-negative-test.js` | pass / 0 |
| `node create-agdf/scripts/local-validator-test.js` | pass / 0 |
| `node create-agdf/scripts/package-build-test.js` | pass / 0 |
| `node create-agdf/scripts/package-contents-test.js` | pass / 0 |
| `node create-agdf/scripts/copilot-profile-test.js` | pass / 0 |
| `node create-agdf/scripts/local-development-install-test.js` | pass / 0 |
| `node create-agdf/scripts/agent-skills-conformance-test.js` | pass / 0 |
| `node create-agdf/scripts/smoke-test.js` | pass / 0 |
| `node create-agdf/scripts/test-routing.js` | pass / 0 |
| `npm run test:host-compatibility` | pass / 0 |
| `npm run compatibility:record` | pass / 0 |
| `npm run compatibility:check` | pass / 0 |
| `npm run test:community-health` | pass / 0 |
| `npm run check:community-health` | pass / 0 |
| `npm --prefix pages run check` | pass / 0 |
| `npm --prefix pages run test:landing` | pass / 0 |
| `npm --prefix create-agdf run release:prepare` | pass / 0 |

## Baseline, corrections and bounded adjustments

1. Initial regressions exposed stale generated Copilot inventory and dispatcher bundle input. The
   existing release preparation regenerated them; all four affected baseline checks then passed.
   Evidence: evidence/VERIFICATION_HISTORY.json, baseline and baseline_after_preparation.
2. The planned five pure runtime leaves increased the reviewed Copilot file inventory from 86 to
   91. Inspection confirmed those exact files; the candidate is 682058 bytes below the unchanged
   696486-byte ceiling. The definition-owned budget rationale was updated and release preparation
   passed (33 version surfaces at 0.14.5, eight profile-history snapshots, public candidate checks).
3. Extraction initially omitted the shared skills helper import in the independently runnable
   Copilot test. The real existing assertion caught it; the import was restored without weakening
   assertions. Evidence: evidence/VERIFICATION_HISTORY.json, issue copilot_fixture_import, and
   the final copilot-installer check in evidence/FINAL_VERIFICATION.json.
4. Package tests first encountered sandbox write denial at the default npm cache. They passed with
   npm_config_cache=/private/tmp/agdf-hac-npm-cache. No user-cache ownership/permission change was
   made. npm_config_ignore_scripts=true avoids redundant prepack because final release preparation
   was already executed. Package generation and all substantive package assertions still ran.
5. Review corrected incomplete target/runtime applicability, captured native input hashes at read
   time and revalidated input/evidence before publication. A partial recovery now re-reads current
   payload and permission/enablement facts; prior success facts cannot masquerade as current state.
6. The community-health fixture lacked a previously linked instruction-footprint audit. That existing
   source was added to its fixture inventory. Focused documentation-contract tests inject the separate
   compatibility dependency; the default missing-input rejection and real full check remain tested.
7. Acorn 8.17.0 is a pinned root development dependency for real import parsing, never part of the
   shipped runtime. The exact already-present pages package/lock integrity was reused after an
   offline install cache miss. The retained dependency_versions in FINAL_VERIFICATION.json verify the root installation. No registry
   upgrade, network host installation or runtime dependency was introduced.

## Acceptance coverage

| Criterion | Tasks | State | Concrete evidence |
|---|---|---|---|
| HAC-01 | T02, T08–T11 | done | 56 observed scenarios, 20 positive host/outcome pairs, explicit 12-row native inventory; generated report |
| HAC-02 | T02, T04, T08–T10 | done | Missing/wrong skill payload controls and legacy healthy non-promotion; rendered outcome columns |
| HAC-03 | T05, T08–T10 | done | Independent capability/lane/path/model proofs; trust-without-execution negatives and four visible capability columns |
| HAC-04 | T02–T04, T09 | done | Same-version changed payload and deliberately stale cache for all four hosts; intended/observed digests retained |
| HAC-05 | T02–T04, T06, T09 | done | Interrupted operations, verified prior/target bytes, settings/enablement fingerprints, freshly read partial state and retained recovery failures |
| HAC-06 | T08–T10 | done | Changed tuple/source/evidence, unknown target/runtime, conflicting observations and evidenced supersession controls |
| HAC-07 | T05, T09, T10 | done | Manual/cancel stimuli, consent regressions and rendered manual/retry next actions; no reporter host mutation |
| HAC-08 | T02, T05, T09 | done | Four canonical dispatch cases per host; target/gate/result/terminal comparison through real binding and validator entry |
| HAC-09 | T01, T03–T08 | done | Actual owner/caller diff review; representative Codex command mutation executes in isolated copy without changing other host fingerprints/results |
| HAC-10 | T01–T07, T11 | done | All 23 focused production/package command groups pass; generated bundle imports and 437-file npm inventory |
| HAC-11 | T08–T11 | done | 36 original historical result/enforcement records preserved as metadata; 56 current deterministic observations; no current native claim; bilingual docs/site checks |
| HAC-12 | T02, T08, T09, T11 | done | One shared runner/grader and scenario inventory, four native stimulus fixtures, 56 real evaluations plus 64 evidence checks; empty/missing/failing input rejects |

## Visible result review

Reviewed the actual generated Markdown: dated source header, five independent outcome columns,
12 explicitly unverified native inventory rows, four separate native capability dimensions,
56 scoped observation rows with negative outcomes and bounded next actions, and 36 historical rows.
The actual facts preserve expected/observed identity, lane, OS, path, original result and recovery
state. The report is linked from the installation guide, both troubleshooting chapters and the
existing site proof area. Website check and built landing-page tests pass (1710 visible words,
existing no-JS/metadata/payload contracts preserved). This is generated-output and local-build
visible evidence, not human UAT or observation of a deployed website.

## Boundaries and remaining evidence

Native installed-root, fresh-session, SDK/model/path-specific governance, native Windows and human
UAT evidence remain absent for this new payload. They are explicit comparison gaps within the approved
slice, not waived evidence for a live-support claim. No real host installation/restart, consent change,
commit, push, release or site publication occurred. The unrelated untracked asset is untouched.
Context Graph/SoT links point to the existing owners and this run's reports; no new authority exists.

Next required step: mandatory final review and QA evaluation of this exact evidence.
