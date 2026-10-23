# SD: AGDF 0.20.0 CLI-qualified release matrix and Desktop migration

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-23
Owner: AGDF maintainer
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Move the existing canonical support policy, native release evaluator, evidence handoff/import, publication gate and compatibility/reporting owners from the two mandatory Desktop targets to the approved mandatory CLI matrix: Claude Code CLI on Windows and Codex CLI on macOS, five cases each. The product source is PRD.md, digest sha256:7ff703b088b9db7a223b286c9f949de3ce20612d37d3615f4e9f648ed47c7daa. The current BROWNFIELD_REVIEW.md supplies subordinate ownership and routing evidence. The previous SD is archived historical material, not current design authority.

The existing native harnesses already execute the five CLI cases (dispatch, failure_case, skill_continuation, upgrade, recovery) against a validated candidate and a frozen tuple, and emit release records. The existing evaluator already validates CLI records with exact candidate, policy, loaded identity, source commit and primary-capture checks. The design reuses both and changes what is mandatory, how the Codex macOS tuple is bound and how Desktop evidence is treated: Desktop records become optional, strictly validated when supplied, and outside publication eligibility; both Desktop surfaces are reported as manually checked.

The change affects release tooling and its projections, not Core governance, host consent, installation ownership or runtime security authority. Source approval, implementation, technical qualification, human QA/UAT acceptance and publication stay separate.

## 2. Ownership And Source Of Truth

| Responsibility | Existing authoritative owner | Design boundary |
|---|---|---|
| Host scope and release policy | plugins/agdf/meta/agdf-plugin.definition.json hostSupport | Versioned mandatory CLI targets, reported Desktop surfaces, optional diagnostic CLI scope and experimental tiers; no qualified flag in policy |
| Policy validation and case selection | scripts/native-probes/lib/release-policy.mjs | One checked interpretation per schema version; unknown schemas, changed targets or widened scope reject |
| Generated diagnostic CLI projection | scripts/sync-package-assets.js; scripts/native-probes/codex-release-policy.json | Keeps the pinned Linux/Windows Codex diagnostic tuple as a derived view, never a mandatory policy |
| Versions, payloads and history | scripts/release-bump.js; scripts/release/version-coherence.js; scripts/release/profile-history.js | Existing shared version line, payload limits and historical profiles |
| Candidate identity | scripts/native-probes/lib/release-candidate.mjs | Complete normalized source/policy/probe/lock and payload binding; the policy change yields a new candidate |
| Native execution | scripts/native-probes/claude-host-e2e.mjs; scripts/native-probes/codex-host-e2e.mjs | Existing isolated install, discovery, five cases, released 0.14.5 baseline, owned-stale injection and removal; frozen tuple check before execution |
| Observation semantics and acceptance | scripts/native-probes/lib/release-observation.mjs; scripts/native-probes/release-evidence.mjs | One technical evaluator for CLI records, schema-3 Desktop records and human reports |
| Evidence exchange and immutable import | scripts/native-probes/lib/release-handoff.mjs | Host/surface-scoped handoff, preflight, review template, import and validate; containment, hash/review/tuple checks, staging and rollback retained |
| Publication dependency | .github/workflows/publish-agdf.yml | All publication paths depend on the complete mandatory CLI evidence and unchanged ordinary checks |
| Diagnostic Codex CLI workflow | .github/workflows/codex-release-e2e.yml | Linux/Windows runs stay optional diagnostics with their pin; never counted as qualification |
| Compatibility and human guidance | scripts/host-compatibility/contract.mjs, native-release.mjs, run.mjs, render.mjs; README.md; INSTALL.md; docs/maintenance/release-0.20.0.md; release notes | Derived labels and facts, never a second release decision or acceptance register |
| Human decisions | Maintainer under GOVERNANCE.md; Core approval owners | Reports, imports and CI approve no gate, merge, publish or acceptance |

## 3. Architecture Decisions

