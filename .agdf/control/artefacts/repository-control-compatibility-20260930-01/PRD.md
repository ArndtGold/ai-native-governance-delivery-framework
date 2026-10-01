# PRD: Repository-specific migration and repair

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR; completed Brownfield Review; ready UX Intent Definition
Date: 2026-09-30
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Identify migration and repair needs for the repository currently being used, show a clear repository-bound action, and make the existing maintenance assistant directly usable through the installed AGDF runtime without reinstalling the plugin.

The global plugin installation supplies the tools. The selected repository's `.agdf/control` supplies its compatibility facts. Installation continues to provide an additional compatibility check of its own selected repository. Automatic startup and manual inspection are read-only; applying maintenance requires a deliberate selection for the displayed target and reviewed consequences/proposals.

The first delivery covers source and generated executable runtime packages for existing supported full-runtime profiles, English/German behavior, regression/package evidence and a separately classified fresh Codex observation. It does not publish, install or upgrade a host implicitly or broaden host/OS support claims. Other live-host and native-Windows claims require their own direct evidence.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready; `.agdf/control/artefacts/repository-control-compatibility-20260930-01/UX_INTENT_DEFINITION.md`
- primary_user_intent: See whether this repository needs maintenance and complete the available migration or repair here.
- success_signal: The correct repository gets its own diagnosis, a deliberate applicable action and an accurate rechecked result; no new installation or search across other repositories is needed.
- primary_decision_or_action: Choose `1. Migration and repair`, `2. Later`, `3. Details`; review concrete proposals and select their application separately where required.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| automatic_inspection | Not checked, absent, current, migration required, repair required or unavailable | Repository identity, concise compatibility notice, counts and maintenance hint | Current repository compatibility inspection, executed only under existing effective technical check permission | Existing host startup/context presentation |
| manual_inspection | Fresh compatibility for the explicitly selected repository | Summary, optional details, unavailable reason and retry | Same current compatibility inspection; Doctor readiness is separate | Existing maintenance result/text presentation |
| guided_maintenance | Inspecting, proposals ready, deferred, applying, current, partial, unresolved repair or stale | Reviewed consequences/originals, choice, progress, backup, final result and next action | Canonical maintenance transaction outcomes followed by compatibility reinspection | Existing maintenance assistant |

State names here express product meaning, not a required technical schema. Counts refer to compatibility classifications, never to aggregate Doctor findings. A stale notice or prior choice does not establish the state or authorization of another repository.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Inspect on supported session startup when existing technical checks are effectively enabled. A deliberate repository maintenance invocation always checks its explicit path again. On supported repository-context changes, the next permitted repository-oriented entry checks the new target; ordinary read-only conversation does not activate AGDF or trigger additional request-driven probing. Manual/disabled technical mode stops automatic inspection but retains the deliberate manual route.
- blockers_and_visible_next_actions: Show the selected repository, incompatible format/unsafe path, missing original/reference, stale proposal, lock or host denial and exactly the applicable next action. An unavailable check is not a current/healthy result.
- recovery_paths: Read-only retry for transient inspection failures; fresh proposal after a stale state; restore original/correct reference for missing evidence; existing explicit journal recovery after interruption. Details and deferral never create journals or apply proposals.
- relevant_state_transitions: Inspection resolves unknown state; details retains effective state; later/blank/EOF defers; start opens read-only proposals; deliberate apply yields a rechecked current/partial/unresolved state; repository switching invalidates the previous selection; repetition rechecks rather than repeating completed migration.

An automatic host hook communicates the finding and available action without waiting on stdin or submitting a default. A user can deliberately start maintenance through the installed runtime's supported entry. A passive fact, a menu label, installation consent, hook trust and a maintenance selection are never an AGDF gate approval.

## 5. Acceptance Criteria

### Exact repository scope

- criterion_id: AC-001
- working_mode: automatic_inspection; manual_inspection
- source_state: Repository identity and compatibility unknown.
- trigger_action: Inspect the current supported host repository context or invoke inspection with a deliberate explicit repository path.
- expected_effective_state: Only that repository's control inventory is evaluated. Independent repositories can have different results. An absent `.agdf` or compatible inventory needs no maintenance prompt.
- visible_feedback: Concrete repository path and its own compatibility state; actionable notice only when maintenance is needed.
- blocker_failure_behavior: Missing/unreliable identity remains unavailable rather than selecting a neighboring repository or treating a host configuration directory as the project.
- recovery_next_action: Select/open the intended repository and retry its read-only check.
- observable_success_and_required_evidence: Fixtures for two distinct repositories, subdirectory context, absent/current control and invalid context prove target isolation with unchanged neighboring bytes.

