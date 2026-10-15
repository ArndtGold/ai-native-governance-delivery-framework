# SD: Reliable MCP runtime and coherent Codex host setup

Status: draft
Gate: SD
Gate approval: open
Based on: Exact approved PRD, registered Brownfield Review and ready UX Intent Definition
Date: 2026-10-14
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the existing runtime and Codex lifecycle boundaries rather than introducing a new server, scheduler, configuration registry or approval owner. One causal observation path isolates preparation, claim, facade/generation qualification, worker startup/provenance, Core execution/commit and response delivery. Preserve the fixed public MCP command envelopes and original UUID/receipt semantics.

The regular installed product remains plugin-owned agdf. An optional project-bound Cockpit remains a separate read/App role: the regular Codex launcher has no bound project argument and the current Cockpit render schema lacks a target directory. Consolidating those endpoints would invent target semantics, so it is rejected for this scope. Existing preparation and package/App owners supply the exact qualified Cockpit tuple, with supported owned registration and lifecycle; a diagnostic dist/local path never becomes product proof merely by renaming.

Host setup is a read-only derived observation of authoritative plugin, project/user configuration, verified installed runtime and available actual host/session facts. Host policy and shared App storage remain Codex-owned. Existing Codex file transactions perform only specifically proven owned transitions; diagnostic descriptors establish setup provenance and intended lifetime, never a second effective configuration authority.

Production changes wait for approved SD/TP and pre-implementation Brownfield evidence. This design resolves ownership and intervention constraints; actual historical startup/timeout causes and final qualification are not claimed complete.

## 2. Ownership And Source Of Truth

| Responsibility | Existing authoritative owner | Extension boundary |
|---|---|---|
| Product metadata and declaration | plugins/agdf/meta/agdf-plugin.definition.json; Core plugin-provenance renderer; supported installers | Keep agdf plugin declaration sole regular registration; do not shadow it in user/project config |
| Runtime preparation/publication/claim retention | packages/cli/lib/mcp-lifecycle/package.js and plugin-runtime.js | Bounded contention and safe phase reasons, exact inspections and immutable roots |
| Direct generation transport and private lifecycle | packages/mcp-server/src/generation.js, generation-entry.js and generation-protocol.js | Keep epoch/generation/message bounds, capacity, acknowledged exit and uncertain work protection |
| Isolated tool execution | packages/mcp-server/src/worker.js and worker-entry.js; existing server executor composition | Phase measurements, coherent busy/draining state and same-invocation optimization only |
| Canonical control effect and recovery | packages/core/lib/control-state/ and existing evaluators/read owners | Original exact receipts/revisions and writer transactions; no transport-defined approval |
| Native Codex registration/precedence observation | packages/cli/lib/mcp-lifecycle/adapters/codex.js, host-config.js and file-utils.js | Closed AGDF role selectors, read-only source composition and safe owned transactions |
| Lifecycle composition/results | packages/cli/lib/mcp-lifecycle/service.js, result.js, presentation.js; existing install/setup clients | One operational projection and action path; do not fork guided installation semantics |
| Existing legacy plugin migration/prewarm | packages/cli/lib/host-adapters/codex/plugin-mcp.js | Regular agdf migration/prewarm remains its existing owner |
| Optional project Cockpit and probe preparation | scripts/prepare-cockpit-local.mjs; scripts/native-probes/core-mcp-decision.mjs; existing packaging/test owners | Exact preparation, managed role/descriptor and completion/abort cleanup; not arbitrary process management |
| App resources, view/session and native qualification | packages/cli/lib/mcp-dispatch-runtime.js; packages/mcp-server/src/server.js, ui-capability.js, cockpit-resource.js; existing Core session/provenance owners | Same resource/target/approval semantics and exact native tuple gates |
| Effective host policy/discovery/rendering/data | Codex installed host and its applicable managed/user/project/plugin layers | Observe supported facts; no override or simulated host authority |

## 3. Architecture Decisions

