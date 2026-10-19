# SD: Bind preview material to the existing PRD presentation

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD
Date: 2026-10-18
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the existing source-readiness, presentation and decision-session owners. The PRD remains the only source of the applicable preview and product acceptance. UX analysis proposes the reviewed candidate; the PRD explicitly adopts the required descriptor. A new presentation record binds that descriptor and its exact files. Existing approval receipts already bind the immutable presentation envelope, so no second approval or receipt family is needed.

The implementation has three boundaries: inspect the authored requirement and exact files without executing them; prepare an immutable, bounded presentation snapshot and safe isolated rendering; read it through the existing presentation/session owner and revalidate current material through the existing approval transaction. Missing or changed material produces a specific recovery instead of another preview or an inferred decision.

### Requirement and applicable preview

New UR authoring uses one initial metadata declaration `Preview requirement: before_prd_interactive` when an explicit requested interactive preview must precede PRD agreement. `none` means no such explicit requirement. Absence on existing unmarked URs retains legacy behavior. Duplicate, empty or unknown authored declarations are invalid rather than inferred. This is an authoring contract: a machine cannot infer an omitted requirement reliably from free prose. UR review and skill evaluations must therefore verify that explicit user requests are retained before UR approval. The marker does not create a gate or change a previously approved UR.

For a required case, the existing PRD contains exactly one `## Preview Review` section with one fenced JSON descriptor. The same section can explicitly adopt a preview in a legacy run; it cannot negate an approved required UR. Descriptor schema `1` contains exactly:

- `schema_version`: string `1`.
- `version`: a lowercase short name with an explicit version suffix, such as `approval-screen-v1`.
- `source_ur_digest`: current canonical approved UR digest, using the existing source-text semantics.
- `entry`: normalized repository-relative owning-run path ending in `previews/<version>/index.html`.
- `files`: unique, lexically ordered entries with exactly `path`, `digest`, `bytes`, `media_type`, including the entry. File digests are SHA-256 of raw bytes, not normalized text.
- `review_task`: concise concrete user task.
- `scenarios`: nonempty normal and relevant error scenario labels.
- `criterion_ids`: nonempty distinct IDs, all present in the same PRD.
- `open_questions`: explicit question strings, or an empty list. This never replaces the existing Approval Decisions table or readiness rules.

The descriptor is bounded to 16 KiB, at most 32 files, 128 KiB per file, and 1 MiB of total raw file bytes. The entry is nonempty UTF-8 HTML. Permitted other media are UTF-8 CSS and classic JavaScript, PNG, JPEG, WebP, GIF and SVG. Paths use the existing safe-relative-path grammar, remain beneath the exact version directory and reject Windows/absolute forms, traversal, encoded traversal, links, directories and special files. Exceeding a bound or unsupported syntax is an explicit authoring/readiness failure, never truncation or partial acceptance. These design limits fit the existing archive's 128 KiB per-file bound without widening historical validation.

The existing `definition-sources` owner reads the UR marker, registered ready UX input and PRD descriptor through one shared preview inspector. UX carries its candidate version, observations and source binding in existing evidence; it does not become the applicable-version authority after PRD adoption. The inspector validates declared local files and supported static resource closure, digests, bytes, source association, criterion IDs and duplicates. A required UR without a complete applicable PRD descriptor is unready. A declared PRD descriptor is validated even in an otherwise unmarked legacy run.

### Source material and immutable presentation

Only PRD presentations with a descriptor use presentation envelope version `5`. It extends the existing document-snapshot record with one `preview_review` object: descriptor digest, normalized descriptor, renderer policy version `1`, rendered HTML digest/bytes and file snapshot references. Snapshot filenames are writer-derived from presentation UUID and numbered file index, not supplied paths. Canonical source paths and raw digests remain in the binding. Keep the current exact record grammar and reject unexpected fields or a version-5 record without a valid PRD preview.

The existing presentation writer publishes raw file snapshots and a derived safe HTML snapshot under the same owning run's `presentations/` directory, before publishing the immutable envelope. Use existing exclusive creation, no-follow/identity checks, fsync and run lock. Interrupted publication resumes only for the same operation UUID and exact verified bytes; mismatches remain rejected and untouched. Recompute live source bindings before and after preparation. Do not add source files as invented aggregate file digests in `material_sources`.