### Compatibility is separate from delivery readiness

- criterion_id: AC-002
- working_mode: automatic_inspection; manual_inspection
- source_state: A valid inventory may coexist with open gates, warnings or missing delivery evidence.
- trigger_action: Produce the compatibility result and notice.
- expected_effective_state: Distinguish migration candidates, repair cases, retained historical records and unavailable checks using canonical compatibility facts. Doctor readiness/findings remain separate.
- visible_feedback: Separate migration/repair counts and concrete details; no assertion that all delivery gates are ready.
- blocker_failure_behavior: Unsupported formats, unsafe scaffold, incomplete inventory or actual integrity errors remain repair/unavailable as appropriate. Declared pending outputs remain pending under the existing recovery rules.
- recovery_next_action: Inspect details and address the named compatibility cause, or continue the existing gate/evidence route when compatibility is already current.
- observable_success_and_required_evidence: Inventory/rendering fixtures include current compatibility with blocked Doctor readiness, future format, planned outputs, missing completed evidence and inactive historical records.

### Automatic execution is read-only and permission-bound

- criterion_id: AC-003
- working_mode: automatic_inspection
- source_state: Effective automatic check permission enabled, disabled, stale or unavailable.
- trigger_action: A supported startup event.
- expected_effective_state: With effective permission, inspect and emit bounded repository facts/notice. Otherwise make no automatic repository control read and claim no check. In every case startup performs no migration, repair, gate approval or repository write.
- visible_feedback: A compatibility finding when actually inspected; unavailable/not-checked when a result is not known. No blocking terminal prompt or pre-submitted choice.
- blocker_failure_behavior: Existing technical permission and identity checks remain authoritative; failure cannot silently fall back to broader execution, another runtime or networking.
- recovery_next_action: Use the deliberate manual inspection path within the existing host permission model.
- observable_success_and_required_evidence: Hook and consent fixtures prove no-write/no-journal/no-stdin-wait behavior and disabled/stale-consent abstention; fresh-host observation is separately classified.

### Repository changes require fresh binding

- criterion_id: AC-004
- working_mode: automatic_inspection; manual_inspection; guided_maintenance
- source_state: A notice, result or proposal belongs to repository A.
- trigger_action: Move to repository B and enter a supported startup or deliberate repository-oriented action.
- expected_effective_state: Reinspect B; A's result and selection cannot authorize B. A maintenance action binds the displayed absolute target and revalidates the selected state before mutation.
- visible_feedback: B's path and fresh need, or a request to recheck the intended target when binding is stale.
- blocker_failure_behavior: A mismatched target/proposal is rejected without redirecting writes; no cache is treated as authority across repositories.
- recovery_next_action: Obtain a fresh result/proposal for the intended repository.
- observable_success_and_required_evidence: Target-switch and stale-selection fixtures prove no writes to the unselected repository and correct notices after reentry.

### Deliberate 1/2/3 maintenance choice

- criterion_id: AC-005
- working_mode: manual_inspection; guided_maintenance
- source_state: Migration or repair is required for the displayed repository.
- trigger_action: Choose `1. Migration and repair`, `2. Later`, `3. Details`, blank input or EOF.
- expected_effective_state: Choice 1 starts guided maintenance/read-only proposals; 2/blank/EOF defer; 3 shows details and returns to the same applicable choices. No prior repository choice, generic assent or absent response is a selection.
- visible_feedback: Path, distinct need and concise choices. Before writes, show affected runs, backup behavior, historical approval reset consequences and concrete repair proposals; avoid redundant per-run confirmations where one reviewed batch suffices.
- blocker_failure_behavior: Invalid input gives concise guidance without choosing a default. Details/deferral/search write no run state or journal.
- recovery_next_action: Make a deliberate valid choice or return later to a fresh inspection.
- observable_success_and_required_evidence: English/German choice and rendering fixtures cover 1/2/3, repeat details, invalid input, blank/EOF and immutable read-only callbacks.

### Canonical migration and approval consequences

