# SD: Clear backlog status and reliable update flow

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-09
Owner: Arndt Gold
Run: backlog-status-flow-clarity-20261009-01
Language: en
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the existing Core-owned saved backlog projection. Produce a bounded work summary from the candidate canonical Run, current transition policy, existing next-action owner and validated registered QA follow-up. Both existing-row synchronization and insertion/link/closeout/revision paths consume it. Write the addressed human-readable table row and a versioned saved observation in the same MASTER_BACKLOG transaction. Core reads this observation without scanning Runs; explicit Run selection compares it with current bound evidence. HTTP/MCP mediate; React renders the supplied meaning and action.

The persisted observation is subordinate provenance for the existing saved row, not a second Run, policy, approval receipt, report or seal. The approved PRD remains the sole acceptance source. This design adds no executable action or approval control to the list.

### Existing Source Evidence And Derivation

The exact approved PRD digest is sha256:f2732c83e5732a95223172135ff5dbc583b0297f182b51d5190d89b40dbf999b. BROWNFIELD_REVIEW.md BF-01–06 and ready UX_INTENT_DEFINITION.md are subordinate inputs. Source inspection confirms run-backlog.js currently consumes plain policyForRunContent, while gate-check.js applies next-action/QA-follow-up refinement; run-steps.js builds rows separately. Further inspected paths include the compact rewrite in run-revision.js, the Run-only relationship correction and exceptional recovery writers. The coverage below includes these paths so the design does not assume two writer call sites are exhaustive. Actual implementation and runtime verification remain TP/QA work.

## 2. Ownership And Source Of Truth

| Responsibility | Existing authority / implementation owner | Boundary |
|---|---|---|
| Transition permission, gates and exact approval | gate-policy.js; gate-check.js; run-recording.js; approval-command.js | Unchanged gate decisions, deliberate replies and approved source integrity |
| Valid custom next-action applicability | control-evaluation/next-action.js and source-revision rules | A descriptive refinement is not implementation/approval authority |
| Normalized QA follow-up | control-evaluation/qa-follow-up.js; quality contract | Reuse registered report/decision/route validation; qa-gate retains sole final quality decision |
| Work summary derivation | Small shared control-evaluation/run-work-summary.js helper within existing Core | Non-authorizing projection; no full gate-check/doctor recursion from writers |
| Saved row/observation representation | control-state/run-backlog.js, shared normalization in control-evaluation/shared.js | One table/observation codec within existing backlog owner; no sidecar store |
| Mutation/consistency | run-backlog-writer.js; run-steps.js; run-revision.js; run-step-transaction.js | Existing ordered locks, revision guards, journal and commit point |
| Immutable reading and selected comparison | control-read capture; control-inspect/cockpit-backlog.js; cockpit.js | Saved-only overview; explicit selected-Run evaluation, no read writes |
| HTTP/MCP boundary | packages/control-ui/server and packages/mcp-server/src/server.js | Existing read operations, opaque resources and envelope; no status inference |
| Visible projection | BacklogRows.tsx, Overview.tsx, mcp/CompactCockpit.tsx, RunDetail.tsx, feedback.tsx | Render Core labels/actions/limitations, stable state/query/focus |
| Contract, tests and documentation | Existing Core tests, UI/browser/MCP tests; architecture/06-agdf-cockpit.md | Versioned saved representation and explicit evidence limits |

## 3. Architecture Decisions