Existing approval receipts and `material_version` retain their schemas and digest algorithms. The PRD text digest already binds its descriptor, and the receipt's `presentation_digest` binds the version-5 envelope and exact preview material. Raw tampering without a descriptor revision is invalid; adopting different valid material changes PRD bytes and uses its existing revision/new-presentation path. The preview inspector must not silently rewrite authored hashes to match new bytes.

### Safe rendering and local resources

Preview HTML is treated as executable untrusted illustrative content. Core never executes it during inspection. Use a real HTML parser and CSS parser for static resource recognition and embedding, not regular-expression HTML rewriting. Pin `parse5` at `7.3.0` and `postcss` at `8.5.29`, versions already present in the repository control-UI lockfile, as explicit packaged production dependencies for this resolver; do not import a development-only transitive installation. Package generation must include the resolved runtime dependencies and prove clean-install loading.

The renderer accepts static local classic-script `src`, stylesheet `href`, image `src`, and CSS imports/URLs that resolve to declared files in the same version directory, plus in-document fragment references. Resolve CSS references relative to their containing stylesheet, detect cycles and reject undeclared resources. Embed supported files into the derived standalone document, preserving classic script order. Reject external/protocol-relative URLs, base elements, executable URL schemes, module scripts/import maps, dynamic local module graphs, srcset, workers, nested frames, object/embed, navigation links and form submissions. Require authors to bundle unsupported resource patterns before review rather than silently drop essential behavior. Inline classic scripts may implement local interactions, but runtime network APIs, dynamic external loads and evaluation are not granted by the viewer.

A generated wrapper places a CSP before all authored content: `default-src 'none'`, inline scripts/styles only, images limited to embedded `data:` resources, no connections, workers, nested frames, objects, base or form actions. Do not allow `unsafe-eval`. In the decision UI use an opaque-origin `srcdoc` child iframe with only `sandbox="allow-scripts"`, no same-origin, navigation, popup, download or form privileges, and a no-referrer policy. Do not inject authored nodes into the parent document, pass the host bridge, or install a listener that treats preview messages as actions. Parent decision controls remain outside that child.

The source-byte binding is independent of this derived rendering: both original files and rendered policy/digest are retained. The standalone fallback uses the same generated wrapper and CSP, not the untrusted original entry opened with host privileges. Unsupported resource patterns or a blocked frame must be visible as unavailable review, not an empty successful preview. CSP/isolation and hostile-preview tests are mandatory implementation evidence; parsing alone is not a security claim.

## 2. Ownership And Source Of Truth

| Concern | Existing owner / extension | Authority |
|---|---|---|
| Explicit preview requirement | UR authoring contract/template and UR readiness | Approved need, with a declared marker for new required cases |
| Applicable version, task and criterion association | PRD Preview Review section | Sole current product/preview association |
| Candidate evidence and observations | UX Intent Definition | Analytical input only |
| Containment, bytes, file closure and descriptor grammar | Shared preview inspector used by definition-sources, readiness and presentation owners | One implementation of preview facts, no approval permission |
| Immutable snapshot and freshness | run-presentation.js | Existing exact presentation owner with version 5 |
| Product material identity | presentation-decision.js | Existing PRD-source material semantics preserved |
| Actual approve effect | approval-command.js and existing action service | One transaction and existing matched receipt |
| Read-only access | Existing decision-session and control-inspect service | Session or exact-presentation selectors, never arbitrary paths |
| Visible decision and recovery | interaction-presentation plus existing locale registry, DecisionCard and DecisionEntry | Same Core projection for native and text modes |
| Historical closure | run-revision.js, run-revision-history.js and artefact-binding-proof.js | Version-aware historical/current validation |

New preview helper modules are cohesive internal extensions of these owners, not a separate service, manifest authority, approval table or product repository.

## 3. Architecture Decisions

