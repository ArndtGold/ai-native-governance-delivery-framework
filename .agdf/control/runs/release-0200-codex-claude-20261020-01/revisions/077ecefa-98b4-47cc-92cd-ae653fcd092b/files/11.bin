# SD: AGDF 0.20.0 Desktop matrix and evidence migration

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-22
Owner: AGDF maintainer
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the existing canonical support policy, native release evaluator, evidence handoff and compatibility/reporting owners for the newly approved Desktop matrix. The exact product source is PRD.md, digest sha256:1d6bf911c1d9229d6c54ddfc0fc74bb3402d0e1a8efff775ad5903d81b657a9e. Current BROWNFIELD_REVIEW.md supplies subordinate ownership and routing evidence. The previous SD is archived historical material, not current design authority.

One 0.20.0 candidate serves both mandatory Desktop targets. Record the maintainer's invocation, upgrade and recovery handchecks without manufacturing missing app/model/session/candidate facts. Qualification still requires exact candidate and environment binding, review, primary native observations and the required capability checks. Unknown identity stays visibly unverified. Codex CLI Windows/Linux remains unqualified outside the mandatory matrix; existing platform probes remain optional and ordinary CI coverage is preserved.

The change affects release tooling and its projections, not Core governance, host consent, installation ownership or runtime security authority. Source approval, implementation completion, technical qualification, human QA/UAT acceptance and publication remain separate.

## 2. Ownership And Source Of Truth

| Responsibility | Existing authoritative owner | Design boundary |
|---|---|---|
| Host scope and release policy | plugins/agdf/meta/agdf-plugin.definition.json hostSupport | Versioned mandatory targets, optional evidence scope and experimental tiers; no qualified flag in policy |
| Policy validation and case selection | scripts/native-probes/lib/release-policy.mjs | One checked interpretation of canonical metadata; missing/unknown schema or incomplete targets reject |
| Generated legacy CLI projection | scripts/sync-package-assets.js; scripts/native-probes/codex-release-policy.json | Preserve old CLI pinned tuple as a derived optional-probe view, never a second mandatory policy |
| Versions, payloads and history | scripts/release-bump.js; scripts/release/version-coherence.js; scripts/release/profile-history.js | Existing shared version line, payload limits and historical profiles |
| Candidate identity | scripts/native-probes/lib/release-candidate.mjs; Core runtime provenance | Complete normalized source/policy/probe/lock and prepared-payload binding; no caller-selected exclusions |
| Observation semantics and acceptance | scripts/native-probes/lib/release-observation.mjs; scripts/native-probes/release-evidence.mjs | Separate human reports from strict qualified observations; one technical release evaluator |
| Evidence exchange and immutable import | scripts/native-probes/lib/release-handoff.mjs | Generalize current Claude/Desktop flow for both hosts; keep containment, hash/review/tuple checks, staging and rollback |
| Upgrade, recovery and cleanup | packages/cli lifecycle owners; scripts/native-probes/lib/release-lifecycle.mjs | Existing supported owned-state operations; fresh actual loaded identity after transitions |
| Publication dependency | .github/workflows/publish-agdf.yml | All publication paths depend on complete approved Desktop evidence and ordinary checks |
| Optional Codex CLI execution | scripts/native-probes/codex-host-e2e.mjs; codex-release-e2e.yml | Retain exact CLI tuple, commit, trace and cleanup safeguards; optional execution grants no public qualification |
| Compatibility and human guidance | scripts/host-compatibility/contract.mjs, native-release.mjs, run.mjs, render.mjs; existing manifest; README.md; INSTALL.md; release notes | Derived labels and facts, never a second release decision or acceptance register |
| Human decisions | Maintainer under GOVERNANCE.md; Core approval owners | Reports/imports/CI do not approve gates, merge, publish or establish human acceptance |

## 3. Architecture Decisions