- SDD-001: Derive one non-authorizing Core work summary using existing transition, next-action and normalized QA owners; rationale: plain policy loses concrete QA obligations, while separate reader/UI logic would duplicate authority; consequence: factor reusable refinement inputs within Core and verify existing gate authorization outputs remain unchanged.
- SDD-002: Keep existing Markdown columns and store versioned per-row provenance comments in MASTER_BACKLOG itself; rationale: lists must expose source correspondence without Run/report scans or a second persistent store; consequence: an optional strict codec and explicit old/invalid-observation limitations are required, and the saved record never proves currentness by itself.
- SDD-003: Allocate the resulting Run revision before planning its dependent summary and commit row plus observation through existing locks/journal; rationale: metadata must bind the actual committed revision and recovery must replay exact bytes; consequence: writer call sites pass one chosen revision and source guards, while explicit unchanged-Run synchronization preserves Run bytes and idempotence.
- SDD-004: Preserve each operation's existing strict/skip/recovery boundary and expose synchronization separately from control success; rationale: an unusable presentation pointer cannot revoke a legitimate exact approval, and exceptional recovery must not acquire competing journals; consequence: result diagnostics and selected-source comparison disclose pending/skipped synchronization, with explicit scoped run-update as recovery where required.
- SDD-005: Reuse saved-only list capture and add bounded optional summary DTOs plus explicit selected comparison; rationale: list cost, section/search meaning and observation coherence must stay stable; consequence: old/unlinked rows remain saved/unverified, parser/version mismatches are limitations, and no fresh status is fabricated by an overview read.
- SDD-006: Render the same Core-supplied phase/action/limitation in compact and expanded rows with stable layout and accessible feedback; rationale: the user must understand open work without reconstructing reports or opening source details; consequence: compact next action becomes directly visible, localization is presentation of Core meaning, and baseline scrolling fixes remain separately attributed.

## 4. Integration Points

### A. Bounded Core Work Summary

The shared helper takes the candidate parsed Run with content, transition result and registered evidence context, never a Run guessed from cwd. It returns a frozen non-authorizing description: phase; derived summary kind; QA outcome/applicability; recorded approval/lifecycle facts; decisive open obligation and count; concrete display action; consumed source references/digests; limitations. No new gate/lifecycle values are introduced. Derived kinds are work_pending, approval_pending, qa_report_pending, qa_evidence_open, qa_correction_open, qa_source_decision, qa_blocked, source_unconfirmed, closeout_pending, completed and unconfirmed. They describe PRD meanings, never replace control.status or authorize execution.

Precedence is explicit:

1. Use the existing transition route and its restrictions as the envelope. A source-revision/Verified Change policy-only path keeps its existing next-action rule. Honor the established next-action applicability/stale-generated-step rule; do not rewrite arbitrary authored Run text just to simplify display.
2. In applicable QA revise, reuse evaluateQaFollowUp's registered paths, report decision agreement, normalized header/route/gap validation and exact open actions. An upstream or invalid/blocked follow-up cannot be presented as code remediation or QA ready. Evidence-only follow-up yields the concrete decisive observation/action, followed by the existing required QA reassessment, rather than the generic implementation text. Mixed findings retain the current most restrictive route and disclose additional open obligations; deterministic order is the existing validated report/source order, not invented priority.
3. Existing custom next actions remain descriptive refinements under that envelope. QA's normalized route overrides incompatible previous generic/custom work; unknown/different-gate custom text remains inspectable rather than being promoted as a proven permitted action. The summary never executes or semantically approves arbitrary prose.
4. For QA pass/block or missing report, validate registered source availability and explicit decision agreement before presenting its report outcome. Existing approved status/approval receipts stay authoritative; missing, foreign, unsafe or conflicting report proof is a source limitation, not permission to amend or revoke approval.
5. For other gates/internal phases, render the current named work/approval requirement using the existing policy. Completion uses the recorded canonical lifecycle and applicable existing route/closeout evidence; active OR or a report alone never becomes completed. Compact routes without formal QA/UAT use not_applicable for those report requirements.

The existing QA evaluator supplies consumed source path/digest observations as supporting data, including referenced reviews even when their findings are resolved. Reuse its existing per-report and finding limits. The saved-summary layer bounds additional provenance to 64 consumed sources and 64 KiB decoded metadata; excess or unavailable inputs produce source_unconfirmed with a reason and the existing conservative owner action, without modifying gate permission. It stores a decisive action plus open count and source references rather than copying full report text. No silent action truncation or unsupported report-prose parsing is accepted.