- SDD-001: Adopt a declared requirement and one PRD-owned descriptor, with one shared inspector for authored evidence; rationale: prose cannot safely establish a machine binding and UX evidence must not become a second product authority; consequence: new explicit requirements must be retained by UR authoring and reviewed, while existing unmarked documents are not silently migrated.
- SDD-002: Extend the existing immutable presentation envelope with version 5 and preview snapshots while retaining current approval receipt and material-version schemas; rationale: the receipt already binds the presentation envelope and the PRD digest binds the descriptor; consequence: every current and historical presentation consumer must understand version 5, and no old-record bypass may approve a newly declared preview.
- SDD-003: Parse and embed declared static resources into one bounded isolated rendering using explicit packaged parser dependencies; rationale: local assets must remain usable offline without granting arbitrary file or network access; consequence: unsupported resource syntax requires author-side bundling, and packaging plus parser/security regressions are required.
- SDD-004: Reuse decision-session and exact-presentation Inspect for read-only preview access with opaque selectors and no view receipt; rationale: access must preserve target/run/revision/presentation context and existing lifetime/freshness rules; consequence: schema additions and failure handling must be propagated to the existing Core, MCP and UI consumers together.
- SDD-005: Revalidate required current preview material inside the existing approval transaction and approved-source proof, retaining original historical predicates for earlier records; rationale: a display-time check cannot protect a later approval or dependent source preparation; consequence: snapshot closure and archived byte readers must include version-5 files and use archived rather than live bytes for historical proof.
- SDD-006: Preserve one decision action and local preview state, with explicit capability and recovery projection shared by native and text surfaces; rationale: reading and example interaction must not be confused with actual approval or invented host support; consequence: unsupported native framing uses the same bound safe standalone view when available, otherwise review stays visibly open.

## 4. Integration Points

### Readiness and authoring

Add the requirement declaration to new UR authoring guidance, template and readiness grammar. Extend UX and PRD authoring guidance with the descriptor and supported-resource rules. Extend the PRD template's existing evidence/approval handoff without adding another artifact type or gate. The shared inspector uses `control-read/fs.js` so captured read workers and live mutation checks obtain the same facts. Do not bypass captured observations with native filesystem calls in read-only projections.

Definition-source and PRD readiness report concrete preview failures using the existing owner recovery and locale registry. A required missing/blocked UX analysis remains its existing blocker. The descriptor cannot override before-PRD product decisions or grant readiness from a file hash alone. Do not fix the unrelated general next-operation/status inconsistency as part of this feature.

### Presentation and decision

`run-presentation-render.js` and the central interaction projection derive the task, version, scenarios, criterion references and consent effect from the checked PRD. Text output supplies exact access to the safe retained presentation view and accurate availability, rather than a generic Markdown link stripped by a summary renderer. `run-presentation.js` binds source and rendered snapshots, and full `validateRunPresentation` recomputes the live preview association/bytes for new required cases.

Both native and exact-text approval enter the same transaction. Invoke preview freshness validation after acquiring existing locks and again immediately before committing the approval revision. If source files change during validation, reject with a concrete changed-material reason and leave approval state unchanged. Existing pending journal/recovery and operation UUID handling remain authoritative. Local filesystem locks protect cooperative writers; they are not a claim of protection against a malicious process rewriting files after the final read. Tests must exercise the existing transaction checkpoints and expose this assurance boundary accurately.

`inspectApprovedArtefact` must verify version-5 snapshots and current declared files for current approved PRD proof. This prevents later SD/TP preparation from adopting a tampered required preview. For old versions 1–4 preserve their original validation. A current marked required PRD cannot be newly approved through a legacy presentation that lacks its preview binding. Current unmarked legacy source interpretation is preserved; source adoption or revised requirements require their existing revision route, not automatic annotation.

### Read API and UI

Add a read-only `preview` operation to the existing decision reader using `session_id`, `snapshot_id`, `run_id` and an opaque `resource_id` issued by that exact decision session. It reads only the session-bound presentation's safe HTML snapshot; callers never select filesystem paths. Add the stateless `presentation-preview` operation to existing Inspect, mirroring `presentation-document` target/run/gate/revision/presentation checks. Return bounded UTF-8 chunks with content digest, byte offsets, complete/next cursor and current/historical applicability. A cursor is bound to the immutable envelope and cannot read another version.

The safe rendered view is limited to 2 MiB after embedding; use 32 KiB UTF-8-safe chunks and existing result limits. Raw snapshot files remain at most 128 KiB each. Split the safe rendering into writer-derived immutable chunks of at most 128 KiB so the existing archive bound does not change. The envelope binds ordered chunk hashes, byte lengths, total bytes and complete-render digest; never allow truncated or reordered rendering. All these snapshots are finite presentation-owned derived content.

