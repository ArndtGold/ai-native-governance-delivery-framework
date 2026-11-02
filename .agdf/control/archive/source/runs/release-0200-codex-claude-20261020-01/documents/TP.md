# TP: AGDF 0.20.0 CLI-qualified release matrix implementation and evidence

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-23
Owner: AGDF maintainer
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

The current product/design sources are PRD.md @ sha256:7ff703b088b9db7a223b286c9f949de3ce20612d37d3615f4e9f648ed47c7daa and SD.md @ sha256:2e1be758666cf513aae78309a301de1ea26536d5e156d84f430b493ff83577a1. BROWNFIELD_REVIEW.md @ sha256:cc85e435ce455f775a184a4d4a76cb8f3f781a53ab002b4d14023a01802bff15 is subordinate routing input. Archived earlier plans and results retain historical authority only. This plan defines work, not completed tests or qualification.

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Implementation-preparation Brownfield Analysis: capture tracked/untracked baseline, the PR 30 branch state, canonical owners, ordinary CI command multiset and timeout baseline, retained code applicability and permitted paths | Claude using brownfield-analysis; existing control writer | New deliberate TP approval |
| T-002 | Migrate hostSupport to schema 3 (required CLI targets claude win32 and codex darwin, reported_desktop, optional pinned diagnostics, unqualified, tiers); extend release-policy.mjs (schema 1 to 3, ten required rows, disjoint diagnostic rows, reported Desktop selector) and the generator; extend policy tests | Claude; plugin metadata and native-policy owners | T-001 |
| T-003 | Confirm candidate identity binds the schema-3 policy and keeps evidence-only outputs neutral; extend candidate tests where the migration needs it | Claude; native candidate owner | T-002 |
| T-004 | Evaluator: bind mandatory CLI targets through reviewed locked tuples and target OS, keep the Codex exact-commit rule, restrict the pin to the diagnostic scope, keep historical records attached to their candidates, and evaluate supplied Desktop scopes strictly and optionally | Claude; native observation owner | T-002, T-003 |
| T-005 | Handoff, preflight, review-template, import and validate: map --surface cli to the required scope for listed targets, write per-host handoff instructions, validate --all-hosts for schema 3, keep staging, recheck, rollback and duplicate rejection | Claude; handoff/import owner | T-004 |
| T-006 | Reuse released-baseline and owned-stale helpers for both CLI hosts; regression checks for baseline integrity, preservation and cleanup; confirm the Codex harness paths hold on darwin | Claude; lifecycle and native execution owners | T-001, T-004 |
| T-007 | Repoint the publication evidence job to the CLI matrix; prove every publish path stays downstream, the ordinary CI inventory and timeouts are unchanged and the diagnostic Codex workflow stays outside eligibility | Claude; release workflow and CI owners | T-002, T-005 |
| T-008 | Compatibility/reporting: project qualified CLI tuples per host and Desktop reported_sources; update README, INSTALL, docs/maintenance/release-0.20.0.md, release notes and the readiness report | Claude; compatibility and reporting owners | T-002, T-004, T-005, T-007 |
| T-009 | Prepare coherent 0.20.0 assets, run affected and full verification, refresh compatibility evidence, then freeze the final candidate from a clean isolated worktree of the final commit after the maintainer authorizes commit and push | Claude; release preparation/verification owner; maintainer for VCS authorization | T-002 to T-008 |
| T-010 | Native qualification on the final candidate: per-host handoff; five Claude Code CLI cases on the Windows test computer and five Codex CLI cases on the maintainer's Mac with preflight-frozen tuples; review, scoped import, validate --all-hosts, compatibility record | Maintainer as native executor on both computers; Claude as evidence reviewer and importer | T-005, T-006, T-009 |
| T-011 | TP Review, Clean Implementation Review, Code Review and QA on the actual diff, results and native evidence; readiness with every remaining gap; keep UAT/OR and publication boundaries | Existing review/QA owners; maintainer for human decisions | T-009; T-010 disposition |