Gate-check and the summary reuse the same QA-follow-up/next-action owners; they need not call each other. Where refinement code is factored, tests compare the existing status, gate, missing approval, allowed and forbidden values before/after. The selected detail may expose the work summary alongside the gate envelope; a specific sourced display action is not another readiness decision.

### B. Saved Markdown Representation

Retain compact seven-column and legacy thirteen-column headers. Status receives the documented English PRD label; next-step/notes receives the concrete display action. For non-QA work the label names the existing phase and draft/work/approval requirement. Existing normalization recognizes the exact generated label/code pairs alongside historical aliases; it does not infer gates from arbitrary text. Unknown old human labels keep their current explicit diagnostic and raw value. No new columns are needed.

After a section's table, outside the contiguous Markdown table and separated by a blank line, keep one addressed marker per recorded row:

`<!-- agdf-backlog-summary-v1 BASE64 -->`

BASE64 encodes UTF-8 canonical JSON using standard base64, which cannot contain a comment terminator or pipe. This is a named private saved-projection extension, not a generic document container. Existing table-only parsers ignore comment lines. The codec accepts only the exact marker, supported version, canonical encoding, bounded plain JSON and fields; no HTML execution, path following, prototype/accessor use or unknown-version inference.

The record contains exactly: schema_version (1); target_id; run_id; section; row_digest; revision_id; observed_at; kind; phase; qa_outcome; lifecycle; recorded_approvals; decisive_obligation (null or id, routing_target, action and source_path); open_obligation_count; display_action; sources (path, digest, state); limitations; authorizes (false). Status text is in the table rather than independently duplicated as another editable state. Paths use safe contained canonical registered references; no external URL or arbitrary path is opened from metadata.

row_digest hashes canonical JSON of the section and all actual parsed serialized table cells, including identity, title, status, links and action. Compute it after the existing tableLine serialization. That serializer's single-line/pipe-to-slash normalization remains documented presentation formatting; exact original obligation action and source remain inspectable in provenance. Rows are descriptive text, not executable shell commands. Both Markdown and UI convey the same meaning, and source detail retains the full registered action.

A valid marker means only “this saved observation was recorded for these row bytes and this Run revision.” It is not a cryptographic approval or a current integrity check. Missing marker means saved/unverified. Unsupported, malformed, duplicate, foreign-target or row-digest mismatch means saved provenance invalid/unverified; preserve safe raw row content with a diagnostic and do not choose a convenient conflicting record. Updates replace only their addressed marker and row, leaving unrelated bytes untouched. Explicit supported closeout moves/removes the corresponding active marker with the row and writes a completed-section observation; it does not auto-archive anything.

No observation is copied into RUN_STATE as another canonical status record. Run/evidence/approval receipts and their seals remain the authority; the saved file owns only its dependent snapshot.

### C. Write And Recovery Flow

Normal flow: acquire existing Run then Backlog locks → validate current revision/seal and pending operations → construct candidate canonical Run/approved operation → choose resulting revision once → derive bounded summary and capture consumed evidence digests → plan addressed row and metadata → recheck source/old-file guards → existing journal → sealed Run commit → exact dependent Backlog bytes → existing recovery retirement/result.

Use an operation's already allocated revision for typed artefact/approval/source-revision receipts. Otherwise the existing writer allocates its UUID once before planning; do not predict a future independently generated UUID. Source guards include every new/refined consumed report, not merely old Run's listedBefore set. Recheck source digests at the existing pre-commit validation point. A source that moves before commit fails the existing stale/source-recovery path; it is not silently resealed from a mixed observation. Source changes after commit leave an honest historical observation, detected on selected current comparison.

The journal already persists backlog.old/next, so the complete row/marker bytes use that existing transaction; no second journal or after-commit metadata patch. Recovery repeats those captured bytes, not a fresh evaluation against changed reports. Keep receipt/seal validation and confirmed-commit handling intact.

