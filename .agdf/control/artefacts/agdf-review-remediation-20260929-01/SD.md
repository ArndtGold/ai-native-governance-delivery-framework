# SD: Recoverable control, host and release delivery

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD revision 6, artefact sha256:fe801a520ac58a7c8ccc61805e3963237a074d7216246c9d6fcb2f5659848fad
Date: 2026-09-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Keep the existing control-state, installer, release and instruction-projection owners. First reproduce or disprove each adopted C finding at its actual write boundary. Implement only confirmed failure paths, then validate the coupled release and the exact source, package and installed claims. PRD acceptance remains authoritative; this document chooses technical mechanisms and does not create another approval or policy source.

The control-state path gets one recoverable closeout operation for Run, OR and Backlog. Its durable intent records the expected old and proposed new bytes or digests, operation ID and phase. The journal is transient recovery metadata, never an alternate Run State or approval source. All compliant readers and writers that can observe these files must complete or explicitly block on recovery before treating a closeout as final. A successful command reports the read-back revision and three-file state; an unresolved interruption reports the operation and recovery action.

## 2. Ownership And Source Of Truth

| Boundary | Authoritative owner | Design responsibility |
|---|---|---|
| Run revision, approvals, artefact seal | `create-agdf/lib/control-state/run-state-writer.js`, `run-seal.js`, run commands | One sealed revision; approval changes only via exact approval or bounded revise path. |
| Quick Task OR and shared Backlog | `create-agdf/lib/control-state/run-steps.js`, `.agdf/control/MASTER_BACKLOG.md` | Recoverable closeout and serialized Backlog updates; journal belongs to this owner. |
| Read and path boundary | `create-agdf/lib/control-state/`, `control-evaluation/`, Verified Change consumers | Common contained-file predicate and current seal validation before trusted read. |
| Native host mutations | `create-agdf/lib/lifecycle/operations.js`, `installers/opencode.js`, host adapters | Revalidate ownership and path at execution; atomically replace owned config files. |
| Marketplace transaction | `create-agdf/lib/installers/local-marketplace.js` | Distinguish rollback-eligible preparation from committed stable root and cleanup residue. Historical profile repair stays in `legacy-profile-upgrade-recovery`. |
| Coupled release and packages | `.github/workflows/publish-agdf.yml`, `create-agdf/lib/release/version-coherence.js`, package manifests, `RELEASE.md` | One tag and exact version set; registry read-back determines release outcome. Runtime payload scope stays in `agdf-npm-package-payload-cleanup`. |
| Request activation and projections | `plugin/meta/contracts/request-activation.md`, `plugin/scripts/instruction-footprint.mjs`, build outputs | Canonical rule, generated guard copies and installed-path checks. |
| Evaluation and public text | Existing Eval runner, `README.md`, `INSTALL.md`, `PRIVACY.md`, `TERMS.md` | Label source, replay, tarball and live-host evidence at their actual level. |

## 3. Architecture Decisions