Changes are limited to the approved metadata/schema/generator, native policy/candidate/observation/handoff/lifecycle owners, the publication workflow, compatibility outputs, public guidance, coupled regression tests and canonical verification wiring. Retained code that already satisfies a task is reused after proving applicability. No second policy owner, evidence decision service or governance writer is introduced.

### Ordered execution and candidate freezing

After TP approval, record T-001 Brownfield Analysis before CD+Tests and capture the CI inventory and timeouts before editing. Preserve the revision archives, original failed attempts, the Desktop human report, historical candidate evidence and foreign untracked artefacts.

Implement T-002 to T-008 with deterministic tests. Generation precedes consumers; never run generators concurrently with tests that read their output, and never run two full verifications at once on this computer. Order: npm ci --ignore-scripts if needed, npm run build:prepare, npm --prefix packages/mcp-server ci --ignore-scripts, targeted suites, npm run compatibility:record, npm run compatibility:check, npm run build, npm --prefix packages/cli run release:prepare and npm run verify:ci. Run the maintenance contracts in Git Bash, because PowerShell resolves bash to WSL first. Repair a failing owner and repeat only justified affected checks before one current full verification.

The final candidate is computed with release-evidence candidate in a clean isolated worktree of the final commit. Commit and push happen only after explicit maintainer authorization; remote CI on that commit is the commit-bound verification when local full verification is limited by the known host-load MCP test flake, which is then recorded as an environment limit. Any later policy, probe, source or shipped change requires a new candidate and new native records.

### Execution routes and evidence files

The common entrypoint remains scripts/native-probes/release-evidence.mjs. The schema-3 behavior below is a planned T-004/T-005 deliverable:

- candidate --output candidate.json: recompute source/payload/policy identity and source revision.
- handoff --candidate candidate.json --host claude or codex --output directory: export the per-host instructions and the five required cases.
- preflight --candidate candidate.json --host claude or codex --surface cli --model actual-model --output tuple.json: capture host, OS, architecture, client version, Node and model on the executing computer.
- npm run native:claude-e2e and npm run native:codex-e2e with --candidate, --tuple, --model and --scenario for dispatch, failure_case, skill_continuation, upgrade and recovery; the harness rejects a changed tuple before execution.
- review-template, then import --candidate candidate.json --bundle directory --review review.json --host claude or codex --surface cli into the required scope.
- validate --candidate candidate.json --directory evidence-directory --all-hosts: require exactly the ten mandatory rows; supplied Desktop scopes are checked strictly; validate-cli stays the diagnostic Linux/Windows route.

Run evidence and logs belong in evidence/CLI_MATRIX_IMPLEMENTATION_20261023/ below the run artefact directory, with actual execution dates kept in the files. Keep source bytes, reference hashes, actual commands and exit results, candidate/tuple/review digests and explicit unavailable outcomes. No pass-shaped file is created for an unexecuted case.

### Native execution on the two computers

Claude Code CLI runs on the Windows test computer. The harness is started from a process outside the Claude Desktop app package (for example a terminal opened through explorer.exe), because the earlier release run completed only there. Authentication stays on that computer; the harness uses its isolated scope and removes its own installation.

Codex CLI runs on the maintainer's Mac with the legitimately authenticated Codex CLI, optionally through CODEX_BIN when the client ships inside the ChatGPT app. Preflight captures the actual client version and model; the plan does not assume 0.163.0 or any other value.

