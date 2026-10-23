# SD: AGDF 0.20.0 candidate-bound host qualification

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-20
Owner: AGDF maintainer
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the existing release, native-probe and host-compatibility paths. Preserve the Core as governance authority, the CLI as installation/lifecycle owner, and `scripts/native-probes/release-evidence.mjs` as the shared technical release-evidence acceptance entrypoint. Host probes produce facts; they do not decide support policy or approve gates.

One release candidate contains coherent 0.20.0 packages and a recomputable, content-bound candidate manifest. Codex runs its mandatory native Linux/Windows cases in the existing trusted CI workflow. Claude CLI and the Claude Code coding surface of the Desktop app are exercised on the separate Windows computer. Their returned evidence is validated against the same candidate before it can close a mandatory obligation. Reporting distinguishes support intent, observed qualification and experimental availability.

The preparation deliverable includes the evidence contract, test handoff and readiness projection. Actual remote observations remain pending until supplied and validated. This design does not claim native execution, introduce a remote agent service, change approval authority or perform publication.

## 2. Ownership And Source Of Truth

| Responsibility | Authoritative owner | Boundary |
|---|---|---|
| Version and host support intent | `plugins/agdf/meta/agdf-plugin.definition.json` | Add a versioned host-support/release-qualification block here; do not independently maintain support tiers or required tuples in another policy |
| Version propagation and history | `scripts/release-bump.js`, `scripts/release/version-coherence.js`, `scripts/release/profile-history.js` | Existing canonical mutation and compatibility checks; no per-host version line |
| Generated policy and package assets | `scripts/sync-package-assets.js` and existing plugin projections | Produce the backward-compatible Codex policy view and validate it against the canonical definition |
| Loaded plugin/runtime provenance | `packages/core/lib/runtime/plugin-provenance.js` and runtime manifests | Reuse normalized source and runtime digest semantics; host claims require observed loaded identity |
| Native execution | `scripts/native-probes/codex-host-e2e.mjs`, `claude-host-e2e.mjs`, `lib/claude-session.mjs` | Host-specific invocation, isolation, consent, capture and cleanup |
| Candidate/evidence acceptance | `scripts/native-probes/release-evidence.mjs` | Extend the existing evaluator with shared identity/coverage checks and distinct host/surface adapters; reusable helpers may live under its existing `lib/` |
| Publication eligibility | `.github/workflows/publish-agdf.yml` | Require all Codex and Claude obligations before any publish job; no second release authority |
| Compatibility projection | `scripts/host-compatibility/`, `evals/host-compatibility/manifest.json` | Explicitly import accepted native facts; preserve the fixture/native distinction and four-host regression inventory |
| Human-facing release material | `README.md`, `INSTALL.md`, `docs/maintenance/README.md`, release notes and the run readiness report | Derived support descriptions and evidence references; no independent qualified-state flag |

## 3. Architecture Decisions

- SDD-001: Put support tiers and required release host/surface/OS policy in the existing canonical plugin definition; keep `codex-release-policy.json` only as a generator-owned compatibility projection retaining its current exact values; rationale: one support-policy owner with existing consumers preserved; consequence: generator, schema/contract tests, profile-history and payload checks must cover the added metadata and reject drift.
- SDD-002: Extend the existing release-evidence owner with a versioned shared candidate/observation contract, recomputing normalized source and payload inventories rather than trusting supplied success flags; rationale: exact candidate identity must survive evidence transport without equating version strings; consequence: content-changing inputs require fresh native evidence, while evidence-only commits may preserve the tested Claude candidate content; Codex's exact-current-commit and clean-worktree checks remain mandatory.
- SDD-003: Keep Codex CLI client 0.157.1 and model gpt-6-luna on native Linux/Windows, and extend the existing scenario partition with upgrade and recovery cases; rationale: preserve the approved release matrix and isolate bounded execution; consequence: more independent scenario evidence is required, without lengthening existing job timeouts or dropping existing cases.
- SDD-004: Extend the existing Claude CLI probe/session helper for Windows-safe command resolution, candidate/loaded identity, skill continuation, upgrade/recovery and cleanup; capture Desktop Code separately as operator-observed native evidence with referenced host output; rationale: CLI stream events cannot establish a Desktop coding session; consequence: unavailable Desktop capture or isolation stays a blocker, with no synthetic pass or local-Claude dependency.
- SDD-005: Export a bounded candidate/test handoff and import only contained, hashed redacted observation files through the same evaluator; rationale: the other computer need not be remotely accessible and credentials must stay there; consequence: remote results are cooperative/operator evidence, not cryptographic proof that an event occurred, and QA must review actual referenced observations.
- SDD-006: Install a checksummed released 0.14.5 baseline into an isolated host test scope, upgrade through the existing CLI to the prepared candidate, and exercise one supported stale/incomplete-state repair; rationale: verify actual effective runtime transitions rather than installer exit codes; consequence: preserve foreign state and fail closed on unknown ownership, with cleanup in every exit path.
- SDD-007: Add a mandatory Claude evidence-validation job to the existing publish graph alongside Codex native jobs; consume checked-in redacted observations tied to recomputed candidate content and a reviewed locked tuple; rationale: remote Windows execution and automated publication share one fail-closed acceptance path; consequence: absent, unreviewed or mismatched evidence blocks all publication, even when package preparation passes.
- SDD-008: Render support intent from canonical metadata and qualification from accepted observations through the existing compatibility pipeline, with a run-local readiness report referencing those results; rationale: avoid parallel status authorities and manual edits to generated output; consequence: fixture success remains separate, experimental hosts remain visible, and no report grants human release approval.

