# SD: Repository-specific migration and repair

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD revision 7, presented as 1ed3f937-5695-4949-9ae0-8fd86e21324f
Date: 2026-09-30
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Expose the existing control maintenance capability through a repository command and permitted startup orientation. Move maintenance implementation out of installer ownership into `create-agdf/lib/control-maintenance/`; both installation and the local validator call that owner. Keep canonical control-state inspection and transaction writers unchanged in authority and format.

The new command is `control-maintenance --dir <absolute-repository> [--guided | --details | --json] [--language <tag>]`. Its default is read-only inspection. `--details` expands inspection output. `--json` returns a read-only structured result. `--guided` opens an explicit terminal conversation: inspect, choose 1/2/3, review migration consequences or repair proposals, deliberately apply, then reinspect. Combining `--guided` with `--json`, or running it without an interactive input channel, fails before any writes. No new noninteractive apply API is introduced in this delivery.

The command runs from the installed local validator as well as the full package CLI. Documentation and startup output use the already supplied executable/runtime path for the active host; they do not recommend `npx`, a package download, reinstall or discovery of an alternative runtime. The command requires an explicit absolute `--dir`; parser-default cwd is not a maintenance target. Treat this explicit directory as the selected control root rather than searching ancestors or neighboring repositories. Automatic startup obtains its root through the existing verified repository-context resolver, including subdirectory context.

## 2. Ownership And Source Of Truth

| Concern | Authoritative owner and implementation |
|---|---|
| Compatibility inventory and classification | Existing `inspectControlMigration` logic, relocated to `lib/control-maintenance/compatibility.js`; reads `control-state` and `control-evaluation/required-files.js`; no Doctor-derived classifier |
| Migration orchestration | Existing `migrateInstallationControl` implementation, relocated to `lib/control-maintenance/migration.js`; preserves revision snapshots, approvals/reset policy and calls canonical recovery |
| Repair proposal search/application | Existing `control-repair.js` implementation, relocated to `lib/control-maintenance/repair.js`; exact Git paths, checkpoint inspection and canonical locked writers remain its authority |
| Run state, seals, contained paths, backups and recovery | `lib/control-state/` including `run-recovery.js`, `run-state-writer.js`, `run-store-inspection.js`, `run-seal.js`, `contained-file.js`; no new seal or approval formula |
| Maintenance sequencing and public result | `lib/control-maintenance/service.js` and `contract.js`; orchestration/projection only, never a second eligibility policy |
| Maintenance text and deliberate choices | Extract the current maintenance render/select functions into `lib/control-maintenance/presentation.js` and `interaction.js`; keep one EN/DE copy owner in `plugin/meta/agdf-interaction-locales.json` |
| Installer integration | `lib/install-setup/service.js`, `contract.js`, `presentation.js`, `interaction.js`; thin callers/re-exports where required for current imports, with no copied rules |
| Command registration and runtime adapters | `lib/cli/command-registry.js`, `parse-args.js`, a dedicated `cli/control-maintenance-command.js` handler registered with validation handlers, and `runtime/validator-application.js` |
| Startup context, permission and generated package | `scripts/sync-plugin-runtime.js`, existing `runtime-check-consent` identity/contract and host adapters, `repository-context.js`, and `runtime/local-validator.js` provenance validation |

Names of existing exported installer helpers may remain as compatibility aliases during extraction, but their implementation lives only in the shared maintenance directory. The shared directory imports no plugin installer, marketplace, MCP configuration or runtime-check consent mutation service. Canonical recovery and repair remain separate established transaction types, not a newly combined write transaction.

## 3. Architecture Decisions

