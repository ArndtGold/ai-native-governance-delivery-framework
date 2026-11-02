# QA Report: Planned URs and backlog-free Core

Status: draft
Gate: QA
Gate approval: open
Based on: approved TP, implementation evidence, task-plan review, Clean and Code reviews
Date: 2026-10-31
Owner: Codex qa-gate; AI technical assessment, not independent human acceptance

## 1. QA Decision

Decision: pass

The sole qa-gate assessment finds the approved local implementation/verification scope sufficiently evidenced, with no applicable open normalized finding, unmet UX row or unresolved upstream decision. This is technical QA only. It grants no human QA/UAT, actual migration, permanent installation, VCS, merge or release approval.

## 2. TP Coverage

- delivered_result: Maintainers can store and refine independent planned URs with priority through the shared Core UR owner, then deliberately hand one exact source to one unapproved Run with immutable origin and idempotent replay. New-layout Runs use per-resource admission and v3/v6 persistence without a shared live backlog; inventory, CLI/MCP and passive Cockpit derive the same facts. A separate optional Codex Planning package delegates to Core. Explicit lossless migration preview/apply/recovery preserves legacy evidence and rejects unknown or substituted state.

TP_REVIEW.md verifies all implementation/test tasks T-001 through T-012, all 11 approved ACs and the TP's 33 scenario mappings. It truthfully left T-013 partial at its recording time solely because this final QA decision was still the next canonical action. Code/Clean/TP reviews, documentation and existing Context Graph reconciliation are now complete; this assessment fulfils T-013's remaining technical decision. No implementation task or required pre-QA evidence is outstanding. Before-merge CI and human QA/UAT/OR/VCS remain their explicitly later decision points, not silently claimed completed tasks.

Current authoring manifest sha256:8df80b4f85d1d23f0404bd3778088871dbf9c61c197718a66f5357384df7875f was fully consumed (18 pages), including version-matched QA_REPORT template sha256:606c4213b8f00e409b9dcba2b45be9131d7b90705c0911d6a38c5fbbe256bd68 and exact approved TP sha256:91f1d9e72388a7baf9a47266c22b7d62afbe898a2e1bae47726791e0cd97244f. Source authoring/approval semantics remain with their existing owners.

## 3. Evidence

References below are relative to this Run artefact directory unless a full source path is supplied. Underlying logs, actual tool exchanges and fixture effects remain available; this report is not a substitute execution log.

