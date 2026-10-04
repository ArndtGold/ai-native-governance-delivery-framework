# SD: Fewer intermediate status cards with complete relationship recording

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD Revision 2
Date: 2026-10-02
Owner: Codex
Run: agdf-intermediate-status-card-reduction-20261002-01
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Use the existing separation between canonical evaluation, sealed recording, nonterminal delivery continuation and terminal presentation. Reconcile the interaction/output instructions so a named internal continuation does not produce an extra status card merely because another check or evidence operation ran. Preserve full explicit status, meaningful events and bound decision presentations. Every terminal dispatcher result still transmits verbatim and stops.

Prevent relationship omissions through one current-gate artefact-recording operation. It publishes the artefact pointer, declared reviewed source binding and required Artefact Chain rows in the same sealed Run revision. Evaluate required relationship completeness prospectively before presenting/approving that artefact, as well as retrospectively for satisfied gates.

For a pre-existing missing row, authorized bound delivery continuation may invoke the same state-recording owner once before terminal output. Eligibility uses an already sealed exact source binding, not inferred semantics. Re-evaluate current control after the correction. Pure evaluation, doctor, explicit status and run-present remain read-only; no hidden write is added to them.

This is a design, not an implemented improvement. Product acceptance remains solely in PRD.md, sha256:7fb12689ba373280448c5826458e12d0d967d7eeb98fb4a4cfd595ac0c76d3d0, approved at Run revision 10.

## 2. Ownership And Source Of Truth

| Responsibility | Authoritative existing owner | Design treatment |
|---|---|---|
| Product acceptance and human authority | Approved PRD; Approvals/Approval Operations in RUN_STATE.md | Preserve exact approval and recorded receipt semantics |
| Visibility and interaction policy | plugins/agdf/meta/contracts/interaction.md | Own event boundary and canonical presentation rules |
| Concise progress/review output | plugins/agdf/meta/contracts/quality.md and canonical skill consumers | Reference interaction policy; avoid a second event matrix |
| Status, decision, recovery and localization | packages/core/lib/interaction-presentation.js; plugins/agdf/meta/agdf-interaction-locales.json | Reuse renderer/registry; no model-built replacement |
| Relationship semantics | packages/core/lib/control-evaluation/delivery-map.js | Extract its existing relationship list into one shared Core helper, used by evaluation and recording; no duplicated gate map |
| Gate readiness | packages/core/lib/control-evaluation/gate-check.js and gate-policy.js; run-presentation.js; run-recording.js | Shared prospective relationship check; preparation routing still works when the current artefact is absent |
| State recording | packages/core/lib/control-state/run-steps.js; run-recording.js | Extend existing Run operations for complete artefact recording and bounded correction |
| Revision, containment, approval preservation and publication | run-state-writer.js; run-seal.js; contained-file.js; approval-operations.js | Existing locks, expected revisions, canonical digests and atomic write remain mandatory |
| Bound orchestration | packages/core/lib/skill-dispatch/service.js | Authorized pre-terminal correction, fresh evaluation and existing host_action rules |
| Public lifecycle adapter and projections | packages/cli/lib/cli/command-registry.js, validation-handlers.js; scripts/sync-package-assets.js | Thin existing command extension and coherent generated consumers |

An optional typed source-binding record is evidence inside the existing sealed Run, not a second product/control authority. Its small codec/validator may be added under Core control-state; it cannot choose a gate, approve an artefact or decide QA. MCP remains a transport adapter to the same dispatcher; it gains no independent correction endpoint or policy.

## 3. Architecture Decisions