- SDD-001: Extract one shared maintenance capability and use thin installer/runtime adapters; rationale: existing proof and transaction rules already cover migration and repair, while installation dependencies are unsuitable for the validator; consequence: import paths and dependency closure change, but policy semantics and exported compatibility callers remain supported.
- SDD-002: Require an explicit absolute directory for the direct command and use existing verified context only for automatic startup; rationale: installation scope, host config directories and parser cwd cannot bind a write target; consequence: startup supplies the exact selected root in its invocation hint, and manual callers select a root explicitly without implicit parent/repository searches.
- SDD-003: Add a read-only default/JSON command with an explicitly requested interactive guided mode and no new noninteractive write surface; rationale: inspection must remain safe for tools/hooks and selection must follow displayed target/consequences; consequence: automated repair selection is outside this delivery and guided mode rejects unavailable input or JSON combinations before mutation.
- SDD-004: Derive a compact repository compatibility fact and hint during the existing consent-bound startup check, independent of Doctor readiness; rationale: users need an actionable repository finding without a new gate or authoritative cache; consequence: startup consumes bounded read-only results, never waits for a choice, and the direct action always reinspects the target.
- SDD-005: Reuse reviewed migration batches and repair proposal selection through existing canonical writers, then reinspect actual outcomes; rationale: proof, reset, locks, backups and owned rollback already have tested owners; consequence: operations may complete independently and partially, while missing originals, stale state and interrupted transactions remain explicit recovery cases.
- SDD-006: Extract maintenance renderers and choices into one shared EN/DE presentation path with concise summaries and deliberate details; rationale: installer and direct entry must communicate equivalent repository meaning without repeating long inventories; consequence: migration details accepts numeric 3 consistently with repair, while existing d/details aliases can remain compatible.
- SDD-007: Ship only the shared capability and its necessary dependencies in supported generated full-runtime profiles, retaining current identity/provenance and renewal checks; rationale: adding the whole installer would introduce unrelated configuration/network capabilities and payload growth; consequence: generated inventories and reviewed payload baselines change, executable identity changes require existing consent renewal, and source evidence remains distinct from installed/live-host proof.

## 4. Integration Points

### Shared service and result

Keep compatibility's current schema/status semantics. Add a separate command envelope owned by the shared contract:

- `schema_version: 1`, `operation: inspect | guided`, explicit `target`, `authorizes: false`.
- `inspection_state: complete | unavailable | not_checked`; `compatibility` contains the existing canonical report when inspected, otherwise null. Known structural/integrity findings stay `repair_required`; a failed execution/parse/timeout cannot masquerade as current.
- `counts` derives migration/repair/historical totals only from that report using the same shared summary projection as installer presentation. Recoverable interrupted migration journals retain their established eligibility distinction; no new stored count/classification authority exists.
- `maintenance_outcome: not_started | deferred | applied | partial | needs_input`; changes, repair summaries, diagnostics and backup references derive from existing operations and final inspection.
- A target-bound structured invocation hint uses executable/prefix/argv data, not executable diagnostic text. No raw candidate content, original bytes or private snapshot payload appears in ordinary JSON or startup facts.

Read-only inspection does not search Git originals, create proposals' journals or initialize missing control. The guided start opens the shared existing read-only plan builders. Eligibility and source verification remain canonical. Result validation rejects an envelope whose target does not match its compatibility/proposal results. Diagnostic strings and source files are data, never instructions.

The CLI adapter prints either the validated JSON projection or localized text. Exit 0 means successful inspection of absent/current state, deliberate deferral, or current state after maintenance; exit 2 denotes a successfully inspected remaining maintenance need; exit 1 denotes usage/unavailable execution. Output retains both operation outcome and rechecked compatibility, so deferral's exit 0 never asserts a healthy inventory.

### Guided maintenance

1. Freshly inspect and display the exact root and need. Current/absent ends without prompting.
2. Display `1. Migration and repair`, `2. Later`, `3. Details`. Choice 1 starts read-only planning; 2/blank/EOF returns deferred; 3 expands details and returns to the same choices. Invalid input repeats guidance with no default.
3. For eligible migration candidates, call the existing migration orchestration with its reviewed batch callback. Show run count, scope, private backup behavior and approval-reset count, then deliberately select the batch application. Preserve the existing explicit installer safe-mode behavior in its adapter; never reuse it as direct-command default authority.
4. Reinspect and offer remaining concrete repair proposals through existing repair search and confirmation. The initial guided start may satisfy the repair search offer for this same root; it never satisfies the later application confirmation. Show proposal kind, sources/differences, backup/reset consequences and unresolved required inputs before deliberate apply. Avoid a duplicate search consent or per-run confirmation where the existing reviewed batch suffices.
5. Reinspect; render actual changes, backup/reset information, remaining inputs or journal/conflict recovery. Deferral/search/details do not write. A skipped migration batch does not silently apply it while repairing; only the separately reviewed repair proposals can be selected.