- criterion_id: AC-006
- working_mode: guided_maintenance
- source_state: Eligible legacy runs have reviewed source/revision/artefact snapshots.
- trigger_action: Deliberately apply the displayed migration batch for this repository.
- expected_effective_state: Use existing canonical recovery semantics, preserve original snapshots and invalidate historical approvals without independent provenance. Leave declared pending outputs and outstanding host evidence unfinished. Do not mutate unselected runs or invent retrospective approval/evidence.
- visible_feedback: Affected run count, reset consequence before application, completed changes and backup references afterward.
- blocker_failure_behavior: A stale or invalid candidate is rejected at its existing boundary. Unresolved repair cases do not imply authority for migration or prevent valid independently selected candidates from completing where existing policy permits.
- recovery_next_action: Recheck stale cases or follow named repair input; resume the ordinary approval sequence for migrated runs.
- observable_success_and_required_evidence: Existing recovery/installer regression cases plus direct runtime invocation prove locks, snapshot binding, backups, approval reset and preservation of unrelated/pending state.

### Repair only from reviewed provable sources

- criterion_id: AC-007
- working_mode: guided_maintenance
- source_state: Repair cases may have verified originals or unresolved evidence.
- trigger_action: Search for proposals, review details and deliberately apply available proposals.
- expected_effective_state: Reuse the existing validated checkpoint/exact Git-path proposals and their canonical writers. Search is read-only; applying is separately selected for concrete proposals. Missing originals or invalid references stay named required input.
- visible_feedback: Exact repository/run, proposal kind, selected source/difference, backup/reset consequence and required inputs for unresolved cases.
- blocker_failure_behavior: Do not blindly reseal changed content, manufacture observations, accept damaged journals, follow unsafe/symlink sources or treat Git history as approval provenance.
- recovery_next_action: Restore/correct the specified original/reference deliberately, then recheck; defer without mutation when no valid proposal exists.
- observable_success_and_required_evidence: Checkpoint, Git, nested-root, tamper, missing-original, placeholder and symlink tests retain their existing assertions and are exercised through the direct maintenance path.

### Conflicts, interruption and repetition remain local

- criterion_id: AC-008
- working_mode: guided_maintenance
- source_state: A reviewed proposal is ready, applying, interrupted or already completed.
- trigger_action: Apply, encounter contention/source change/interruption, or repeat maintenance.
- expected_effective_state: Revalidate target, source and artifacts; preserve canonical locks, atomic writes and original backups. Repetition does not add a needless revision or repeat completed migration. Partial completion is reported per run.
- visible_feedback: Current result, conflict or pending recovery, preserved backup and the exact permitted retry/resume action.
- blocker_failure_behavior: Reject stale/newly unsafe targets and conflicting files; rollback only files still owned by the current operation. Do not overwrite concurrent edits or hide an interrupted operation as success.
- recovery_next_action: Reinspect/review a new proposal, retry after the lock is released or use the existing explicit transaction recovery.
- observable_success_and_required_evidence: Fault injection before/after state rename and journal completion, concurrent file changes, planned-file appearance, lock contention and idempotent repeat tests.

### Direct entry through installed runtime

- criterion_id: AC-009
- working_mode: manual_inspection; guided_maintenance
- source_state: AGDF runtime is installed; this repository has maintenance need.
- trigger_action: Invoke its supported repository maintenance entry with the displayed target.
- expected_effective_state: Inspect/migrate/repair using the shipped runtime and existing shared owners without invoking plugin installation, registry/package download, MCP configuration or host permission mutation. Ordinary JSON/noninteractive inspections are read-only; any supported noninteractive write must require an expressly selected reviewed target-bound operation.
- visible_feedback: A usable local entry and its result, or a concrete unavailable/permission reason when the profile cannot execute it.
- blocker_failure_behavior: A missing/incomplete runtime or native host denial does not trigger a broad runtime search, reinstall or permission bypass.
- recovery_next_action: Use the documented permitted manual path or obtain the existing narrowly scoped native permission; report unsupported profiles honestly.
- observable_success_and_required_evidence: Execute the generated runtime in isolated repository fixtures without installer dependencies, network or host configuration writes; classify installed/fresh-host evidence separately.

### Rechecked results are actionable

