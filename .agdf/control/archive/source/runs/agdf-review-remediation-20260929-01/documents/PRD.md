# PRD: Verlässliche Schreib- und Releasewege nach Review

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR revision 3 and Brownfield Review revision 4
Date: 2026-09-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

This delivery fixes confirmed write-integrity and release defects from the 2026-09-29 reviews through the existing control-state, installer, package and contract owners. Review claims are hypotheses until a focused reproduction or counterexample establishes the actual behavior. The outcome is staged: (1) durable control and host mutations, (2) one complete coupled release path, (3) distributed guard and public-evidence accuracy, then (4) bounded CI and rule-drift hardening. Each stage must pass its own tests, but the run is complete only when the combined release path and required gates pass.

Ownership is explicit. This run owns C1–C6 and the post-commit backup recovery case C7. `legacy-profile-upgrade-recovery` retains historical profile compatibility and Windows Claude cache recovery; C7 work must use its existing marketplace transaction owner after reading that run's current state. This run owns license and NOTICE content in the three npm packages; `agdf-npm-package-payload-cleanup` retains its runtime-payload inclusion/exclusion scope. The `agdf_inspect` documentation and QA remain in `agdf-mcp-inspect-slice1-20260929-01`. No prior run's approval is transferred.

## 2. UX Intent And Success

- ui_ux_impact: high
- ux_intent_definition: ready — `.agdf/control/artefacts/agdf-review-remediation-20260929-01/UX_INTENT_DEFINITION.md`
- primary_user_intent: A maintainer can tell which run, installation or package state actually survived an interruption and can take one bounded recovery action without guessing.
- success_signal: Fault-injection and normal-path checks agree with the visible effective state. A failed write does not silently replace an approved artefact; an installer does not remove an unowned target; a release does not report completion when only part of the package set is published.
- primary_decision_or_action: The person approves a bound AGDF gate, retries a clearly bounded operation or decides how to handle a partial release. Technical success is never interpreted as that decision.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Run and artefact recording | One sealed revision and its associated OR/Backlog effect, or the prior complete revision | committed, rejected unchanged, interrupted recoverable, blocked by live lock | Existing control-state store and seal/revision validator | CLI run-step result and gate-check status |
| Host installation and removal | Native configuration and ownership-validated AGDF files as read back after execution | installed, unchanged, partial recoverable, ownership conflict | Native host source plus existing AGDF ownership markers | Existing lifecycle result and presentation |
| Coupled npm release | Exact registry versions of `create-agdf`, `@agdf/mcp-server`, `@agdf/cli` and the matching tag | validated, publishing, complete, partial, failed | npm registry read-back and tagged source/package inventories | Publish workflow summary and release guide |
| Documentation and evaluation | Exact source, package or live-host claim with its evidence level | verified, bounded, unverified | Canonical source/test result or dated host observation | README, INSTALL, evaluation output and privacy/terms text |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Explicit CLI write/lifecycle commands and the versioned `agdf-v*` workflow activate their existing owners. No background retry, release or approval is inferred from a read-only check.
- blockers_and_visible_next_actions: Stale revision, invalid or absent seal, concurrent live writer, unowned/symlinked path, invalid Windows-relative path, dependency/version skew, missing package file and incomplete QA/UAT each stop at their existing boundary and identify the affected run, path class or package without exposing secrets.
- recovery_paths: A transient interruption may be retried after the effective state is read back. A stale lock may be reclaimed only after the owner is proven gone. An installed marketplace may be restored or completed only using its ownership evidence. A partial npm publish is reported with exact published packages and a deliberate operator next step; no automatic unpublish is promised.
- relevant_state_transitions: Proposed write → validated → one durable committed result or unchanged rejection; staged install → committed or recoverable rollback; validated tag → all packages published or exact partial state. Human gate approval remains a separate transition tied to the run, gate, revision and presentation.

## 5. Acceptance Criteria

### AC-001 — Run closeout and backlog are crash-consistent