### Candidate identity and evidence lifecycle

The candidate helper under `scripts/native-probes/lib/` reuses the existing provenance and normalized checkout hashing conventions. A versioned sorted inventory covers all source/build/probe/policy inputs and dependency locks that can change the shipped installation or tested behavior, plus normalized inventories of the actual prepared plugin and npm payloads. Derive the root digest from paths, entry types and normalized file digests; bind the schema, version and policy digest as well. Verify complete inventory coverage, including new files under the owned roots, rather than trusting a caller-selected list. Refuse symlinks, missing inputs and unsafe paths. Do not include installed dependency directories, timestamps or host-specific absolute install paths in the cross-host source identity; bind dependency lockfiles and the actual packaged runtime instead.

The release inventory covers canonical source under `plugins/agdf/`, the four package roots, build/release/probe code in `scripts/`, required evaluation/fixture inputs, root manifests/lockfile and the affected workflow definitions. Enumerate generated directories through their validated payload manifests rather than recursively ingesting their temporary outputs. Candidate hashing excludes only defined output classes: Git metadata, dependency/build working directories, `probe-results/`, native observation/output directories, generated compatibility reports and run/control artefacts. These exclusions are fixed by the candidate owner and tested; observations cannot extend them. The release evaluator verifies the required inventory and output manifests against a prepared checkout. A changed policy, probe, build input, lockfile or shipped byte changes identity.

This avoids the circular dependency where importing a result changes the identity of the software it tested. For Claude, retain the original clean execution commit and inventory digest; importing result-only records into a later commit is acceptable only when recomputation proves identical candidate source/payload/probe/policy content. A dirty source run remains diagnostic. Codex continues to require its clean source commit to equal the current release CI SHA; the additional candidate digest does not relax this check.

The handoff records expected candidate digest, package/version digests, clean source commit and case inventory. On the remote Windows computer, preflight records installed CLI/app versions, model, architecture and Node. Freeze these as that execution's exact expected tuple before running cases and hash them into the observation bundle. Import checks expected versus observed tuple values and referenced files; current/latest or a nonempty arbitrary version is not a match rule. Changing an observed tuple requires a fresh matching run and review, not an edit of completed results.

### Shared observation contract

Extend evidence versioning under the existing release-evidence owner; retain the old Codex parser only for historical/diagnostic compatibility, never as a way to satisfy new 0.20.0 obligations. The common envelope contains schema version, kind, observation ID, timestamp, host/surface/OS/architecture/version/model/Node, execution lane and assurance, source commit and dirty state, candidate/policy/source/runtime digests, required case ID, actual result and hashed contained evidence references. Host-specific step records retain the primary stream/CLI/native observations needed to check semantics.

Case results are `pass`, `fail` or `unverified`; acceptance requires all policy-required cases exactly once with `pass` and consistent candidate/tuple identities. Reject unknown schema/host/surface/case, duplicates, missing values, mixed candidates, evidence hash changes, unsafe paths, symlinks and a claimed pass unsupported by the expected native observation. Unknown host capabilities stay unverified. Retain declared harmless leftovers such as a marketplace registration separately from the required absence of plugin/runtime/config/permission leftovers.