- SDD-001: Keep one safe phase/error observation path in the existing launcher, generation and worker owners, with run-local causal evidence; rationale: Broad catches conceal different mechanisms; the isolated live-lock experiment proves a real misclassification, not the historical cause; consequence: No raw exception stack, private argv/payload or secret enters normal MCP output; existing command/result identities remain unchanged.
- SDD-002: Extend the existing package publication/claim owner with bounded live-contention handling and distinct contention versus invalid-integrity failure; rationale: Valid live publication ownership must not be reported as corrupt executable claim; claim acquisition occurs both for facade and direct generation children; consequence: Keep the same lock, exact fresh inspection and immutable retention; do not remove live/unknown locks or claims by PID inference.
- SDD-003: Retain a fresh isolated Worker and full runtime proof per request; measure its phases and keep executor capacity occupied until termination is confirmed; rationale: Avoid introducing cross-request provenance caches, persistent workers, queues or duplicate schedulers as speculative performance fixes; consequence: Optimize only demonstrably repeated work within one invocation at its existing owner; unknown effects and original receipt recovery remain authoritative.
- SDD-004: Use one derived Codex setup observation in the existing lifecycle/adapter/presentation path, combining plugin declaration and relevant project/user facts; rationale: The current exact-agdf native adapter and plugin helper each own part of the topology; neither raw config nor CLI presence alone proves desktop effective state; consequence: No second mutable registry; preserve source identity and distinguish declared, directly observed and unavailable facts.
- SDD-005: Extend existing Codex registration transactions with a closed role/identity selection and digest-bound preview/revalidation for owned transition or cleanup; rationale: Product, optional bound Cockpit and descriptor-proven diagnostics require safe reconciliation across current sources; consequence: Default plugin-managed agdf behavior and all other host adapters remain unchanged; only exact in-scope owned sections may change.
- SDD-006: Keep a separate optional project-bound Cockpit runtime through the existing opt-in preparation/App owner; use agdf-cockpit as the new managed product ID with guarded legacy transition; rationale: Regular Codex plugin launcher has no project-root binding and the current agdf_cockpit input carries no target directory; forced consolidation would change target/authority semantics; consequence: Tool basenames and resource/session contracts remain; unknown external references or live old clients prohibit silent ID replacement and remain explicit compatibility/freshness state.
- SDD-007: Make existing probe/preparation helpers own diagnostic descriptors and idempotent activation/completion/abort cleanup through the same Codex transaction owner; rationale: Prepared candidates currently do not constitute automatic registration ownership; observed wrapper command needs independent exact proof; consequence: New diagnostic IDs use agdf-test-*; legacy names require exact source/config/descriptor proof; foreign/shared state and historical evidence are retained.
- SDD-008: Keep existing server/App capability, exact native qualification and text/document fallback owners; never qualify native mediation from a test override; rationale: Configured, started, discovered, rendered and interacted are separate host facts; consequence: A UI resource or same version is not native qualification; registration removal does not erase shared host browser data.
- SDD-009: Coordinate local build/prewarm/install and runtime update through existing supported package/installer owners, freezing final source and installed identities; rationale: Steady-state startup should reuse the exact prepared SDK/runtime; old claimed generations and sessions remain protected; consequence: No manual cache patch, new release, host restart, broad runtime deletion or arbitrary budget/deadline increase.
- SDD-010: Keep criteria-chain-v1 and existing Core operation/QA/closeout ownership as the only acceptance and committed-effect authority; rationale: Reliability, topology and diagnostic evidence must not grant delivery or transfer approvals; consequence: Preserve all approved bytes and original operation UUID/digest/revision; new QA/UAT/OR remain required.

### Causal observation and repair protocol

The baseline evidence file evidence/SD_CLAIM_CONTENTION_MECHANISM.json exercises existing source in an owned disposable directory. A proven live publication lock throws AGDF_RUN_WRITE_LOCKED from acquireMcpExecutableClaim while launchPluginMcpServer emits AGDF_MCP_EXECUTABLE_CLAIM_INVALID. This proves the misclassification mechanism; it does not prove that a lock caused the earlier recorded incident. The experiment used injected runtime preparation and did not validate a complete real runtime, mutate product/configuration or loosen a guard.