Each computer runs the five cases against the same final candidate in a clean checkout of its commit after npm run build:prepare and the MCP package install. The executor returns release-records.json, the referenced primary captures, host-process.json and the frozen tuple, without credentials, profiles or unrelated transcripts. Upgrade starts from the verified published 0.14.5 artifact; recovery injects only the supported owned-stale state. Unknown ownership, unsafe scope, a changed tuple, a failed step or a timeout stops that case and preserves its actual result. Existing helper timeouts and the ten-minute job limit stay unchanged.

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Canonical schema-3 policy and the generated diagnostic Codex view agree; unknown schema, changed target or hand-edited projection rejects | policy-generation.log |
| AC-001 | SDD-001 | T-009 | SCN-002 | All versions, exact dependencies, profile history and archives identify 0.20.0; nothing is published or tagged | version-packages.log; package inventory digests |
| AC-002 | SDD-001 | T-002 | SCN-003 | Policy requires only Claude CLI win32 and Codex CLI darwin; Desktop is reported, Codex CLI Linux/Windows unqualified, Copilot/OpenCode experimental with adapters retained | scope-policy.log |
| AC-002 | SDD-008 | T-008 | SCN-004 | Guidance and reports show qualified CLI tuples, manually checked Desktop, unqualified and experimental paths without broader inference | support-labels.log; inspected guidance and report output |
| AC-003 | SDD-002 | T-003 | SCN-005 | Source, new owned file, probe, policy, lock or shipped-byte mutation changes candidate identity; missing inventory inputs fail | candidate-invalidation.log |
| AC-003 | SDD-002 | T-003 | SCN-006 | Evidence-only inputs keep software identity; LF/CRLF normalization holds and binary or policy changes do not disappear | candidate-output-boundary.log |
| AC-003 | SDD-003 | T-004 | SCN-007 | Unreviewed tuple, tuple changed between cases, wrong candidate, policy, OS, model or loaded identity reject for a mandatory target | tuple-binding.log |
| AC-003 | SDD-003 | T-004 | SCN-008 | Human reports keep unknown fields and zero coverage; a malformed record of any schema cannot downgrade or pass silently | report-assurance.log |
| AC-003 | SDD-002 | T-005 | SCN-009 | Traversal, symlinks, changed, missing or oversized references, duplicate imports and partial-stage failures reject without accepted output or foreign deletion | immutable-import.log |
| AC-004 | SDD-003 | T-004 | SCN-010 | For the Codex darwin row a pin-bound or Linux/Windows diagnostic record, a record with another commit or an unreviewed tuple rejects; the pin still binds diagnostics | codex-macos-binding.log |
| AC-004 | SDD-001 | T-002 | SCN-011 | requiredReleaseCases returns exactly ten rows; optional diagnostic rows are disjoint from required rows; Desktop rows are reported only | required-cases.log |
| AC-004 | SDD-004 | T-010 | SCN-012 | Five Codex CLI darwin records for the final candidate pass with the frozen tuple, exact commit, primary captures, non-authorizing calls and clean removal | codex/cli release-records.json; frozen tuple; review.json; primary captures |
| AC-005 | SDD-003 | T-005 | SCN-013 | Per-host handoff, tuple-capturing preflight and review templates are bounded and non-authorizing; import with --surface cli lands in the required scope; a wrong bundle or tuple review rejects | handoff-scope.log |
| AC-005 | SDD-004 | T-010 | SCN-014 | Five Claude Code CLI win32 records for the final candidate pass with the reviewed frozen tuple, primary stream captures and clean removal | claude/cli release-records.json; frozen tuple; review.json; primary captures |
| AC-005 | SDD-002 | T-004 | SCN-015 | Records for 830d8b94 and aa3e4b02 are rejected for the final candidate and remain unchanged in their original locations | historical-evidence.log |
| AC-006 | SDD-004 | T-006 | SCN-016 | Only the verified published 0.14.5 baseline is accepted; development relabel, bad integrity or unsafe archives reject | baseline-integrity.log |
| AC-006 | SDD-004 | T-006 | SCN-017 | Owned-stale recovery and all failure exits preserve foreign settings, permissions and cleanup; unknown ownership rejects repair | lifecycle-preservation.log |
| AC-006 | SDD-004 | T-010 | SCN-018 | Upgrade and recovery records of both hosts show baseline identity, fresh loaded final candidate, preserved foreign state and cleanup | upgrade and recovery records per host; baseline integrity references |
| AC-007 | SDD-007 | T-007 | SCN-019 | Every direct and transitive npm publish stays downstream of validation, the full ordinary tests and the CLI evidence job; a failed or missing gate cannot publish | publish-dependencies.log |
| AC-007 | SDD-007 | T-007 | SCN-020 | The ordinary per-lane command multiset and timeout budgets are preserved; new tests are wired into canonical chains | ci-inventory.log; baseline/current command multisets; timeout diff |
| AC-007 | SDD-005 | T-010 | SCN-021 | validate --all-hosts accepts the complete reviewed ten-case bundle for the final candidate only; each missing, failed, duplicate or mismatched case rejects | cli-matrix-validation.json; per-case review digests |
| AC-007 | SDD-006 | T-005 | SCN-022 | Schema-2 policy, a partial matrix, an optional-scope import for a required target and a partial or invalid supplied Desktop set reject; absent Desktop scopes pass | matrix-bypass-rejection.log |
| AC-008 | SDD-008 | T-008 | SCN-023 | Reported Desktop sources stay outside qualified native claims; only imported mandatory CLI records project qualified facts | compatibility-assurance.log; generated report references |
| AC-008 | SDD-006 | T-008 | SCN-024 | Per-host handoff instructions and readiness list completed checks, qualified tuples, human reports, historical and diagnostic records, open cases and next actions without acceptance or publication inference | RELEASE_READINESS.md |
| AC-008 | SDD-008 | T-009 | SCN-025 | Affected and full verification pass on the final snapshot with refreshed compatibility evidence; any CI claim names its tested SHA and lanes | verification logs; clean candidate inventory; CI run links |
| AC-008 | SDD-008 | T-011 | SCN-026 | Current task coverage, solution integrity and code reviews evaluate the actual diff and results; QA records its actual decision and carries every gap forward | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; QA_REPORT.md |