- criterion_id: AC-010
- working_mode: manual_inspection; guided_maintenance
- source_state: Maintenance has completed, partially completed, failed or been deferred.
- trigger_action: Return a final result or repeat inspection.
- expected_effective_state: Reinspect actual repository compatibility. Current, partial, still-required and unavailable outcomes reflect completed operations and remaining causes; deferral claims no changes.
- visible_feedback: Path, actual migrated/repaired outcomes, backup/reset information where applicable, unresolved originals/diagnostics and one applicable next action. A transient unavailable check exposes read-only retry.
- blocker_failure_behavior: Unresolved repair or failed verification cannot render complete success; generic Doctor blockers cannot turn a current inventory into a compatibility failure.
- recovery_next_action: Follow the named original/reference/journal recovery, retry inspection, or return to ordinary repository work when compatibility is current.
- observable_success_and_required_evidence: Mixed success/failure, no-source, deferred, current-after-repeat and unavailable fixtures verify text and structured results against reinspection.

### Localized and bounded presentation

- criterion_id: AC-011
- working_mode: automatic_inspection; manual_inspection; guided_maintenance
- source_state: Repository language and compatibility state are resolved or unavailable.
- trigger_action: Present notice, choices, proposals, details and result.
- expected_effective_state: English/German copy communicates equivalent scope and consequences. Supported locale fallback uses existing semantics. Startup summaries are bounded; full per-run details are available deliberately.
- visible_feedback: Plain repository-facing language and 1/2/3 labels; the exact target remains identifiable, and required causes/paths are not lost by compaction.
- blocker_failure_behavior: Missing locale/state data gives the existing honest unavailable/fallback behavior; it does not suppress the actionable problem or interpret diagnostic/file content as execution instructions.
- recovery_next_action: Open details or retry/select the permitted manual route.
- observable_success_and_required_evidence: Render every relevant state/menu in both locales, include a large inventory and paths with spaces, and compare actual output to canonical results.

### Installer parity and honest cross-host evidence

- criterion_id: AC-012
- working_mode: automatic_inspection; manual_inspection; guided_maintenance
- source_state: Installer and full-runtime host profiles consume the same maintenance capability.
- trigger_action: Inspect/apply through installation or the direct repository path and generate existing host packages.
- expected_effective_state: Canonical compatibility, migration and repair rules have one shared implementation; installation retains its additional selected-repository check. Generated supported profiles contain the needed runtime dependencies, preserve provenance/version/consent guards and report unsupported execution honestly.
- visible_feedback: Same repository meaning and explicit evidence boundary across supported surfaces. Package/source/fixture success does not claim fresh Codex, Claude, Copilot, OpenCode, Linux or Windows observation.
- blocker_failure_behavior: Payload/integrity drift or missing execution support remains a concrete validation/support gap, not a weaker guard or inferred parity.
- recovery_next_action: Correct the named package/integration problem or obtain separately authorized direct host evidence.
- observable_success_and_required_evidence: Installer/direct-path parity, complete profile builds, minimum dependency/inventory checks, runtime integrity positives/negatives and a separately recorded fresh Codex UAT lane; other host/OS lanes remain explicitly unverified until observed.

## 6. Non-Goals

- Search or maintain unrelated repositories; infer a governance target or run approval from cwd, plugin installation or a passive notice.
- Add a parallel compatibility state store, gate, policy classifier, approval owner or second maintenance implementation.
- Synthesize missing original evidence, historical approval authority or host observations.
- Change existing control-state format, approval formula, provenance/trust rules or recovery transaction policy.
- Publish, deploy, reinstall the plugin, configure MCP, broaden native permissions or perform VCS actions automatically.
- Claim unsupported/fresh host or platform parity from repository fixtures.

## 7. Users And Roles

Arndt Gold owns this product requirement and PRD approval. A repository user decides whether to start, defer, inspect details or apply reviewed maintenance. AGDF reports factual compatibility and executes only the supported selected maintenance operation. Existing native host permission remains authoritative for technical execution; exact AGDF gate approvals remain independently bound to target, run, gate, revision and presented artefact.

## 8. Constraints

Preserve the existing request-activation boundary, technical automatic-check consent, exact runtime/version/provenance identity, supported profile constraints, contained-path rules, locks, snapshots, private backups and atomic writers. Use existing localization and maintenance policy owners. Ordinary conversation is not permission to probe repositories. Startup must be read-only, bounded and non-blocking; changing executable content must follow existing consent renewal rules. Preserve the substantial authorized work already present in this checkout and keep this run's acceptance distinct from historical recovery runs.