- SDD-001: Serialize closeout with a run lock followed by a shared Backlog lock and a durable per-run intent journal; stage OR, install OR, commit the sealed Run, then update Backlog, with recovery rolling back the pre-Run phase or completing the post-Run phase only after digest and revision checks; rationale: no filesystem rename can atomically replace three files and the Run seal includes OR content; consequence: closeout readers and writers must check pending intent, and uncertain external edits block automatic recovery.
- SDD-002: Give each lock a random owner token, process identity and creation evidence; reclaim only after a platform-specific check proves that exact owner process ended, otherwise block and require inspection; reject missing or invalid seals in normal writes and reserve any seal repair for a separately explicit audited migration or repair route; rationale: age and PID alone cannot distinguish a slow live writer from an abandoned or reused process; consequence: ambiguous stale locks may need manual recovery and legacy unsealed runs need an explicit migration.
- SDD-003: Centralize relative-path validation for Run artefacts and Verified Change with both POSIX and Windows form checks, then resolve and realpath the root and target and require a regular file inside the root; rationale: a host-dependent `path.isAbsolute` check can accept drive-relative, UNC or device paths on another host; consequence: previously accepted malformed paths will fail until corrected.
- SDD-004: Use one narrow atomic-file primitive for owned host configuration writes and recheck file type, marker or exact known-entry ownership immediately before every write or removal; recheck tree identity before recursive removal and stop if it changed; rationale: planning-time checks and direct `writeFileSync` or `rmSync` do not protect the execution boundary; consequence: interrupted or contested operations can return partial or conflict states for bounded retry.
- SDD-005: Persist a marketplace transaction phase and committed-root identity so startup recovery rolls back only a pre-commit swap; after commit it validates the stable root and treats an old backup as cleanup residue; rationale: current backup presence alone cannot prove that the new stable root is uncommitted; consequence: old ambiguous residue requires ownership and provenance inspection before automatic deletion.
- SDD-006: Make `agdf-v*` the sole publishing trigger, include every package and lockfile in version coherence, and install root dependencies from the committed lockfile before the same release validation in PR CI and tag CI; rationale: separate tag routes and checkout-local dependencies can publish incompatible packages; consequence: the legacy standalone workflow loses publish authority and stale locks fail earlier.
- SDD-007: Keep legal text as explicit files in each of the three package sources and validate exact packed tarball inventories through the existing package-content owner; rationale: repository-level legal files are not proof of package contents; consequence: packaging fails if any scoped package omits LICENSE or applicable NOTICE.
- SDD-008: After each publish attempt, query exact package versions in the registry and classify each as published, absent or unknown; mark complete only when all are confirmed, and require an operator choice for partial state; rationale: npm publication is irreversible at this workflow boundary and retries may meet already-published versions; consequence: an incomplete release fails visibly and cannot be presented as a single successful tag.
- SDD-009: Resolve the guard contract from the installed plugin root, generate all host projections from the canonical activation rule, and validate their fingerprints and generic repository assumptions in source, build and packed layouts; rationale: source-only checks miss shipped path and projection drift; consequence: generated files and integrity snapshots must be refreshed through their existing generator.
- SDD-010: Bind public claims and Eval labels to the exact inspected source revision, tarball or dated host observation, with replay provenance separate from measured execution; rationale: offline fixture replay and current source cannot establish published or live behavior; consequence: unsupported claims are reduced until direct evidence exists.
- SDD-011: Declare least required workflow permissions, a single publication credential owner, pinned action/dependency sources and a clean-checkout validation order; rationale: release trust depends on the actual CI inputs and token scope; consequence: unavailable credentials or drift fail clearly, and registry policy remains an external observation.

## 4. Integration Points

1. **Control closeout:** `run-step closeout` validates gate, revision, seal, OR ownership and Backlog layout before durable intent. It acquires the run lock, then the shared Backlog lock; writes and fsyncs the intent and staged bytes; installs OR; writes a Run revision sealed against that OR through an internal writer using the already-held lock; writes Backlog from the locked current content; reads all three back; marks intent complete and removes only its own lock and journal. Any failure before Run commit restores the prior OR and leaves Run/Backlog unchanged. A failure after Run commit finishes Backlog from the journal on next guarded entry. If observed bytes do not match either expected state, it blocks without overwriting them. Backlog-only `run-step` updates take the same shared lock and compare the content they read before replace.
2. **Run authority and path reads:** `writeRun` validates a complete current seal before changing a revision. A separate migration or repair operation, if needed, is explicit and records evidence. All artefact and Verified Change reads use the same contained-file rule. The rule rejects Windows drive-relative and rooted forms even on POSIX; canonical real paths and file type decide final containment.
3. **Host mutations:** Existing plans remain previews. At apply time, the owning adapter checks the current marker, known entries, directory identity and symlink state again. Replacement uses a temporary sibling file, fsync and rename; removal uses the current ownership evidence. Execution reports which mutations actually completed and the observed effective state.
4. **Marketplace:** Stage and backup names remain under the existing marketplace owner. A committed phase is durable only after the new root is installed and its provenance validates. Recovery validates phase plus stable/backup ownership, never equates backup presence with rollback permission, and deletes only proven obsolete residue.
5. **Release:** Release preparation checks all three manifests and lockfiles, pack inventories and guard projections. PR and tag validation use the same dependency installation and tests. Publishing is sequential with exact registry read-back after each step and an aggregate final read-back; `RELEASE.md` records the manual completion or superseding-version choice for a partial set.

