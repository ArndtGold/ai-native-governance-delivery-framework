# TP: Local read-only AGDF control cockpit

Status: draft
Gate: TP
Gate approval: open
Based on: approved PRD and approved SD of agdf-control-cockpit-20261005-01
Date: 2026-10-05
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Task List

All tasks below are planned, not completed. Codex performs the implementation and verification; Arndt Gold retains product and deliberate gate decisions. Dependencies determine order, not an obligation to run parallel agents. Implementation starts only after TP approval and completed implementation-preparation Brownfield Analysis.

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Complete post-TP Brownfield preparation: audit every filesystem read reached by discovery, parser, configuration, doctor, gate evaluation, seals, relationships and proof checks; document canonical owners, default-live behavior, scoped-provider seams, affected files and dirty-workspace baseline; prove no uncontrolled live fallback is required | Codex, Core preparation | TP approval |
| T-002 | Implement immutable control capture under packages/core/lib/control-read: no-symlink regular-file reads, membership/identity/metadata/digest checks, one bounded retry, provenance, limits and later revalidation; add deterministic mutation tests | Codex, Core reader | T-001 |
| T-003 | Introduce AsyncLocalStorage read context at audited Core read helpers, preserve original target binding and live defaults, deny uncaptured target reads, and use the existing no-child inspection lane with unavailable Git evidence; add isolation, approval-integrity and evaluator parity tests | Codex, Core integration | T-001, T-002 |
| T-004 | Add Core cockpit DTO projection and registered-resource manifest under existing control-inspect ownership: inventory all lifecycle states, separate persisted/evaluated detail, opaque scoped IDs, strict text decoding and typed availability; add projection/resource fixtures | Codex, Core projection | T-003 |
| T-005 | Implement private package Node service: explicit target startup, loopback session authentication, fixed static asset manifest, four read API routes, single read worker, queue/cancellation/timeouts and shutdown; add HTTP boundary and byte-invariance tests | Codex, local service | T-004, T-008 |
| T-006 | Implement React overview/detail/document journeys, validated API client, in-memory reducer, abort/generation handling, visible five-second freshness checks, explicit reload/retry and selection recovery; add state and request-order tests | Codex, UI behavior | T-004, T-008 |
| T-007 | Implement passive Markdown and escaped JSON/text presentation, German labels, provenance, read-only banner, evaluated/persisted distinction and semantic keyboard/focus/announcement behavior; add malicious-content and accessibility scenarios | Codex, UI presentation | T-006 |
| T-008 | Create private packages/control-ui with local lockfile, exact compatible React/React DOM/TypeScript/Vite/react-markdown/remark-gfm and test dependency pins; add typecheck/build/start/test scripts, ignore dist and verify UI exclusion from public payloads | Codex, packaging | T-001 |
| T-009 | Execute new Core/service/UI suites and affected existing regressions after synchronization; review actual diff and task fulfillment, address defects and produce criterion-linked evidence for the canonical CR/QA owners | Codex, verification and review | T-002 through T-008 |
| T-010 | Document reproducible install/build/start/stop in packages/control-ui/README.md; run pointer and keyboard journeys against real repository data, compare full control-tree bytes, record browser observations, retry/stale/removal cases and local operational limits | Codex, local-use verification | T-005, T-007, T-009 |

T-008 may precede T-002 through T-004 after preparation. Dependency installation is repository-local, not a host plugin installation. Do not change approved design choices while selecting compatible versions. The existing language/config repair remains independent scope.

## 2. Verification Traceability