- SDD-001: Reuse nonterminal continuation and canonical interaction policy for routine output; rationale: the dispatcher already distinguishes internal continuation from terminal decisions/status; consequence: no global visibility setting, persistent last-card cache, new approval layout or new dispatcher outcome, and every meaningful event/terminal result stays visible.
- SDD-002: Share the existing relationship registry and add prospective readiness validation; rationale: current delivery-map requirements activate after gate satisfaction and therefore expose omissions after approval; consequence: incomplete currently recorded artefacts cannot reach presentation/approval, while missing current artefacts remain draftable and exempt relationships remain exempt.
- SDD-003: Extend run-step with one current-gate artefact-recording step and a sealed typed evidence receipt; rationale: pointer, source binding and chain row must be committed together, with a reusable exact proof for an old clerical omission; consequence: additive CLI/evidence format with strict validation and no automatic conversion of prose or legacy records.
- SDD-004: Permit one exact-evidence correction only in authorized bound delivery orchestration before terminal output, using the same writer; rationale: routine bookkeeping should not require another user round-trip while unknown derivation stays blocked; consequence: pure status/evaluation never writes, invalid seals/approvals and concurrent changes fail closed, and no already emitted terminal result is intercepted.
- SDD-005: Keep all localized visible copy and rendering in existing interaction owners and synchronize canonical instruction consumers; rationale: source instructions, generated profiles and registered languages must express the same product boundary; consequence: full rendered case/state coverage and projection checks are required, with no host-specific normative fork.
- SDD-006: Preserve explicit evidence lanes and local reversibility; rationale: policy/rendering checks cannot prove an actual reduction in host interaction; consequence: TP must secure a positive redundant-card baseline before implementation and an actual Codex comparison, while other hosts remain qualified only by their own evidence and no installation/VCS/release is automatic.

## 4. Integration Points

### 4.1 Internal output and continuation

The sole normative event boundary lives in interaction.md. quality.md and skill guidance refer to it. A supplied nonterminal control snapshot permits only its named work; the agent consumes it without an additional standalone status invocation for each internal substep. Required evaluations still run through existing evaluators at their checkpoints. Their machine results and durable evidence remain complete even when no separate chat card is warranted.

After an internal operation changes or completes recorded control, redispatch the same target/run with continue_delivery. An explicit user status request uses the existing read-only dispatch/status route and always returns fresh canonical status. Do not relabel explicit status as delivery continuation to suppress it. Unchanged internal checks need not produce another card; blockers, scope/binding/authority changes and reviewable outcomes use their existing canonical presentation. Interruption does not reuse an obsolete snapshot: revalidate the binding first and surface material changes.

No general deduplication service or persistent last-visible revision is added. Visibility cannot change whether a check runs. Existing terminal host_action and ready-gate presentation sequences remain intact. Instruction-only consumers receive the same event policy but cannot claim executable correction without the runtime operation.

### 4.2 Complete artefact recording

Extend the existing command with `run-step --step artefact --gate <PRD|SD|TP|QA> --evidence <recording-input.json> --run <id> --revision <id>`. Permit --gate only for this step in addition to its existing approval/presentation commands; other steps keep their grammar. The existing CLI handler delegates to Core. No --response or approved-status input is accepted. QA maps to the registry's logical QA_REPORT relationship and its canonical QA artefact row; recording a report does not approve QA or decide pass.

The strict version-1 recording input contains the selected run/target identity, expected revision, destination type/path/canonical SHA-256 and policy-valid draft/report status, plus the exact registry relationship and source type/path/canonical SHA-256. A reviewed derivation mapping has a named reviewer and a contained evidence reference with its digest. It explicitly maps this destination to its sources; a header such as Based on: UR alone is not a valid recording input. Caller review is cooperative local attestation, not independent proof of human review or semantic correctness. Existing review/QA must still assess the mapping.

Files are prepared before control publication, within the selected run's artefact directory. Under the existing Run lock, recording validates the expected revision, current permitted gate, safe regular-file containment, exact bytes, registry semantics, source authority and explicit reviewed mapping. It builds one candidate containing the Artefacts pointer, source-binding receipt, evidenced Artefact Chain row and concise recording evidence. The existing writer validates the candidate, preserves approvals/Approval Operations and commits one new sealed revision by atomic rename. No control reader may accept a pointer without its required evidenced relationship. A staged unlinked file is not published control or approval readiness.

Initial recording requires valid existing sealed control. Updating an already linked draft may accept content_changed only as an explicit current-gate recording operation with an otherwise validated snapshot: the change must be limited to that permitted draft, all other bound artefacts and every currently approved artefact must retain their recorded digests. If that boundary cannot be proven, reject the operation and use explicit existing maintenance/revision recovery. Automatic correction never accepts content_changed or repairs a seal.

Use the existing canonical digest semantics, including line-ending normalization, rather than introducing a second byte-hash interpretation. Recheck source/destination digests immediately before commit; later changes remain detected by the existing seal/read path. Approved-source integrity is checked against the applicable current approval receipt or equivalent exact stored approval presentation. Missing exact approval-integrity proof makes automatic correction ineligible; it must not be guessed from a truncated hash.