Retain existing transaction recovery for interrupted migrations. Unsupported repair interruptions remain a concrete journal/manual recovery need rather than being auto-resumed or resealed. No new generic repair-from-arbitrary-file, cross-run approval reuse or global repository queue is introduced.

### Startup and repository changes

Extend the existing generated session check after its effective consent and verified context checks. Execute read-only `control-maintenance --dir <root> --json` through the same fixed, provenance-checked local validator used for Doctor. Keep Doctor's result separate. The two inspections share a bounded startup execution deadline; a timed-out/invalid compatibility result is unavailable. Child stdin is ignored, output is capped and parsed/validated, and startup never calls guided mode.

Add compact `repository_control` facts alongside existing `automatic_check` facts: selected root, inspection state, compatibility status, derived counts and permitted manual invocation. Include only a concise localized notice/hint when migration or repair is actually required; absent/current has no maintenance prompt. Per-run findings and originals stay in deliberate details. A passive hint describes choices in the command; it does not imply an executable native button or ask the model to invoke governance during ordinary conversation.

Disabled/stale consent emits the existing base context without automatic repository probing. Manual command invocation still uses ordinary native host permission and runtime identity checks. Preserve each host's existing hook input and context transport. On supported session/repository reentry resolve again; no prior result/choice is persisted as authority for another root. The OpenCode adapter currently supplies ignored stdin: use only its already supplied directory as the documented fallback for that adapter's permitted check, and do not infer a target from an ambient directory for other surfaces. A host without such reentry receives the explicit command fallback rather than a claim of live change monitoring.

## 5. Constraints And Compatibility

- Control-state format remains version 2. The new command envelope/fact is additive and does not reinterpret seals, historical records, planned missing outputs, trust receipts or gate approvals.
- Exact root/run/revision/source snapshots, contained paths, source digests, lock checks and canonical private backups remain enforced at the existing write boundary. A changed source requires a new plan; original Git bytes never attest approval.
- Direct maintenance command registration is additive. Existing lifecycle and installer flags keep their prior scope; installer compatibility re-exports protect current call sites without making installer modules runtime dependencies.
- Existing supported local-runtime profiles get the dependency closure. Minimal/reference-only surfaces report their limitation rather than silently acquiring configuration or network abilities. Generator ownership remains canonical; generated files are regenerated, never independently maintained.
- Existing EN/DE localization pack owns labels and equivalent consequences. Share maintenance projection/renderer logic; bounded startup copy has fixed fields while details retain full required causes/paths. Do not add a second product acceptance register.
- Executable/runtime/source digests change; preserve renewal requirements and native host permissions. Neither this SD nor later source/package validation authorizes installation, restart, publication, commit, push or PR.

## 6. Test And Evidence Strategy

TP will map the approved criterion IDs and the seven decisions to specific tasks/scenarios without copying acceptance prose. Cover shared-owner installer/direct parity; two independent roots and subdirectory startup; current/absent/unsupported/planned/completed-missing states; every menu/result in EN/DE; blank/EOF/invalid/repeated details; disabled/stale consent; stale proposals/locks/symlinks/tampering/interruption/idempotence; mixed outcomes; and isolated generated-runtime invocation with no installer/network/config writes.

Use existing `install-control-migration-test.js`, `install-control-repair-test.js`, recovery/run-state transaction suites, consent/host-adapter tests and modularization/runtime/package integrity checks as baseline owners. Add meaningful direct-command/startup integration scenarios rather than weakening existing assertions or mirroring implementation. Review complete supported profile dependency inventories and any baseline growth using the existing payload history owner.

A fresh Codex observation is a separate delivery evidence lane after a permitted refreshed installation/session. If that environment is not available, record the missing evidence and its owner; tests cannot replace it. Other fresh hosts and native Windows remain unverified unless observed. QA and human UAT retain their existing roles.

## 7. Acceptance Traceability