Desktop evidence records `operator_observed`, the actual app version and Windows tuple, a fresh Claude Code coding-session identity, the observed loaded plugin/runtime identity and the actual AGDF skill or MCP access path/result. Reference redacted native session/plugin diagnostics and a screenshot or operator capture that identifies the app's coding surface; a screenshot alone cannot prove a tool call or runtime identity. Use operator observations only for Desktop claims; do not relabel them as automatically captured protocol proof. No evidence entry is itself a user gate approval.

## 4. Integration Points

1. Canonical release preparation validates the support metadata and generates matching packages/policy views at 0.20.0. Reuse `release:bump`/`release:prepare`; preserve tag/history, licensing and payload-budget controls.
2. The candidate helper checks the prepared payload, produces a manifest and emits a portable Windows handoff with exact checkout/candidate instructions, baseline package integrity, required cases, redaction rules and expected return files. It exports no secrets and executes no remote commands.
3. Codex CI runs its existing scenario jobs plus upgrade/recovery on the release SHA. Shared probe mechanics capture candidate identity and installed/loaded identity around each transition. Preserve trusted refs, environment credentials and bounded artifact retention.
4. The external Windows executor verifies the handoff, captures its exact tuple, runs the Claude CLI cases and records separate fresh Desktop Code observations. Prefer isolated CLI profiles; Desktop must use a verified host-supported test profile or dedicated test environment. Do not assume the Desktop app honors CLI isolation variables or shares the CLI's installed payload. If safe isolation or loaded-candidate proof is unavailable, return an explicit blocker.
5. Import reads only an explicitly supplied local bundle and validates it before copying accepted redacted records into `evals/host-compatibility/native/<candidate-id>/`. Preserve failed attempts as historical records rather than overwriting success flags. Update `native_sources`/`native_targets` through the existing manifest after validation. A locked review record identifies the exact accepted remote tuple and bundle digest; it is an input fact, not another release decision owner.
6. The publish graph builds the same candidate, downloads its own Codex observations as today, and validates the committed Claude Windows bundle against the recomputed candidate and locked tuple. Existing workflow validation tests must establish that every npm publication is downstream of both required host checks. Result-only imports may require a final current-SHA Codex rerun; no remote code execution occurs during ingestion.
7. The compatibility producer adapts accepted native records into its existing observation vocabulary, preserving lane, mechanism, candidate digests, actual result and primary references. Generated output includes support tier and exact capability scope. A readiness report links package checks, both native evidence sets, outstanding obligations and later approval/publication boundaries.

No new hosted endpoint, background monitor, thread messaging or automatic external upload is introduced. The handoff and returned files are reviewable artefacts, and their transport remains explicit.

## 5. Constraints And Compatibility

Keep governance approval, host consent, plugin-managed transport and all four adapter regression suites intact. The canonical plugin version stays common to supported-intent and experimental integrations. Host-policy metadata expresses intent, never completed qualification. Generated projections cannot override canonical source. The new observation contract is release tooling; historical evidence remains historical and is not silently upgraded.

Use the existing Node 22+ policy. Reuse Windows command resolution from `packages/cli/lib/host-command.js`, safe-path checks and normalized LF hashing; preserve binary bytes and short isolated paths. No global long-path, trust, approval or credential setting is silently changed. Model credentials are passed only where needed for model execution and are excluded from installation/build output and shared artefacts. Preserve the helper's supported environment-token authentication; no local Claude credentials are a prerequisite here.

The candidate implementation may need source changes beyond a version bump, but only to satisfy the approved criteria. Public documentation must distinguish published 0.14.5 behavior from prepared 0.20.0 behavior until publication is observed. No VCS, tagging, publishing or marketplace mutation follows from this design approval.

## 6. Test And Evidence Strategy

TP will map the approved criteria and design decisions to concrete tasks and cases. Reuse version-coherence, distribution-profile/history, packaging, runtime integrity, public/portable plugin, release-workflow, host compatibility and native-evidence suites. Add meaningful rejection cases for altered source/payload/policy, changed/missing files, evidence-only imports, wrong commit/tuple, duplicate and missing cases, false cleanup and unsupported Desktop claims. Verify that result-only import preserves candidate content identity, while relevant source changes invalidate it; Codex must still reject evidence for another release commit.