The approved PRD is the sole acceptance source. Rows refer to its IDs without copying acceptance prose. Every criterion/SD decision pair has a concrete scenario. Evidence paths in this table are relative to this run's artefact directory: EVIDENCE/<file>. Each planned JSON record contains scenario_id, tested source/fixture, command or browser steps, actual result, expected-result comparison, timestamp and relevant output/screenshot references. All records are absent/planned until executed; no row is a passing result.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-004 | SCN-001 | Stable captured inventory contains known active, completed and malformed entries with exact identity; Core discovery parity preserves unavailable fields | EVIDENCE/core-inventory.json#SCN-001 |
| AC-001 | SDD-007 | T-004 | SCN-002 | Absent control, unreadable subtree and genuinely empty store produce distinct absent/partial/empty results; known entries survive partial failure | EVIDENCE/core-inventory.json#SCN-002 |
| AC-001 | SDD-008 | T-010 | SCN-003 | Real overview identifies target, lifecycle and evaluation independently; invalid entries remain visible and unavailable fields stay explicit | EVIDENCE/browser-journeys.json#SCN-003 |
| AC-002 | SDD-001 | T-003 | SCN-004 | Captured and existing live Core evaluations agree on identical fixtures, approval digests/target identity and revisions; Git evidence is unavailable in the no-child lane and never eligible by invention | EVIDENCE/core-parity.json#SCN-004 |
| AC-002 | SDD-008 | T-007 | SCN-005 | Contradictory persisted prose is shown separately beneath authoritative evaluated state; approval, QA, UAT and lifecycle remain separate values | EVIDENCE/ui-status.json#SCN-005 |
| AC-003 | SDD-004 | T-006 | SCN-006 | Overview to detail to document and back retains valid target/run/version; deliberately reversed request completion cannot overwrite a later run selection | EVIDENCE/ui-state.json#SCN-006 |
| AC-003 | SDD-008 | T-010 | SCN-007 | Pointer and keyboard complete all three views; destination heading receives focus and return restores the originating control without changing run identity | EVIDENCE/browser-journeys.json#SCN-007 |
| AC-004 | SDD-003 | T-004 | SCN-008 | Only registered same-run/snapshot resources and explicitly registered related control references resolve; captured evaluator-only proofs do not become browser resources | EVIDENCE/core-resources.json#SCN-008 |
| AC-004 | SDD-005 | T-007 | SCN-009 | Registered Markdown/JSON/text show source provenance and content; script, raw HTML, forms, images and unknown/external links execute or fetch nothing | EVIDENCE/ui-documents.json#SCN-009 |
| AC-004 | SDD-007 | T-004 | SCN-010 | Missing, binary, invalid UTF-8 and over-2-MiB documents have distinct truthful results; none becomes an empty or silently truncated preview | EVIDENCE/core-resources.json#SCN-010 |
| AC-005 | SDD-007 | T-005 | SCN-011 | Injected filesystem, evaluator, worker and transport failures return bounded typed scope/retryability; internal errors, unrelated bytes and secret are absent | EVIDENCE/service-failures.json#SCN-011 |
| AC-005 | SDD-008 | T-007 | SCN-012 | Loading, empty, partial, invalid, missing, unsupported, blocked and failed views have distinguishable German feedback and an appropriate next action | EVIDENCE/ui-status.json#SCN-012 |
| AC-006 | SDD-001 | T-002 | SCN-013 | Create/delete/rename, file/ancestor replacement, same-size edits and change-then-restore during capture/evaluation/revalidation yield one coherent observation or source_changed; no live bytes enter a captured evaluation | EVIDENCE/core-mutations.json#SCN-013 |
| AC-006 | SDD-004 | T-006 | SCN-014 | Five-second checks while visible and a check after visibility return mark changed data; only explicit reload replaces content; removed run returns to inventory with explanation | EVIDENCE/ui-freshness.json#SCN-014 |
| AC-006 | SDD-007 | T-005 | SCN-015 | Snapshot replacement invalidates old IDs, concurrent readers cannot mix versions, and failed refresh retains a stale label rather than a current claim | EVIDENCE/service-freshness.json#SCN-015 |
| AC-007 | SDD-004 | T-006 | SCN-016 | Visible retry passes through progress and preserves still-valid run/document selection after transient failure; persistent failure remains explicit | EVIDENCE/ui-retry.json#SCN-016 |
| AC-007 | SDD-007 | T-005 | SCN-017 | Worker/read interruption can be retried after recovery; cancelled requests and shutdown release resources; no implicit unbounded capture retry occurs | EVIDENCE/service-failures.json#SCN-017 |
| AC-007 | SDD-008 | T-010 | SCN-018 | Browser observes error, retry, progress and recovery on the same journey; persistent failure offers repair outside cockpit and retains previous-data warning | EVIDENCE/browser-recovery.json#SCN-018 |
| AC-008 | SDD-001 | T-003 | SCN-019 | Two simultaneous provider contexts retain distinct captures/targets, live callers keep default reads, and missing captured paths fail closed; scope exits restore default reader | EVIDENCE/core-provider.json#SCN-019 |
| AC-008 | SDD-002 | T-005 | SCN-020 | Every read API/navigation/refresh/retry/error journey leaves full control-tree membership and bytes identical; mutation/approval/dispatch routes and methods are denied without Git/shell operations | EVIDENCE/read-only-tree.json#SCN-020 |
| AC-008 | SDD-004 | T-006 | SCN-021 | No approval/edit/execution controls or browser storage writes occur; full reload resets ephemeral navigation and process restart invalidates prior session | EVIDENCE/ui-authority.json#SCN-021 |
| AC-009 | SDD-002 | T-005 | SCN-022 | Wrong/missing secret, foreign/null Origin, wrong Host/port, foreign fetch site, preflight, unsupported method, invalid/missing target and public-host arguments fail closed; valid authenticated same-origin reads succeed | EVIDENCE/http-boundary.json#SCN-022 |
| AC-009 | SDD-003 | T-004 | SCN-023 | Unregistered or foreign-run/snapshot IDs, encoded/double-encoded traversal, absolute paths and file/ancestor symlink swaps expose no outside bytes and never substitute another target | EVIDENCE/core-resources.json#SCN-023 |
| AC-009 | SDD-005 | T-007 | SCN-024 | Malicious Markdown URLs, SVG/HTML/embed payloads and disguised registered links cause neither execution, remote request nor out-of-scope resource navigation | EVIDENCE/ui-documents.json#SCN-024 |
| AC-010 | SDD-006 | T-008 | SCN-025 | Local clean package installation, typecheck and build succeed with recorded exact lockfile/engine versions; dist/dependencies are absent from public CLI/plugin payloads | EVIDENCE/package-build.json#SCN-025 |
| AC-010 | SDD-007 | T-005 | SCN-026 | File-count, per-file, total-capture, document and response caps accept boundary values and reject boundary-plus-one; ten-second deadline, one-active/one-queued limit and port conflict are explicit and shutdown closes worker/listener | EVIDENCE/service-limits.json#SCN-026 |
| AC-011 | SDD-005 | T-007 | SCN-027 | Original multilingual UTF-8 documents and IDs preserve content through passive rendering/escaped text; markup interpretation does not translate source text | EVIDENCE/ui-documents.json#SCN-027 |
| AC-011 | SDD-008 | T-010 | SCN-028 | Representative normal, blocker, stale and error views use German labels/actions; unknown Core values remain unavailable with original source context | EVIDENCE/browser-language.json#SCN-028 |
| AC-002 | SDD-001 | T-001 | SCN-029 | Read-call audit identifies every reached target-control filesystem operation and its provider seam; no unresolved live fallback, copied gate rules or target rebinding remains before implementation | EVIDENCE/brownfield-preparation.json#SCN-029 |
| AC-002 | SDD-001 | T-009 | SCN-030 | Affected existing control, approval, inspection and MCP regressions pass without skipped/weakened assertions; installed-host results are distinguished from source tests | EVIDENCE/regressions.json#SCN-030 |
| AC-010 | SDD-006 | T-010 | SCN-031 | README steps reproduce local startup, real overview/detail/document journey and shutdown with explicit target; before/after control bytes match and no installation/cloud/time-saving claim is made | EVIDENCE/local-reproduction.json#SCN-031 |
| AC-009 | SDD-002 | T-005 | SCN-032 | Fragment secret is removed immediately and never appears in request URL, cookie, browser durable storage, error or request log; fixed assets reject unknown/escaped/symlink paths and carry restrictive security headers | EVIDENCE/http-boundary.json#SCN-032 |