Explicit synchronization of a valid unchanged sealed Run binds its current revision. It captures and rechecks current consumed sources and the old backlog under the same locks, then atomically writes the addressed row/marker only. Identical revision, row and source inputs preserve the original observation time and return unchanged; a later read or repeat must not invent a fresh synchronization timestamp. New successful Run revisions update the observation even when visible words stay identical. Known skips do not write a marker.

| Existing operation path | Summary integration | Failure / visible synchronization result |
|---|---|---|
| run-approve; control approve | Existing writeRunWithBacklogLocked after exact validation; pass receipt's resulting revision | Existing permitted skipped pointer reasons preserve approval; expose updated/unchanged/skipped separately from accepted/approved |
| run-update, changed Run or registered reports/internal steps | Existing writeRunWithBacklog; candidate summary and evidence source guards | Existing skip contract retained; stale/foreign/pending state rejects or requires recovery |
| run-update, valid unchanged Run | synchronizeRunBacklog with current revision | Atomic pointer repair; idempotent unchanged; no Run rewrite or approval |
| run-step ur/route/review/evidence/artefact | Existing row plan plus common summary/codec; typed artefact uses binding's revision | Strict unsupported/path/identity checks retained; legacy preserves per-gate columns; truthful updated/unchanged or existing legacy limitation |
| run-step supported Quick/Compact closeout | Existing explicit row move/OR-lite transaction plus completed observation | No speculative move on partial work; legacy no-move limitation stays explicit |
| Early PRD reopening and late source-revision apply | run-revision existing dependent writer/compact rewrite uses common summary and receipt's revision | Existing permission, archive/journal and supported-layout strictness preserved; no new migration |
| Authorized relationship correction | Retain its Run-only correction/confirmed-commit owner; report pointer synchronization pending for new revision | Explicit scoped run-update follows when needed; do not nest another transaction or turn this repair into gate authority |
| Exceptional run-recovery and other directly recorded lifecycle/control maintenance | Preserve their own journal/recovery owner; publish pending synchronization when they change the represented revision/facts | Existing explicit run-update repairs the addressed valid pointer; selected comparison exposes stale record; no silent success claim |
| run-create before a row exists | No fabricated backlog summary | Entry creation remains the explicit existing UR/row step |
| Bare file edit / report not registered | No automatic watcher/write | Saved/unverified or selected mismatch; explicit authoritative recording required |

Exceptional recovery's pending pointer outcome is the same justified control-versus-pointer independence as skip, not a claim that every writer is cross-file atomic. Existing operation result owners expose reason and concrete explicit follow-up. Typed/control JSON results gain optional synchronization detail without new flags or gate formulas. Callers must not describe accepted/approved as pointer-synchronized when the detail is skipped/pending. No list-wide freshness claim can detect all external file edits without selection; this limitation stays visible.

### D. Read, Mediation And Presentation

projectCockpitBacklog parses raw entries and marker observations in one bounded MASTER_BACKLOG read. It validates section/key/row digest/target/version and attaches an optional saved_summary DTO with provenance_state recorded, unverified or invalid, derived kind/phase and localized label/action data from Core's shared vocabulary. No Run/report is resolved. Older missing fields produce the explicit old-row fallback; malformed present fields are diagnosed. The existing snapshot, row identity, source_digest/content_digest, counts and stored-field search stay unchanged.

An explicit Run selection already captures that Run's registered dependencies. Within that same immutable observation, cockpit.js compares the saved revision and consumed source digests against the selected current valid Run/seal/evaluation. Expose comparison matching, different or unavailable with reasons; even matching is a current observed correspondence, not readiness/approval authority. Rebuild the selected non-authorizing summary through the same owner for comparison where necessary, never reclassify the inventory. An unavailable/out-of-scope selected evaluator stays explicitly unavailable. No broad scan or automatic persistence is added.