Record phase, bounded monotonic elapsed time, safe owner-local reason and producer/version/digest reference. Use existing injected seams and generation onEvent hook for reproduction; keep full sensitive exceptions only out of normal output and do not persist secrets in evidence. Diagnostic vocabulary is owned by the launcher/runtime result path, not duplicated by tests or product UI. Do not change fixed MCP top-level schemas or classify an undispatched request as an executed effect.

evidence/SD_INSTALLED_CLAIM_CONTENTION_MECHANISM.json repeats the same isolated mechanism using actual installed package.js/plugin-runtime.js from candidate 0.14.5+codex.local-a90b74966806 and obtains the same live-lock/misclassified output. It uses synthetic preparation and is explicitly not a full configured-plugin launch, corrected-candidate proof or historical root-cause claim.

For claim acquisition, treat only an exact live-owned publication lock as contention. Retry through the same package owner within the remaining existing publication deadline, with the existing bounded-delay policy and an additional bounded claim wait whose ceiling is set before implementation in TP from the measured hold times. Unknown/malformed/foreign locks and actual package/digest/marker/path mismatch stay refused; no broad retry-on-error. The design forbids extending the current overall publication/worker/generation budgets as the remedy. If a host's effective startup deadline is shorter, report that fact and use existing supported preparation/prewarm; never silently rewrite host timeout settings.

Apply the same classification at facade and direct-child claim sites. Every successful acquire still runs the current fresh provenance/marker/path checks under the original lock and writes the original immutable retention claim. No cross-request cached hash or claim liveness garbage collector is added.

### Executor and deadline behavior

Retain per-request Worker isolation and per-request full runtime validation. Instrument startup/import/provenance, operation and result/termination separately; generation IPC qualify/invoke and host startup/tool deadlines are distinct. Inspect cancellation/busy/draining before dispatch. On result, timeout, error or cancel, occupancy stays protected until actual worker termination is confirmed; no new request may run through a temporarily cleared active slot while previous execution may still be ending. The caller still receives a bounded error/uncertain effect if termination cannot be confirmed; the owner retains protected capacity rather than silently replacing an unconfirmed executor.

Keep current 10-second worker default, generation protocol ceilings and public cancellation/unknown semantics. Remove only proven redundant same-invocation work at its existing owner, with captured source bytes/revalidation and full mutation-under-lock checks intact. Reject speculative persistent workers, cross-request provenance caches, generic queues, parallel writes or a second scheduler. A measured defect requiring one of those architecture changes must return for design reassessment before implementation; unknown required normal-path deadline failures cannot be hidden as successful qualification.

A response timeout after possible dispatch preserves original operation_id/request digest/run/revision and routes to existing operation-status and exact replay. It never asserts rollback or creates a new mutating UUID. IPC response loss and unconfirmed generation/session shutdown remain separately protected.

### Codex roles and compatibility transition

Resolve product role from the installed plugin declaration and proven existing preparation/descriptor. Keep one regular plugin agdf; native project/user entries with that ID are legacy/conflict evidence and must not silently shadow the plugin. Reuse existing marked legacy migration; foreign same-name entries are preserved and reported.

Optional Cockpit remains project-only with a real canonical target and read-only mode. The new managed ID is agdf-cockpit, displayed as AGDF Cockpit in AGDF-owned presentation. Existing agdf-cockpit-local can be transitioned only after exact before/after command/runtime/resource/tool-manifest and reference proof. Preserve tool basenames, contained target/read boundary and resource URI. If namespace consumers or live old clients cannot be accounted for, retain the exact old ID as an explicit compatibility state, without installing a duplicate ID or claiming completed migration. Its finite exit condition is a separately observed supported client refresh and verified reference transition; Arndt Gold remains accountable for that accepted compatibility boundary through SD approval. Codex settings may display technical IDs; do not invent a display-name field the host does not support.

Preparation remains opt-in and activated:false until a supported owned registration transaction is complete. Existing Cockpit profile/source/package construction is reused and bound to the final qualified source; a normal plugin install does not automatically enable another project server or widen scope. Existing Codex product enable guard stays unchanged for default governance role. An explicit closed Cockpit role uses the same transaction owner, not a second adapter or a generic arbitrary-section writer.

