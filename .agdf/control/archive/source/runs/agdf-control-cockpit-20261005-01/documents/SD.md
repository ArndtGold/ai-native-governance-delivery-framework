# SD: Local read-only AGDF control cockpit

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD
Date: 2026-10-05
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Build a private local package at packages/control-ui containing a React/TypeScript frontend, a Node HTTP adapter, local build/start commands and tests. Extend the existing Core reading boundary with a scoped immutable read view and cockpit projection service. Existing Core parsers, doctor, gate-check, seals, readiness and relationship evaluators continue to determine control meaning. The browser never parses governance Markdown to decide a gate.

Flow: deliberate local startup binds a canonical repository target; Core captures and validates control input bytes; existing evaluators read those bytes through the scoped read context; Core returns an inventory, selected-run projection and registered-resource manifest with snapshot provenance. The HTTP adapter authenticates each API request and mediates its bounded selectors. React renders three linked views and explicit loading/error/stale/recovery states.

No source files are implemented by this document. The design preserves all eleven approved PRD criteria; task planning and runtime evidence follow a separate SD decision.

## 2. Ownership And Source Of Truth

| Concern | Owner and intended location | Source/reuse boundary |
|---|---|---|
| Persisted state and approval evidence | Existing .agdf/control run and artefact files | Unchanged formats and approval authority |
| Governance interpretation | Existing packages/core/lib/control-evaluation and control-state | Reuse policy, parser, discovery, seal and relationship logic; no copied rule matrix |
| Captured read context and source containment | Core read owner, new modules beneath packages/core/lib/control-read/ | Extend existing contained-file and control-read-boundary behavior with captured bytes and metadata |
| Cockpit DTO projection | Core read owner, new service beneath packages/core/lib/control-inspect/ | Existing evaluations supply meaning; new projection supplies stable bounded browser data |
| HTTP session, request validation and static assets | packages/control-ui/server | No governance policy, writers, shell/Git execution, MCP dispatch or target-changing endpoint |
| Navigation, state display and safe document rendering | packages/control-ui/src | DTO consumption, localization and view state only |
| Product acceptance | Approved PRD.md | UX analysis is subordinate; this SD maps rather than duplicates its acceptance |
| Packaging | Private packages/control-ui package and lockfile; existing Core projection build | Local application is excluded from public CLI/plugin/MCP payloads; generated Core assets follow existing build owners |

The previously authorized language/config fix remains a separate workspace change and is not silently incorporated, reset or committed as cockpit work.

## 3. Architecture Decisions

- SDD-001: Core captures an immutable in-memory read view and evaluates it through a request-scoped read context; rationale: independent live file reads can mix versions and temporary-directory mirrors would change target identity and approval bindings; consequence: participating Core read helpers must accept the scoped provider while default live CLI/MCP behavior stays unchanged and parity is tested.
- SDD-002: Use one loopback HTTP origin, a per-process random session secret and strict request validation; rationale: local filesystem data must not become available to unrelated browser origins or DNS-rebinding requests; consequence: browser reload needs the current startup session link and service restart invalidates the old secret.
- SDD-003: Core issues opaque IDs only for registered, contained control resources and denies browser-supplied filesystem paths; rationale: repository-wide containment alone would expose unregistered files; consequence: outside-control, missing, unsupported and denied references stay visible as bounded unavailable states rather than becoming arbitrary file access.
- SDD-004: Keep selected view, run/document selection, request generation and stale/previous content in React memory with a small explicit state reducer; rationale: navigation and retry must preserve identity without a second durable workflow store; consequence: full browser reload resets navigation and reads a new snapshot, with no localStorage, IndexedDB, service worker or URL-based document/target state.
- SDD-005: Render Markdown with react-markdown using raw HTML disabled and restrictive component/link handling, and JSON/text as escaped source text; rationale: local documents are untrusted display input; consequence: scripts, iframes, forms, embedded images and remote resources are inert or omitted, and only registered links become internal document actions.
- SDD-006: Use a private React/TypeScript/Vite package whose built assets are served by the same Node adapter; rationale: the cockpit is a local application rather than the public Astro site or a new installed MCP surface; consequence: explicit local install/build/start is required, with a package-local lockfile and no public package/release or host-install change.
- SDD-007: Bound capture, evaluation, API output and document preview, and return typed error/recovery states; rationale: a local reader must not exhaust resources or represent failures as successful emptiness; consequence: oversized inputs explicitly fail or show limited preview, while stable known metadata remains distinguishable from missing content.
- SDD-008: Project evaluated and persisted state separately, localize interface labels/actions through existing Core presentation catalogs where available, and make keyboard/focus navigation explicit; rationale: source fidelity and human authority must remain visible across all three views; consequence: unknown codes are shown as unavailable with source identity rather than translated into invented status, and original document language remains unchanged.