HTTP/MCP use existing read operations/envelopes and selectors with optional added summary/comparison fields; strict DTO validation in control-ui/src/api.ts and types.ts checks supported values, bounds and matching row/Run identity. Validate preservation of those fields during backlog_titles refresh in App.tsx alongside existing raw-field checks. No transport infers status or follows metadata paths. No new protocol version is claimed without actual schema changes requiring it; additive fields are documented and tested with missing-old-field fallback.

BacklogRows renders the supplied localized phase/open-work label and direct next action in both modes. Original stored status/action and saved provenance remain inspectable; unverified/invalid provenance has a short visible limitation. Core/registered presentation vocabulary supplies translations of fixed meaning; report/custom action text stays sourced original text unless a validated translation already exists. React does not translate arbitrary report prose into a new obligation or approval. WorkStep/presentation helpers may be reused for text layout only.

Long next actions wrap without clamping away decision content. Keep controls and supplementary-title announcement layout stable, existing row keys/focus IDs and source details intact. Existing retry/reload controls handle stale/transient reads, with accessible feedback and no read-side mutation. Selected mismatch is shown in Run detail, not used to change section membership or a completed list query. No implementation or verification success is claimed by this design.

## 5. Constraints And Compatibility

Supported compact/legacy layouts and archived/planned raw values remain readable. Only the explicitly addressed canonical mutation/synchronization creates or updates a marker/status; no bulk backfill. New generated labels are added to the existing normalizer so current doctor/projection consumers do not treat them as arbitrary unknown labels. Preserve historical aliases and tests. External consumers still see the same table columns; consumers requiring the old finite status vocabulary must use the documented new labels or keep old saved rows until explicit update. Do not claim an old runtime understands newly generated labels.

Rollback is local source/fixture restoration before delivery; no installation/rollout is authorized here. A production downgrade must use reviewed, explicit row synchronization compatible with that runtime and preserve current approvals/Run history. Removing code must not silently bulk rewrite canonical rows or promise old metadata is current. Unsupported metadata versions fall back with a limitation.

Keep metadata within the existing 2 MiB backlog read cap and response limits. Resource excess yields explicit limited/unavailable or existing operation-specific skip/rejection, never silent truncation. Preserve no-follow file safety, safe path registration, sealed source relations, exact approval formula and current gate sequence. Summary fields cannot select a Run, invoke an action or satisfy any gate. Do not change runtime policy merely to obtain a clearer status.

## 6. Test And Evidence Strategy

TP must map criteria and these decisions to meaningful Core state/transition fixtures, exact writer outcomes and actual fault/concurrency boundaries. Extend run-backlog-writer-test.js, run-step-transaction-test.js, artefact/revision/approval tests, control-cockpit projection/scoped-read/list tests, UI component/browser tests and MCP round-trip validation. Use existing fixtures; no broad rewrite or mirrored tests.

Exercise QA missing/revise evidence/correction/upstream/block/pass/approved, compact non-QA and closeout, malformed/missing/foreign/referenced changed report, legitimate/stale custom action, multiple obligations and resource limits. Verify all operation paths in the integration table, replay/idempotence, source movement before commit, interruption at real intent/Run/Backlog stages, competing Run updates and foreign backlog conflict. Assert exact protected bytes/approval history and current permission outputs, not just pretty strings.

Codec/read tests cover old compact/legacy, canonical marker round-trip, row/digest mismatch, duplicate/foreign/unknown marker, non-symlink containment and immutable capture. UI/browser tests cover direct compact action, same observed meaning, narrow/wide long text, selected mismatch, visible retry, keyboard/focus and delayed title/scroll stability. Current installed native visibility requires actual host observation; local browser/source/protocol success cannot substitute. Preserve the prior UI diff baseline and do not rewrite evidence or approved artefacts from neighboring Runs.