Diagnostic IDs for new work use agdf-test-* and explicit role/owner/target/lifetime. The observed agdf-cockpit-draft-check and agdf-decision-probe are bounded legacy candidates, not universal matching rules. A descriptor must prove exact original config bytes, command/args/wrapper and digest, canonical target/runtime, owner and intended effect. If historical descriptor proof is absent, record unavailable ownership and require an exact user-reviewed declaration before removal; do not fabricate ownership from this SD or a temp path.

### Safe lifecycle transactions and derived host state

Use a closed role spec and allowlisted ID/legacy alias policy in existing Codex adapter/service code. Capture all affected authoritative sources before mutation; validate contained files, duplicate/nested unsupported sections, collision and scope/precedence. Preview the exact intended section difference, preserve all foreign sections/tool rules, revalidate bytes immediately under existing transaction locks and re-read the owned result. Share existing snapshots/journal/reference/retirement primitives. A rollback may restore only its exact unchanged owned post-state; if another owner changed configuration, retain the conflict and require bounded recovery rather than overwriting it.

Status reads never migrate or create ownership marks. Plugin/proj/user origin, role, target, source identity, runtime identity, lifecycle owner and evidence strength are projected from these sources. Extend the existing lifecycle result/diagnostic composition with bounded optional role/setup observations in its current owner; preserve existing required fields/schema behavior for default consumers and cover additive compatibility. Do not use a new persistent status file as effective truth.

Call existing supported native readback where available, but preserve its client variant and actual returned fields. A CLI mcp get presence observation is not desktop UI, effective permission policy or fresh session proof. Raw configured timeouts/permissions are declared; native confirmed values are observed; managed policy/unavailable fields remain unknown. Actual current connection/generation observations can show old/new runtime identity without scanning all host processes. No process count or config toggle proves discovery/rendering.

Owned disable/remove and test cleanup reconcile only declared owned entries/references. Directly owned children use existing acknowledged shutdown/exit; arbitrary shared Codex processes are not killed. Config removal with an old still-running host session is reported as such and needs a supported user-triggered refresh, not automatic app restart. Shared MCP-App storage is never purged by AGDF. Retain uncertain/claimed immutable runtimes until existing retention proof permits removal.

### App qualification

Reuse io.modelcontextprotocol/ui capability observation, existing resource validation, target/read and presentation/session binding, and exact host/server/dispatcher/SDK/resource qualification tuple. No prepared disposable appOnlyMediationQualified override may enter product qualification. Keep enabled/configured, process started, tools discovered, App rendered and interaction proven independently evidenced. Unsupported or unobserved native rendering preserves the existing text/document fallback and human gate decision binding. New configuration, a resource read or an old successful view does not establish fresh current App behavior.

## 4. Integration Points

The plugin manifest/launcher flows into the existing immutable package publisher, private generation facade and per-request executor. Scoped Core commands own business effects and receipts. Separately prepared Cockpit connects an explicit project to existing read/session/resource owners. Existing setup/lifecycle clients use one Codex transaction and observation owner for plugin/proj/user facts and bounded role transitions. Native probes reuse existing protocol client/helper fixtures and descriptor provenance; they cannot grant host, gate or cleanup authority.

## 5. Constraints And Compatibility

Preserve fixed MCP command schemas, gate values/formulas, original receipt/history semantics, target containment, SDK/content proof, private IPC bounds and epoch routing, three-slot generation capacity, uncertain work/view retention and acknowledged shutdown. No SDK override, hand-patched cache, global process kill, wider host permission/scope, App-data wipe or automatic restart. Default Codex governance activation remains plugin-managed and other hosts are unchanged.

Any additive lifecycle observation is backward compatible under its existing result/profile/presentation owners and must retain existing consumers/tests; no new cross-host config format or public control operation is introduced. Product/test naming migration is conditional on exact ownership and consumer compatibility; partial/retained states are truthful outcomes rather than successful cleanup. Before QA, no required confirmed defect or required evidence gap may be left unresolved.

## 6. Test And Evidence Strategy