## 3. Test Plan

These are executable obligations and failure actions. Synthetic fixtures test validators only; they do not establish host qualification. Native cases require the stated prerequisites, never assumed access.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | Extend release-lifecycle-test policy fixtures for schema 3; npm run test:release-qualification; npm run sync-package-assets; check generated diff | Disposable fixtures and prepared source | Locked dependencies; generation completes before consumers | Policy/generator owner | policy-generation.log | Repair canonical policy or generator; no manual derived-policy override |
| AC-001 | SCN-002 | Canonical release:prepare plus version, history and package suites; inspect manifests and prepared archives | Prepared checkout with full history | Locked root and MCP dependencies; version transaction only if a version differs | Release preparation owner | version-packages.log; package inventory digests | Keep candidate unprepared and repair the owner; no fabricated history, tag or budget increase |
| AC-002 | SCN-003 | Extend policy fixtures for required targets, reported Desktop, diagnostic pin, unqualified rows and four tiers | Disposable policy fixtures | Approved scope from PRD/SD | Policy owner | scope-policy.log | Reject inconsistent scope; return a product change to PRD |
| AC-002 | SCN-004 | Extend scripts/host-compatibility tests; npm run test:host-compatibility; inspect README, INSTALL, release guide and notes | Prepared checkout with synthetic report fixtures | Canonical matrix; generated report owner; fixtures labelled synthetic | Compatibility owner | support-labels.log; inspected output | Fix the producer; never patch only a generated report |
| AC-003 | SCN-005 | Extend release-candidate-test with policy, probe and payload mutations | Disposable candidate fixtures | Complete inventories; no daily profile or config deletion | Candidate owner | candidate-invalidation.log | Stop candidate freezing; fix inventory through its owner |
| AC-003 | SCN-006 | Extend release-candidate-test for evidence-only outputs, LF/CRLF and binary negatives | Cross-platform deterministic fixtures | Only owner-defined output exclusions | Candidate owner | candidate-output-boundary.log | Treat mismatch as invalid; no caller-selected exclusions |
| AC-003 | SCN-007 | Extend release-handoff-test and release-evidence-test with tuple, candidate, policy, OS, model and loaded-identity mutations for both required targets | Native trace fixtures, no live model execution | Schema-3 evaluator from T-004 | Native evidence owner | tuple-binding.log | Keep the row unqualified and repair the evaluator |
| AC-003 | SCN-008 | Extend fixtures for human_report, malformed CLI and Desktop records and unknown schemas | Disposable records with contained references | DESKTOP_HANDCHECKS_20261022.md hash; no invented identity | Observation owner | report-assurance.log | Retain the report as unverified; reject invalid records |
| AC-003 | SCN-009 | Extend release-handoff-test with injected recheck, rename and projection failures | Owned temporary bundles with foreign sentinels | Only referenced bounded files | Handoff/import owner | immutable-import.log | Stop import; retain originals and repair the transaction |
| AC-004 | SCN-010 | Extend release-handoff-test and release-evidence-test for the Codex darwin row: pin-bound, diagnostic, wrong-commit and unreviewed-tuple records; diagnostic pin still enforced | Deterministic Codex CLI fixtures | Schema-3 policy and evaluator | Native evidence owner | codex-macos-binding.log | Keep the Codex row open; repair the evaluator |
| AC-004 | SCN-011 | Extend release-lifecycle-test for requiredReleaseCases, optionalCliCases and the Desktop selector | Disposable policy fixtures | Schema-3 policy | Native policy owner | required-cases.log | Reject the policy change and repair the selector |
| AC-004 | SCN-012 | handoff, preflight and npm run native:codex-e2e for the five cases; review-template; import --host codex --surface cli | Maintainer's Mac; actual Codex CLI client and model | Final candidate from T-009; clean checkout of its commit; build:prepare and MCP install; legitimate Codex authentication; isolated scope | Maintainer as executor; Claude as reviewer | codex/cli release-records.json; frozen tuple; review.json; primary captures | Record the exact missing access or failed case; keep the Codex row open; no relabelled diagnostics |
| AC-005 | SCN-013 | Extend release-handoff-test for per-host handoff text, preflight, review templates and --surface cli scope mapping | Owned handoff fixtures | Arguments parsed as data; no secrets or remote execution | Handoff owner | handoff-scope.log | Stop the route with the concrete missing input |
| AC-005 | SCN-014 | handoff, preflight and npm run native:claude-e2e for the five cases from a process outside the Desktop app package; review-template; import --host claude --surface cli | Windows test computer; actual Claude Code CLI and model | Final candidate; clean checkout of its commit; build:prepare and MCP install; existing Claude authentication on that computer; isolated scope | Maintainer as executor; Claude as reviewer | claude/cli release-records.json; frozen tuple; review.json; primary captures | Record the exact failure or missing prerequisite; keep the Claude row open; no reuse of 830d8b94 records |
| AC-005 | SCN-015 | validate the historical 830d8b94 and aa3e4b02 records against the final candidate in a disposable copy | Copies of historical evidence | Original directories stay read-only | Evidence reviewer | historical-evidence.log | Keep historical records unchanged; never move them into the final candidate directory |
| AC-006 | SCN-016 | Extend release-lifecycle-test for archive, integrity and baseline identity | Disposable archive fixtures | Registry or archive integrity reference; no lifecycle scripts | Lifecycle owner | baseline-integrity.log | Block the transition until a safe baseline is available |
| AC-006 | SCN-017 | Run release-lifecycle tests and affected CLI lifecycle and cache-recovery suites with foreign sentinels and interrupted paths | Owned fixture scopes; platform suites in ordinary CI | Production repair owner; bounded failure injection | Lifecycle owner | lifecycle-preservation.log | Stop on preservation failure; fix the lifecycle path, never relax a guard |
| AC-006 | SCN-018 | Review the upgrade and recovery records from SCN-012 and SCN-014 for baseline, fresh loaded identity, preservation and cleanup | Imported records of both hosts | Completed native runs | Evidence reviewer | upgrade and recovery records per host | Keep the affected case open with its gap |
| AC-007 | SCN-019 | Extend npm --prefix packages/cli run test:release-workflows for the evidence job and all publish dependencies | Workflow fixtures | Trusted-ref, tag, credential, version and registry constraints retained; no publish | Release workflow owner | publish-dependencies.log | Block the workflow change; identify the bypassing path |
| AC-007 | SCN-020 | Capture testInventory and ciJobs from scripts/ci-plan.mjs as data before and after; node --test scripts/ci-plan-test.mjs; compare timeouts | Repository fixtures; ordinary CI lanes when run | Baseline snapshot from T-001; ci-plan --job is not used because it executes jobs | CI verification owner | ci-inventory.log; command multisets; timeout diff | Stop on a dropped command or raised timeout |
| AC-007 | SCN-021 | release-evidence validate --candidate candidate.json --directory evals/host-compatibility/native/final-candidate-id --all-hosts | Clean final candidate plus both imported bundles | T-009 candidate; both reviews; SCN-012 and SCN-014 imported | Evidence reviewer and release validator | cli-matrix-validation.json; review digests | List each missing or rejected case; no overall qualified or release-ready claim while incomplete |
| AC-007 | SCN-022 | Extend release-handoff and release-evidence tests for schema-2 policy, partial matrix, optional-scope import of a required target and partial or invalid Desktop sets | Deterministic fixtures | Schema-3 policy and validator | Release evidence owner | matrix-bypass-rejection.log | Reject the bypass; keep the diagnostic scope without publication credit |
| AC-008 | SCN-023 | Extend host-compatibility and native-release fixtures; npm run test:host-compatibility, compatibility:record and compatibility:check | Prepared checkout with synthetic and actual inputs | reported_sources contract; generator after source change | Compatibility owner | compatibility-assurance.log | Fix the contract or producer; leave the report visibly incomplete |
| AC-008 | SCN-024 | Inspect RELEASE_READINESS.md against actual results and guidance | Run artefacts and prepared candidate | Human assertions and test results kept distinct | Reporting owner | RELEASE_READINESS.md | Keep overall qualification pending with concrete owner actions |
| AC-008 | SCN-025 | Ordered preparation, targeted suites, npm run build, npm run verify:ci and git diff --check; remote CI on the authorized commit | Owned source snapshot; ordinary Linux/Windows CI lanes | Locked dependencies; no concurrent full verifications; commit and push only after maintainer authorization | Verification owner | verification logs; candidate inventory; CI run links | Repair scoped failures; record an environment-limited local stage with its exact limitation, not as success |
| AC-008 | SCN-026 | task-plan-review, clean-implementation-review, code-review and qa-gate on the current run, sources and results | Selected current run | T-001 to T-010 outcomes | Review owners; QA as sole decision owner | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; QA_REPORT.md | Route normalized gaps; QA revise or block while mandatory proof is missing |