- criterion_id: AC-001
- working_mode: Run and artefact recording
- source_state: An existing sealed Quick Task run with OR and Backlog content, or an interrupted prior attempt.
- trigger/action: Closeout is attempted, including stale-revision rejection, forced failure at each write boundary and two concurrent attempts.
- expected_effective_state: Exactly one complete outcome is recoverable; an unchanged rejection preserves the prior OR and Backlog, and a success has matching sealed run, OR and Backlog content.
- visible_feedback: The result names the effective run revision and whether a retry or recovery is needed.
- blocker/failure_behavior: No partial success is presented as completed; a competing writer cannot silently lose a Backlog update.
- recovery/next_action: Re-read the selected run and resume only the ownership-proven interrupted operation.
- observable_success: Deterministic fault and concurrency tests show no lost prior content or mismatched final state.
- required_evidence: Focused control-state tests with injected failures and concurrent writers, plus seal/revision validation after every attempt.

### AC-002 — Locks and seals preserve approval authority

- criterion_id: AC-002
- working_mode: Run and artefact recording
- source_state: A live writer, an abandoned lock, or a run with missing or altered seal data.
- trigger/action: Another write or approval is attempted.
- expected_effective_state: A live writer remains protected; an abandoned lock has a bounded verified recovery; unsealed or tampered state cannot gain an approval or a new committed revision through a normal write.
- visible_feedback: The blocked run and recoverable lock or seal condition are identified without advising removal of seal lines as a shortcut.
- blocker/failure_behavior: No time-only expiry displaces a live writer and no missing seal downgrades approval checks.
- recovery/next_action: Inspect the exact lock/run and use the documented repair path; do not infer approval.
- observable_success: Process-crash, live-lock and seal-tamper tests reject unsafe writes and permit only proven recovery.
- required_evidence: Run-writer and doctor negative tests, including the removed-seal approval case.

### AC-003 — File paths stay within their declared roots

- criterion_id: AC-003
- working_mode: Control evaluation on Linux and Windows
- source_state: A run or Verified Change contains relative, drive-relative, UNC, device or symlinked paths.
- trigger/action: An artefact is read or presented for approval.
- expected_effective_state: Only a canonical file within the selected target root is accepted; invalid forms cannot be read or represented as trusted evidence.
- visible_feedback: The existing invalid-path or read-boundary result identifies the rejected field.
- blocker/failure_behavior: No external file content appears in a gate presentation.
- recovery/next_action: Correct the path in the owning artefact and rerun validation.
- observable_success: Windows and POSIX path matrices reject escapes and retain legitimate contained paths.
- required_evidence: Shared path-boundary tests used by run-state, Verified Change and seal consumers.

### AC-004 — Host configuration writes and removals respect current ownership

- criterion_id: AC-004
- working_mode: Host installation and removal
- source_state: An owned config or tree, an unowned replacement, a symlink swap, or a crash during mutation.
- trigger/action: OpenCode or lifecycle writes configuration, or an approved uninstall removes an AGDF-owned tree.
- expected_effective_state: A write leaves either the old complete file or the new complete file; deletion happens only after ownership is rechecked immediately before mutation.
- visible_feedback: The result distinguishes committed, unchanged, ownership conflict and recoverable interruption.
- blocker/failure_behavior: A changed marker or symlink blocks mutation; foreign data remains intact.
- recovery/next_action: Reinspect the exact host source or owned stage, then retry only the bounded operation.
- observable_success: Interrupted-write and ownership-swap tests preserve old/foreign content and never leave truncated configuration.
- required_evidence: Existing OpenCode, lifecycle and marketplace suites with injected write/delete failures and marker swaps.

### AC-005 — Marketplace commit cannot roll back a successful install

- criterion_id: AC-005
- working_mode: Host installation
- source_state: A verified old marketplace, a staged new one and a backup; cleanup may fail after the new stable root is committed.
- trigger/action: A later install invokes interrupted-transaction recovery.
- expected_effective_state: The already committed new version remains effective; cleanup residue is handled separately from an uncommitted transaction.
- visible_feedback: The installer reports exact effective version and bounded residue cleanup or recovery.
- blocker/failure_behavior: A failed backup deletion is not interpreted as authorization to restore the old version.
- recovery/next_action: Revalidate ownership, then remove only proven obsolete residue or stop for manual repair.
- observable_success: Forced post-commit cleanup failure followed by another install never reinstates the old root.
- required_evidence: Local-marketplace regression with injected backup-delete failure and current provenance read-back.