- SDD-001: Migrate canonical hostSupport to schema_version 3 with required_targets for Claude Code CLI win32 and Codex CLI darwin (five CLI_CASES each), reported_desktop for Codex and Claude Desktop, optional_cli for the pinned Linux/Windows Codex diagnostics, and the unchanged unqualified and experimental entries; rationale: the mandatory matrix changes meaning, so a new schema keeps historical schema-2 candidates interpretable under their own predicates; consequence: release-policy.mjs, the asset generator, case selectors and public projections migrate together, and schema 1 and 2 remain readable only for historical candidates.
- SDD-002: Preserve the complete candidate inventory, policy/payload/source digests and clean-origin checks; rationale: scope changes cannot change evidence truth; consequence: the migration creates a new final candidate, and records for aa3e4b02, 830d8b94 or dirty diagnostics stay attached to their original candidates and are never relabelled.
- SDD-003: Bind each mandatory CLI target through a reviewed locked tuple captured by preflight and frozen before execution, for Codex exactly as already done for Claude; keep the exact release-commit rule for Codex records; apply the 0.157.1 / gpt-6-luna pin only to the optional Linux/Windows diagnostic scope; rationale: the Mac runs a different client version and the pin describes the diagnostic runners, not the qualified surface; consequence: the evaluator selects the binding rule by target scope, and a pinned or unreviewed tuple can never satisfy the macOS row.
- SDD-004: Keep the five CLI cases and their existing step and primary-capture checks (host, install, discovery, the case, removal; primary exit, observed model, outcome, non-authority, terminal flag, plugin and runtime digest); rationale: these already prove the PRD capabilities per case; consequence: no new record schema for CLI; upgrade and recovery keep the released 0.14.5 baseline integrity, owned-stale repair, fresh loaded identity, foreign-state preservation and cleanup checks of the existing lifecycle owner.
- SDD-005: Desktop evidence becomes an optional, non-gating scope of the same evaluator: absent Desktop scopes pass publication; a supplied Desktop scope must be a complete strict schema-3 set for its target and is rejected with its concrete error otherwise; human reports keep zero coverage credit; rationale: retain the tooling and the no-silent-downgrade rule without blocking 0.20.0; consequence: public 0.20.0 labels stay "manually checked" for both Desktop surfaces even if a valid set were supplied, until a later approved policy promotes them.
- SDD-006: Generalize handoff, preflight, review-template and import to the mandatory CLI scopes: import with --surface cli selects the required scope when the policy lists that target and the optional diagnostic scope otherwise; per-host handoff instructions name the host computer, the harness command and its isolation; rationale: today --surface cli always maps to the optional scope; consequence: imports land in the cli folder of the host below the candidate directory in evals/host-compatibility/native with their own review.json, never overwrite earlier records and never execute supplied commands.
- SDD-007: Rename and repoint the publication evidence job to validate --all-hosts against the schema-3 required CLI targets; rationale: publication must enforce the approved matrix in the existing graph; consequence: every npm publish path stays downstream of validation, the full ordinary test inventory and this job; the Codex Linux/Windows workflow stays optional and outside eligibility; current timeouts are unchanged.
- SDD-008: Derive host/surface-scoped status in the existing compatibility owners: qualified for imported mandatory CLI records of the exact tuple, manually checked for Desktop reported_sources, diagnostic, historical, unqualified and experimental otherwise; rationale: avoid synthetic success and parallel status authority; consequence: reports and guidance show exact tuples and limits, and no report grants acceptance or release authorization.

### Canonical policy and case selection

hostSupport schema 3 keeps the four host tiers. required_targets lists { host: claude, surface: cli, os: win32, scenarios: CLI_CASES } and { host: codex, surface: cli, os: darwin, scenarios: CLI_CASES }. reported_desktop lists both Desktop surfaces with the DESKTOP_CASES they were reported for and the Claude OS win32; Codex Desktop OS stays unknown. optional_cli keeps { codex: { codex_version 0.157.1, model gpt-6-luna, platforms linux and win32 } } for diagnostics, and unqualified keeps Codex CLI linux and win32. The generator derives codex-release-policy.json from optional_cli.codex unchanged.

requiredReleaseCases remains the sole mandatory case inventory and returns ten rows for schema 3. optionalCliCases returns only the diagnostic Linux/Windows Codex rows for schema 3 so a required row can never also be optional. A Desktop selector returns the reported Desktop rows for the optional Desktop scope. The validator rejects any schema-3 policy whose required targets, OS values, scenarios, reported surfaces, optional pin or unqualified list differ from the approved values, and rejects schema-2 policies for new publication eligibility.