- Plan coverage: TP_REVIEW.md, sha256:00995071e57e3950d9a3b4fc96c8dc1b0096fe9a04bea133097407db3ee2fd8e. All applicable UX Intent Fidelity rows are fulfilled with automated browser or actual native CLI evidence; no code-only claim substitutes for a visible obligation.
- Solution integrity: CLEAN_IMPLEMENTATION_REVIEW.md, sha256:61e458ead00e39560fbde35e14de6d968881322cfef5e02df5e7de14988c188b. One UR/template owner, Core effects, derived inventory, explicit versioned compatibility and no second runtime/status authority. Brownfield preparation and dirty-path preservation are evidenced in BROWNFIELD_ANALYSIS.md and CD_TESTS.md.
- Code quality: CODE_REVIEW.md, sha256:f7f50176f75f73bb37f6c7660c77f9239e9d4350aa20381415779b34e35b5aef. Its CR-001 through CR-004 retain original implementation_gap/CD+Tests routes and concrete resolved evidence. No reclassification or status-only closure: actual old-runtime MCP regression fails 0/2 then passes 2/2; own admission claim filtering passes targeted Git/foreign-claim cases; duplicate UI close passes visibility/browser rechecks; migration substitution reproduces 2/4 failures and passes all 17 migration cases after the owner correction.
- Core/CLI/concurrency/recovery: evidence/implementation/core-cli.log 76/76, plus targeted legacy approval/revision/owned-output/closeout/preview and Verified Change logs. Post-review journal-binding-after.log 17/17 and journal-boundaries.log 10/10 prove exact epoch/journal binding, closed captured Run locks, safe refusal, preserved unknown bytes and supported fixture recovery.
- Protocol/schema: actual assembled STDIO both protocol eras 2/2 in review-stdio.log, with stale planned-source/unreadable-store negatives and error contracts; native-read-core.log 4/4. Expanded/compact schema parity covers 3036 cases; planning/Run bindings remain disjoint and material/request/result bounds remain controlled.
- Visible UI: HTTP 8/8, UI 25 files/283 tests and typecheck pass; affected browser cases and final assembled-Core browser integration pass. Refer to ui.log, ui-typecheck.log, browser-affected.log, browser-palette.log and browser-final-candidate.log. No native Desktop/Cockpit observation is inferred.
- Packages/compatibility: final generation/assembly and package 1538 files pass; reviewed Copilot payload 452 files/4927790 bytes. Verification-plan 27/27 proves existing CI inventory registration, not execution of remote CI. Compatibility 56/56 and freshness pass on source fingerprint d2e83cd19a2fa73602fac4ad1d07cb6e138679414135482be742a9f2457f799c. See review-generation.log, review-assembly.log, review-package.log, review-payload.log, review-compatibility.log and review-compatibility-check.log.
- Native feature behavior: NATIVE_QUALIFICATION_REPORT.md and evidence/implementation/native/manifest.json retain Core-only and Core+Planning actual tool exchanges and fixture effects on one unchanged Core 0.20.2+codex.local-826ca9884801, optional 8b32f58de579, Codex CLI 0.163.0/macOS x86_64. Both pass capture/refinement/priority, explicit source-bound handoff/status/replay and missing approvals; Core-only also proves direct creation. Existing ChatGPT login was reused without credential access/copy/acquisition. The previous Core installation and config bytes were restored exactly.
- Native applicability: the final package source a679e02c1b680ba3d6c0eb82a0d2e80b1917d6d8f42a205662cba99a782fb95f was not installed natively. native-final-applicability.json compares all package files and worker AST: only migration validateIntent changed in executable behavior after the native cohort. Exercised authoring/material/schema/read/handoff/direct-Run paths and optional package remain unchanged. Affected migration, process/version, actual compiled STDIO/package and compatibility checks were rerun. Reuse the exact original feature observations under TP's affected-proof rule; do not claim native execution of the final digest or native migration.
- Migration scope: actual Worktree preview accounts for all 316 backlog lines across 156 Runs/3 drafts, with zero blockers and 105 explicit findings. All 14240 Control entries/631450625 file bytes remained unchanged. Isolated apply/rollback/forward recovery is separately proved. No actual Worktree cutover or trusted repair of historical uncertainty occurred.
- Provenance/preservation: qa-source-snapshot-summary.json binds the final 2202 source files; their current bytes and all 33 native evidence files were rechecked without drift. Existing prerequisite routing work and primary/unrelated changes remain preserved. Bound live Doctor reports pass. Final tracked diff whitespace check passes.

Failed attempts remain failed evidence. The original planned Inspect bug was fixed in production, then reverified. Automatic review rejected a bypass-based restart; that rejected action was not executed or indirectly retried. The successful native cohort used normal Codex workspace permissions and the existing independent MCP startup path. A separate startup-without-MCP attempt produced no planned source/Run and was restored. No failed run is relabelled green.

## 4. Missing Evidence

- qualification_limits: Native observations qualify only the recorded Codex CLI/macOS feature cases on Core 826ca9884801 and unchanged optional package. No fresh native installation of final a679e02c1b68, native migration, Desktop/Cockpit, Windows or other-host qualification is claimed. Actual current-head GitHub CI remains to run before an authorized merge; no PR/head exists for this uncommitted work. Human QA/UAT, actual project migration and release are not performed.

No required pre-QA test or visible evidence remains missing within the approved scope. The explicit unchanged-feature reuse is justified above and in both supporting reviews. These limits are not converted into broader support or human acceptance. No deviation-acceptance mechanism is used.

## 5. Risks

- delivery_risks: Actual legacy cutover remains a deliberate separate operation; the preview retains 61 unverified ended histories, 43 unresolved associations and one unavailable legacy UR. Capacity limits are 256 Run locks and a 32 MiB journal. Unknown/foreign or unsupported states refuse and retain evidence. Required current-head CI, human acceptance and later delivery/installation decisions remain outstanding.