TP fixes the exact baseline, candidate, workloads, sample counts, per-phase measurement, bounded claim wait ceiling and expected results before implementation. Existing applicable performance, payload/instruction and protocol guards remain unchanged. The isolated live-lock mechanism becomes an actual valid-runtime contention regression, with direct launcher and child/facade claim paths, genuine invalid provenance, unknown/foreign owner and expired budget cases.

Exercise worker startup/validation/execution/termination, cancel/busy, post-commit response loss, IPC/generation timeout, exact original status/replay and unchanged-state refusals. Causal hypotheses require supported reproductions or concrete counterevidence; random repeated success alone does not explain a historical failure.

Cover plugin/proj/user defaults, Cockpit capability before/after, technical ID/reference compatibility, managed/foreign conflicts, repeat/disable/reactivate/migrate/remove, partial failure/rollback and exact diagnostics descriptor cleanup after completion/abort. Actual old sessions are reported, not silently killed. Native App tests remain distinct from protocol/resource fixtures, and every native claim requires current direct proof.

Use existing normal build, supported preparation/install/prewarm, exact marketplace/cache/frozen source and actual configured launcher/STDIO lanes. Do not overlap generation/build/install. Any final source change requires affected requalification. Reviews, sole QA and new human QA/UAT/OR use existing writers and preserve earlier completed Runs. No production/host mutation occurs during SD authoring.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Phase-coded exception/timing observations and causal counterprobes at original owners | Launcher/generation/worker and scoped causal report | SDD-001 | Observed mechanism is not automatically historical cause; unknown required cause remains a QA gap |
| AC-002 | Baseline/candidate regressions against actual corrected path; each mechanism retains counterevidence | Existing runtime/lifecycle test owners | SDD-001, SDD-002, SDD-003 | No test-only fix or speculative replacement |
| AC-003 | Separate cold/warm, phase and producer timing; remove proven redundant same-invocation work only | Existing executor/runtime/package and performance owners | SDD-002, SDD-003 | Keep existing deadlines and applicable p95 guards; any bound change requires measured reassessment |
| AC-004 | Fresh package proof, preserved lock/claim owner and exact Core uncertain-operation recovery | Package claim owner; Core operations/transactions | SDD-002, SDD-003, SDD-010 | No live/unknown retention deletion, new UUID or timeout-as-rollback inference |
| AC-005 | One allowlisted safe startup line and existing diagnostics/recovery result fields | Launcher and existing MCP failure serializers/locales | SDD-001 | Public schemas/envelopes unchanged; unsupported error detail stays unknown |
| AC-006 | Supported install/prewarm then byte/source/producer proof and real installed transport cases | Existing build/installer/provenance/test owners | SDD-009, SDD-010 | Test/probe generation and old loaded namespace cannot qualify final product |
| AC-007 | Source-bound criteria/review/evidence and sole QA with fresh acceptance and OR | Existing control writers and quality/closeout owners | SDD-009, SDD-010 | No altered gates/receipts or weakened size/assertion guards |
| AC-008 | Regular plugin agdf plus optional explicit project Cockpit; guarded closed-name migration retaining tool/resource semantics | Plugin manifest; existing Codex adapter and Cockpit preparation | SDD-004, SDD-005, SDD-006 | Keep justified separation; detect unknown namespace consumers/old client before migration; no duplicate config |
| AC-009 | Exact descriptors and command/source proof for explicit temporary setup and cleanup | Existing probe/preparation and Codex transaction owners | SDD-005, SDD-007 | Old path/name is not ownership; preserve unmatched and active/shared state |
| AC-010 | Attribute single/multi-client and diagnostic lanes, deadline layers and actual producer | Existing runtime/lifecycle observation and qualification owners | SDD-001, SDD-003, SDD-004 | Host configured values are not assumed effective; source and host observations remain distinct |
| AC-011 | Bounded read-only topology/state projection with origin, role, runtime and evidence strength | Codex adapter/lifecycle/result/presentation and actual host observations | SDD-004, SDD-008 | No mutable mirror, false precedence, fabricated effective permissions or rendered state |
| AC-012 | Closed roles reuse owned transactions/references/snapshots and lock-bound exact revalidation | Codex adapter/file transactions; existing lifecycle/installer | SDD-005, SDD-006, SDD-009 | Partial rollback never overwrites foreign changes; legacy/collision/disabled/shared cases retain explicit state |
| AC-013 | Existing capability and native tuple checks plus unchanged bound text/document path | MCP server/UI/session and Core presentation owners | SDD-008 | No resource-as-rendering or App override promotion; direct native claims need fresh proof |
| AC-014 | Separate config transition, directly owned session end and host-data ownership/freshness facts | Existing lifecycle/probe/generation ownership; Codex host | SDD-004, SDD-005, SDD-007, SDD-008 | No automatic host restart, shared storage purge or unverified process kill |