The approved PRD is the sole acceptance source; this table specifies realization and ownership only.

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Explicit-root command and verified startup resolver feed the same inventory; no neighbor search or empty-control prompt. | CLI/runtime composition owner: `command-registry.js`, `repository-context.js`, shared compatibility owner | SDD-001, SDD-002 | Explicit-root validation prevents cwd/default/config-directory substitution; subdirectory resolution stays in the existing startup resolver. |
| AC-002 | Canonical report plus shared derived count projection, independent of Doctor; known integrity and planned-output rules retained. | Compatibility owner relocated from `install-setup/control-migration.js`; `control-state/run-seal.js` and `run-recovery.js` | SDD-001, SDD-004 | Additive envelope does not change inventory classification; unavailable execution cannot claim current. |
| AC-003 | Consent-first bounded startup invokes only read-only command with ignored stdin; disabled/stale checks retain base context. | Runtime-check owner: `runtime-check-consent/contract.js`; generator owner: `sync-plugin-runtime.js` | SDD-003, SDD-004, SDD-007 | Changed executable identity renews existing permission; hook performs no maintenance writes or blocking choices. |
| AC-004 | Resolve every supported reentry and reinspect explicit root before planning; existing source/lock validation rejects stale writes. | Repository-context owner and canonical recovery/repair writers | SDD-002, SDD-004, SDD-005 | No authoritative compatibility cache or choice transfer; unsupported reentry uses fresh manual inspection. |
| AC-005 | Shared 1/2/3 entry with read-only start; existing distinct batch/proposal application choices; blank/EOF defer. | Shared interaction/presentation owner extracted from `install-setup`; existing batch/repair callbacks | SDD-003, SDD-005, SDD-006 | Numeric details added consistently; old aliases retained; no default application and no redundant repair-search prompt. |
| AC-006 | Migration adapter calls existing reviewed snapshot batch and canonical recovery, then projects backups/reset and reinspects. | Shared migration owner; `control-state/run-recovery.js` and canonical writer | SDD-001, SDD-005 | Existing explicit installer safe mode remains installer scoped; direct entry does not infer it or historical approval provenance. |
| AC-007 | Shared repair engine retains read-only checkpoint/exact Git search, public projection and separate reviewed application. | Shared repair owner extracted from `install-setup/control-repair.js`; canonical contained paths/writers | SDD-001, SDD-005 | No fabricated original, raw original exposure, arbitrary restoration or blind reseal; missing input remains unresolved. |
| AC-008 | Keep established locks/atomic writes/owned rollback; no combined cross-run transaction; report pending journal and idempotent outcomes. | `control-state/run-state-writer.js`, `run-recovery.js`, shared repair engine | SDD-005 | Partial completion remains local; unsupported interrupted repair recovery is named rather than auto-overwritten. |
| AC-009 | Add dedicated CLI adapter to validator with explicit directory and read-only default/JSON; guided mode requires available interaction. | CLI/runtime composition owner: registry/parser, dedicated command handler, `validator-application.js`, `local-validator.js` | SDD-002, SDD-003, SDD-007 | New additive CLI surface ships with verified minimum closure; no noninteractive apply, installer/config/network fallback or permission bypass. |
| AC-010 | Shared service derives operation outcomes and final compatibility from reinspection; text/JSON retain both, with specific recovery references. | Shared service/result owner over canonical compatibility and transaction outcomes | SDD-005, SDD-006 | Deferred is an operation outcome, not healthy state; failure/remaining need cannot become complete success. |
| AC-011 | Extract single maintenance renderer/copy path; bounded startup notice and deliberate full details in both locales. | `agdf-interaction-locales.json`, shared maintenance presentation, existing locale resolver | SDD-004, SDD-006 | Fixed startup fields resist inventory growth; diagnostic data is inert and exact target remains visible. |
| AC-012 | Shared implementation, thin adapters, minimal runtime closure, regenerated manifests and reviewed inventories; separate host evidence lanes. | Generator/package owner: `sync-plugin-runtime.js`, provenance and existing payload baseline/history; installer service | SDD-001, SDD-007 | Identity renewal and dependency-growth review preserved; package success makes no unsupported live-host/platform claim. |

## 8. Risks And Open Questions