### Tuple binding and record evaluation

Preflight captures the actual tuple on the executing computer: host, surface cli, os, arch, client version, Node and the requested model. The reviewer freezes it in the bundle review; the harness refuses to run when the actual tuple digest differs. For a mandatory target the evaluator requires a record tuple digest contained in the reviewed locked tuples and the target OS; for Codex it also requires the record source commit to equal the candidate commit. For the optional diagnostic scope the existing pin check stays. The rule that all cases of one host/surface/OS share one tuple digest stays.

### Desktop and human reports

DESKTOP_HANDCHECKS_20261022.md and the existing human_report envelopes stay unchanged and keep zero coverage. The schema-3 Desktop record branch, native transcript and rollout checks, distinct-session rule, capture signature and per-scope review tuple stay intact. validate reads the desktop-code folder of a host only when present; a partial or invalid supplied set fails with its existing error code; absence adds no obligation.

### Candidate, reuse and import lifecycle

Reuse source/payload inventories, LF-normalized hashing, symlink/path rejection, policy digest recomputation and evidence-only exclusions. Generate the final candidate from a clean isolated worktree of the final commit. The five Claude CLI cases for 830d8b94 and all Desktop handoff material for aa3e4b02 remain historical with their original manifests; new records are produced only for the final candidate. The import keeps the owned temporary stage, recheck before rename, duplicate rejection and rollback of only its own output.

## 4. Integration Points

1. After TP approval and Brownfield Analysis, change hostSupport, release-policy.mjs and the generator together; regenerate dependent views through current release preparation, preserving licensing, profile history, payload limits and one version line.
2. release-evidence candidate/handoff recompute the final candidate and write required-cases.json for the selected host from schema 3; the handoff text per host names the computer, the harness command (npm run native:claude-e2e or native:codex-e2e with --candidate, --tuple, --model and --scenario), isolation and the returned files. Claude Windows runs start outside the Desktop app package; Codex macOS runs may name CODEX_BIN.
3. Executors run preflight, freeze the tuple, run the five cases and return release-records.json, primary captures and the frozen tuple. Reviewers prepare the review with review-template, then import per host with --surface cli into the required scope.
4. validate --all-hosts evaluates exactly the ten mandatory rows, plus any supplied Desktop scope strictly; validate-cli stays the Linux/Windows diagnostic route.
5. In publish-agdf.yml the evidence job independently prepares the candidate and runs validate --all-hosts; every publish job keeps its existing needs chain and timeouts.
6. native-release.mjs, contract.mjs, run.mjs and render.mjs project qualified CLI tuples per host and the Desktop reported_sources; public guidance and release notes are updated through their owners; compatibility:record/check refresh the reports.

All steps describe intended implementation. No workflow, runtime code, host installation, publication or VCS mutation is performed by this design.

## 5. Constraints And Compatibility

Keep Core approvals, exact material/revision bindings, host consent, unknown-state handling, plugin-managed transport, ownership and rollback/cleanup invariants intact. Preserve all four adapter regression inventories, ordinary Linux/Windows CI tests and current timeouts. Release-specific expected-matrix assertions change; ordinary regression coverage is never deleted and missing evidence never becomes a pass.

Old records, candidate manifests, review material and revision archives remain immutable. Schema-2 Desktop and CLI records keep their parsers; unknown schemas fail with a concrete error. Use existing Windows-safe command resolution, normalized LF hashing and binary integrity. The upgrade baseline is the actually published 0.14.5 artifact with captured registry/archive integrity. Preserve unrelated files, host settings, credentials and governance state; no broad cache cleanup, blind process termination, global trust change or assumed ownership.

## 6. Test And Evidence Strategy

TP maps the criteria and decisions to tasks and cases. Reuse the policy/lifecycle, candidate, handoff, native-evidence, compatibility, release-workflow, metadata/generation, distribution/history, package/runtime-integrity and CI-plan suites.