## 8. Risks And Open Questions

The isolated lock test establishes a source mechanism, not historical causation or real-runtime validity. Root causes of remaining startup and timeout observations remain evidence obligations. Missing ownership for legacy wrappers may prevent automatic cleanup; that is retained explicitly. Whole control capture can reject concurrent source changes legitimately, as observed during PRD readiness; no blanket snapshot retry/guard weakening is permitted.

A raw host timeout may be shorter than initial package acquisition or generation qualification; supported installer prewarm and safe phase reporting are primary routes. Changing a measured budget or executor architecture needs design reassessment. Claim retirement remains conservative and may retain bytes after crashes; no debt is hidden by deleting unconfirmed claims. Existing legacy namespace/session compatibility is bounded by verified consumer transition/user refresh, never a permanent silent alias or duplicate product server.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Diagnostic and causal boundary | before_sd | resolved | Existing owners expose safe phases; preserve historical uncertainty; actual required defect proof precedes passing QA. | Arndt Gold; launcher/runtime owner |
| Claim contention versus integrity | before_sd | resolved | Same publication lock and fresh proof, bounded wait only for proved live contention under existing total budget; unknown/foreign/integrity still refuse. | Arndt Gold; package claim owner |
| Executor architecture and proof | before_sd | resolved | Fresh per-request Worker and full provenance; protect capacity until confirmed end; no cross-request cache or new scheduler. Proven same-invocation waste only. | Arndt Gold; MCP executor owner |
| Product and Cockpit separation | before_sd | resolved | Regular agdf stays plugin-managed; project-bound optional Cockpit stays separate to preserve target/schema; reject forced consolidation. | Arndt Gold; existing server/App owner |
| Names and compatibility exit | before_sd | resolved | New managed Cockpit ID agdf-cockpit; exact guarded legacy transition only. If old client/reference cannot be accounted for, retain old ID visibly without duplicate; exit on supported refresh and verified transition. | Arndt Gold; Codex lifecycle owner |
| Registration and cleanup authority | before_sd | resolved | One existing Codex transaction owner with closed roles and exact preview/revalidation; descriptors alone do not adopt foreign state. Unknown proof requires exact reviewed declaration. | Arndt Gold; Codex adapter/setup owner |
| Effective host state and native claims | before_sd | resolved | Derived bounded observations only; preserve host variant, policy, session and shared data authority; native render/interaction require exact fresh proof. | Arndt Gold; existing lifecycle/App owners |
| Installation/update and default consumers | before_sd | resolved | Existing supported build/install/prewarm and compatibility-preserving result composition; no default second server, cross-host change or automatic restart. | Arndt Gold; installer/lifecycle owner |
| Claim hold measurements, fixed ceiling and causal scenarios | later_tp | deferred | TP assigns numeric bounded claim ceiling within unchanged total budget, workloads and scenario expectations from baseline timing before production changes. | Task/Test Plan owner |
| Exact installed/native and cleanup ownership evidence | later_tp | deferred | TP names source/package/runtime/host lanes, descriptor proofs, baseline regressions and permitted native refresh/observation limits. | Task/Test Plan owner |

## 9. Next Step

Review this exact SD. A new Approval: SD permits Task/Test Plan drafting only; approved TP and implementation-preparation Brownfield evidence are required before production/runtime/configuration changes.

## AGDF Approval Summary (de; source=en)