## 5. Constraints And Compatibility

- Preserve existing CLI command names, JSON schema and normal success behavior where possible. Add explicit error/status fields without changing approval authority or treating a journal as a source of truth.
- Use deterministic lock order for all writers that touch Run and Backlog. The lock protocol must not evict a live process based on elapsed time. On unsupported process-identity probes, fail closed with a documented recovery path.
- Journal entries and temporary files are confined to the selected control root, use exclusive creation and ownership tokens, and are fsynced before any irreversible write. Recovery verifies exact bytes/digests and does not silently overwrite unrecognized edits.
- Do not follow symlinks for host deletes or assume a plan still owns a path at execution. Existing installer provenance and host-native registration remain authoritative.
- Preserve the released `agdf-v0.14.5` versus current-source distinction. No source change or tarball check alone proves an installed-host result or an npm registry state.
- No automatic unpublish, foreign-file deletion, approval transfer, QA pass or UAT pass follows from technical checks.

## 6. Test And Evidence Strategy

TP first records a focused reproduction or counterexample for C1–C7. Control tests inject failure after every durable closeout boundary and run two writers against one Backlog; after recovery they compare sealed Run, OR and Backlog and test live, dead and ambiguous locks plus removed or changed seal lines. Path tests use native POSIX and Windows lexical forms, traversal and symlink escapes in all three consumers. Host tests interrupt configuration replacement and swap markers or symlinks after planning but before apply. Marketplace tests fail post-commit backup deletion, restart recovery and read back the effective installed version.

Release evidence uses clean Linux and Windows checkouts, stale-lock and legacy-tag negative fixtures, exact tarball inventories, source/build/packed guard resolution, a simulated partial registry outcome and affected CI runs. Documentation evidence compares the exact text with Eval runner behavior, the tagged package and any dated installed-host observation. These tests support later Code Review and QA; UAT and release remain separate decisions.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Durable intent, fixed lock order and phase-based recovery around OR, sealed Run and Backlog. | Control-state `run-steps.js`, `run-state-writer.js`; Run State and Backlog; control-state owner | SDD-001 | New journal is internal recovery metadata; unknown external edits stop rollforward. |
| AC-002 | Owner-identity locks and complete-seal requirement on normal writes. | Control-state writer and seal validator; control-state owner | SDD-002 | Old unsealed runs require explicit migration; uncertain process identity blocks reclamation. |
| AC-003 | Shared cross-platform lexical and canonical contained-file validation. | Run artefact, Verified Change and seal readers in control-state/evaluation; control-evaluation owner | SDD-003 | Malformed formerly accepted paths fail until repaired. |
| AC-004 | Atomic owned-file replacement and execution-time ownership and symlink checks. | Lifecycle operations and OpenCode/host adapter owners | SDD-004 | Contended or interrupted changes can report partial or conflict state. |
| AC-005 | Explicit marketplace commit phase and stable-root provenance before residue cleanup. | `installers/local-marketplace.js`; marketplace transaction owner | SDD-005 | Ambiguous old backups require bounded manual inspection; historical profile work remains separate. |
| AC-006 | Single coupled tag workflow, complete lockfile coherence and clean dependency install. | Publish workflow, release version-coherence module and package manifests; release owner | SDD-006 | Legacy tag ceases publishing; stale lockfiles block release preparation. |
| AC-007 | Package-local legal files and exact pack inventory checks. | Three npm package sources and package-content tests; package/release owner | SDD-007 | Payload inclusion/exclusion remains with the separate package-payload run. |
| AC-008 | Per-package registry read-back and explicit partial-release outcome. | Publish workflow and `RELEASE.md`; release operator | SDD-008 | Already-published versions cannot be retried blindly; operator selects completion or superseding version. |
| AC-009 | Plugin-relative contract path plus generated fingerprint and installed-layout validation. | Canonical activation contract and instruction-footprint generator; plugin contract owner | SDD-009 | Projection regeneration changes generated files and needs packaged-path verification. |
| AC-010 | Version- and evidence-qualified Eval, installation and privacy wording. | Eval runner and public documents; documentation/evaluation owner | SDD-010 | Claims without a dated observation are narrowed rather than inferred. |
| AC-011 | Least-privilege workflow configuration and reproducible dependency sources. | GitHub Actions workflows and release guide; CI/release owner | SDD-011 | Registry credential policy remains externally verified, and missing credentials fail release. |