## 4. Integration Points

### Core capture and evaluation

Create a read-only capture boundary for the selected canonical target. Reuse run-state-reader.discoverRuns for inventory semantics, parseRunState/parseControlState for registered artefacts and existing evaluator functions for gate/doctor meaning. Completed runs use the same explicit run selector as active runs; invalid discovery results remain inventory entries with diagnostics rather than being dropped by the all-active filter.

The capture enumerates .agdf/control, rejecting symlink/special-file traversal and retaining directory membership, regular-file identity and byte digests. Open regular files without following links where supported, verify descriptor/path identity before and after reads, and validate ancestor identities. On platforms without O_NOFOLLOW, descriptor/ancestor identity and real containment remain mandatory. A second enumeration/read validates membership, identity, size, high-resolution modification/change metadata and digests. Mutation or unreadable input invalidates the capture; perform at most one internal retry, then expose changed/unavailable. No new snapshot is silently treated as empty.

The immutable view contains original canonical target identity, captured bytes, captured metadata, inventory quality and a digest over sorted path/digest/membership data. It also records captured_at and observed_as_of timestamps. These are observation provenance, not durable run revisions or approval attestations. Run revisions and source digests remain separate fields. Source changes after observation are possible; the interface says when its data was observed and never claims to lock future updates.

Extend the existing read owners with a provider that supplies captured readFile, exists, directory enumeration, stat and realpath semantics for the selected target. Thread it through a scoped Core read context; use AsyncLocalStorage for isolation, with a live provider as the existing default. Do not monkey-patch Node fs, switch a global target or copy evaluator code. Every filesystem read used by the cockpit evaluation—including config, discovery, seals, binding proof, revision history and related-run reads—must pass this boundary. An uncaptured target-path read fails closed; it never falls back to the live filesystem. Generated immutable runtime/catalog resources are loaded separately through the existing resource binding. The provider has no write operations.

The original target root is retained throughout evaluation, including resolveControlCommandTarget and binding/seal checks. This avoids misrepresenting a temporary mirror as the approved repository. Git-derived verified_change observation is explicitly unavailable in this browser adapter, matching the existing no-child-process inspection lane; never synthesize eligibility or approval from absent Git evidence. Surface the canonical diagnostic/limitation.

Before returning a current response for an existing snapshot ID, revalidate captured source membership, identity and digests against the bound target. A mismatch returns changed with no new current result under the old ID. React retains the old view only as stale and offers explicit reload. A bounded five-second freshness check compares versions without replacing displayed content automatically; suppress checks while the document is hidden, and check on return to visibility. New source data is loaded only by explicit reload/retry. A selection/document operation also revalidates the current snapshot. This is an observed immutable view, not a claim of a cross-process filesystem transaction or continuous freshness.

### Browser DTO and endpoints

The internal contract is version 1, private to this local package. Responses contain schema_version, target identity/display path, snapshot_id, observed_as_of, typed availability/error code and retryability. Inventory entries have run_id, title/objective where available, lifecycle, revision_id, validity and normalized Core-supplied status. Detail carries evaluation, persisted assertions, diagnostics, recorded approvals, missing evidence, permitted-action description and resource manifest. Do not serialize runtime closures, Maps, absolute private paths beyond the explicit target/control provenance, session secret or machine-internal errors.

Serve GET /api/snapshot, GET /api/runs/:runId? snapshot=<id>, GET /api/documents/:resourceId? snapshot=<id>, and GET /api/freshness? snapshot=<id> (actual queries omit spaces). No API accepts a filesystem path, alternate target or approval response. GET /api/snapshot captures/replaces the one current in-memory session view; replacing it invalidates older IDs so concurrent browser views get changed/stale rather than mixed data. Document IDs are scoped to target/run/snapshot and looked up in the Core manifest. Other methods/routes are denied. Expected errors use structured data: control_absent, inventory_partial, invalid_run, run_removed, document_missing, document_unsupported, resource_denied, source_changed, read_failed, resource_limit, session_invalid.