Where run-step also updates the shared backlog, keep its established lock order, journal and Run-revision commit point. Extend that existing transaction only for this step's actual outputs; no new transaction manager. A failure before publication leaves old accepted control, and a pending transaction is handled by the existing recovery rules before readiness. Post-commit errors must not be reported as no change: re-read the committed revision, retain audit evidence and expose unresolved recovery. Existing fault injection must verify both sides of the commit point.

### 4.3 Binding evidence, history and legacy compatibility

Add an optional `Artefact Bindings` evidence section to RUN_STATE.md, using the established immutable-receipt pattern: schema_version 1 and a table of binding_id, receipt_digest and a strictly decoded base64url canonical-JSON receipt. A versioned Core validator owns this format. The whole section is covered by the existing content seal. It is not an approval receipt, product register or alternate live state.

Each receipt binds the existing target identity, run, registry triple, exact source/destination paths and canonical digests, reviewed mapping reference/digest/reviewer, origin `reviewed_mapping`, and recording operation/old/new revision identities. Reuse the writer's allocated next revision identity for the receipt and commit. Artefact Chain remains the operative relationship; its evidence references the binding ID. The human-readable Evidence table names the relevant artefacts, review reference and operation rather than exposing encoded data as a chat card.

Receipts are history. Explicit permitted draft re-recording supersedes the destination's previous active binding in the new receipt; it does not delete prior evidence. Repair must find exactly one applicable active binding for the current artefact identities. Unknown fields/versions, malformed encoding, duplicate IDs, contradictory active bindings, evidence-file drift and foreign identities are ineligible, not silently normalized.

Absent sections in legacy runs remain valid and confer no automatic repair eligibility. Existing evidenced chain rows retain their existing interpretation. A legacy missing row without typed proof stays blocked and may be explicitly completed with reviewed evidence through the ordinary recording path; no blanket migration or new approval is inferred. Optional provenance evidence does not require a new control_state_version or global rewrite. Older runtimes do not implement the new recording/correction operation; generated and installed versions must be identified before claiming its use.

### 4.4 Prospective relationship readiness

The shared registry remains the existing list, including UR-approved_by-Approval:UR and PRD/SD/TP derivations plus QA_REPORT-tests-TP. UR's exact approval row is still produced by run-approve; pre-UR readiness must not require an approval that has not occurred. Do not add relations for not_applicable gates or invent source mappings from gate order.

For PRD/SD/TP/QA, once the current artefact is recorded and otherwise eligible for presentation, check its required evidenced relationship before constructing a ready decision or accepting approval. gate-check, run-present and run-approve use that same prospective validation. A missing current artefact still routes to prepare_gate_artifact; a relationship-only issue on a recorded artefact cannot cause repeated artefact redrafting. Existing satisfied-gate audit validation remains active. Empty evidence, duplicate/conflicting relevant rows and absent required sources cannot pass readiness.

### 4.5 Bounded automatic correction

Correction is invoked only for an explicitly authorized selected-run delivery continuation/intake with a fresh expected revision, after target resolution and a readable canonical snapshot. Automatic eligibility additionally requires valid seal, no pending transaction, no unrelated blocker, exact approval integrity, one missing registry row and one previously sealed active binding whose artefacts and reviewed evidence still match. If several independent rows are absent or provenance is incomplete, retain the concrete maintenance blocker rather than widening the operation.

The repair function under the existing Run lock rechecks the snapshot and proof, adds only the missing row and the correction audit, and writes a new sealed revision. It preserves every approval receipt and approved artefact. The audit records old/new revision, binding ID, artefact identities/digests, reviewed proof and validation result. Compare the approval-derived permission envelope before/after: it must remain the same. Removing a bookkeeping diagnostic cannot manufacture approval authority; any additional substantive control change is surfaced through the normal event route.

The dispatcher performs at most one such operation for this evaluated revision/relationship, then freshly evaluates the resulting revision before deciding continuation or terminal output. An already complete matching row is a no-op; conflicts are rejected. A competing writer or changed source yields a concrete stale/conflict result without retrying into another revision. Fresh evaluation can reveal another blocker, which is shown normally. No loop, environment/runtime repair or human approval synthesis is possible.

evaluateGateCheck, analyzeDeliveryMap, doctor, delivery-map, explicit status and run-present never invoke the mutation. Correction belongs to the canonical state writer; service.js only coordinates it in authorized delivery. MCP and CLI use the same injected operation, validated containment and target binding. New success/rejection detail is returned through existing diagnostics/evidence and localized presentation owners, without a new dispatcher outcome or independent repair endpoint. Already returned terminal host_action text is never hidden or reinterpreted.