- Lösung: Bestehende Launcher-, Paket-/Claim-, Worker- und Codex-Lifecycle-Owner erweitern. Sichere Phasenmessung trennt Start, Herkunftsprüfung, Ausführung, Commit und Antwort. Keine zweite Registry, Laufzeit oder Freigabeautorität.
- Ursachenbeleg: Ein isolierter Versuch bestätigt, dass eine lebende Veröffentlichungssperre als ungültiger Claim gemeldet wird. Das beweist den Mechanismus, nicht die Ursache jedes früheren Vorfalls; weitere Pflichtursachen bleiben Untersuchungsaufgaben.
- SDD-001: Sichere Phasen-/Ursachendiagnose an den bestehenden Owners; keine privaten Payloads oder erfundene historische Ursache.
- SDD-002: Lebende Claim-Konkurrenz begrenzt behandeln, echte Integritätsfehler weiter verweigern. Gleiche Sperre, frische Prüfung und unveränderte Gesamtgrenzen; kein Löschen unklarer Claims.
- SDD-003: Frischen isolierten Worker und volle Laufzeitprüfung erhalten. Kapazität erst nach bestätigtem Ende freigeben; nur belegte redundante Arbeit innerhalb eines Aufrufs optimieren, keine neue Queue oder Anfrage-übergreifende Prüf-Caches.
- SDD-004: Host-Zustand aus vorhandenen Plugin-/Projekt-/Benutzerquellen und tatsächlichen Beobachtungen ableiten. Deklarierte, wirksame, alte und unbekannte Werte bleiben getrennt.
- SDD-005: Bestehende Codex-Transaktionen mit geschlossenen Rollen und exakter Vorher-/Nachher-Prüfung verwenden. Fremde Regeln, Scope und Standard-Pluginbetrieb erhalten; kein allgemeiner Konfigurationswriter.
- SDD-006: Optionales projektgebundenes Cockpit bleibt getrennt, damit Zielbindung und Öffner erhalten bleiben. Neuer verwalteter Produkt-ID agdf-cockpit; Alt-ID nur geprüft überführen. Bei unklaren Verbrauchern/alten Sitzungen sichtbar erhalten, keine Doppelregistrierung; Ende der Ausnahme durch geprüften Wechsel und bewusste Sitzungsaktualisierung.
- SDD-007: Tests verwenden agdf-test-* und exakte Deskriptoren. Bestehende Probe-/Setup-Owner sichern Aktivierung, Abschluss, Abbruch und wiederholten Cleanup. Alte Testnamen oder Temp-Pfade allein erlauben keine Löschung.
- SDD-008: Bestehende App-Fähigkeits-, Sitzungs- und Qualifizierungsprüfung erhalten. Serververbindung, Ressourcen und tatsächliche App-Darstellung getrennt; Text-/Dokumentfallback bleibt gebunden. Gemeinsame Host-App-Daten bleiben geschützt.
- SDD-009: Normaler Build, unterstützte Vorbereitung/Installation und Vorwärmung qualifizieren den exakten finalen Stand. Alte beanspruchte Generationen/Sitzungen erhalten; keine Cache-Handpatches, Neustarts oder freien Budgeterhöhungen.
- SDD-010: PRD-Kriterien, Core-Belege, alleinige QA und neue QA/UAT/OR bleiben die vorhandene Autorität. Keine alten Freigaben übertragen oder unklare Wirkung mit neuer UUID wiederholen.
- Entscheidungen: Architektur, Zuständigkeiten, Cockpit-Trennung, Namenswechsel-Bedingungen, Cleanup und Nachweisgrenzen sind entschieden. TP konkretisiert begrenzte Claim-Wartezeit, Messlast, Regressionen und genaue installierte/native Belegspuren vor Umsetzung.
- Grenzen und Risiken: Restliche historische Ursachen sind offen; Alt-Probe-Ownership kann fehlen. Hostwerte und alte Sitzungen können abweichen. Konservativer Claim-Erhalt bleibt; fremde Einstellungen, gemeinsame Prozesse und App-Daten werden nicht pauschal bereinigt. Native Aussagen brauchen frische direkte Belege.
- Nächster Schritt: Approval: SD erlaubt Task/Test Plan. Der neue Produktionsfix und die Hostbereinigung sind noch nicht umgesetzt.