## 8. Risks And Open Questions

- **Implementation risk:** Multi-file recovery may expose an intermediate state to a reader outside the control-state API. TP must inventory these readers and give each a recovery check or a blocked status before coding. If a supported external reader cannot honor that boundary, SD needs revision before implementation.
- **Portability risk:** Process start identity and directory fsync differ by OS. TP must specify supported probes and fault behavior on Linux, macOS and Windows; uncertainty stays blocked rather than reclaimed.
- **Evidence risk:** C findings are review leads. TP must keep a counterexample outcome available; an unconfirmed issue is not a mandate to add machinery.
- **External state:** npm registry, GitHub token configuration and loaded plugin behavior require observation at the exact release or host. Repository tests cannot certify them.

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Lösung: Die bestehenden Control-State-, Installer-, Release- und Vertragsmodule behalten ihre Zuständigkeit. Jede übernommene C1–C7-Vermutung wird vor einer Implementierung reproduziert oder mit Gegenbeleg geschlossen.
- SDD-001: Ein dauerhaftes, pro Run gebundenes Transaktionsprotokoll und feste Sperrreihenfolge machen OR, versiegelten Run und Backlog nach einem Abbruch überprüfbar wiederherstellbar. Unbekannte Fremdänderungen stoppen die automatische Wiederherstellung.
- SDD-002: Sperren enthalten eine eindeutige Prozessidentität; nur ein nachweislich beendeter Besitzer erlaubt Rückgewinnung. Normale Schreibwege weisen fehlende oder ungültige Siegel ab.
- SDD-003: Ein gemeinsamer Pfadprüfer verwirft Windows-Sonderformen und prüft anschließend kanonische Dateien unter der gewählten Wurzel.
- SDD-004: Host-Konfiguration wird atomar ersetzt; Besitz, Dateityp und Symlinkzustand werden unmittelbar vor Schreiben oder Löschen erneut geprüft.
- SDD-005: Ein dauerhaft erfasster Marketplace-Commit trennt Rücknahme vor der Übernahme von der Bereinigung alter Backups nach erfolgreicher Übernahme.
- SDD-006: Nur der gekoppelte `agdf-v*`-Pfad darf veröffentlichen; Manifeste, Lockfiles und Abhängigkeiten werden im sauberen Checkout abgeglichen.
- SDD-007: LICENSE und erforderliche NOTICE-Dateien werden in allen drei tatsächlichen npm-Paketen geprüft; der getrennte Payload-Run behält seine eigene Grenze.
- SDD-008: Die Registry wird für jede exakte Paketversion zurückgelesen. Ein Teilpublish bleibt sichtbar unvollständig und verlangt eine Betreiberentscheidung.
- SDD-009: Der Aktivierungsvertrag wird relativ zum installierten Plugin aufgelöst; generierte Guard-Kopien und Fingerprints werden in Quell-, Build- und Paketlayout geprüft.
- SDD-010: Eval- und öffentliche Aussagen unterscheiden Offline-Replay, Quellstand, Tarball und datierte Host-Beobachtung.
- SDD-011: CI verwendet die nötigen Minimalrechte, nachvollziehbare Abhängigkeitsquellen und eine eindeutige Credential-Verantwortung.
- Risiken: Ein Leser außerhalb des Control-State-Zugangs könnte einen Zwischenstand sehen; der TP muss alle Leser erfassen. Nicht sicher nachweisbare Prozessidentität oder fremde Dateiänderung führen zu einem sichtbaren Stopp. Registry- und Live-Host-Zustand brauchen eigene Beobachtung.
- Nächster Schritt: Nach einer gebundenen SD-Freigabe den Aufgaben- und Testplan mit konkreten Fehlstellen, Plattformen und Nachweisen erstellen. Code bleibt bis zur eigenen TP-Freigabe gesperrt.