## 5. Constraints And Compatibility

Approval formula, presentation binding, approval receipts, current target/run and terminal-stop semantics remain unchanged. Gate artefacts cannot be marked approved by the recording step. QA retains sole decision ownership. New provenance is additive local evidence; unsupported records fail closed for correction, and historical valid rows are not retroactively rewritten.

Source instructions and generated host profiles are projected through existing sync owners. Public command help/grammar and runtime inclusion change coherently; no code belongs in source-root generated runtime paths. Core cannot import CLI/MCP/SDK/build or start processes. Existing installation-repair deletions are separate worktree changes and do not become this design's implementation or baseline.

Rollback is a scoped source/generated change rollback after stopping this operation. Preserve already recorded valid historical binding/audit evidence; do not erase approvals or downgrade them by hand. Existing readers continue using operative chain rows, but older versions provide no automatic-correction assurance. No rollout, host installation, release or VCS action is authorized by this SD.

## 6. Test And Evidence Strategy

TP must map the nine PRD IDs and all decisions to executable scenarios and evidence without copying acceptance into another register. Secure a reproducible positive redundant-card baseline before implementation, record total/card text and protected events, and separately prove control/evidence parity. A zero-card baseline or a crafted after-only transcript does not demonstrate improvement. If no actual eligible baseline is found, report the evidence gap and revisit the product claim before implementation rather than weaken acceptance.

Use existing dispatcher, presentation, recording/approval, delivery-map and transaction test owners. Required boundaries include prospective recording readiness, valid/absent proof, all registry relationship types/exemptions, old valid rows, strict receipt parsing, stale/foreign/conflicting identities, evidence-file/approved-byte drift, invalid seals, read-only nonmutation, concurrent writers, idempotence and faults before/after commit. Every affected card/state and new message is rendered for every registered locale. Exact pending/current authority and terminal byte transmission remain protected.

Actual Codex observation must identify the loaded version/session and compare the same goal/inputs. Source, generated payload, installed bytes, protocol replay and actual host/model behavior are separate lanes. An isolated proposed runtime can be observed without replacing the user's installed plugin; any installation still requires its own authorization. Host tool blocks are measured separately. Other-host and native-OS gaps remain explicit. No pass or implementation success is claimed by this design.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Consume existing nonterminal packets without routine extra status invocations; record matched positive baseline and total/card text | interaction.md and quality.md; Core dispatcher; Codex evidence owner | SDD-001, SDD-006 | Existing silent workflows cannot prove reduction; TP must secure the actual positive baseline |
| AC-002 | Preserve canonical event/decision/blocker/changed-binding presentation and fresh resumption evaluation | interaction.md; interaction-presentation.js; target/gate owners | SDD-001, SDD-005 | No suppression of terminal text or relevant changed permission; all affected locales tested |
| AC-003 | No persistent dedup cache; unchanged internal work uses continuation, explicit status remains fresh/read-only | service.js; gate-check.js; interaction.md | SDD-001, SDD-004 | Explicit status never opts into mutation or suppression; changed resumption uses fresh control |
| AC-004 | Preserve exact approval receipts/presentation validation and the current approval-derived permission envelope | run-recording.js; approval-operations.js; run-presentation.js; run-state-writer.js | SDD-002, SDD-003, SDD-004 | Missing exact approval-integrity proof disqualifies automatic correction; no approval transfer |
| AC-005 | Keep evaluations/evidence complete; publish state/evidence atomically and record correction audit | control-evaluation owners; run-state-writer.js; run-step-transaction.js | SDD-001, SDD-003, SDD-004, SDD-006 | Publication failures/concurrency are fault-tested; no evidence omitted to shorten chat |
| AC-006 | Existing localized renderer/registry plus separately identified actual Codex before/after observation | interaction-presentation.js; agdf-interaction-locales.json; sync and host evidence owners | SDD-005, SDD-006 | Missing actual host evidence prevents the visible success claim; no installed/all-host inference |
| AC-007 | Existing owner extensions and one shared relationship registry; typed records remain subordinate sealed evidence | delivery-map.js; control-state owners; interaction.md; sync owner | SDD-001, SDD-002, SDD-003, SDD-004, SDD-005 | Additive CLI/evidence format must be coherent; no second workflow/presentation/repair authority |
| AC-008 | Current-gate artefact recording commits pointer/binding/chain together; prospective readiness guards present/approve | run-steps.js; shared relationship helper; gate-check.js; run-recording.js | SDD-002, SDD-003 | Keep absent artefact draftable and non-applicable relationships exempt; respect existing transaction recovery |
| AC-009 | Use sealed exact reviewed binding for one authorized pre-terminal correction; revalidate, audit, reject ambiguous cases | run-state recording/writer; service.js coordinator; interaction-presentation.js | SDD-003, SDD-004, SDD-005 | Legacy proof absent means no autorepair; stale/conflicting/invalid/write-failure cases remain visible blockers |