## 3. Test Plan

### Deterministic suites and fixtures

Add executable Node tests at packages/core/test/control-read-snapshot-test.js, control-read-provider-test.js and control-cockpit-projection-test.js. Add service tests at packages/control-ui/test/service.test.mjs and UI/component tests plus actual browser scenarios at packages/control-ui/test/. The private package exposes npm test and npm run test:browser, with typecheck/build checked separately. Select and lock compatible UI/browser test dependencies during T-008; keep browser automation separate from production dependencies. Document any required local browser setup in the README.

Fixtures use disposable temporary directories, never mutate the real repository to inject failures. Build active/completed/invalid/empty/absent/partial stores, exact approved binding fixtures, contradictory persisted assertions, registered and unregistered references, strict UTF-8 and hostile content, and alternate targets with distinct sentinel bytes. Use synchronization barriers/hooks to inject mutations at capture/read/evaluation/revalidation boundaries rather than probabilistic sleeps. Include ancestor-directory swaps, symlinks and special files; unsupported platform no-follow primitives require an equivalent validated identity strategy or explicit denied result, never an unchecked read.

Provider tests enumerate the audited read graph and deliberately deny any uncaptured path. Compare existing and scoped results with original target identity and the same no-child evidence policy; do not compare unavailable Git eligibility with an invented pass. Test AsyncLocalStorage concurrency, thrown exceptions and scope teardown. Ensure request DTO validation rejects malformed/unknown versions and stale responses before UI state publication.