- SDD-001: Migrate canonical hostSupport to schema_version 2, explicitly separating mandatory Desktop targets, optional CLI scopes and unqualified/experimental labels; rationale: remove the old mandatory CLI assumption at its source; consequence: validation, generation, case selectors and public projections must migrate together, while unsupported versions reject.
- SDD-002: Preserve existing candidate inventories, policy/payload/source digests and clean-origin checks, and bind actual reviewed Desktop tuples independently of CLI tuples; rationale: changing target scope cannot change evidence truth; consequence: this policy/probe change creates a different candidate, so old records remain attached to their original candidate and cannot silently qualify the new one.
- SDD-003: Keep three mandatory cases per Desktop target (session, upgrade, recovery), with session carrying individually checked installation, consent, discovery, dispatch, controlled failure, applicable skill and cleanup obligations; rationale: preserve required capabilities while reusing the existing Desktop scenario structure; consequence: six complete case records with consistent actual tuples are required, and Codex's unspecified Desktop OS is never a wildcard qualification.
- SDD-004: Add explicitly discriminated human-report inputs under the existing observation owner and a versioned strict Desktop observation branch for both hosts; rationale: retain original human assertions without relaxing the qualified-record grammar or applying CLI policy to Desktop; consequence: a reported pass has zero coverage credit until a separate reviewed candidate-bound record passes all required checks.
- SDD-005: Generalize the existing bounded handoff/review/import flow to explicit host and surface scopes, retaining immutable original records and exact review bindings; rationale: reuse the actual Windows evidence and support both Desktop targets without another service or register; consequence: optional CLI review/import is separate from mandatory Desktop coverage, and imports never relabel old candidates or execute supplied commands.
- SDD-006: Retain released 0.14.5 baseline integrity, supported owned-state upgrade/recovery and fresh Desktop-loaded identity/cleanup checks; rationale: reported transition success and effective runtime transition are different evidence; consequence: recover original proof first, then justify only missing-fact verification, preserving foreign settings and fail-closed ownership.
- SDD-007: Replace the former mandatory Codex CLI/Claude dependency chain with one mandatory Desktop release-evidence check in the existing publication graph; rationale: publication must enforce the approved matrix rather than an unavailable CLI credential path; consequence: both Desktop sets remain required, ordinary CI and current timeouts remain intact, and optional diagnostics cannot bypass evidence eligibility.
- SDD-008: Derive surface-specific support and evidence status through existing compatibility/reporting owners, keeping human reports visible but outside qualified native claims; rationale: avoid synthetic success and parallel status authority; consequence: generated reports/readiness show exact limits, unqualified platforms and experimental adapters, and no report grants acceptance or release authorization.

### Canonical policy and target resolution

hostSupport schema 2 contains the existing four host tiers plus explicit required Desktop targets. Each target identifies host, surface desktop-code, the session/upgrade/recovery case set and the environment-selection rule. Claude Desktop's target is Windows. Codex Desktop uses an exact tuple selected from reviewed original or targeted observations; until that tuple exists its OS remains unknown and the target remains pending. The rule selects one concrete observed environment for this release; it is not an assertion of all supported operating systems.

The review binds the candidate, host, surface and one exact actual OS/architecture/app/model/runtime tuple. A qualifying Codex Desktop tuple may describe the actual OS shown by evidence, but never qualifies Codex CLI on that OS or all Desktop OS variants. No default to this checkout's OS or an installed CLI version is permitted. Applicable model/runtime fields require actual observed values; genuinely inapplicable fields need explicit reasoned review, not the value unknown masquerading as not_applicable.

Optional CLI policy remains distinct: preserve the old Codex CLI 0.157.1 / gpt-6-luna / Linux and Windows tuple for retained probe execution, labelled unqualified until separately reviewed for its own scope. The generator derives codex-release-policy.json from this explicit optional block so current CLI consumers retain their pinned values. Claude Windows CLI evidence has its own observed locked tuple. Optional scope cannot add a required Desktop row, satisfy one, or turn a diagnostic result into support.

requiredReleaseCases remains the sole mandatory case-inventory function, now returning only the two required Desktop targets. Optional CLI validation uses a separate explicitly named scope within the same policy/evidence owner. Neither a host filter nor omission of --all-hosts may make the publication validator accept a partial schema-2 matrix. Historical schema-1 policy remains interpretable only with its original predicates and candidate; it is not rewritten or used to satisfy the new policy.

### Human reports and qualified observations

Keep DESKTOP_HANDCHECKS_20261022.md unchanged as the attributed source statement. Through the existing evidence owner, represent it in a discriminated human_report envelope with schema version, stable ID, recorder/date, source reference/digest, host/surface, the three reported results, assurance human_reported, explicit unknown identity fields, missing facts and qualification status unverified. Preserve recording date separately from unknown execution date. Claude Windows is source context; the CLI version/model does not fill the Desktop tuple.

The human-report parser checks shape, containment, reference integrity, bounded sizes and attribution. It does not fabricate native stream events, screenshots, loaded identities, candidate IDs or execution times. It may document an incomplete result while the qualification evaluator continues to reject missing proof. Native record parsers must reject human_report input, unknown kinds and unsupported schemas; malformed qualified evidence cannot be silently downgraded to a report or ignored.