Update docs/architecture/06-agdf-cockpit.md and relevant existing reader/writer documentation with final vocabulary, private marker/DTO compatibility, owner/trigger coverage, selected freshness comparison and limitations. QA/report owners retain their existing normalized gap/evidence routing.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Core bounded summary and direct row/action projection with inspectable saved binding | run-work-summary within Core; run-backlog; Arndt Gold accountable for approved product meaning | SDD-001, SDD-002, SDD-006 | Exact raw obligation remains inspectable after Markdown text normalization; no invented specificity |
| AC-002 | Derived QA/report/approval/lifecycle cases under unchanged transition envelope | gate-policy, qa-follow-up, exact approval receipts and canonical Run lifecycle | SDD-001 | Preserve compact applicability, malformed-source limits and existing gate authority |
| AC-003 | Shared refinement/evidence owner and selected comparison, no UI/transport evaluator | next-action, qa-follow-up, gate-check and Core work-summary/read owners | SDD-001, SDD-005 | Custom text is descriptive and cannot override QA route or become execution permission |
| AC-004 | Chosen revision and source guards; row/marker same existing journal; explicit exceptional pending/skip result | run-backlog-writer, run-steps, run-revision, transaction and exceptional recovery owners | SDD-003, SDD-004 | Preserve commit/recovery boundaries, approval replay and foreign updates; never nest exceptional journals |
| AC-005 | Row-bound private marker, saved-only overview and current selected source comparison | MASTER_BACKLOG saved pointer; canonical selected Run/seal/reports; cockpit-backlog/cockpit | SDD-002, SDD-005 | Saved marker is historical provenance, not current integrity proof; no list scans or read write |
| AC-006 | Optional codec, same columns, old aliases and explicit per-layout mutation | run-backlog, shared normalizer, existing row/link/closeout owners | SDD-002, SDD-004, SDD-005 | Old/unlinked rows remain unverified; unsupported versions/strict layouts are diagnosed; no automatic migration |
| AC-007 | Direct same Core action/label, stable keys/layout and existing accessible reload; DTO validation | Core summary/read DTO; BacklogRows, Overview, CompactCockpit, RunDetail, api/App | SDD-005, SDD-006 | Baseline scrolling fix separated; long text visible; no query reclassification or native claim from browser tests |
| AC-008 | Complete operation/owner trace, version/compatibility and failure contract with test/doc mappings | Approved PRD; this SD; existing Core transaction/read and review/QA owners | SDD-001, SDD-002, SDD-003, SDD-004, SDD-005, SDD-006 | Update actual documentation and collect scoped evidence; no second registry, control gate or host rollout |

## 8. Risks And Open Questions

No material before_sd design choice remains open. Implementing the source-guard and chosen-revision plumbing must preserve receipt/journal validation; tests and preparation re-evaluate actual call-site coverage before code. Metadata increases saved-file size and has explicit caps/fallback. Unsupported external readers of new labels need documented compatibility rather than an invented guarantee. Selected comparison may be unavailable when required evidence is outside the allowed control scope. Native readability may remain an evidence obligation. These risks have bounded existing owners and exit conditions in the decisions/evidence plan, not another policy/store.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Common summary and authoritative action precedence | before_sd | resolved | SDD-001 shared non-authorizing Core helper reuses existing transition, next-action and QA validation; no writer calls full gate-check or React policy. | sd-definition; Core evaluation owner; Arndt Gold accountable |
| Persisted representation and bounded old-row behavior | before_sd | resolved | SDD-002 same table columns, versioned strict base64 JSON comments in existing backlog, row/revision/source binding and explicit missing/invalid/unknown fallback; no sidecar or duplicate Run state. | sd-definition; Core backlog owner |
| Actual resulting revision and evidence consistency | before_sd | resolved | SDD-003 allocate once before planning, use receipt's revision when present, recheck consumed inputs before existing commit, replay captured row/marker bytes; unchanged-Run sync preserves revision and timestamp on repeat. | sd-definition; Core writer/transaction owners |
| Strict, skipped and exceptional recovery synchronization | before_sd | resolved | SDD-004 integration table preserves operation boundaries; expose updated/unchanged/skipped/pending/recovery distinctly; exceptional Run-only recovery uses explicit scoped synchronization without nested journals. | sd-definition; existing approval/recording/recovery owners |
| Read DTO, freshness comparison and localization | before_sd | resolved | SDD-005 additive validated summary/comparison fields; one-file saved overview, explicit same-snapshot selected comparison, fixed Core vocabulary and sourced untranslated custom text; no scans or read writes. | sd-definition; Core read and HTTP/MCP mediation owners |
| Stable compact/expanded presentation | before_sd | resolved | SDD-006 shared row shows direct action and limitations, sources on demand, wrapping and stable controls/keys/focus; existing retry behavior and title invariants retained. | sd-definition; existing control-ui presentation owner |
| Task/scenario execution and actual host evidence | later_tp | deferred | Bind all criteria/decisions to tasks and boundary scenarios, exact validation commands and evidence files; attribute dirty baseline separately and name current native observation method without claiming success. | Existing Task/Test Plan owner; later QA/evidence owners |