Resource boundaries are exactly the SD limits: 20,000 files, 256 MiB aggregate, 32 MiB captured file, 2 MiB preview, 8 MiB serialized response, ten-second operation deadline, one active worker job plus one waiting request and at most one internal capture retry. Use actual small boundary fixtures for preview/response and parametrized accounting tests plus representative large capture integration for aggregate limits, avoiding unnecessarily allocating every worst-case combination. Verify encoded bytes, not string character count. Record which boundaries were exercised end to end versus accounting/clock injection. Cancellation/deadline tests must demonstrate worker termination or bounded resource release and subsequent service recovery.

For passive rendering, observe script/dialog/navigation and network activity, including CSS URLs, image URLs, javascript/data schemes, raw HTML, embedded frames, SVG, Markdown autolinks and registered-reference impersonation. Expected remote requests are zero. Verify only the same-origin approved asset/API requests occur and that CSP is actually returned by the built server. Header/auth tests exercise missing Origin with and without secret as well as exact allowed Origin. Denials remain bounded and leak no sentinel bytes.

### Commands and evidence capture

After TP approval and preparation, run these commands from repository root and save exact command, runtime version, exit status and relevant output in the scenario evidence records. New test paths/scripts are deliverables, not presently existing or passing commands.

```text
npm --prefix packages/control-ui ci
npm run sync-package-assets
npm --prefix packages/control-ui run typecheck
npm --prefix packages/control-ui run build
node packages/core/test/control-read-snapshot-test.js
node packages/core/test/control-read-provider-test.js
node packages/core/test/control-cockpit-projection-test.js
npm --prefix packages/control-ui test
npm --prefix packages/control-ui run test:browser
npm --prefix packages/cli run test:control-state
npm --prefix packages/cli run test:control-command
npm --prefix packages/cli run test:control-inspect
npm --prefix packages/cli run test:interaction-presentation
npm --prefix packages/cli run test:verified-change
npm --prefix packages/cli run test:plugin-mcp-runtime
npm --prefix packages/cli run test:runtime-integrity-layout
npm --prefix packages/cli run test:runtime-integrity-negative
npm --prefix packages/cli run test:payload-budget
npm --prefix packages/cli run test:package-contents
git diff --check
```

Read-helper audit can add directly affected existing tests; explain additions by the actual call graph. Synchronize assets before tests that inspect generated/runtime copies. Build package payload through existing tooling if required by its content tests and inspect that UI dist/node_modules are excluded; do not publish, bump version, install plugins or replace the active runtime. Type/build engines must satisfy Core Node 22+ and selected Vite minimum, including Node 22.12+ in that line. Existing platform checks remain applicable where supported; local source success does not prove another OS or fresh host integration.

### Browser and real repository evidence

Start the built service with npm --prefix packages/control-ui run start -- --dir /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework. Record selected target, Node/dependency versions, port and shutdown result without copying the session secret into evidence. Observe all three journeys with real canonical data, verify selected IDs/revision/observed version, inspect registered documents, read-only indication, German feedback, focus and narrow/wide responsive views. Screenshots and concise observation records support behavior; component tests alone do not replace this evidence.