Retain schema-2 native CLI parsing and its strict existing semantics for historical/optional CLI records. Add a schema-3 Desktop qualified-observation branch at the same owner, using the common candidate, reference and transition validators. It requires host/surface/case identity, actual reviewed tuple and digest, source/execution identity, candidate/policy/loaded-runtime binding, session identity, actual result, operator_observed assurance and primary references. Both hosts use Desktop semantics; Codex CLI pins and exact-current-commit rules remain exclusively on the CLI branch rather than being misapplied to a Desktop app version.

The session record proves each capability explicitly: deliberate installation/consent, host discovery, actual non-authorizing AGDF dispatch, controlled invalid input, applicable skill continuation with verified contracts, and actual owned cleanup. Expected behavior comes from the current contracts; ordinary conversation success or a generic tool connection does not suffice. Reference native diagnostics/tool traces tied to that Desktop coding session and a host-identifying image/capture. Existing reference integrity, size and containment checks stay mandatory; screenshots or checklist booleans alone cannot establish runtime/tool semantics. Inapplicable skill paths require a concrete scoped capability reason, never a blanket waiver of the advertised access path.

Upgrade/recovery records require before/after identity, exact baseline integrity, supported action, fresh Desktop session, effective candidate, foreign-state/permission preservation and cleanup, with actual references. No successful CLI case substitutes for a Desktop case. Every record remains operator-observed even when referenced native diagnostics can be parsed; hashes establish integrity, not independent truth or human authenticity. QA reviews the actual material.

### Candidate, reuse and import lifecycle

Reuse complete source/payload inventories, normalized text versus binary hashing, symlink/path rejection and candidate/policy digest recomputation. Required source, policy, probe, lockfile, build and shipped-byte changes invalidate candidate identity. Fixed evidence-output exclusions avoid circular identity when importing reports; new report output must reside within the existing excluded native/observation output classes, never in a caller-defined exclusion.

Generate the final candidate from a clean exported/prepared checkout. Do not delete the user's ignored daily host configuration to obtain a clean identity, and do not treat repository-test success as payload equivalence. Preserve original source commit and verified payload identity; equivalent evidence-only imports are reusable only after exact recomputation. Retained Codex CLI observations still require their original pinned tuple, clean source and exact release-commit rule when invoked for optional release-grade CLI validation.

The five Claude Windows CLI cases remain validated evidence for candidate 830d8b94 and its original tuple/policy, with review/import and final applicability explicit. Because this migration changes policy/source inputs, do not claim those bytes match a new candidate. Review and retain them against their original manifest and primary references through the existing evidence owner; any current qualified CLI claim needs exact current applicability. Since CLI is outside the mandatory Desktop matrix, no blanket CLI rerun is required to complete Desktop-focused preparation. Older dirty Codex macOS results stay diagnostic, including failed attempts.

Generalize importClaudeEvidence internally to the existing host-scoped import owner, retaining the old interface for its historical scope with explicit schema checks. New host/surface-scoped intake checks candidate and locked tuples, validates each selected scope's complete cases, copies only contained hash-checked referenced files into an owned temporary stage, rechecks immediately before rename and rolls back only that operation's owned output. Use the existing candidate/host directory with surface subdirectories to prevent CLI/Desktop collisions; preserve old records and reject duplicate imports. No arbitrary directory copy, symlink traversal, secret transfer, command execution or remote agent is introduced.

Qualified records alone may enter native_sources/native_targets and native claim projection. Human reports use a declared reported_sources input in the existing compatibility manifest, validated and rendered only as attributed reports. This is input metadata, not a second acceptance register. Unknown report identity cannot become installed/updated/recoverable native facts. The candidate manifest normalizes this evidence-only manifest field alongside existing native/public-evidence output fields so recording a report changes no software identity; tests must show that policy/probe/shipped changes still do.

## 4. Integration Points