Native Codex requires Linux/Windows observations on the final clean release SHA and pinned model/client. Native Claude requires returned Windows CLI cases and separately reviewed Desktop coding-session evidence. Both exercise baseline upgrade and supported recovery using actual loaded identity after a fresh session. Where automation cannot observe Desktop, preserve operator provenance and primary references for QA review; deterministic parser tests cannot close that gap.

Upgrade uses the published 0.14.5 distribution with exact version and recorded registry/archive integrity, or the immutable matching release tag's verified assembly only when it is demonstrated equivalent to that released package. Do not install today's 0.14.5-labelled development payload as the baseline. Baseline extraction rejects unsafe archive paths and unintended lifecycle execution. New and baseline installations stay in owned test scopes. Recovery uses a supported stale/incomplete owned installation scenario and production repair/status entrypoints; test injection never rewrites foreign ownership markers or approval state. Record before/after package identity, host-observed identity, preservation checks, cleanup and exit conditions. Desktop transition evidence must include a fresh coding session after upgrade/recovery rather than borrowing the CLI result.

CI case partitioning retains the existing timeout bounds and full inventory, with independent upgrade/recovery jobs if needed. Authentication, inaccessible native runners, unavailable released baseline or missing Windows results are explicit execution blockers. Package preparation can complete while these remain open; native qualification, successful QA and publication eligibility cannot be inferred from preparation.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Canonical version bump, generated policy consistency and package/history validation | Release tooling owner: scripts/release-bump.js and scripts/release/version-coherence.js | SDD-001 | Metadata/profile and payload changes must be propagated and validated before candidate freezing |
| AC-002 | Canonical support tiers feed generated comparison and checked public guidance | Plugin metadata and compatibility owners: agdf-plugin.definition.json and scripts/host-compatibility/render.mjs | SDD-001, SDD-008 | Intent must not become a synthetic qualified flag; experimental adapters stay available |
| AC-003 | Recomputed candidate/tuple identities and versioned primary-evidence validation | Native evidence owner: scripts/native-probes/release-evidence.mjs and provenance helpers | SDD-002, SDD-005 | Evidence-only commits preserve candidate content only after recomputation; no relaxation of Codex SHA checks |
| AC-004 | Preserve pinned Codex matrix and partitioned native scenarios | Codex probe and trusted workflow owners: codex-host-e2e.mjs and codex-release-e2e.yml | SDD-003 | New cases must not omit current cases or increase existing timeout bounds |
| AC-005 | Windows handoff, extended CLI probe and separate operator-observed Desktop capture | Claude probe/session and shared evidence owners: claude-host-e2e.mjs, lib/claude-session.mjs, release-evidence.mjs | SDD-004, SDD-005 | Desktop isolation/identity cannot be assumed from CLI configuration; unavailable proof remains open |
| AC-006 | Released baseline, owned-scope upgrade and supported bounded repair with fresh-session identity | CLI lifecycle/provenance owners and native probe callers | SDD-006 | Old published payload differs from development; retain exact baseline integrity and foreign-state protections |
| AC-007 | Every publish job depends on both required host evidence checks | Existing publication/evidence owner: publish-agdf.yml and release-evidence.mjs | SDD-007 | Imported data cannot execute commands or approve gates; missing evidence must block before publication |
| AC-008 | Reuse native compatibility import and generated status, with a run-local readiness view | Compatibility/reporting owners and release notes | SDD-008 | Do not duplicate qualified state or expose credentials; report pending remote work and publication separately |

## 8. Risks And Open Questions

Remote app/CLI versions, selected model, Desktop diagnostic availability and actual Windows results are not yet observed. The handoff must gather these before execution and freeze the tuple; it cannot substitute the local macOS versions. Desktop safe isolation or observable loaded identity may be unavailable; that is an execution gap, not permission to weaken the contract. Baseline package availability and registry integrity must be established without assuming today's same-version source is equivalent. Candidate manifests require complete coverage and deterministic cross-platform hashing; tests must prove exclusions do not hide shipped or executed inputs.