Before starting and after stopping, enumerate every .agdf/control entry and hash every regular file; compare membership, file type and bytes. Do not run approval/recording/control-writing commands during this observation window. Write comparison outputs to a temporary directory outside the selected control tree, and persist the completed evidence only after the comparison window closes. Any external concurrent change invalidates the clean invariance claim: record it and repeat in a stable window rather than attribute it to the cockpit or silently ignore it. Failure/stale/removal injection occurs in disposable fixture repositories. Compare real-data detail with an explicitly read-only Core report at the matching source version.

### Review and readiness

T-009 reviews the actual diff for defects, security boundary bypass, duplicate owners and missing task/scenario evidence. Complete mandatory CR and task-plan fulfillment evidence using their existing owners after CD+Tests, then route the canonical QA report through qa-gate. Tests do not decide final QA. Leave any unavailable browser/platform/package check explicitly unverified; a required gap prevents a full readiness claim. No implementation or readiness evidence is claimed by this TP.

## 4. Brownfield Scope

Reuse discovery, parser, configuration/language resolution, evaluation, approval/seal/relationship checks, no-child inspection behavior and canonical resource ownership. Add disposable observation/projection behavior without creating another rule engine. T-001 names all actual Core read sites before changing them; T-003 preserves default-live behavior and isolates scoped readers from approval/mutation paths. Scope includes necessary Core read helpers, new Core read/projection/tests, private packages/control-ui, its README/lockfile/tests and narrowly necessary ignore/build-boundary integration. Public API/schema/gate meaning and existing control files remain governed by their current owners.

Capture read-only git status/diff and relevant source digests before implementation to distinguish the already present independent language/config changes. Do not revert, stage, commit or overwrite that work. Existing asset synchronization may project both pre-existing and new canonical changes; record provenance and review rather than claiming every generated delta belongs to this run. If actual implementation needs a conflicting owner, public contract change or different approved architecture, use the existing source-revision route before proceeding.

## 5. Out Of Scope

Editing or submitting approvals through the browser; run creation, gate advancement, agent/Git execution, second persistent database, browser durable storage, remote/cloud deployment, public release or host installation, MCP App embedding, binary preview, blanket repair/migration and implementation of the independent language/config fix. Reading evidence does not grant these operations.

## 6. Risks And Blockers

The principal risk is incomplete reader coverage: T-001/T-003 must prove the effective read graph, including existence/directory/stat/digest access, not only direct readFile calls. A missing provider seam or unavoidable live fallback is a blocker requiring correction or approved design revision. Concurrent mutation tests cannot prove a cross-process transaction; report the bounded observed interval and preserve changed-state detection.

The real control tree has approximately 52 MiB from prior design inspection; this is capacity context, not a benchmark. Worker/capture bounds and real startup observations must be measured. Large or malformed individual resources must retain truthful availability without a permissive evaluation. Dependency resolution, engine validation and test tool setup belong to T-008 and are recorded before implementation verification; an incompatible choice is replaced within the approved library architecture rather than silently raising supported prerequisites.

Other risks are token leakage in browser tooling/evidence, unsafe renderer defaults, symlink/ancestor races, stale request publication, generated payload drift and unavailable real-browser automation. Each has an explicit scenario above. No open product or architecture decision is delegated to implementation. Arndt Gold owns any necessary scope/design decision; Codex owns completion of planned evidence and disclosure of remaining gaps.

## 7. Next Step

Present the bound TP for a new deliberate Approval: TP. After valid TP approval, complete T-001 Brownfield preparation and follow the canonical route to CD+Tests. This draft does not authorize implementation, commit, installation or release.

## AGDF Approval Summary (de; source=en)