### AC-006 — One coupled release path produces coherent packages

- criterion_id: AC-006
- working_mode: Coupled npm release
- source_state: A candidate version and an exact source tag, with stale or matching lockfiles.
- trigger/action: CI validates a release or a publish tag is pushed.
- expected_effective_state: Only the `agdf-v*` path can publish; every package and lockfile version agrees; validation installs declared dependencies deterministically before invoking tests.
- visible_feedback: A mismatch fails before publication and names the offending surface.
- blocker/failure_behavior: The legacy standalone tag has no publication path; missing root dependencies cannot be masked by a developer checkout.
- recovery/next_action: Repair source/lock versions and rerun the canonical release preparation before a new tag.
- observable_success: A clean checkout passes the same preparation as PR CI, while deliberately stale lockfiles and legacy tags cannot publish.
- required_evidence: Workflow contract tests, version-coherence tests, clean-checkout validation and package smoke on Linux and Windows.

### AC-007 — Published packages carry legal and operational files

- criterion_id: AC-007
- working_mode: Coupled npm release
- source_state: Each of the three candidate npm packages is packed from a clean prepared tree.
- trigger/action: Package-content validation runs before publish.
- expected_effective_state: LICENSE, applicable NOTICE text, runtime entrypoints and versioned metadata are present in each package; test/build residue is absent according to its owner.
- visible_feedback: The check names the package and missing or forbidden path.
- blocker/failure_behavior: A missing legal file blocks publish.
- recovery/next_action: Correct the canonical package source and repack.
- observable_success: Inventory tests pass on exact tarballs and fail when LICENSE or NOTICE is removed.
- required_evidence: `npm pack --json` inventory assertions for `create-agdf`, `@agdf/mcp-server` and `@agdf/cli`.

### AC-008 — Partial publication is represented honestly

- criterion_id: AC-008
- working_mode: Coupled npm release
- source_state: One package was published while a later package failed or is not yet resolvable.
- trigger/action: The publish workflow terminates or is retried.
- expected_effective_state: Registry read-back distinguishes published, absent and unknown versions for each package; the workflow never reports a complete AGDF release from a partial set.
- visible_feedback: The exact partial state and one operator decision path are shown.
- blocker/failure_behavior: No automatic rollback or duplicate publish is assumed possible.
- recovery/next_action: The release owner deliberately completes a safe remaining publication or records a superseding version after checking registry state.
- observable_success: Simulated partial-publish checks yield a non-success state with exact package/version evidence.
- required_evidence: Workflow-level failure simulation or contract test plus `RELEASE.md` recovery procedure.

### AC-009 — Installed guard paths and rule projections resolve

- criterion_id: AC-009
- working_mode: Plugin installation and AGDF skill use
- source_state: Source and generated plugin trees for supported hosts.
- trigger/action: Build, pack and inspect the plugin; load a projected skill guard.
- expected_effective_state: The declared request-activation contract path resolves inside the installed plugin, every guard copy has the expected fingerprint, and generic contracts do not imply AGDF-repository files exist in a target project.
- visible_feedback: Packaging or footprint checks name the broken projection before release.
- blocker/failure_behavior: A missing path or conflicting normative phrase blocks the build rather than silently shipping.
- recovery/next_action: Correct the single canonical owner, regenerate projections and rerun integrity checks.
- observable_success: All source/generated/packed paths resolve and negative drift fixtures fail.
- required_evidence: Instruction-footprint, installed-layout and package-content tests across relevant host profiles.

### AC-010 — Evaluation and public-data claims match evidence