1. After renewed TP and preparation, update canonical hostSupport and its existing metadata validation, the shared release-policy reader and asset generator. Regenerate dependent views/packages through current release preparation. Preserve licensing, profile history, payload limits and one version line.
2. Existing release-evidence candidate/handoff commands recompute the final prepared payload and required Desktop cases. Generalize preflight/template support to explicit Codex or Claude Desktop. Original missing tuple remains unknown in reports; templates start unverified and cannot yield a qualifying record by generation alone.
3. Review available original Desktop observations first. Attach exact recovered environment/candidate/session facts only when supported, preserving the original report. Name a concrete missing fact and justification before any targeted fresh observation, using host-supported isolation or a dedicated test scope; never assume Desktop honors CLI isolation variables.
4. The same importer validates scoped bundles and locked review, separates human reports, qualified Desktop and optional/historical CLI records, and preserves source bytes and failures. Already validated old CLI records remain historical if candidate equivalence fails; do not modify their IDs/digests or manufacture fresh traces.
5. In publish-agdf.yml, one required release-evidence job independently prepares/recomputes the candidate and loads reviewed Codex and Claude Desktop evidence. It does not depend on native CLI model credentials, optional probe artifacts or a manually set success flag. It checks both complete mandatory target/case sets against the new policy. Keep --all-hosts compatibility explicit; no schema-2 default may accept only Codex.
6. Every publish action remains downstream of validation, the full ordinary test inventory and this mandatory evidence gate, including transitive MCP/wrapper publication. Retain exact tag/version, registry state, package integrity, trusted-event/ref, credential and smoke/bootstrap protections. The standalone Codex CLI workflow remains optional/unqualified diagnostics; removing its mandatory publication dependency never marks it passed.
7. Extend native-release.mjs's currently Claude-specific projection to host/surface-scoped qualified paths. Preserve human_uat versus fresh_host lanes and primary references. Extend contract/run/render to display the canonical target matrix and attributed reported_sources without feeding those reports into native claim classification. Update checked public guidance and readiness references through existing owners.

All steps describe intended implementation. No workflow, runtime code, host installation, publication or VCS mutation is performed by this design.

## 5. Constraints And Compatibility

Keep Core approvals, exact material/revision bindings, host consent, unknown-state handling, plugin-managed transport, ownership and rollback/cleanup invariants intact. Preserve all four adapter regression inventories and ordinary Linux/Windows CI tests and current timeouts. Scope changes may change release-specific expected matrix assertions, never delete ordinary regression coverage or make missing evidence a pass.

Version policy and Desktop observations explicitly rather than interpreting old bytes under new semantics. Old records, candidate manifests, review material and source-revision archives remain immutable historical evidence. A schema-2 CLI record does not auto-convert to schema-3 Desktop evidence. Unknown/new schemas fail with concrete recovery rather than a success-shaped legacy fallback.

Use existing Windows-safe command resolution, normalized LF text hashing and binary integrity. Baseline means the actually published 0.14.5 artifact with captured registry/archive integrity, not today's source relabelled as 0.14.5. Refuse unsafe archive entries and unintended lifecycle execution. Preserve unrelated files, host settings, credentials and governance state; no broad cache cleanup, blind PID termination, global trust changes or assumed ownership.

Public guidance distinguishes prepared 0.20.0 from any observed published version. Neither optional probe execution nor human reporting changes the release target policy or grants acceptance. No hosted attestation service, automatic external messaging, extra API or UI feature is needed.

## 6. Test And Evidence Strategy

TP maps the existing criteria and these decisions to concrete tasks/cases; no new acceptance register is introduced. Reuse policy/lifecycle, candidate, handoff, native-evidence, compatibility, release-workflow, metadata/generation, distribution/history, package/runtime-integrity and CI-plan suites.

Required negative coverage includes old policy used for new eligibility; Codex CLI default bypass; one missing Desktop host/case; wrong candidate/policy/tuple/app/surface; unknown Codex Desktop OS; CLI tuple borrowed for Desktop; human_report counted as coverage; a malformed qualified record silently treated as a report; unsupported schema; duplicate cases/IDs/import; missing or changed primary references; unsafe paths/symlinks; false tool-contract/cleanup claims; and failed upgrade/recovery preservation. Every npm publish path must be proven downstream of the required evidence gate and unchanged ordinary tests. Assert the complete ordinary test multiset and existing timeout bounds.

Candidate tests prove evidence/report-only input projection does not alter tested software identity, while source/policy/probe/lock/new-owned-file or payload changes do. Historical Claude CLI success stays on its original candidate; wrong final applicability rejects without rewriting the result. Optional Codex CLI tests keep client/model/commit/trace and strict cleanup assertions.