- Ziel: Zehn geplante Aufgaben führen zum lokalen, rein lesenden Cockpit mit Übersicht, Run-Detail und Dokumentansicht. Die freigegebenen PRD- und SD-Fassungen bleiben die Grundlage; es wird keine weitere Abnahmeliste eingeführt.
- Reihenfolge: Nach TP-Freigabe zuerst Brownfield-Vorbereitung und vollständige Prüfung der Core-Lesewege. Danach festgehaltener Datenstand, isolierter Lesekontext, Core-Projektion und erlaubte Dokumentressourcen, lokaler Dienst sowie React-Bedienung. Paketgrundlage und kompatible Abhängigkeiten werden nach der Vorbereitung eingerichtet.
- Zuständigkeit: Codex übernimmt Umsetzung und Prüfungen; Arndt Gold behält Produkt- und Gate-Entscheidungen. Bestehende Core-Owner behalten Kontrollinterpretation, Freigaben und Schreiboperationen. Die separate Sprachkorrektur bleibt außerhalb dieses Runs und wird nicht überschrieben.
- Umfang: Private React-/TypeScript-/Vite-Anwendung, notwendige Core-Leseanpassungen, Tests und lokale Startdokumentation. Alle elf PRD-Kriterien und acht SD-Entscheidungen sind über 32 stabile Szenarien mit Aufgaben, beobachtbaren Ergebnissen und konkreten Evidenzorten verknüpft.
- Datenprüfung: Core-Parität einschließlich Zielidentität und Freigabebindungen, vollständige Reader-Abdeckung, parallele Lesekontexte und absichtliche Änderungen während Erfassung, Auswertung und Nachprüfung. Fehlende erfasste Dateien dürfen keinen Rückfall auf Live-Daten auslösen. Git-Nachweise bleiben im Browser-Lesepfad ausdrücklich nicht verfügbar.
- Sicherheitsprüfung: Sitzungsschlüssel, genauer Loopback-Host und Ursprung, Methoden, feste Asset-Liste, registrierte Ressourcen, fremde IDs, Pfadmanipulationen und Symlink-/Verzeichnistausch. Passive Dokumentdarstellung muss aktive Inhalte und fremde Netzaufrufe verhindern; der Schlüssel darf nicht in Logs oder Evidenz gelangen.
- Bedienprüfung: Übersicht, Detail, Dokument und Rückweg mit Maus und Tastatur; passende Fokusführung, deutsche Hinweise, Originalquellen, verspätete Antworten, Fehler/Wiederholen und sichtbar veraltete Inhalte. Änderungen erscheinen erst nach bewusstem Neuladen; entfernte Auswahl wird erklärt.
- Grenzenprüfung: Die freigegebenen Datei-, Speicher-, Vorschau-, Antwort- und Zeitlimits werden einschließlich Grenzwert und Überschreitung geprüft. Ein Worker, eine wartende Anfrage, begrenzter Erfassungsretry, Abbruch und sauberes Beenden bleiben verbindlich. Teilweise synthetische Grenzprüfungen werden von echten Integrationsnachweisen unterschieden.
- Unveränderlichkeit: Alle Kontrolldateien und die vollständige Dateimenge werden vor und nach Browser-Nutzerwegen verglichen. Prüfprotokolle entstehen währenddessen außerhalb des Kontrollbaums; Evidenz wird erst anschließend gespeichert. Gleichzeitig beobachtete externe Änderungen erfordern einen neuen stabilen Prüfzeitraum.
- Lokalbetrieb: Lockfile und Node-/Vite-Voraussetzungen dokumentieren, Typprüfung und Build ausführen, vorhandene Core-/CLI-/MCP-/Integritäts-/Payload-Prüfungen prüfen und den echten Repository-Nutzerweg reproduzieren. UI-Dateien und Abhängigkeiten dürfen nicht im öffentlichen Plugin-/CLI-Payload landen. Kein Host-Installations-, Veröffentlichungs- oder Zeitersparnisnachweis wird behauptet.
- Risiken: Unvollständige Reader-Abdeckung, Races, aktive Dokumente, Geheimnislecks, veraltete Antworten und Paketdrift sind ausdrücklich prüfpflichtig. Nicht verfügbare notwendige Nachweise bleiben offen; Änderungen an freigegebenem Verhalten benötigen die bestehende Revisionsroute.
- Entscheidungsgrenze: Dieser Plan enthält geplante Prüfungen, noch keine bestandenen Implementierungs- oder Browserergebnisse. TP-Freigabe erlaubt Brownfield-Vorbereitung und anschließend Umsetzung gemäß aktuellem Kontrollpfad. Code Review und die abschließende QA-Entscheidung folgen ihren bestehenden Ownern.