- criterion_id: AC-010
- working_mode: Documentation and evaluation
- source_state: Offline replay, dated live observations and the currently published package are distinguishable.
- trigger/action: A maintainer reads INSTALL, README, privacy/terms or an Eval metric.
- expected_effective_state: Text identifies replay versus measured execution, describes actual fixture and fingerprint provenance, and names MCP/CLI installation, local reads and `npx` acquisition accurately for the claimed version.
- visible_feedback: No offline replay is described as a live mutation or host proof; limitations and human approval remain explicit.
- blocker/failure_behavior: A missing observation does not become a zero or a success claim.
- recovery/next_action: Collect dated evidence or reduce the claim.
- observable_success: Documentation/metric contract checks and a human review of exact versioned copy agree with the implementation.
- required_evidence: Evaluation runner inspection, public-text diff, documentation assertions and source-versus-tag comparison.

### AC-011 — CI permissions and dependencies are bounded

- criterion_id: AC-011
- working_mode: CI and release
- source_state: Pull request and publish workflows with third-party actions and package installs.
- trigger/action: Workflows run on a clean checkout.
- expected_effective_state: Jobs receive only required token permissions; dependencies used by validation have a reproducible source; actions and publication credentials follow a documented single owner.
- visible_feedback: Security and dependency checks identify drift before publish.
- blocker/failure_behavior: A workflow without a required credential fails clearly and does not fall back to broader permissions.
- recovery/next_action: Update the pinned source or credential configuration and rerun CI.
- observable_success: Workflow contract checks and a clean CI run match the documented permissions and dependency policy.
- required_evidence: Workflow static checks and affected GitHub Actions runs; registry policy changes require separately observed external state.

## 6. Non-Goals

- Approve or publish the separate `agdf_inspect` slice, change MCP read/write authority, or infer its UAT from these tests.
- Rewrite all installers or add a second governance/policy engine; reuse existing owners.
- Retroactively change `agdf-v0.14.5` or claim that today's source behavior is already installed in a live host.
- Replace the Offline Eval framework with a new benchmark in this run; correct public claims now and route real measurement work separately.
- Automatically unpublish npm packages, delete foreign host files or relax exact gate approvals.
- Treat low-priority review hygiene items (D5, D7, P7–P8, C8–C10) as release blockers without a separately evidenced impact.

## 7. Users And Roles

- Maintainers and release operators need accurate effective state and bounded recovery.
- Plugin users and host adapters consume installed paths and contracts; no host permission becomes governance approval.
- Arndt Gold owns product scope and exact gate decisions for this run. Existing run owners retain their approved boundaries.
- The control-state, installer, release and contract modules remain the technical owners named in the Brownfield Review and SOT registry.

## 8. Constraints

- Preserve existing public CLI, run-state and package compatibility unless SD documents a versioned migration.
- All destructive host operations require current ownership evidence; the test environment must not mutate a live installation.
- Keep one canonical rule and one generated projection path, with negative checks for drift.
- Release preparation, CI, QA, UAT, registry publication and fresh host behavior remain separate evidence planes.

## 9. Evidence Requirements

- Isolated reproductions or counterexamples for each adopted C finding, including Windows forms and failure points where relevant.
- Regression tests in existing owner suites and clean-checkout Linux/Windows CI for release and package behavior.
- Exact tarball inventories, generated plugin and installed-layout checks, plus version/tag reconciliation.
- Affected host observation for any claim about loaded plugin behavior; repository tests support only repository claims.
- Code Review with normalized findings, QA report for the approved TP and later UAT evidence before release.

## 10. Risks And Open Questions