Extend DecisionBootstrap with optional checked preview metadata: resource ID, version, task, scenario labels, criterion IDs, digest and actual access state. Add `port.preview()` through DecisionEntry. DecisionCard places the localized version-labelled access beside document access, opens the isolated view, restores focus on return and preserves the parent binding and pending state. Keep the approve button outside the preview and retain existing receipt matching. A read failure shows a retry for the same version; a stale binding disables the old decision and requests fresh presentation. Ordinary requested changes stay in Chat.

Native iframe access is available only when the actual host policy permits this isolated surface and the frame reports its bounded ready state. Any such signal is rendering status only, never evidence of human viewing or approval. No permissive CSP fallback is allowed to make it work. A host that denies framing receives an honest unsupported state and may use the exact safe standalone projection through an actually supported file/browser route. Text and standalone access do not promote a host to native-qualified. No local server, listener or hosting platform is added to Core.

### History, package and contract propagation

Extend source-revision closure to include all version-5 file snapshots, rendered chunks and binding envelopes before atomic source revision. Validate raw digests through archive byte readers rather than live paths. Keep original source paths as historical keys and archive the exact bytes, with existing 128 KiB source-file limits unchanged. Pending presentations must remain available as historical evidence but cannot become current authority.

Propagate additions through the existing Core/CLI/MCP generated package assembly, read schemas, UI types and locale catalog. Explicitly package parser dependencies; run a clean package/runtime smoke test so a dev-only parser installation cannot conceal missing production dependencies. Adjust payload baselines only through the existing measured budget process with the actual reason and diff. Do not edit installed caches or claim this branch has updated live hosts.

## 5. Constraints And Compatibility

No new gate, approval action, checkbox, click receipt, independent preview manifest authority or automatic message. No change to product acceptance or the unanswered policy of the illustrative product. No implementation of that product. No network/CDN resources in the bound runtime rendering; preview authors must retain supported local assets or bundle dependencies before adoption. The earlier prototype wrapper's optional CDN support is illustrative and must not be used as a runtime-isolation proof.

Use strict version dispatch, preserving existing envelope versions 1–4, document reads, QA deviation version 4, receipt schemas and canonical material hashing. Version 5 applies only to PRD preview presentations. Every version-sensitive branch in presentation, document reads, decision sessions, approved-source proof, archival/revision and replay checks must be reviewed; updating only the main writer is insufficient. Mixed-version or malformed fields fail closed. No historical receipt is rewritten to claim preview evidence.

On incompatible or unsupported input, stop the new path and preserve stored evidence. Rollback of code cannot manufacture an older presentation for a newly marked required case. Complete the implementation and package checks before exposing the new requirement contract as supported. Deployment, release and installed-host updates remain outside this run's authorized scope.

## 6. Test And Evidence Strategy

Use existing Core fixture, command, decision-session and UI test patterns with actual temporary files. Tests must prepare a real presentation, attempt actual approval, and assert unchanged approvals on missing entry/assets, wrong run, unsafe or symlinked paths, raw byte changes, UR mismatch, asset-set omission and changed descriptor/version. Test a valid unchanged material path and fresh presentation after the existing approved-source revision procedure. Preserve negative tests and exact receipt semantics.

Static closure/renderer tests cover relative stylesheet and image references, CSS imports/URLs, classic script order, binary asset bytes, cycles, encoding aliases, unsupported modules/URLs, file/count/output bounds, duplicate fields, undeclared resources and parser package loading. Hostile content must fail to access parent controls, host bridge, network, forms, popups, top navigation, workers or arbitrary paths. Treat CSP/iframe failures as visible failures, not a successful blank result.

Session tests cover wrong resource/session, stale source, expiry, close/teardown, immutable versus current access, cursor binding/UTF-8/chunk tampering and retry. UI/browser tests cover the exact review task, scenario and policy distinction, open/return/focus, complete and missing-proof examples, changed basis and unsupported framing at 736, 360 and 320px. Prove no preview action calls the real decision or sends a message.