## 9. Evidence Requirements

QA must consume the stable criterion chain through SD and TP, actual source/diff and generated package evidence, existing migration/repair negatives, two-repository isolation, read-only consent/hook observations, localized rendered output and direct generated-runtime execution. Source/package/fixture, installed-runtime and fresh host/model evidence are separate lanes. A fresh Codex check/UAT observation is a delivery evidence obligation; other host/OS support claims remain bounded by whatever is actually observed. Validation must not modify real approvals or use historical run success as proof of the new integration.

## 10. Risks And Open Questions

The current assistant is installation-bound and must not drag plugin installation dependencies into the standalone validator. Host startup/context capabilities differ; unsupported or disabled automatic checking needs an honest manual path. Notice and selection transport must preserve exact repository identity and handle spaces/special characters. Large inventories and transient errors must not create an unreadable startup dump or silent healthy result. Concrete module placement, entry grammar, typed schema and execution/evidence plan remain downstream decisions with named owners below; no unresolved product question blocks this PRD.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Per-repository need versus global plugin installation | before_prd | resolved | Diagnose only the selected repository; use globally supplied runtime tools; no reinstall required. Approved UR sections 2, 3 and 5 and direct user direction. | Arndt Gold, PRD owner |
| User choice and application consequences | before_prd | resolved | Offer 1 maintenance, 2 later, 3 details; starting allows read-only proposals, with reviewed scope/backups/reset and deliberate application before writes. Blank/EOF and passive facts never consent. | Arndt Gold, PRD owner |
| Automatic entry and unchanged technical authority | before_prd | resolved | Use existing effectively permitted startup/repository entry checks; disabled/unavailable checking has the deliberate manual path. No background search, blocking hook input, broadened permissions or gate authority. | Arndt Gold, PRD owner |
| Missing originals and historical approvals | before_prd | resolved | Existing canonical proof/reset and partial recovery rules remain; pending outputs and missing host observations are never fabricated. | Arndt Gold, PRD owner |
| Delivery and support boundary | before_prd | resolved | Source/generated profiles, EN/DE, regression and separate fresh Codex evidence; no automatic publication/install/host changes or expanded other-host/native-Windows claims. | Arndt Gold, PRD owner |
| Shared module owner, direct entry grammar and typed result/facts | later_sd | deferred | SD specifies one shared maintenance implementation, thin installer/runtime adapters and the minimum runtime dependency closure while satisfying AC-001 through AC-012. | Existing CLI/runtime composition owner, Codex preparing SD |
| Invocation, conflict, generation and live-host evidence scenarios | later_tp | deferred | TP maps every criterion and SD decision to executable scenarios and separately classified host evidence; no product acceptance is deferred. | Existing Task/Test Plan owner, Codex preparing TP |

## 11. Next Step