These resolved entries record the proposed technical choices for review; this draft is not an SD approval or implementation result. BF-04's control/pointer independence is retained with accountable Core writer/recovery owners, reason-bearing outcomes and explicit scoped synchronization. Its finite exit condition is passing operation/skip/recovery and selected-staleness evidence before QA; missing evidence routes to its existing owner.

## 9. Next Step

Validate decision/criteria/summary readiness and canonically record this SD derived_from the exact approved PRD. Present it for a new deliberate Approval: SD, requested revision or rejection. Only valid SD approval permits TP drafting. Implementation remains forbidden until TP approval and required preparation.

## AGDF Approval Summary (de; source=en)

- Ziel: Das freigegebene PRD wird über die bestehenden Core-Owner umgesetzt: verständlicher gespeicherter Stand, konkrete offene Aufgabe, nächster erlaubter Schritt und prüfbare Herkunft. Dies ist ein Lösungsentwurf; Code und neue Verhaltensnachweise sind noch nicht erstellt.
- Architektur: Ein kleiner gemeinsamer Core-Baustein erzeugt die nicht autorisierende Arbeitszusammenfassung aus Run-Policy, bestehender Nächste-Schritt-Logik und validierten QA-Feststellungen. QA-Nachweise, Korrekturen, vorgelagerte Entscheidungen, bestanden vor Freigabe und Abschluss bleiben getrennt. Gate-/Freigabehoheit und erlaubte/verbotene Aktionen bleiben unverändert; Schreiber rufen keine vollständige Gate-Prüfung rekursiv auf, React und HTTP/MCP entscheiden keine Statusregeln.
- Speicherung: Die vorhandenen sieben beziehungsweise dreizehn Backlog-Spalten bleiben bestehen. Die gezielt aktualisierte Zeile erhält den verständlichen Status und nächsten Schritt. Ein begrenzter, versionierter Prüfvermerk als Kommentar im selben Backlog bindet Zeile, Ziel, tatsächliche Run-Revision und verwendete Quellen. Er ist eine gespeicherte Beobachtung, kein zweiter Kontrollspeicher, neues Siegel oder Freigabebeleg. Originalaufgaben und Quellen bleiben prüfbar; fehlende/ungültige/fremde Vermerke bedeuten gespeichert und unbestätigt.
- Schreibfluss: Die resultierende Revision wird einmal vor der Planung festgelegt beziehungsweise aus dem vorhandenen Freigabe-/Artefaktbeleg übernommen. Run- und Backlog-Sperren, Quellenprüfung und bestehendes Journal speichern Zeile und Vermerk gemeinsam am vorhandenen Commit-Punkt. Recovery wiederholt die erfassten Bytes. Eine ausdrückliche Zeigerkorrektur verändert keinen gültigen Run; gleiche Wiederholung erzeugt weder Revision noch frisch erfundenen Zeitstempel.
- Abdeckung und Fehler: Freigaben, Bericht-/Artefakt- und interne Schritte, unterstützter Abschluss sowie frühe/späte Quellenrevision verwenden dieselbe Bedeutung. Bestehende strikte Fehler und begründete übersprungene Backlog-Updates bleiben erhalten und werden ausdrücklich gemeldet. Sonder-Recovery beziehungsweise reine Beziehungskorrektur behält ihren eigenen Schreiber und meldet ausstehende Synchronisierung; danach folgt gezieltes run-update. Keine zweite Transaktion, kein unbemerkter Erfolg und keine fremden Zeilenänderungen.
- Lesen und Anzeige: Die Liste liest nur das Backlog einschließlich Prüfvermerk. Erst bewusstes Öffnen eines Vorhabens vergleicht diesen mit aktueller Run-Revision, Siegel und Quellen im selben Prüfstand. Gespeichert, unbestätigt, abweichend und nicht verfügbar bleiben erkennbar. Core liefert die Zustandsbedeutung; beide Karten zeigen Phase und konkrete nächste Aktion direkt. Quellen sind aufklappbar, lange Texte umbrechen, Suche/Bereich/Scrollen/Fokus und Titel-Nachladen bleiben stabil. Temporäre Lesefehler bieten vorhandenes sichtbares Retry/Neuladen; Lesen schreibt nichts.
- Kompatibilität: Alte Werte, Links, Identität, Reihenfolge und beabsichtigte Bereiche bleiben erhalten, bis eine gezielte kanonische Operation den Eintrag aktualisiert. Neue Begriffe werden im bestehenden Normalisierer registriert; unbekannte alte Werte oder Vermerkversionen sind ausdrücklich begrenzt. Keine Massenmigration oder automatische Archivierung. Alte Laufzeiten verstehen neue Begriffe nicht automatisch; diese Grenze wird dokumentiert. Metadaten und Datei bleiben begrenzt; übergroße/unprüfbare Quellen werden nicht still gekürzt oder als aktuell ausgegeben.
- Abnahmezuordnung: Alle acht PRD-Kriterien sind genau einmal auf bestehende Owner und sechs Designentscheidungen abgebildet. TP prüft QA-Zustände, Quellen-/Aktionsvorrang, alle Schreibpfade, Wiederholung, echte Unterbrechungs-/Parallelitätsgrenzen, Altformate, ungültige Quellen/Vermerke und beide schmalen/breiten Ansichten. Architektur- und Nutzerdokumentation erklärt Begriffe, Trigger, Herkunft und Grenzen. Quellen-/Test-/Protokoll-/Browsernachweise ersetzen keine aktuelle native Hostbeobachtung.
- Entscheidungen und Risiken: Alle materiellen Designentscheidungen sind im Entwurf aufgelöst; TP übernimmt nur Aufgaben, Tests und konkrete Evidenzerhebung. Kritisch bleiben unveränderte Freigabe-/Journalvalidierung, Quellenbewegung während des Schreibens, begrenzte Metadaten, fremde/alte Verbraucher und ggf. unverfügbare aktuelle Hostdarstellung. Vorbereitungsanalyse und Tests prüfen diese Pfade; bestehende UI-Änderungen und fremde Run-Feststellungen bleiben getrennt. Keine neuen Gates, automatische QA/UAT, Veröffentlichung, Installation, Git-Aktion oder Schließung des fremden QF-001.
- Nächster Schritt: Dieses SD prüfen und neu bewusst mit Approval: SD freigeben, Überarbeitung verlangen oder ablehnen. Danach ist der Aufgaben-/Testplan erlaubt; Implementierung bleibt bis zu dessen Freigabe und Vorbereitung gesperrt.