Compatibility tests cover no-preview runs, earlier presentation versions, immutable document reads, QA deviation presentation, approval/material replay, archived source revision and generated clean-install runtime. Check measured payload, runtime integrity, source/generated parity and relevant locale/schema tests. Native host qualification requires actual visible rendering, lifecycle/interaction and teardown evidence for that specific host; otherwise explicitly report the gap. TP will name executable test commands, scenario IDs and retained evidence locations.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | PRD descriptor and central projection supply task, version, scenarios and criterion references | Approved PRD; definition-sources and interaction projection owners | SDD-001, SDD-006 | Existing summaries must not strip the only usable access path or hide unresolved decisions |
| AC-002 | Session-bound isolated view and parent return/focus preserve the existing decision | decision-session.js; DecisionCard and DecisionEntry | SDD-003, SDD-004, SDD-006 | No host bridge or preview message becomes an action, unsupported framing is visible |
| AC-003 | Explicit PRD adoption and existing product-decision checks preserve unresolved assumptions | Approved PRD and prd-readiness.js | SDD-001 | UR/UX evidence stays subordinate and example policy remains outside acceptance |
| AC-004 | Shared inspector checks normalized version paths, raw bytes and complete supported static closure | definition-sources plus presentation-owned preview inspector/resolver | SDD-001, SDD-003 | Bound counts and unsupported syntax reject explicitly, no silent partial bundle |
| AC-005 | Version-5 preparation and live checks inside existing approval transaction | run-presentation.js and approval-command.js | SDD-002, SDD-005 | Keep existing receipt/material algorithms and fail closed on races or missing assets |
| AC-006 | Descriptor revision changes PRD material, stale presentation cannot authorize it | Existing source revision and presentation/approval owners | SDD-002, SDD-005 | Preserve old evidence and require a fresh deliberate response, never rewrite hashes |
| AC-007 | Shared access states, same-version retry and exact safe standalone fallback | control-inspect service and decision-session projection | SDD-004, SDD-006 | Real host support is conditional and unqualified hosts receive no native guarantee |
| AC-008 | Existing approval command and matched receipt remain the sole decision path | approval-command.js, decision-action-service.js and DecisionCard | SDD-002, SDD-006 | No new receipt family or viewing prerequisite and no native permission as approval |
| AC-009 | Version-aware proof and archived byte closure preserve old predicates | artefact-binding-proof.js and run-revision-history.js | SDD-002, SDD-005 | Historical bytes never resolve through live files, new required cases cannot use old envelopes |
| AC-010 | File/transaction/session/browser/package tests cover the actual integration with explicit evidence bounds | Existing test/TP/QA owners | SDD-003, SDD-004, SDD-005, SDD-006 | Prototype and replay evidence cannot substitute for implementation or native-host proof |

## 8. Risks And Open Questions

The design choices are resolved for planning; implementation and independent observations remain unproven. Resource parsing/embedding, safe inline script handling, file races, strict record compatibility and native sandbox restrictions are the main risks addressed by mandatory failure-path tests. The parsers add production payload and maintenance cost; use the declared versions and package/budget evidence, with no hidden transitive runtime dependency. This is required implementation work rather than accepted deferred debt.

The prototype and 19 browser checks inform the review flow only. They do not establish the new parser, file binding, approval transaction, session integration, compatibility or native-host behavior. The example's missing-proof policy remains explicitly unanswered in the approved PRD and is not settled here. No material architecture decision is deferred to TP; only executable tasks and evidence collection are.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Requirement and applicable preview authority | before_sd | resolved | SDD-001: declared new requirement, PRD-owned descriptor, shared inspector and no prose inference or silent legacy migration | Arndt Gold, SD owner |
| Exact presentation binding without second approval schema | before_sd | resolved | SDD-002: version 5 extends existing presentation and its receipt-bound envelope, preserving material-version and receipt algorithms | Arndt Gold, SD owner |
| Resource parsing, bundling and isolation | before_sd | resolved | SDD-003: explicit packaged parser versions, bounded supported static closure and opaque-origin CSP-restricted rendering with no host bridge | Arndt Gold, SD owner |
| Read transport and lifecycle | before_sd | resolved | SDD-004: existing decision reader plus stateless presentation Inspect, opaque selectors, exact digest/chunks, existing session expiry and close | Arndt Gold, SD owner |
| Current and historical source proof | before_sd | resolved | SDD-005: live transaction checks and version-aware approved-source proof, exact archived byte closure and unchanged earlier record predicates | Arndt Gold, SD owner |
| Native/text capability and decision UX | before_sd | resolved | SDD-006: one current Core projection and existing action, local preview behavior, honest unsupported access and supported exact standalone fallback | Arndt Gold, SD owner |
| Executable implementation and validation sequence | later_tp | deferred | TP must map every criterion/decision to bounded tasks, test scenarios, commands and evidence, including security, compatibility, package and actual-host limits | Task/Test Plan owner |