### Session and network boundary

The start command requires --dir, resolves and binds it once, rejects invalid roots and never falls back to cwd/another repository. Bind only 127.0.0.1, use an OS-assigned port by default and permit an explicit --port with normal range/conflict validation. Never accept a public host override. Print the selected target and startup address without launching a browser automatically.

Generate a cryptographically random 256-bit per-process secret. Put it in the fragment of the startup link; React consumes it once into memory and immediately removes the fragment through history.replaceState. It is never sent as query/path/cookie, persisted, reflected in an error or logged in requests. Each API request sends it in a dedicated header; compare it safely. The startup link itself is deliberately shown only to the local user. A stale/missing secret requires reopening the current startup link.

Validate the exact numeric loopback Host/port for every request, reject foreign/null Origin and foreign Sec-Fetch-Site, allow only the exact service origin when Origin exists, and require the secret on all API requests even if Origin is absent. Send no CORS permission and reject preflight/foreign requests. Serve only built static paths from a fixed assets manifest, not arbitrary paths; disallow symlink/escape and unknown routes. Use no-store for API/bootstrap, no-referrer, nosniff, frame-ancestors none and a restrictive CSP allowing local external scripts/styles and same-origin fetch, with no object/frame/form/remote image execution. No raw control files are static assets.

### Resource and document boundary

The browser manifest is derived from the selected run's Artefacts rows and explicitly registered related control resources. Resolve Markdown references against that manifest using canonical normalized control-relative paths. Never expand a document link into a general repository read or fetch remote data. Core evaluators may need captured control history/proof files; that does not automatically grant those files browser visibility.

Documents decode as strict UTF-8. Markdown uses the constrained renderer, JSON/text use escaped preformatted content. Disable raw HTML, executable embeds, forms and resource-loading elements; substitute images with inert descriptions. Render unknown/external links as text with source information; permitted registered links navigate via opaque manifest IDs. A supported text preview limit is 2 MiB. Larger text has an explicit too-large state with source identity; unsupported binary files show provenance and format explanation. No content is truncated into an apparently complete preview.

### UI state and local startup

Use Overview, RunDetail and DocumentView components with shared TargetContext/ReadOnlyBanner, StatusFields, Provenance and ReadState feedback components. An API client validates the versioned DTO, includes the session header and uses abort signals/request sequence IDs. Older completions cannot overwrite a newly selected run. Reducer states distinguish idle/loading/available/empty/partial/invalid/missing/unsupported/blocked/stale/error. Navigation stores only in-memory identity and scroll/focus context. Set focus to the destination heading on view change, restore appropriate originating control on return and announce loading/errors through aria-live. Use semantic buttons/links and responsive layout; do not introduce approval/edit/execution controls.

Use a package-local dependency lockfile for React, React DOM, TypeScript, Vite, react-markdown and remark-gfm plus test dependencies. Select compatible exact resolved versions during TP implementation, without changing these architectural choices. Node runtime follows Core's Node 22+ baseline; the cockpit build/start requirement is Node 22.12+ in the 22 line or a supported newer line satisfying the chosen Vite engine. Recheck engine declarations when pinning dependencies.

Planned reproducible commands: npm --prefix packages/control-ui ci; npm run sync-package-assets; npm --prefix packages/control-ui run build; npm --prefix packages/control-ui run start -- --dir <explicit-repository>. Shutdown uses the process signal and releases memory/listener. Build output is ignored at packages/control-ui/dist. Core's generated/runtime assets follow existing synchronization and payload validation; the React bundle and UI dependencies are not inserted into public plugin/CLI payloads.

## 5. Constraints And Compatibility

Existing live Core callers retain their default reader and gate behavior. The scoped captured reader is selected only by the new read service and never used by approval/mutation operations. Reuse configuration and locale resolution; the browser does not change config.json. No run/schema migration, second database, snapshot disk cache or durable browser state is introduced. Capture buffers are disposable observations, not a parallel source of truth. No temp control mirror or provider fallback can invent target identity or approval provenance.