## 8. Risks And Open Questions

No before-SD product or ownership decision remains open. TP owns concrete baseline fixtures, scenario IDs and host observation procedure. Implementation-preparation Brownfield Analysis must recheck current owners, source diffs and generated inclusion before code work.

Provenance is cooperative evidence, not cryptographic proof of semantic derivation or human intent. Correcting a row is therefore narrower than inventing/reviewing a requirement. The new strict receipt format and prospective validator must avoid breaking legacy rows or creating a preparation loop. The writer's atomic commit point must not be confused with simultaneous filesystem edits to staged artefacts. The approved source/proof bytes are rechecked and subsequent drift remains a blocker. Runtime packaging and fresh host observation may still expose gaps; retain them explicitly.

## 9. Next Step

Review and deliberately approve with `Approval: SD`, revise or decline. Approval permits Task/Test Plan preparation only. Implementation still requires TP approval and implementation-preparation Brownfield Analysis.

## AGDF Approval Summary (de; source=en)

- Lösung: Vorhandene interne Continuations werden ohne zusätzliche Statuskarte pro Prüfung genutzt. Expliziter Status, relevante Änderungen, Blocker und vollständige Freigabepräsentationen bleiben sichtbar. Jede terminale Dispatcher-Ausgabe bleibt wortgetreu und beendet den Aufruf; Prüfungen und Nachweise bleiben vollständig.
- Verantwortung: Interaktionsvertrag und Renderer besitzen die Anzeige; bestehende Kontrollauswertung besitzt Gate-/Beziehungssemantik; bestehender Run-Schreibpfad besitzt Erfassung und Korrektur. Der Dispatcher koordiniert nur vor terminaler Ausgabe. MCP bleibt Transport. Es entsteht keine zweite Status-, Freigabe- oder Reparaturautorität.
- SDD-001: Routineausgaben nutzen bestehende nichtterminale Pakete und eine gemeinsame Sichtbarkeitsregel. Keine globale Einstellung, kein dauerhafter Letzte-Karte-Cache und kein neuer Dispatcher-Ergebnistyp. Nach Unterbrechung wird die Bindung frisch geprüft; explizite Statusanfragen bleiben vollständig und lesend.
- SDD-002: Die vorhandene Beziehungsliste wird einmal gemeinsam genutzt. Beziehungen aktuell erfasster PRD-/SD-/TP-/QA-Artefakte werden bereits vor Präsentation und Freigabe geprüft. Noch fehlende Artefakte bleiben entwerfbar; UR-Freigabe wird nicht vorweggenommen und nicht anwendbare Beziehungen bleiben ausgenommen.
- SDD-003: Ein neuer Schritt im bestehenden `run-step` erfasst aktuelles Gate-Artefakt, explizit geprüfte Quellbindung, Beziehungszeile und Evidenz gemeinsam in einer versiegelten Revision. Eingabe nennt Run/Ziel/Revision, exakte Pfade/Digests, Beziehung und geprüften Ableitungsnachweis mit Reviewer. Sie ist lokale kooperative Evidenz, kein unabhängiger Beweis menschlicher Prüfung. Der Schritt kann keine Freigabe setzen oder QA entscheiden.
- Quellbindung und Transaktion: Versionierte, streng geprüfte Bindungsbelege liegen als Evidenz im versiegelten Run und verweisen auf konkrete Artefakte und Ableitungsprüfung. Gate-Reihenfolge oder „Based on: UR“ allein reichen nicht. Historie bleibt erhalten; explizite Entwurfsaktualisierung ersetzt die aktive Bindung nachvollziehbar. Bestehende Locks, Revisionsprüfung, atomare Veröffentlichung und gegebenenfalls das bestehende Journal bleiben maßgeblich. Teilzustände erreichen keine Freigabereife; Fehler nach dem Commit dürfen nicht als unveränderte Operation gelten.
- SDD-004: Nur autorisierte Fortsetzung eines eindeutig gebundenen Runs darf vor terminaler Ausgabe eine fehlende Zeile mit bereits versiegeltem, weiterhin passendem Beleg korrigieren. Erforderlich sind gültiger Zustand, unveränderte genehmigte Artefakte, eindeutige Bindung und keine anderen Blocker. Höchstens ein Versuch, dann frische Auswertung; Audit nennt alte/neue Revision und Nachweise. Freigaben und daraus abgeleitete Berechtigungen bleiben unverändert. Konflikte, veraltete Revisionen, fehlende Belege, Siegeldrift und Schreibfehler bleiben konkrete Blocker; Wiederholung erzeugt keine Duplikate oder Schleifen.
- Lesende Grenze und Altbestand: Doctor, Status, Gate-Auswertung und `run-present` schreiben niemals automatisch. Alte gültige Beziehungszeilen bleiben gültig. Ohne maschinenprüfbaren Bindungsbeleg gibt es keine Autoreparatur; eine fehlende Zeile wird dann ausdrücklich mit geprüftem Nachweis erfasst. Keine pauschale Migration, Siegelreparatur, automatische Erstellung fehlender Artefakte oder Übertragung einer Freigabe.
- SDD-005: Betroffene Texte und Darstellungen bleiben im bestehenden Locale-/Renderer-Owner. Kanonische Anweisungen und generierte Hostprofile werden konsistent projiziert. Jeder betroffene Fall/Zustand und neue Text wird in allen registrierten Sprachen tatsächlich gerendert geprüft; keine hosteigene normative Variante.
- SDD-006: Vor Implementierung muss ein reproduzierbarer Ablauf mit tatsächlich vorhandenen redundanten Karten gesichert werden. Kartenanzahl/-text, Gesamttext, geschützte Ereignisse und Kontroll-/Evidenzvollständigkeit werden getrennt verglichen. Mindestens ein tatsächlicher Codex-Ablauf mit benannter geladener Version/Session muss die Verbesserung belegen. Andere Hosts erhalten nur eigene belegte Aussagen; Tool-Blöcke werden separat gezählt. Ein isolierter Runtime-Versuch ersetzt keine Hostbeobachtung.
- Integration und Kompatibilität: Bestehende CLI-/Core-/Dispatcher-Pfade werden erweitert; optionales versioniertes Bindungsevidenzformat und der bestehende `run-step` mit zusätzlichem Schritt `artefact`, Gate und Evidenzeingabe werden gemeinsam dokumentiert/projiziert. Beispiel: `run-step --step artefact --gate SD --evidence recording-input.json`. Kernpaketgrenzen, exakte Freigabeformel, Präsentationsbindung und terminale Stoppregeln bleiben erhalten. Rücknahme erfolgt zusammenhängend in Quelle/Projektion; historische gültige Belege und Freigaben bleiben erhalten. Ältere Runtime-Versionen besitzen keine neue Autoreparaturfähigkeit. Keine automatische Installation, Veröffentlichung oder Git-Aktion.
- Abdeckung: Alle neun PRD-Kriterien sind jeweils genau einmal auf technische Umsetzung, bestehenden Owner, Entscheidungs-IDs und Kompatibilitätsrisiko abgebildet. TP plant positive/negative Beziehungs-, Freigabe-, Wiederholungs-, Konkurrenz- und Schreibfehlerfälle einschließlich beider Seiten des Commit-Punkts sowie lesende Nichtmutation und terminale Textparität.
- Risiken und offen: Kooperative Quellbindung beweist keine fachliche Ableitung unabhängig; Review/QA bleibt nötig. Alte Datensätze, neue strikte Belege, Vorbereitungsschleifen, Commit-/Dateigrenzen und Runtime-/Hostnachweise müssen geprüft werden. Konkrete Vergleichsfälle, Szenario-IDs und Beobachtungsverfahren entscheidet Codex im TP. Keine Implementierung oder Erfolgsaussage wird mit diesem Design behauptet.
- Nächster Schritt: `Approval: SD` erlaubt ausschließlich den Aufgaben- und Testplan. Implementierung benötigt danach TP-Freigabe und die vorbereitende Brownfield-Analyse. Überarbeitung oder Ablehnung bleiben möglich.