Required negative coverage: schema-2 or changed schema-3 policy for new eligibility; one missing host or case; a Codex macOS record bound by the pin or an unreviewed tuple; a Codex record with another commit; a Linux/Windows diagnostic record offered for the macOS row; wrong candidate, policy, OS, model or loaded identity; tuple changed between cases; duplicate case, ID or import; an optional-scope import for a required target; a partial or invalid supplied Desktop set; a human report counted as coverage; unsafe paths and symlinks; failed upgrade/recovery preservation. Every npm publish path must be proven downstream of the evidence job and the unchanged ordinary test multiset and timeouts.

Candidate tests prove that evidence/report-only inputs keep software identity while policy, probe, lock or payload changes alter it. Native evidence is independent of repository tests: ten fresh records for the final candidate from the two maintainer-operated computers, reviewed and imported before validation. No native or CI run is claimed by this SD.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Existing shared version/payload/history preparation with regenerated policy views | Release tooling owner: scripts/release-bump.js, scripts/release/version-coherence.js and asset generator | SDD-001 | Schema migration changes candidate content; regenerate and validate all dependent views |
| AC-002 | Host/surface-scoped labels for qualified CLI tuples, manually checked Desktop, unqualified and experimental paths | Compatibility owners and public guidance: scripts/host-compatibility, README.md, INSTALL.md | SDD-001, SDD-008 | Broad host tiers must not imply other OS or surfaces; reported Desktop passes carry zero coverage |
| AC-003 | Recompute candidate identity, lock reviewed tuples, keep loaded-identity and commit checks | Native evidence owner: release-candidate.mjs and release-observation.mjs | SDD-002, SDD-003 | Old candidate records are never current applicability; reports never receive synthetic identities |
| AC-004 | Mandatory Codex CLI darwin target with reviewed frozen tuple and exact commit; pin only for diagnostics | Release policy/observation owners and codex-host-e2e.mjs | SDD-001, SDD-003, SDD-004 | Diagnostic Linux/Windows records cannot satisfy the macOS row; MCP success proves no hook trust |
| AC-005 | Mandatory Claude CLI win32 target with fresh records; 830d8b94 stays historical; Claude Desktop reported | Release policy/observation owners and claude-host-e2e.mjs | SDD-002, SDD-003, SDD-004 | No CLI-to-Desktop identity transfer; changed candidate prevents reuse of old records |
| AC-006 | Existing released-baseline upgrade and owned-stale recovery cases with fresh loaded identity and cleanup | CLI lifecycle owner and scripts/native-probes/lib/release-lifecycle.mjs | SDD-004 | Unknown ownership or missing preservation proof blocks the affected case |
| AC-007 | One mandatory CLI evidence check in all publication paths; Desktop scopes optional but strict | release-evidence evaluator, release-handoff.mjs and publish-agdf.yml | SDD-005, SDD-006, SDD-007 | Removing the Desktop dependency cannot drop ordinary tests, raise timeouts or accept partial scopes |
| AC-008 | Per-host handoff instructions, readiness report and refreshed compatibility evidence with all open obligations | Handoff owner, compatibility producer and run readiness report | SDD-006, SDD-008 | Hashes prove integrity only; preparation and reported success do not imply acceptance or publication |

## 8. Risks And Open Questions

Both native environments are maintainer-operated; records arrive only after execution on the Mac and the Windows test computer, and the Claude harness completed on Windows earlier only outside the Desktop app package. The Codex macOS client version on the Mac (last observed 0.163.0) and the available model are captured by preflight, not assumed. Published 0.14.5 and development MCP capabilities differ, so upgrade proof must identify the effective new runtime.