- SD must determine the smallest recoverable unit of work for Run/OR/Backlog, and how to distinguish live from abandoned locks without a race.
- TP must choose fault points and concurrency schedules that test behavior rather than duplicate implementation internals.
- The exact action versions and registry authentication approach may change; verify them when the release implementation is prepared. External trusted-publishing configuration needs a separately observed owner.
- A failed partial npm publish cannot be rolled back by Git alone. The release operator needs registry read-back and an explicit decision.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Ownership of C7 versus historical-profile recovery | before_prd | resolved | This run owns post-commit backup cleanup/recovery only; `legacy-profile-upgrade-recovery` retains historical profile compatibility and Claude cache recovery. Coordinate against its current revision before touching `local-marketplace.js`. | Arndt Gold, product scope |
| Ownership of LICENSE/NOTICE versus package-payload cleanup | before_prd | resolved | This run owns legal-file inclusion and corresponding exact tarball assertions; `agdf-npm-package-payload-cleanup` retains runtime payload inclusion/exclusion. One package inventory test may cover both without a second manifest. | Arndt Gold, product scope |
| Partial npm publication behavior | before_prd | resolved | Report exact registry state and require an operator decision; no automatic unpublish or success claim. | Arndt Gold, release scope |
| Confirmed versus inferred review findings | before_prd | resolved | Every C1–C7 claim requires isolated reproduction or a documented counterexample before its implementation task proceeds. A disproved claim closes with evidence rather than speculative code. | Arndt Gold, quality scope |
| Recovery protocol and lock ownership representation | later_sd | open | Design inside the existing control-state and installer owners after fault paths are observed. | SD owner |
| OS and clean-checkout evidence matrix | later_tp | open | Assign exact Linux, Windows, package, failure and host observations in TP. | TP owner |

## 11. Next Step

Review this PRD and approve only with `Approval: PRD`. SD, TP and implementation remain blocked until their own gates are approved.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Wartende und fehlgeschlagene Schreib-, Installations- und Releasevorgänge sollen einen überprüfbaren effektiven Stand und einen begrenzten nächsten Schritt zeigen.
- Umfang: Bestätigte C1–C7-Risiken, gekoppelte npm-Veröffentlichung, vollständige Lizenz- und Plugin-Pakete sowie belegtreue öffentliche Aussagen; bestehende Run- und Modul-Eigentümer bleiben erhalten.
- AC-001: Run, OR und Backlog bilden nach Erfolg oder Abbruch einen vollständig wiederherstellbaren Stand ohne verlorene parallele Änderung.
- AC-002: Lebende Schreiber bleiben gesperrt; verwaiste Locks werden nur nach Eigentumsprüfung behandelt; fehlende oder manipulierte Siegel erlauben keine Freigabe.
- AC-003: Kontroll- und Verified-Change-Pfade bleiben unter der gewählten Wurzel, auch bei Windows-Sonderformen und Symlinks.
- AC-004: Host-Konfiguration wird vollständig oder gar nicht ersetzt; Löschung prüft Besitz unmittelbar vor der Ausführung erneut.
- AC-005: Ein erfolgreich übernommener Marketplace-Stand wird nach fehlgeschlagener Backup-Bereinigung nicht auf die Vorversion zurückgesetzt.
- AC-006: Nur der gekoppelte Tag-Pfad veröffentlicht; Versionen, Lockfiles und Validierungsabhängigkeiten stimmen im sauberen Checkout überein.
- AC-007: Alle drei npm-Pakete enthalten LICENSE, nötige NOTICE-Angaben und die geprüften Laufzeitdateien.
- AC-008: Ein Teilpublish zeigt die exakten Registry-Stände und verlangt eine bewusste Betreiberentscheidung statt einer behaupteten Gesamtauslieferung.
- AC-009: Der Guard-Pfad ist im installierten Plugin auflösbar; Fingerprints und generische Verträge folgen ihrer kanonischen Quelle.
- AC-010: Eval-, MCP-, Datenschutz- und Installationsaussagen nennen den tatsächlichen Nachweisstand und die beanspruchte Version.
- AC-011: CI und Publish verwenden begrenzte Berechtigungen, nachvollziehbare Abhängigkeiten und eine dokumentierte Credential-Verantwortung.
- Entscheidungen: C7-Nachbearbeitung und LICENSE/NOTICE gehören zu diesem Run; bestehende Upgrade- und Payload-Runs behalten ihre gesonderten Grenzen. Ein Teilpublish wird nicht automatisch zurückgerollt. Review-Vermutungen werden vor einem Fix reproduziert oder mit Gegenbeleg geschlossen. Recovery-Protokoll und Prüfmatrix werden in SD und TP entschieden.