Limits: at most 20,000 captured files, 256 MiB total bytes, 32 MiB per captured file, 2 MiB per displayed document, 8 MiB serialized API response and 10 seconds per capture/evaluation operation. Use one worker for read capture/evaluation, at most one running operation and one waiting request, with request cancellation/shutdown and typed busy/timeout errors; do not spawn shell/Git children. The current inspected control tree is approximately 52 MiB, so the total byte limit accommodates it without asserting a performance benchmark. Exceeding a limit returns resource_limit/unsupported with identity and a next action; it never hides truncation as success. The bounded TP must verify exact boundary behavior.

## 6. Test And Evidence Strategy

Verify Core snapshot/live parity on stable inputs and default CLI/MCP regressions. Inject mutations into capture, evaluator and revalidation, including create/delete/rename and change-then-restore with changed identity/metadata; captured evaluation must not read live bytes. Parallel request contexts must not leak providers or targets. Test approved binding/target identity unchanged under captured evaluation and the explicit unavailable Git evidence lane.

Exercise active/completed/invalid inventory, missing control/documents, unsupported/binary/invalid-UTF8/over-limit content, malicious Markdown, origin/Host/secret/method/target/traversal/symlink cases and request limits. Verify no network or active-content execution and unchanged complete control-tree bytes through overview/detail/document/navigation/refresh/retry/failure operations.

Use browser evidence on real repository data for all three journeys, keyboard/focus, German labels, source fidelity and retry/stale/reload/removal behavior. Test DTO/request-order failures separately from visual evidence. No test pass or runtime/browser result is claimed by this design. TP names exact tasks, scenarios, commands and evidence records; QA retains sole final quality decision.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Captured discoverRuns inventory retains completed and invalid entries; Core projection distinguishes complete/partial/empty/unavailable | Approved PRD and existing Core discovery/parser/evaluation owner | SDD-001, SDD-007, SDD-008 | Keep all-active CLI behavior unchanged; never filter failures into emptiness |
| AC-002 | Existing evaluators read the same captured bytes; DTO separates evaluated results and persisted assertions with revision/digests | Approved PRD; Core gate-check/doctor/seal/relationship owners | SDD-001, SDD-008 | Provider coverage and original target binding require parity/regression tests |
| AC-003 | In-memory reducer, request cancellation/generation, semantic navigation and heading/return focus | Approved PRD; React presentation owner | SDD-004, SDD-008 | Late responses cannot overwrite selection; full reload intentionally resets ephemeral navigation |
| AC-004 | Opaque registered-resource manifest and passive supported-format renderer with strict UTF-8 and provenance | Approved PRD; Core resource owner and React document presentation owner | SDD-003, SDD-005, SDD-007 | Unsafe/unknown/oversized content yields explicit unavailable state, never silent truncation |
| AC-005 | Typed availability/error DTO and explicit reducer/view states with localized next actions | Approved PRD; Core evaluation truth and React feedback owner | SDD-007, SDD-008 | Error categories preserve affected scope and known previous data |
| AC-006 | Captured input digest, original revisions, revalidation before related reads and periodic freshness notice plus explicit reload | Approved PRD; Core immutable-view/read owner | SDD-001, SDD-004, SDD-007 | Observation is time-bounded; changed or expired IDs cannot silently produce a current result |
| AC-007 | Visible retry uses same selected IDs where valid, request progress and typed remaining failure | Approved PRD; HTTP mediation and React recovery owner | SDD-004, SDD-007, SDD-008 | Preserve stale labels; no hidden repeated capture loop or control repair |
| AC-008 | Provider/API have no writers; browser controls are read-only; ephemeral memory only | Approved PRD; existing control writer/approval authority stays outside cockpit | SDD-001, SDD-002, SDD-004 | Verify complete before/after bytes; do not expose dispatch/approve via HTTP |
| AC-009 | Required --dir binding, loopback Host/Origin/secret checks and opaque registered-resource lookup with containment | Approved PRD; Core containment and local HTTP security owners | SDD-002, SDD-003, SDD-005 | No public-host override, path request, foreign-origin access, symlink escape or raw static control serving |
| AC-010 | Private package build/start and explicit local target; fixed asset serving, limits and clean shutdown | Approved PRD; private cockpit package and existing Core build owners | SDD-006, SDD-007 | Build engine compatibility and public payload boundaries require checks; no host install/release |
| AC-011 | German view labels/actions through catalog projection; source-language documents and IDs remain unchanged | Approved PRD; Core locale catalog and React presentation owner | SDD-005, SDD-008 | Unknown results remain unavailable; no invented authority through translation |