Actual Desktop evidence is independent of repository tests. Review original invocation/upgrade/recovery assertions and recover primary identity/reference material before justified targeted checks. Verify deliberate installation/discovery, non-authorizing dispatch, invalid input, applicable skill continuation, loaded runtime and cleanup in the actual Desktop session. Keep unknown/failed facts visible if unavailable. Human capture remains operator evidence, not machine authenticity proof. No new native or CI run is claimed by this SD.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Existing shared version/payload/history preparation with checked policy derivation | Release tooling owner: scripts/release-bump.js, scripts/release/version-coherence.js and asset generator | SDD-001 | Schema migration changes candidate content; regenerate and validate all dependent views |
| AC-002 | Derive Desktop target scope, exact surface limits and unqualified/experimental labels | Plugin metadata and compatibility owners: hostSupport and scripts/host-compatibility/render.mjs | SDD-001, SDD-008 | Broad host tiers must not imply CLI/platform qualification; human reports carry zero native coverage |
| AC-003 | Recompute candidate identity and lock actual host/surface tuples; preserve historical record semantics | Native evidence owner: release-candidate.mjs and release-observation.mjs | SDD-002, SDD-004, SDD-005 | Old policy/source identity is not current applicability; reports never receive synthetic identities |
| AC-004 | Codex Desktop session/transition records with individual capability checks; optional pinned CLI path retained | Release policy/observation owners and Codex native probe/workflow | SDD-003, SDD-004 | Codex Desktop app version is not CLI version; unknown OS stays pending and Windows/Linux CLI stays unqualified |
| AC-005 | Independent Claude Desktop identity/capabilities and separate original Windows CLI retention/review | Existing release-handoff/observation owners and Claude session probe | SDD-003, SDD-004, SDD-005 | No CLI-to-Desktop identity transfer; changed candidate prevents automatic old-record qualification |
| AC-006 | Released baseline, supported bounded owned-state transitions and fresh loaded Desktop identity | CLI lifecycle owner and scripts/native-probes/lib/release-lifecycle.mjs | SDD-006 | Unknown ownership or missing effective runtime/preservation proof blocks the affected case |
| AC-007 | One mandatory full-Desktop evidence check in all publication dependency paths | Existing release-evidence evaluator and publish-agdf.yml | SDD-001, SDD-003, SDD-007 | Removed mandatory CLI dependency cannot become skipped Desktop checks, dropped ordinary tests or larger timeouts |
| AC-008 | Existing report inputs/projections preserve human assertions, actual native status and readiness gaps | Compatibility contract/native-release/run/render owners, public guidance and run readiness report | SDD-005, SDD-008 | Hashes prove integrity only; preparation and reported success do not imply human acceptance or publication |

## 8. Risks And Open Questions

Desktop app versions/models/session/candidate and primary references remain unknown. This design resolves how to represent and reject incomplete qualification; it does not invent the missing facts or require a blanket rerun. TP owns original-evidence recovery and a bounded action per actual gap. Without recoverable binding, both Desktop reports stay human-reported and publication remains blocked.

Any policy/probe migration creates a different candidate from 830d8b94; current Claude CLI reuse requires actual equivalence and is not assumed. Existing native Desktop validation currently trusts some booleans, and Codex tuple checks run before its Desktop branch: the new Desktop branch must establish capabilities from referenced primary material and apply correct app-specific identity, preserving the stricter release semantics. Operator authenticity remains cooperative and must be stated.

Compatibility report output must not leak unknown reports into positive native claim classification. Manifest evidence-only normalization must not exclude policy/runtime input. The publication dependency rewrite must preserve the full test inventory and every later publication path. These are required implementation/review checks, not accepted technical debt. No material architecture choice is left to an unnamed later stage.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Canonical matrix and optional CLI projection | before_sd | resolved | SDD-001: schema-2 hostSupport owns mandatory Desktop targets and optional CLI policy; generator retains the legacy pinned CLI projection | Plugin metadata and release tooling owner |
| Identity and old evidence applicability | before_sd | resolved | SDD-002: retain complete candidate binding and historical semantics; new policy/source is a new candidate, never relabel old success | Native evidence owner |
| Desktop case and actual OS selection | before_sd | resolved | SDD-003: session/upgrade/recovery per host; session proves individual capabilities; Claude Windows and one reviewed actual Codex Desktop tuple, unknown until evidenced | Native release policy owner |
| Human reports versus qualified Desktop records | before_sd | resolved | SDD-004: explicit human_report inputs with zero coverage; strict versioned Desktop branch and retained CLI parser; no borrowed identity or boolean-only semantic proof | Native observation owner |
| Scoped handoff, review and immutable intake | before_sd | resolved | SDD-005: generalize existing host/surface intake, retain containment/staging/recheck/rollback and exact original candidate; no extra service or registry | Native handoff owner |
| Effective upgrade/recovery and cleanup | before_sd | resolved | SDD-006: released baseline integrity, supported owned-state repair, fresh Desktop session and actual preservation/cleanup; recover original facts first | CLI lifecycle owner and Desktop evidence reviewer |
| Publication graph | before_sd | resolved | SDD-007: require full Desktop evidence plus unchanged ordinary checks; old native CLI workflow stays optional and all downstream publishes remain protected | Release workflow owner |
| Reporting authority and manual source inputs | before_sd | resolved | SDD-008: existing manifest/contract/render pipeline distinguishes reports from qualified native claims; canonical policy is sole scope source | Compatibility producer owner |
| Original evidence recovery and targeted execution | later_tp | deferred | Identify concrete original files/facts and only necessary missing-case actions; preserve unknown facts and no-blanket-retest boundary | TP author, maintainer and evidence reviewer |
| Executable cases and validation order | later_tp | deferred | Map each criterion/decision to task IDs, scenario IDs, expected outcomes, evidence, bounded commands and complete CI inventory checks | TP author |