### Targeted and full verification command inventory

- npm run test:release-qualification and node scripts/native-probes/release-evidence-test.mjs for policy, candidate, handoff, lifecycle and evidence contracts.
- npm --prefix packages/cli run test:release-workflows and node --test scripts/ci-plan-test.mjs for publication dependencies, per-lane command multiset and timeouts.
- npm --prefix packages/cli run test:release-version-coherence, test:distribution-profile-history, test:release-bump and test:package-contents plus the existing runtime-integrity and package suites through their canonical chains.
- npm run test:maintenance-contracts in Git Bash; npm run test:host-compatibility, compatibility:record and compatibility:check.
- npm run build, npm --prefix packages/cli run release:prepare, npm run verify:ci and git diff --check for the complete snapshot; npm run verify:commit for an authorized committed snapshot.

Do not create another executable inventory to replace canonical npm chains. Record the SHA and job results for any remote CI claim; do not trigger protected or model workflows automatically.

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Execution handoff and evidence order | SD: Execution handoff and evidence order | resolved | T-010 follows T-009: per-host handoff, preflight with frozen tuple, five cases per computer, review-template, scoped import, then SCN-021 validation and compatibility record. Claude runs on the Windows test computer outside the Desktop app package; Codex runs on the maintainer's Mac. Missing access or a failed case stays an explicit open row with its owner action | Maintainer as executor; Claude as evidence reviewer |
| Executable coverage and ordering | TP | resolved | Eleven tasks and 26 scenarios map all eight PRD criteria and all eight SD decisions; T-001 precedes changes; generation precedes consumers; T-009 freezes the candidate before T-010; T-011 follows actual results | TP author and verification owner |
| Historical evidence | TP | resolved | Records for 830d8b94, aa3e4b02 and dirty diagnostics stay in place with their original manifests; SCN-015 proves they cannot satisfy the final candidate | Native evidence owner |
| Baseline, ownership and bounded execution | TP | resolved | Verified published 0.14.5 baseline, supported owned-stale repair, foreign sentinels and fresh loaded identity; existing helper and job limits unchanged | Lifecycle and native execution owners |
| VCS, remote and human decision boundary | TP | resolved | Commit and push only after explicit maintainer authorization; no tag, publication, credential transfer or new remote access; later QA/UAT/OR decisions stay exact and separate | Release preparation owner and maintainer |