## 8. Risks And Open Questions

The scoped read provider touches existing read helpers; missing coverage would undermine snapshot claims. Make provider audit and live-default/captured parity explicit TP tasks and fail closed for uncaptured target reads. Capturing the control tree costs memory/CPU; the bounded worker, limits and changed-state recovery contain it. Hostile local processes with direct filesystem/process access remain outside browser-session isolation, and observed freshness does not lock future edits. No accepted debt waives consistency or containment.

Exact dependency pins, test fixtures, scenario IDs and evidence destinations remain execution/planning detail. If implementation cannot satisfy a resolved architecture decision or PRD behavior, return to the existing SD/PRD revision owner; do not relax it silently. Future MCP embedding, releases, host installations or persistent snapshot storage require separately scoped decisions.

Primary references checked for library/build choices: [React build-tool guidance](https://react.dev/learn/build-a-react-app-from-scratch), [Vite guide and engine requirements](https://vite.dev/guide/), and [react-markdown component/security documentation](https://github.com/remarkjs/react-markdown). These support tool capabilities, not a claim that this proposed implementation is verified safe.

## Design Decisions

Resolved rows are concrete design choices for this SD approval, not claims of prior separate user acceptance.

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Snapshot and evaluator boundary | before_sd | resolved | SDD-001: immutable captured bytes/metadata in scoped Core provider, original target identity, no live fallback or policy copy, observed provenance and revalidation | Core design owner: Codex preparing for Arndt Gold |
| Browser session and network boundary | before_sd | resolved | SDD-002: required explicit target, 127.0.0.1 exact Host/origin, 256-bit secret, memory-only fragment bootstrap, authenticated read APIs and restrictive static/CSP policy | Adapter design owner: Codex preparing for Arndt Gold |
| Resource selection and rendering | before_sd | resolved | SDD-003 and SDD-005: registered opaque resource IDs, contained no-symlink reads, inert Markdown, escaped JSON/text, strict UTF-8, unsupported/denied states | Core and UI design owner: Codex preparing for Arndt Gold |
| UI state and authority presentation | before_sd | resolved | SDD-004 and SDD-008: in-memory navigation, stale/retry states, request generation, semantic keyboard/focus, separate persisted/evaluated status and German labels | UI design owner: Codex preparing for Arndt Gold |
| Local packaging | before_sd | resolved | SDD-006: private React/TypeScript/Vite package; same-origin built-asset server; package-local lockfile; source Core reuse with existing generated build; no public UI payload or host installation | Packaging design owner: Codex preparing for Arndt Gold |
| Resource bounds and runtime isolation | before_sd | resolved | SDD-007: one worker, one queued request, 10-second operation ceiling, file/byte/response/document caps, bounded retry, typed busy/limit/error states and clean shutdown | Core and adapter design owner: Codex preparing for Arndt Gold |
| Task and scenario mapping | later_tp | deferred | Name tasks, fixtures, commands and evidence destinations covering all criteria/decisions, provider audit, mutations, negative access and real browser journeys | Task Plan owner: Codex preparing for Arndt Gold |
| Dependency resolution | later_tp | deferred | Pin and lock versions satisfying chosen library interfaces and Node/Vite engines, record the resolution and run type/build checks; do not change the architecture or install a host plugin | Implementation planning owner: Codex preparing for Arndt Gold |

## 9. Next Step

Review this SD and decide with a new deliberate `Approval: SD`, revision request or decline. Valid SD approval permits Task/Test Plan drafting only; implementation remains unavailable until TP approval and required Brownfield preparation.

## AGDF Approval Summary (de; source=en)

- Lösung: Eigenes lokales Paket `packages/control-ui` mit React, TypeScript, Vite und einem Node-Dienst. Übersicht, Run-Detail und Dokumentansicht verwenden die bestehende Core-Auswertung; das Cockpit bleibt rein lesend.
- Datenstand: Core hält gelesene Kontrolldateien und Metadaten im Arbeitsspeicher fest. Bestehende Reader und Auswertungen lesen denselben festgehaltenen Datenstand über einen isolierten Lesekontext. Zielidentität und Freigabebindungen bleiben erhalten; keine kopierte Gate-Logik, kein temporäres Repository und kein Rückfall auf ungeprüfte Live-Dateien.
- Aktualität: Antworten nennen Datenversion, Run-Revision und Beobachtungszeit. Vor weiteren Lesezugriffen und durch einen begrenzten Fünf-Sekunden-Check werden Änderungen erkannt. Veraltete Ansichten bekommen einen Hinweis; neue Inhalte erscheinen erst nach bewusstem Neuladen. Es wird keine dauerhafte Sperre gegen spätere externe Änderungen behauptet.
- Browsergrenze: Start benötigt ein ausdrücklich angegebenes Repository. Der Dienst bindet ausschließlich an `127.0.0.1`; API-Zugriffe brauchen einen zufälligen Sitzungsschlüssel. Host, Ursprung und Methode werden geprüft. Der Schlüssel bleibt im Speicher, wird nach dem Öffnen aus dem URL-Fragment entfernt und bei Neustart ungültig.
- Dokumente: Der Browser verwendet undurchsichtige IDs für registrierte, erlaubte Kontrollressourcen. Keine beliebigen Dateipfade, fremden Ziele oder Symlink-Ausbrüche. Markdown bleibt passiv, HTML und aktive Einbettungen sind gesperrt; JSON und Text werden als Quelltext angezeigt. Nicht unterstützte, fehlende oder gesperrte Ressourcen behalten ihre Herkunft und eine Erklärung.
- Bedienung: Auswahl, Navigation und vorherige/veraltete Inhalte bleiben nur im React-Arbeitsspeicher. Alte Antworten überschreiben keine neue Run-Auswahl. Tastatur, Fokus, Lade- und Fehleransagen sowie sichtbares Wiederholen werden ausdrücklich berücksichtigt. Deutsche Oberflächenbegriffe und Originalsprache der Quellen bleiben getrennt.
- Grenzen: Ein Worker mit höchstens einer wartenden Anfrage; höchstens 20.000 Dateien, 256 MiB Gesamtdaten, 32 MiB pro erfasster Datei, 2 MiB pro Dokumentvorschau, 8 MiB API-Antwort und zehn Sekunden pro Lese-/Auswertungsoperation. Überschreitungen werden erklärt und nicht als vollständige Vorschau oder leere Liste ausgegeben.
- Kompatibilität: Bestehende CLI-/MCP-Aufrufe behalten ihren normalen Reader. Der neue Lesekontext besitzt keine Schreibfunktionen. Git-basierte Nachweise bleiben in dieser Browser-Leseschnittstelle ausdrücklich nicht verfügbar. Keine zweite Datenbank, keine dauerhaften Browserdaten, keine Host-Installation und kein UI-Bundle im öffentlichen Plugin-/CLI-Paket.
- Nachweise: TP muss alle elf PRD-Kriterien und die acht Designentscheidungen abdecken. Gefordert sind Core-Parität, vollständige Reader-Abdeckung, Änderungen während des Lesens, negative Zugriffsfälle, Ressourcenlimits, passive Dokumente, echte Browser-Nutzerwege und unveränderte Kontrolldateien. Das Design behauptet noch keine implementierten oder bestandenen Laufzeittests.
- Entscheidungen: Architektur, Zuständigkeiten, Sitzungsgrenze, Datenstand, Rendering, Bedienzustände, Paketierung und Limits sind in diesem Entwurf entschieden. Genaue Aufgaben, Szenarien, Evidenzorte und kompatible Dependency-Pins gehören mit benannten Verantwortlichen ins TP. Die separate Sprachkorrektur bleibt außerhalb des Cockpit-Umfangs.
- Grundlagen: [React dokumentiert Vite als möglichen Build-Weg](https://react.dev/learn/build-a-react-app-from-scratch); [Vite beschreibt React-/TypeScript-Vorlagen und Node-Voraussetzungen](https://vite.dev/guide/); [react-markdown dokumentiert passives Komponentenrendering und Sicherheitsgrenzen](https://github.com/remarkjs/react-markdown). Diese Quellen ersetzen keine Prüfung unserer späteren Umsetzung.
- Nächster Schritt: Dieses Lösungsdesign prüfen und gezielt entscheiden. Eine SD-Freigabe erlaubt den Aufgaben-/Testplan; Codeimplementierung benötigt weiterhin die TP-Freigabe und Brownfield-Vorbereitung.