## 9. Next Step

Present this exact Solution Design for a new deliberate Approval: SD. Approval permits renewed Task/Test Plan drafting only. Implementation and candidate freezing follow renewed TP approval and applicable Brownfield Analysis. The final readiness report must carry remaining Desktop identity gaps through QA/UAT/OR; no code, workflow, gate, publication or VCS authority is inferred from this draft.

## AGDF Approval Summary (de; source=en)

- Ziel: Die genehmigte Desktop-Matrix konsistent durch vorhandene Policy, Nachweisprüfung, Veröffentlichungssperre und Berichte führen.
- Lösung: Die Plugin-Definition erhält eine versionierte Pflichtmatrix für Codex Desktop und Claude Desktop. Claude Desktop ist Windows zugeordnet; Codex Desktop wird nur für die tatsächlich belegte Umgebung bewertet, bis dahin bleibt das Betriebssystem unbekannt. Codex CLI unter Windows/Linux bleibt unqualifiziert; seine bisherigen Probes bleiben optional mit ihren strengen Prüfungen. Copilot/OpenCode bleiben experimentell.
- Nachweise: Menschliche Berichte werden mit Ursprung, gemeldeten Szenarien und unbekannten Angaben dokumentiert. Sie zählen nicht als qualifizierte Pflichtnachweise. Eine getrennte strenge Desktop-Prüfung verlangt Kandidatenbindung, tatsächliche App-/Modell-/Sitzungsidentität, native Primärbelege, erlaubten AGDF-Zugriff und sauberen Abschluss. CLI-Werte werden nicht übernommen.
- Fälle und Sicherheit: Pro Desktop-Host bleiben Sitzung, Upgrade und Wiederherstellung Pflicht. Die Sitzung prüft Installation, Zustimmung, Erkennung, nicht autorisierenden Aufruf, Fehlerfall und anwendbare Skill-Fortsetzung einzeln. Upgrade startet beim veröffentlichten 0.14.5-Paket; Eigentum, fremde Einstellungen, Freigaben und wirksame neue Laufzeit bleiben geschützt.
- Wiederverwendung: Ursprüngliche Desktop-Belege zuerst ergänzend zuordnen; nur konkrete Lücken rechtfertigen gezielte neue Beobachtungen. Die fünf Windows-Claude-CLI-Fälle bleiben beim ursprünglichen Kandidaten erhalten. Die neue Policy verändert die Kandidatenidentität; alte Ergebnisse werden nicht umetikettiert.
- Release und Berichte: Eine gemeinsame Pflichtprüfung verlangt beide vollständigen Desktop-Nachweissätze vor jeder Veröffentlichung. Alle normalen CI-Tests und Zeitlimits bleiben erhalten. Die bestehenden Berichte zeigen Handprüfungen, qualifizierte Fakten, Diagnose, unqualifizierte Plattformen und experimentelle Hosts getrennt.
- Risiken: Konkrete Desktop-Identitäten und Primärbelege fehlen weiterhin; damit bleiben Gesamtqualifikation und Veröffentlichung offen. Prüfsummen belegen Dateiintegrität, nicht die Wahrheit menschlicher Beobachtungen. Dieses Design behauptet keine Umsetzung oder neue Host-/CI-Tests.
- Nächster Schritt: Nach neuer SD-Freigabe den Task-/Testplan erneuern; danach erst genehmigte Umsetzung, aktuelle Prüfungen und die weiteren Freigaben. Keine Veröffentlichung, Tags oder VCS-Aktionen.