No open code/solution-integrity defect or upstream SoT drift remains identified. There is no measured concurrency-speed, conflict-free Git, distributed-lock or sandbox-security claim. The Run's existing legacy control remains in place; no silent migration is required to review this implementation. Source/package proof, native feature observations and human decisions are separate evidence classes.

Quality contract impact: AGDF_STATUS_CARD_PARALLEL_RULE_MODEL. Existing gate/readiness projection remains authoritative; passive UI/list facts introduce no second approval/transition model. Runtime contracts, actual CLI/MCP results and relevant smoke/UI checks support this assessment.

## 6. Required Next Step

Present this exact recorded QA decision through gate-check and its canonical presentation owner for a new deliberate human Approval: QA. Do not infer that approval from Ja/continue or technical pass. After a valid human QA approval, continue only to the next allowed UAT step.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## Context Graph And Knowledge Persistence

- memory_target: context_graph
- memory_reason: preserve verified inventory/closure ownership and version boundaries in existing nodes
- memory_refs: .agdf/control/CONTEXT_GRAPH.md; run_inventory_20261030; run_closure_20261029
- context_graph_impact: update_existing_node
- context_graph_refs: run_inventory_20261030; run_closure_20261029
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: both existing nodes now distinguish legacy/new-layout mutation, derived inventory, immutable origin and exact qualification/migration limits, with source/evidence references

## AGDF Approval Summary (de; source=en)

- Ziel: Geplante Vorhaben als einzelne URs verwalten und den gemeinsamen Masterbacklog als Pflicht- und Schreibengpass ablösen; Core und optionale Codex-Planung nutzen denselben UR-Owner.

- Ergebnis: Unabhängiges Speichern, Klären und Priorisieren; ausdrückliche Übergabe eines bestimmten UR-Stands an genau einen Run mit Herkunft und sicherer Wiederholung. Neue Projekte verwenden Run-lokale Persistenz ohne Live-Backlog. Core, CLI/MCP und passive Cockpit-Ansicht teilen die abgeleiteten Fakten. Verlustfreie Migrationsvorschau und isoliert geprüfte Recovery sind vorhanden. TP-, Clean- und Code-Review sind erfasst; technische QA: pass.

- Nachweise: 76 Core-/CLI-Prüfungen, 17 abschließende Migrations- und 10 Prozess-/Versionsfälle, zwei tatsächliche STDIO-Protokollabläufe, automatisierte UI-/Browsernachweise, Paket-/Schema- und 56 Kompatibilitätsprüfungen bestanden. Codex CLI bestand mit Core allein und mit Planungserweiterung; Quellen, Übergaben, Wiederholung und ausbleibende Freigaben wurden tatsächlich beobachtet. Vier konkrete Implementierungsbefunde sind korrigiert und nachgeprüft.

- Grenzen: Native Nachweise gelten für den tatsächlich geprüften Kandidaten 826ca9884801 auf Codex CLI/macOS. Danach änderte sich nur die Migrationsjournal-Validierung; die unveränderten UR-/Übergabepfade sind abgeglichen, betroffene Prüfungen erneut bestanden. Keine native Ausführung des endgültigen Paket-Digests, Desktop-/Windows-/anderer Host-Test oder menschliche Abnahme wird behauptet. Die vorherige Installation und Konfiguration wurden wiederhergestellt.

- Risiken: Die echte Migration wurde als unverändernde Vorschau geprüft, nicht angewendet. 105 alte Zuordnungs-/Historienbefunde bleiben ausdrücklich erhalten; unbekannte Zustände und Kapazitätsüberschreitungen werden abgewiesen. Pflicht-CI am späteren aktuellen PR-Stand und menschliche UAT bleiben erforderlich. Es gibt noch keinen Commit, Push, PR, Merge oder Release.

- Entscheidung: Approval: QA bestätigt ausschließlich diese technische Qualitätsbewertung und ihre Grenzen. Sie erlaubt den nächsten UAT-Schritt; tatsächliche Migration, permanente Installation, VCS und Veröffentlichung sind damit nicht freigegeben.