## 9. Next Step

Review and deliberately approve this Solution Design with `Approval: SD` after the exact presentation is prepared. Approval permits Task/Test Plan drafting. Implementation remains forbidden until TP approval and required implementation-preparation Brownfield Analysis.

## AGDF Approval Summary (de; source=en)

- Lösung: Das bestehende PRD benennt die gültige Vorschau samt Dateien, Prüfsummen, UR-Quelle, Prüfaufgabe und Kriterien. Ein gemeinsamer Core-Prüfer validiert diese Grundlage. Neue ausdrückliche Vorschaupflichten werden bereits in der UR maschinenlesbar festgehalten; alte Dokumente werden nicht stillschweigend umgeschrieben.
- Verantwortung: PRD bleibt Produktquelle, UX bleibt Analyse. Quellenprüfung, Präsentation, Sitzung, Freigabe und Historie bleiben bei ihren bestehenden Core-Eigentümern. Die Vorschau erhält keine eigene Entscheidungsbefugnis.
- Entscheidungen: Eine neue Präsentationsversion 5 bindet genaue Quelldateien und sichere Darstellungs-Snapshots. Die bestehenden Freigabebelege und Material-Prüfsummenverfahren bleiben erhalten. Core prüft vor Präsentation und erneut im vorhandenen Freigabevorgang. Nach Änderungen braucht es die bestehende Revision, neue Präsentation und neue bewusste Antwort.
- Integration: Der bestehende Entscheidungsleser und Inspect liefern ausschließlich die gebundene Vorschau. Die Karte öffnet sie neben dem Dokument und kehrt zur gleichen Entscheidung zurück. Die Vorschau läuft isoliert ohne Host-Brücke, Dateizugriff oder Netzfreigabe. Native Anzeige wird nur bei tatsächlicher Unterstützung angeboten; sonst dieselbe sichere Standalone-Darstellung über einen unterstützten Zugang oder ein ausdrücklich offener Zugriff.
- Ressourcen: Lokale Bilder, klassische Skripte und Styles werden geparst, geprüft und in die sichere Darstellung eingebettet. Dafür werden die im Repository vorhandenen Parser-Versionen als echte Produktionsabhängigkeiten paketiert. Grenzen: 32 Dateien, je 128 KiB und zusammen 1 MiB, sichere Darstellung höchstens 2 MiB. Nicht unterstützte Ressourcen müssen vorher gebündelt werden; nichts wird still abgeschnitten.
- Kompatibilität: Alte Präsentationsversionen und Fälle ohne Vorschau behalten ihre bisherigen Regeln. Historische Nachweise lesen archivierte Bytes. Neue Vorschaupflichten dürfen nicht über alte Präsentationen umgangen werden. Kein neues Gate, keine zusätzliche Vorschaufreigabe und kein Klicknachweis.
- Nachweise: Der TP muss echte Datei-, Freigabe-, Sitzungs-, Browser-, Sicherheits- und Pakettests vorsehen. Bestehender Prototyp und Replay-Prüfungen beweisen die Umsetzung nicht. Native Host-Unterstützung braucht eigene sichtbare Interaktions- und Lebenszyklusnachweise.
- Offen: Keine bindende Architekturentscheidung bleibt für den TP offen. Aufgaben, konkrete Testbefehle und Nachweisablage werden dort geplant. Die Regel des Beispielprodukts bei wichtigem fehlendem Nachweis bleibt weiterhin unbestätigt. Diese Freigabe erlaubt die TP-Erstellung; Implementierung und Veröffentlichung sind noch nicht erlaubt.