The first row resolves the single SD later_tp decision exactly once. Runtime values such as client versions and models are captured at execution by preflight; the approved product and design already define the behavior when they are missing. If a concrete gap changes scope, design or executability beyond these stop paths, affected work stops and uses the existing normalized clarification route.

## 4. Brownfield Scope

T-001 inspects the approved UR/PRD/SD, both revision archives, the current Brownfield Review and retained changes; hostSupport, its validation and generator; release-policy, candidate, observation, handoff and lifecycle helpers; both native harnesses and the diagnostic workflow; the publication graph; the compatibility manifest, native projection and rendering; release, profile and package owners; and the CI plan and inventory. Record BROWNFIELD_ANALYSIS through the internal-step writer before CD+Tests.

Preserve foreign runs and untracked work. Never hand-edit RUN_STATE, MASTER_BACKLOG, approved source bytes, source bindings, receipts or seals. The known EOF blank-line finding in the sealed earlier BROWNFIELD_REVIEW material stays with its owner.

## 5. Out Of Scope

Publication, tags, marketplace submission, automatic VCS actions, remote services or messaging, credential transfer, active-profile replacement, Desktop qualification, Codex CLI Linux/Windows qualification, Copilot/OpenCode native qualification, product or UI redesign, Core gate changes, fabricated traces or tuples and weakened ownership, evidence, cleanup, history, payload or time-limit checks. This plan claims no native case or CI run.