Operator-provided Desktop observations have limited assurance: hashes prove artifact integrity, not human authenticity or execution truth. QA must assess actual native evidence and retain that limitation. No extra attestation service is justified for this scope. Return records may be stored in a later evidence-only commit; current source/payload/probe/policy recomputation is required before any reuse. Unknown ownership or unsupported recovery blocks the affected case rather than authorizing destructive repair.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Canonical host policy and projection | before_sd | resolved | SDD-001: existing plugin definition owns tier/matrix; old Codex policy becomes a checked generated view with unchanged pinned values | Plugin metadata/release tooling owner |
| Candidate identity and result-only imports | before_sd | resolved | SDD-002: bind complete normalized source/probe/policy and actual payload inventories; exclude only fixed output classes, recompute on acceptance; preserve exact Codex release SHA | Native evidence owner |
| Codex execution depth | before_sd | resolved | SDD-003: keep Linux/Windows and pinned tuple, add independently bounded upgrade/recovery cases without removing existing coverage | Native Codex workflow owner |
| Claude CLI versus Desktop observation | before_sd | resolved | SDD-004: reuse CLI helper, capture Desktop Code separately with operator/native references and verified loaded identity; unsupported capture remains a blocker | Claude native probe owner and Windows executor |
| Remote evidence format and transport | before_sd | resolved | SDD-005: portable handoff, local contained/hash-checked ingestion and locked tuple/bundle review; no remote service, secret transfer or automatic messaging | Native evidence owner |
| Upgrade/recovery baseline and non-destructive path | before_sd | resolved | SDD-006: exact released 0.14.5 integrity, owned test scope, supported repair and fresh-session identity, cleanup on all exit paths | CLI lifecycle owner |
| Required publication checks | before_sd | resolved | SDD-007: existing publication graph must validate both host sets before every publish; current evaluator remains the sole technical acceptance entrypoint | Release workflow owner |
| Reporting authority | before_sd | resolved | SDD-008: support intent from metadata, qualification from validated observations; existing compatibility producer plus a referencing readiness report | Compatibility producer owner |
| Concrete cases, runtime tuple and bounded commands | later_tp | deferred | Plan named scenarios, coverage and execution order; capture exact Windows preflight tuple before launch and stop when safe isolation or credentials are unavailable | TP author and Windows executor |

## 9. Next Step

Review and approve this exact Solution Design with `Approval: SD`. Approval permits Task/Test Plan authoring only. TP must map the eight PRD criteria and these eight design decisions to concrete tasks, native cases, negative checks, expected results and evidence, including the remote Windows handoff. Version/source/workflow changes and native qualification remain pending the applicable TP approval and implementation preparation.

## AGDF Approval Summary (de; source=en)

- Ziel: Einen gemeinsamen 0.20.0-Kandidaten und eine gemeinsame Prüfstelle für beide Host-Nachweise verwenden.
- Lösung: Die vorhandene Plugin-Definition besitzt Supportumfang und Testmatrix. Bestehende Generatoren, Versionspflege, Installer, native Probes und der Publish-Workflow werden erweitert; Copilot/OpenCode bleiben experimentell.
- Kandidatenbindung: Quell-, Paket-, Probe- und Policy-Inhalte werden mit Prüfsummen gebunden und bei Annahme neu geprüft. Reine Ergebnisdateien ändern diese Softwareidentität nicht; Codex muss weiterhin exakt den sauberen Release-Commit testen.
- Codex: Linux/Windows, CLI 0.157.1 und gpt-6-luna bleiben bestehen. Upgrade und Wiederherstellung ergänzen die vorhandenen Fälle, ohne Prüfungen zu streichen oder Zeitlimits zu erhöhen.
- Claude: Auf dem anderen Windows-Rechner laufen CLI-Prüfungen und getrennte Beobachtungen einer frischen Desktop-Coding-Sitzung. Versions-/Modellwerte und geladener Pluginstand werden dort erfasst. Zugangsdaten bleiben dort; fehlende Desktop-Belege bleiben offen.
- Übergabe und Release-Sperre: Ein prüfbares Testpaket benennt denselben Kandidaten und die erforderlichen Rückgabedateien. Die bestehende Prüfstelle kontrolliert Identität, Ergebnisse, Referenzen und Vollständigkeit. Ohne passende Belege beider Hosts bleibt Veröffentlichung gesperrt.
- Upgrade und Risiken: Ausgangspunkt ist das tatsächlich veröffentlichte 0.14.5-Paket. Tests bleiben in eigenen Bereichen und erhalten fremden Zustand. Importierte Desktop-Belege haben ausdrücklich die Aussagekraft der dokumentierten Bedienerbeobachtung; Prüfsummen beweisen keine Ausführung.
- Nächster Schritt: Nach SD-Freigabe entsteht der konkrete Task-/Testplan. Implementierung, native Tests, Publikation und Tags sind damit noch nicht freigegeben.