No unresolved product or architecture decision blocks task planning. The existing repository has extensive unrelated staged/unstaged work; TP must capture scope and preserve it rather than use checkout-wide cleanup. Extraction risks import/dependency drift and accidental installer coupling; direct generated-runtime execution and dependency inventory checks are required mitigations. Startup has a finite deadline: unavailable is explicit and the manual route remains usable. Repair proof may be absent; partial or needs-input is valid behavior, not permission to fabricate evidence.

The task planner owns scenario selection, concrete check commands, dependency ordering and the separately obtained fresh Codex evidence. Implementation-preparation Brownfield Analysis after TP approval must verify that these inspected owners and invariants still match current source. Any newly discovered change to accepted behavior must return to PRD revision instead of being hidden in implementation.

## 9. Next Step

Review this Solution Design and approve only with `Approval: SD`. This permits Task/Test Plan preparation; it does not authorize implementation.

## AGDF Approval Summary (de; source=en)

- Lösung: Den vorhandenen Wartungsassistenten unter einem gemeinsamen Modul-Owner aus dem Installer herauslösen. Installer und installierte Runtime verwenden dieselben Prüf-, Migrations- und Reparaturregeln.
- Aufruf: `control-maintenance --dir <absolutes-repository>` prüft nur lesend. `--details` zeigt Details, `--json` liefert lesende Daten. `--guided` öffnet bewusst den interaktiven Assistenten; ohne Eingabekanal oder zusammen mit JSON erfolgt keine Anwendung.
- Ablauf: Frische Prüfung des konkreten Pfads; 1 startet Vorschläge, 2 verschiebt, 3 zeigt Details. Vor Writes werden Migrationsfolgen beziehungsweise konkrete Reparaturvorschläge geprüft und bewusst angewendet. Danach wird der tatsächliche Bestand erneut geprüft.
- Start-Hinweis: Bestehende wirksame Check-Berechtigung und verifizierter Repository-Kontext erlauben einen kurzen, lesenden Kompatibilitätshinweis mit direktem Aufruf. Doctor bleibt getrennt. Der Hook wartet auf keine Auswahl; deaktivierte oder veraltete Berechtigung prüft nicht automatisch.
- Repository-Wechsel: Unterstützter neuer Einstieg prüft den neuen Kontext; ein manueller Aufruf prüft seinen ausdrücklich angegebenen Root frisch. Frühere Befunde und Auswahlen werden nicht auf ein anderes Repository übertragen.
- Sicherheit und Folgen: Bestehende Revisionen, Quellen, Locks, Sicherungen, atomare Writes und Freigabe-Reset bleiben maßgeblich. Fehlende Originale, Konflikte oder unterbrochene Reparaturen bleiben konkrete offene Eingaben; Git-Historie gilt nicht als Freigabenachweis.
- Entscheidungen: SDD-001 gemeinsamer Owner; SDD-002 explizite Zielbindung; SDD-003 lesender Standard und bewusster interaktiver Modus; SDD-004 berechtigter Start-Hinweis; SDD-005 kanonische Transaktionen und erneute Prüfung; SDD-006 gemeinsame deutsche/englische Darstellung; SDD-007 minimale Paket-Abhängigkeiten mit bestehenden Integritäts- und Berechtigungsprüfungen.
- Nachweise: Alle zwölf freigegebenen Kriterien sind genau einmal dem Design zugeordnet. Der Aufgaben-/Testplan konkretisiert Repository-Trennung, Menüs, Fehlerfälle, Installer-/Runtime-Gleichheit und erzeugte Pakete. Frische Codex-Ausführung bleibt ein separater Nachweis; andere Hosts und Betriebssysteme werden nur anhand tatsächlicher Beobachtung bewertet.
- Risiken: Modul-Extraktion kann Import- oder Paketfehler verursachen; bestehende Integritätsprüfungen und isolierte Runtime-Ausführung müssen das prüfen. Start-Timeout meldet nicht verfügbar. Vorhandene fremde Änderungen bleiben erhalten; Produkt- und Designfragen für die nächste Planung sind geklärt.
- Freigabefolge: `Approval: SD` erlaubt den Aufgaben-/Testplan. Die Implementierung folgt erst nach TP-Freigabe und erforderlicher Brownfield-Analyse.