The evaluator change must keep the stricter pin path for diagnostics and must not let the required scope accept an optional-scope import. The compatibility projection must not leak reported Desktop passes into qualified claims. The publication rewrite must preserve the full test inventory and every later publication path. These are required implementation and review checks, not accepted technical debt. No material architecture choice is left to an unnamed later stage.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Canonical matrix schema | before_sd | resolved | SDD-001: hostSupport schema 3 with required CLI targets claude win32 and codex darwin, reported_desktop, optional pinned diagnostics and unchanged unqualified/experimental entries; schema 1 and 2 stay historical only | Plugin metadata and release tooling owner |
| Identity and old evidence applicability | before_sd | resolved | SDD-002: complete candidate binding; the migration yields a new candidate; no relabelling of earlier records | Native evidence owner |
| Codex macOS tuple binding | before_sd | resolved | SDD-003: reviewed locked tuple from preflight plus exact release commit; the 0.157.1 / gpt-6-luna pin applies only to Linux/Windows diagnostics | Native release policy owner |
| Case set and capability checks | before_sd | resolved | SDD-004: existing five CLI cases with step, primary-capture, baseline, owned-stale and cleanup checks; no new CLI schema | Native observation and lifecycle owners |
| Desktop evidence role | before_sd | resolved | SDD-005: optional, non-gating, strict when supplied, complete per target; human reports zero coverage; public labels stay manually checked in 0.20.0 | Native observation owner |
| Scoped handoff and import | before_sd | resolved | SDD-006: --surface cli maps to the required scope for listed targets; per-host instructions; existing staging, recheck and rollback | Native handoff owner |
| Publication graph | before_sd | resolved | SDD-007: the evidence job runs validate --all-hosts on the CLI matrix; all publish paths stay downstream; diagnostic workflow stays optional | Release workflow owner |
| Reporting authority | before_sd | resolved | SDD-008: existing manifest/contract/render pipeline projects qualified CLI tuples and reported Desktop sources separately | Compatibility producer owner |
| Execution handoff and evidence order | later_tp | deferred | Map each criterion and decision to tasks, scenario IDs, bounded commands, the two maintainer-run executions, review/import and validation order | TP author, maintainer and evidence reviewer |

## 9. Next Step

Present this exact Solution Design for a new deliberate Approval: SD. Approval permits renewed Task/Test Plan drafting only. Implementation and candidate freezing follow TP approval and Brownfield Analysis. The readiness report must carry the open native records through QA/UAT/OR; no code, workflow, gate, publication or VCS authority is inferred from this draft.

## AGDF Approval Summary (de; source=en)

- Ziel: Die genehmigte CLI-Pflichtmatrix konsistent durch vorhandene Policy, Nachweisprüfung, Veröffentlichungssperre und Berichte führen.
- Lösung: Die Plugin-Definition erhält Schema 3 mit den Pflichtzielen Claude Code CLI unter Windows und Codex CLI unter macOS mit je fünf Fällen. Die Desktop-Oberflächen werden als manuell geprüft geführt, die gepinnten Codex-Linux/Windows-Läufe bleiben optionale Diagnose. Schema 1 und 2 bleiben nur für historische Kandidaten lesbar.
- Bindung: Jedes Pflichtziel wird über ein per Preflight erfasstes, geprüftes und eingefrorenes Tupel gebunden; für Codex gilt zusätzlich der exakte Release-Commit. Der Pin 0.157.1 / gpt-6-luna gilt nur für die Diagnose.
- Fälle und Sicherheit: Die vorhandenen Harnesses und Prüfungen bleiben: Installation, Erkennung, Fall, Entfernung, Primärmitschnitt, Upgrade vom veröffentlichten 0.14.5 und Owned-stale-Recovery mit Erhalt fremder Einstellungen.
- Desktop: Desktop-Belege sind optional und blockieren nicht. Gelieferte Sätze müssen vollständig und streng gültig sein, sonst schlägt die Prüfung fehl. Handberichte zählen nie als Abdeckung.
- Release und Berichte: Eine Pflichtprüfung verlangt die zehn CLI-Fälle vor jeder Veröffentlichung; alle normalen CI-Tests und Zeitlimits bleiben. Berichte zeigen qualifizierte CLI-Tupel, Handprüfungen, Diagnose, unqualifizierte und experimentelle Wege getrennt.
- Risiken: Die nativen Läufe brauchen deinen Mac und den Windows-Testrechner. Die alten Ergebnisse werden nicht umetikettiert; der neue Kandidat braucht zehn frische Records.
- Nächster Schritt: Nach SD-Freigabe den Task-/Testplan erneuern; danach erst Umsetzung, Prüfungen und weitere Freigaben. Keine Veröffentlichung, Tags oder VCS-Aktionen.