Review this PRD and approve only with `Approval: PRD`. That permits Solution Design preparation; implementation remains unavailable until the existing SD/TP approvals and implementation-preparation prerequisites are satisfied.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Den Migrations- und Reparaturbedarf des gerade verwendeten Repositorys erkennen und dort beheben können, ohne das Plugin erneut zu installieren.
- Umfang: Schreibgeschützte Prüfung bei unterstütztem Start mit bestehender Check-Berechtigung, manueller Repository-Aufruf, verständlicher Hinweis und direkter Wartungsassistent der installierten Runtime. Installer und Runtime verwenden dieselben bestehenden Regeln.
- AC-001: Nur das konkret ausgewählte Repository prüfen; unterschiedliche Repositories erhalten eigene Befunde. Fehlender oder aktueller Kontrollbestand braucht keine Wartungsaufforderung; unklarer Kontext verlangt eine neue Zielwahl.
- AC-002: Migration, Reparatur, historische Bestände und nicht verfügbare Prüfung unterscheiden. Kompatibilität bleibt getrennt von Doctor und offenen Delivery-Gates; deklarierte ausstehende Artefakte bleiben ausstehend.
- AC-003: Automatische Prüfung nur mit wirksamer bestehender Berechtigung, ohne Writes, Journale, Gate-Freigabe oder blockierende Eingabe. Bei deaktivierter oder nicht verfügbarer Prüfung bleibt der bewusste manuelle Einstieg.
- AC-004: Bei Repository-Wechsel frisch prüfen und jede Aktion an den angezeigten Pfad binden. Vorschläge oder Auswahlen eines anderen Repositorys sowie veraltete Zustände dürfen keine Writes erlauben.
- AC-005: 1 startet die Vorschlagssuche, 2 verschiebt, 3 zeigt Details. Leere Eingabe und EOF verschieben; ungültige Eingabe wählt nichts. Vor Anwendung betroffene Runs, Sicherungen, Freigabe-Reset und konkrete Vorschläge zeigen; redundante Einzelbestätigungen vermeiden.
- AC-006: Migration verwendet kanonische Recovery, geprüfte Snapshots und Sicherungen. Historische Freigaben ohne unabhängigen Nachweis werden zurückgesetzt; ungewählte Runs, ausstehende Artefakte und fehlende Host-Belege bleiben erhalten. Ungeklärte Reparaturen bleiben sichtbar.
- AC-007: Reparatur nur aus überprüfbaren Checkpoints oder exakter Git-Pfadhistorie nach bewusster Anwendung konkreter Vorschläge. Suche bleibt lesend; fehlende Originale bleiben erforderliche Eingaben. Kein blindes Neusiegeln, erfundener Beleg oder unsicherer Symlink-Zugriff.
- AC-008: Ziel, Quellen und Artefakte vor Writes erneut prüfen; Locks, atomare Writes und Sicherungen beibehalten. Konflikte und Unterbrechungen lokal behandeln, parallele Änderungen schützen und Wiederholung ohne unnötige Revision ermöglichen.
- AC-009: Direkter Einstieg über die ausgelieferte Runtime ohne Installer, Download, MCP- oder Host-Konfigurationsänderung. JSON-Abfragen bleiben lesend; unterstützte nichtinteraktive Writes benötigen ausdrücklich ausgewählte, geprüfte und zielgebundene Aktionen. Fehlende Ausführung wird konkret gemeldet.
- AC-010: Nach Wartung tatsächliche Kompatibilität erneut prüfen und aktuell, teilweise erledigt, weiterhin erforderlich oder nicht verfügbar ehrlich anzeigen. Ergebnis nennt Änderungen, Sicherungen, offene Ursachen und den passenden nächsten Schritt; Verschieben behauptet keine Änderung.
- AC-011: Deutsche und englische Hinweise, Menüs, Vorschläge und Ergebnisse vermitteln denselben Umfang und dieselben Folgen. Startausgabe bleibt kurz; Details enthalten erforderliche Ursachen und Pfade, auch bei großen Beständen und Pfaden mit Leerzeichen.
- AC-012: Installer und Runtime behalten einen gemeinsamen Regel-Owner. Erzeugte unterstützte Profile enthalten alle nötigen Abhängigkeiten und bestehen Integritäts-/Payloadprüfungen. Quellcode-, Paket-, Fixture-, installierte Runtime- und frische Host-Nachweise werden getrennt bewertet.
- Entscheidungen: Repository-spezifische Prüfung statt globaler Bestandsannahme; 1/2/3 mit geprüften Folgen vor bewusster Anwendung; bestehende technische Berechtigung; bestehende Originalnachweis-/Freigabe-Reset-Regeln; Lieferung mit EN/DE-, Paket-, Regression- und separatem frischem Codex-Nachweis sind geklärt.
- Nachgelagerte Entscheidungen: Lösungsdesign legt gemeinsamen Modul-Owner, Aufrufgrammatik, Ergebnisschema und minimale Runtime-Abhängigkeiten fest. Aufgaben-/Testplan ordnet alle Kriterien den ausführbaren Szenarien und getrennten Host-Nachweisen zu. Kein Produktentscheid bleibt offen.
- Grenzen: Fremde Repositories warten, zweite Policy-/Freigabe-Owner schaffen, Belege erfinden, Kontrollformat oder Recovery-Regeln ändern, automatisch veröffentlichen oder installieren sowie unbeobachtete Host-/Betriebssystem-Unterstützung behaupten, gehört nicht zum Umfang.
- Freigabefolge: Approval: PRD erlaubt die Vorbereitung des Lösungsdesigns. Code-Implementierung folgt erst nach den vorhandenen SD-/TP-Freigaben und Voraussetzungen.