## 6. Risks And Blockers

The ten native records depend on two maintainer-operated computers; until both bundles are imported and validated, overall qualification and publication eligibility stay open, reported through SCN-021, SCN-024 and SCN-026. The local MCP structured-flow test can flake under host load; remote CI on the authorized commit then serves as commit-bound verification. A changed client version between preflight and execution invalidates the frozen tuple and requires a new preflight. Any needed relaxation or scope change returns to the earliest source owner with renewed approval.

## 7. Next Step

Present this exact plan for a new deliberate Approval: TP. That approval permits the implementation-preparation Brownfield Analysis, then scoped implementation and checks. Record actual CD+Tests, reviews and QA through their owners; no release action follows automatically.

## AGDF Approval Summary (de; source=en)

- Ziel: Die genehmigte CLI-Pflichtmatrix umsetzen und mit zehn frischen nativen Fällen am finalen Kandidaten belegen.
- Plan: Elf Aufgaben decken Bestandsanalyse, Policy-Schema 3, Kandidatenbindung, Tupelbindung im Evaluator, Übergabe/Import/Validate, Upgrade/Recovery, Veröffentlichungssperre, Berichte, Paketprüfung, native Läufe und Reviews/QA ab.
- Abdeckung: 26 Szenarien ordnen alle acht PRD-Kriterien und acht SD-Entscheidungen Aufgaben, erwarteten Ergebnissen, Ausführungswegen und Nachweisen zu. Alle normalen CI-Tests und Zeitlimits bleiben erhalten.
- Native Läufe: Fünf Claude-Code-CLI-Fälle laufen auf dem Windows-Testrechner außerhalb des Desktop-App-Pakets, fünf Codex-CLI-Fälle auf deinem Mac; jeweils mit per Preflight eingefrorenem Tupel, Prüfung und Import vor der Validierung.
- Alte Belege: Die Records für 830d8b94, aa3e4b02 und die Diagnosen bleiben unverändert und zählen nicht für den finalen Kandidaten.
- Ablauf: Nach TP-Freigabe Bestandsanalyse, Umsetzung und Tests, dann Commit und Push nur nach deiner Freigabe, finaler Kandidat, native Läufe, Reviews und QA.
- Grenzen: Fehlender Zugang oder fehlgeschlagene Fälle bleiben offene Pflichtnachweise. Keine Tags, Veröffentlichung, Zugangsdatenübertragung oder automatischen Abnahmen.
- Nächster Schritt: Neue TP-Freigabe öffnet die Bestandsanalyse und danach die Umsetzung.
