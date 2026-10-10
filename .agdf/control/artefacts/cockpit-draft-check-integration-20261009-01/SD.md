# SD: Bound draft checks in the Cockpit

Status: draft
Gate: SD
Gate approval: open
Owner: Arndt Gold
Date: 2026-10-09
Run: cockpit-draft-check-integration-20261009-01
Language: en
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## Solution Overview

Extend the existing Cockpit read path with one selected-context draft-check operation. Reuse the existing artifact-readiness evaluator, safe captured filesystem view, read worker, session guards, typed transport and central reading state. The selected undertaking gets one reusable draft-check presentation; documented approval rows and current control assessment retain their own meanings and owners.

The standalone model-facing agdf_inspect artifact-readiness operation keeps its existing input/output and read-only semantics. The App uses agdf_cockpit_read instead of the general inspect tool: its target is fixed by the established session, and its Run/gate/revision/source derive from the currently verified selection. No arbitrary file path or target is accepted.

The flow is: select the undertaking and capture a bounded draft-source descriptor without running authoring checks; deliberately check that descriptor; verify the old selection and source snapshot; replace the read scope with one fresh capture containing the same selected Run and the same Core check; revalidate before publishing; install the new scope only if the client selection and request generation still match. Existing source-change observation then covers that checked draft. Reload obtains a new unchecked context, never an automatic authoring check.

This is a design, not an implementation or native-host result. The exact approved PRD remains product authority. The compact documented-approval Run is contextual reuse and is not rewritten or used as an approval source.

## Ownership And Source Of Truth

| Responsibility | Existing owner and planned change | Boundary |
|---|---|---|
| Authoring checks and original reports | packages/core/lib/control-inspect/artifact-readiness.js; extract its current projection into one reusable internal evaluator inside this owner | Same UR/PRD/SD/TP validators, source/gate/seal guards and original report; no App/MCP content validator |
| Safe immutable source observation | packages/core/lib/control-read/snapshot.js and fs.js | All selected draft, Run and validator dependencies pass through the existing captured read view and final revalidation; no native filesystem bypass |
| Selected source descriptor and result envelope | packages/core/lib/control-inspect/cockpit.js | Derive the canonical gate draft from selected Run and existing Core assessment; source descriptor is not a readiness verdict or registration |
| MCP selectors and session lifecycle | packages/core/lib/control-inspect/cockpit-contract.js and cockpit-session.js | Add one allowlisted operation; fixed target, exact snapshot/selected Run/revision, generation, expiry and existing context invalidation |
| Bounded execution and changes | packages/core/lib/control-read/cockpit-worker.js, cockpit-pool.js, control-changes.js | Same worker, limits, capture replacement, dependency monitoring and change/freshness semantics |
| MCP and local browser transport | packages/control-ui/src/mcp/transport.ts, api.ts, types.ts; packages/control-ui/server/service.mjs | Thin adapters over the same Core reader; strict request/envelope/data validation; no generic tool bridge or additional result authority |
| Client selection and commits | packages/control-ui/src/App.tsx and state.ts | Central selected reading generation/scope owns installation; a dedicated useDraftCheck controller owns only ephemeral request/cancellation/loading, not product validation |
| Visible draft state | Reusable DraftCheck presentation consumed by RunDetail.tsx and the selected CompactCockpit.tsx context | Same semantic result and deliberate action in wide/narrow/expanded/compact reading; saved approvals remain separate |
| Canonical delivery mutations and approvals | Existing authoring, run-step, run-present, run-approve and QA owners | Draft checking never invokes them; later corrections/approvals remain outside this action |

## Architecture Decisions

- SDD-001: Reuse one Core authoring projection inside the existing artifact-readiness owner and call it from both the standalone captured inspector and the Cockpit captured reader; rationale: nested independent captures could report success outside the selected view and duplicate validation would create a second authority; consequence: a bounded internal refactor is required with parity and no-write regression proof, while the public inspect report remains compatible.
- SDD-002: Add artifact_readiness to the existing allowlisted Cockpit MCP read schema and the authenticated local browser adapter, carrying selected snapshot/Run/gate/expected revision only; rationale: the general agdf_inspect tool accepts target context that is inappropriate for an App-bound session; consequence: the compatibility-sensitive interface grows additively, with strict server and client validation and no fallback to a broader tool or path selector.
- SDD-003: Capture the canonical unregistered draft's availability/content identity as a selected-source dependency, and use an explicit scope replacement for checks with revalidation and exact binding; rationale: a frozen view cannot safely gain new dependencies later and Run revision alone misses changed draft bytes; consequence: successful and authoring-unready checks publish a new snapshot and regenerated resource selectors, while source changes fail closed and require reload.
- SDD-004: Derive display outcome/recovery in the Core read projection while retaining the original report and nested readiness findings; rationale: client content rules or a blanket false-ready error classification would misrepresent Core authority and blocked prerequisites; consequence: a bounded presentation projection and localized explanation accompany the raw outcome, with unknown/unavailable information remaining explicit and no semantic completeness claim.
- SDD-005: Keep result installation with the central reading reducer and isolate ephemeral check orchestration in a selected-context controller with cancellation/request epochs; rationale: both server generation and live client binding must reject late replies, and App must not gain another result cache or gate decision point; consequence: check commits replace scope atomically and invalidate old requests/results on navigation, reload, stale source, session replacement or teardown.
- SDD-006: Render one reusable inline draft-check component in the selected context with stable focus identities, deliberate disclosures and accessible bounded loading/results; rationale: action/state semantics must remain identical across widths without disturbing documented approvals or existing scroll/focus recovery; consequence: responsive layout and accessible live status reuse existing styles/reading-position handling, with fresh visible keyboard/scroll evidence required.
- SDD-007: Preserve old read operations and standalone inspector contracts, package through existing build owners and require exact-source/build no-write and visible/native evidence; rationale: a passing source test is insufficient for the actual installed/rendered action and the shared checkout contains protected earlier work; consequence: local scoped rollback removes the addition without control migration, and unsupported older hosts get a bounded unavailable result rather than broader access or an automatic install.

## Integration Points

### Shared Core projection and selected draft descriptor

The internal evaluator extracted under SDD-001 performs the existing run/seal/current-gate/source and authoring checks. It runs synchronously under withControlReadView supplied by captureControlScope; no helper may open native files or establish its own unrelated snapshot. The standalone inspector retains its outer capture and bounded failure report. Existing validator calls and flags authorizes false, readiness_scope authoring_checks, semantic_review_required, registration_required and presentation_required remain unchanged.

The selected-run projection adds an optional draft_check block. Its descriptor contains gate when applicable, expected_revision_id, canonical artifact_path, nullable artifact_digest, source state and reason. It is derived by the Core owner from the selected active Run, supported-gate registry and existing assessment/approval state, with safe contained-source availability/digest observation. It does not evaluate draft content or claim ready merely because a file exists. Missing files are observed as absence, unsafe components are denied and non-control registered prerequisites remain out of scope. No resource registration is fabricated for an unregistered draft.

Only canonical .agdf/control/artefacts/<selected-run>/<supported-gate>.md paths derived internally are observed. The selection capture records the actual file or absence and its safe ancestors, so creation/removal, same-size replacement, symlink substitution and same-revision byte changes participate in existing revalidation/change observation. Changes to a canonical draft before checking invalidate the selected snapshot; the operation does not silently adopt new bytes.

### Additive request contract

The new agdf_cockpit_read branch is:

```json
{
  "operation": "artifact_readiness",
  "session_id": "<existing session UUID>",
  "snapshot_id": "<current selected snapshot UUID>",
  "run_id": "<current selected Run ID>",
  "gate": "UR | PRD | SD | TP",
  "expected_revision_id": "<current selected revision UUID>"
}
```

The JSON illustrates the exact fields; each identifier must satisfy the existing UUID/Run patterns, gate is the existing four-value enum, and additional properties are rejected. No target, arbitrary path, source contents, tool name or writer action is accepted. The App presentation language follows its established German presentation; it does not invent a new locale-routing mechanism.

The MCP session checks expiry, exact snapshot and session.run_id before execution. The Core reader independently verifies that details contain this selected Run, its expected revision matches and the gate matches the observed supported draft descriptor. This selector check precedes losing the legitimate view. The canonical evaluator still owns current-gate permission and source integrity; a client-proposed gate is not authority.

For the existing authenticated local browser transport, add the exact GET route /api/draft-check/<run-id> with exactly snapshot, gate and expected_revision query keys, each once and validated. Keep existing target binding, credential/origin/method/header/cache restrictions. Translate only these fields to the same Core reader operation. It has no target/path override and no new local server or exposure model.

### Capture replacement and result contract

The Core reader accepts the old selector only after assertSnapshot verifies its current dependencies. It then follows existing replaceScope behavior: drop retained bytes/context packet, capture a selectedRun for the same Run plus its shared authoring result, verify the selected revision/gate/source against the accepted descriptor inside that capture, replay frozen dependencies and revalidate before publication. A changed revision, gate or digest during recapture returns stale/unavailable and never a success for a silently adopted source.

The existing envelope fields schema_version, target, snapshot_id, observed_as_of, source_digest, state, code, retryable and data remain. Successful reads, including genuine authoring corrections, return data.kind run and data.run with its normal resources/control projection plus draft_check. Its result is the original authoring report; display contains the derived state/reason/recovery and optional localized explanation. The original checks, diagnostics, readiness_details and next_action are retained, not replaced by invented translations. Binding combines envelope target/snapshot/source observation with result Run/gate/current and expected revision/artifact path/digest. Authorizes remains false throughout.

Guard, source-changed and transport failures retain existing envelope failure behavior, including data null where required. Report metadata can be null on a bounded failed inspection; null is not manufactured into a digest or a passed check. The client validates the full typed optional block, flags, identifiers, permitted state and report/binding consistency before installation. Malformed or contradictory data is unavailable with dto_invalid; it is never accepted as a content verdict.

Add artifact_readiness to the existing replacement-operation lists in the session, worker and pool. The session increments its generation, clears old resource selectors and invalidates prepared context under existing publication ownership rules. After response, it verifies the same active session/generation and registers only resources from the returned selected Run. The worker adopts the new view as current and rebinds control-changes to reader.dependencies; the pool adopts the new scope and terminates/rejects obsolete change waits in its established way. Capture/response/worker/time/session limits are reused, not enlarged to accommodate arbitrarily large reports.

### Outcome and recovery projection

Core produces unchecked for an eligible observed descriptor without a result. A reported authoring pass is shown as passed only when the report belongs to the accepted stable binding and the existing ready result is valid; an empty diagnostic list is not independent evidence. Actual content-check failures are corrections_required. Boundary/current-gate/source/integrity failures are unavailable or stale as appropriate, retaining available nested correction details and the canonical next action. Unknown result codes remain unavailable with the original reason, not guessed remediation.

The user label Entwurfsprüfung bestanden is accompanied by a short explanation of authoring checks only. Original technical details remain inspectable. Missing/approved/unsupported drafts explain why the deliberate action is unavailable. Transient busy/timeout/read failures offer visible retry only while the selected context remains valid; source changes require the existing reload then an explicit check; session expiry uses existing reopening and disables old selectors. No loop, silent recheck, gate mutation or generic fallback occurs.

### Frontend lifecycle and presentation

Add a useDraftCheck controller at the selected-reading boundary, separate from presentation. It captures the live target, session, snapshot, Run, gate, expected revision, source descriptor, central reading generation and local request epoch. It initiates only through a deliberate action, prevents duplicate pending requests and uses AbortController plus a deadline. Cancellation is not authority: before commit, every live binding and epoch must still match, reading must remain fresh/usable and the returned scope/report must pass validation.

Coordinate check execution with existing freshness/title/navigation requests and prepared-context invalidation. Cancel/drain obsolete freshness reads and pause routine freshness while replacing scope; resume existing observation on the committed scope. Perform any required handoff cleanup through its existing owner before replacement, then recheck that the captured client binding is still current. Never weaken context_cleanup_uncertain or permit another host-context publication through this read.

Add a guarded draft-check commit action to the central reading reducer. It atomically installs the returned scope/detail/resources with the existing route, conditional on expected old scope and reading generation; it does not maintain another cache or persistent verdict. useDraftCheck owns loading/retry failure only. Navigation, reload, stale/source-change signals, session change, draft removal/approval, unmount and a lost active card context abort/invalidate its old request; the checked report is hidden or explicitly historical when its scope is stale. On resumed visibility, use existing freshness validation before treating a retained observation as current. Reload/new selection has no report and therefore remains unchecked.

RunDetail and the selected CompactCockpit context use the same DraftCheck component, positioned alongside draft/work context and outside saved-approval rows. The component consumes already-derived display state and original findings; it never invokes validators or derives gate permission. Use stable data-focus-id values based on the selected Run/action, not regenerated document resource UUIDs. Preserve the existing disclosure/scroll restoration when installing a replacement scope and remap document focus by type/registered reference as today. Do not remount the entire undertaking for a result.

The action remains a native keyboard-usable button with guarded pending/disabled semantics that preserve focus; use accessible aria-busy/status feedback without turning all long findings into repeated live announcements. Bound details wrap long paths/diagnostics without horizontal loss. Gate appears in the main result; revision, digest, observation and original report are available through deliberate source/details inspection. Transient failure provides a visible retry and other blockers point to existing reload/reopen/authoring actions. Width/mode changes never start another check or change its meaning.

## Constraints And Compatibility

Old agdf_cockpit_read operations and selectors retain their existing behavior. draft_check is additive/optional in selected detail; older readers can ignore it. New clients encountering a server without the operation/descriptor show a bounded unavailable capability, preserve other reading actions and never fall back to general inspect or direct filesystem access. The current generic artifact-readiness report remains compatible and uses the same validator implementation.

No persisted state/schema, approval formula, Run seal semantics, durable source, gate sequence or history changes. Source metadata and check results live only in the existing read capture/client observation. Captures remain immutable and bounded; shared helpers use the captured filesystem seam exclusively. Existing resource containment and out-of-scope prerequisite limits are preserved, including fail-closed handling when actual canonical evaluation depends on prohibited files.

Build/package propagation uses existing Core/MCP/control-ui owners. This Run authorizes no global install/deploy/release action. Exact build/runtime observation is required later; any host activation needed for fresh proof must be explicit and evidence-bound. Rollback reverts only this addition/generated assets, leaves old read operations working and requires no Run/data migration or approval rewrite. Prior dirty paths and separately approved sources remain protected.

## Test And Evidence Strategy

Use the actual Core validators to prove parity between standalone and scoped checks, including supported UR/PRD/SD/TP, complete/incomplete/open-decision/traceability findings and supported unregistered drafts. Compare exact report fields and no-write byte baselines for success and failure; test gate, approval, source and contained read guards rather than fixture-only UI policy.

Session/worker/reader scenarios must exercise denied/foreign/extra selectors, expiry, bounds, source changes before capture/during replay/before publication, unchanged revision with changed draft bytes, absence-to-creation/removal and atomic/symlink replacement. Ensure check scope updates resources, dependency monitoring and change waits correctly; retain context publication/cleanup and old operation compatibility scenarios. The browser route must enforce its existing authentication/origin/GET and exact-query checks and return the same Core projection.

App scenarios must cover A→B late replies, reload/session/card context loss, stale source, malformed/partial/unknown reports, timeout/busy/expiry/retry, no automatic check and pending duplicate prevention. Use the real built presentation for compact/expanded narrow/wide results, long diagnostics, original source details, keyboard/status/focus/scroll/resize/reload/document/approval-disclosure interactions. Fresh native-host observation must bind its source/build/runtime and actual check/result/recovery sequence; earlier scrolling confirmation cannot replace it.

TP chooses exact task/scenario IDs, commands and observation fixtures within these fixed obligations. Evidence separates source/unit, MCP stdio, browser and fresh native-host claims and records unavailable proof honestly. No new benchmark, release campaign or other-host native proof is inferred. Shared-path work requires protected-source and scope comparison against the baseline before implementation.

## Acceptance Traceability

This table maps each approved PRD criterion exactly once; it references acceptance without duplicating or redefining it.

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Observed supported canonical draft descriptor and deliberate reusable action before registration, with no check on select/disclose/reload | Core supported-gate/source owner; selected reading context; approved PRD | SDD-001, SDD-002, SDD-006 | Missing/approved/unsupported sources remain bounded; no fabricated resource registration |
| AC-002 | Preserve actual shared authoring report and nested findings; Core read projection distinguishes content corrections from unavailable control/source reads | Existing artifact-readiness and gate validators; approved PRD | SDD-001, SDD-004 | Unknown/partial/long reports cannot become success or guessed corrections; diagnostics retain their meaning |
| AC-003 | Same-selected-context revalidated capture replacement, draft-byte dependencies and guarded client epochs/central scope installation | Core captured read view/session/observer and central selected reading state | SDD-002, SDD-003, SDD-005 | Same-revision edits, session/snapshot replacement and late responses invalidate old success; no implicit adoption |
| AC-004 | Existing bounded worker errors, typed outcome/recovery and explicit retry/reload/reopen flow coordinated with reading/context lifecycle | Core error/session/freshness owners and selected-read controller | SDD-002, SDD-004, SDD-005 | Timeout/busy/expired or quarantined context cannot bypass permission or leave endless checking |
| AC-005 | Read-only shared projection with fixed target/selectors and visible authoring scope, separate from approval/control/QA owners | Core source/gate/writer boundaries; approved PRD | SDD-001, SDD-002, SDD-004, SDD-006 | No arbitrary path/tool, mutation or inferred approval; raw flags and durable byte checks preserve boundaries |
| AC-006 | Same inline component across widths with stable focus/disclosure IDs, accessible pending feedback and reading-position preservation | Existing App selected-reading and presentation owners; approved UX criteria in PRD | SDD-005, SDD-006 | Regenerated source UUIDs, long findings and resize/reload must not cause focus loss, horizontal loss or flicker |
| AC-007 | Additive validated interface, common captured evaluator, existing generated build propagation and exact scoped/protected/native evidence | Existing Core/MCP/App module/build owners; protected approved sources; approved PRD | SDD-001, SDD-002, SDD-003, SDD-007 | Old/new runtime mismatch is bounded unavailable, rollback is local, other approvals remain intact and proof levels stay distinct |

## Risks And Open Questions

All material design choices above are resolved for this bounded integration. The actual implementation must still demonstrate them. Largest risks are missing source dependencies for unregistered drafts, replacing a selected view without coordinating all session/worker/client owners, native FS use in a shared evaluator, and focus/context loss when resource identities regenerate. Design assigns each to its existing owner and requires specific later proof; it accepts no retained architectural debt or alternate validator.

If implementation reveals incompatible source-read prerequisites or a material authority/product boundary not represented here, route it to the earliest affected approved source through canonical recovery; do not patch around it. Exact scenario/command/build-native evidence planning is deferred to TP with a named owner, not hidden design work.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| SDD-001 Shared authoring projection | before_sd | resolved | Extract one evaluator inside existing artifact-readiness owner; standalone and scoped readers use it under their bounded captured view; unchanged checks/public report | Arndt Gold / Core read owner |
| SDD-002 Selected App request and browser adapter | before_sd | resolved | Add strict artifact_readiness branch and authenticated exact-query browser route; no target/path override or broader-tool fallback | Arndt Gold / Cockpit interface owner |
| SDD-003 Source observation and replacement | before_sd | resolved | Capture canonical draft file/absence dependencies at selection; verify exact old binding and recapture same Run plus report; revalidate and publish one new scope through all existing owners | Arndt Gold / Core snapshot-session owner |
| SDD-004 Meaning and recovery | before_sd | resolved | Core derives bounded display/recovery from actual report; keep original diagnostics/details and separate authoring pass from permission/approval/QA | Arndt Gold / Core read-presentation owner |
| SDD-005 Client request and state ownership | before_sd | resolved | Dedicated ephemeral controller, live epochs and cancellation; central reducer installs scope atomically; coordinate freshness/navigation/context invalidation and reject obsolete replies | Arndt Gold / App reading-state owner |
| SDD-006 Reusable accessible presentation | before_sd | resolved | One draft-context component in selected compact/expanded reading; stable focus identities and existing position restoration; status feedback and deliberate details; no full undertaking remount | Arndt Gold / Cockpit presentation owner |
| SDD-007 Compatibility and proof | before_sd | resolved | Preserve old selectors/inspect report, additive optional detail, bounded old-server feedback and local code rollback; exact build/protected-source/native evidence, no implicit install/release | Arndt Gold / Core-MCP-App integration owner |
| Executable tasks and observations | later_tp | open | TP owner maps every criterion and SDD to concrete scenarios/commands and identity-bound native observation, including races, source guards, limits and regression coverage | Task/Test Plan owner |

## Next Step

Review derivation and record SD derived_from the exact approved PRD with the existing typed writer. Validate SD decision/traceability/localized-summary readiness and obtain a fresh bound presentation and deliberate Approval: SD. Only then draft TP; implementation remains blocked until TP approval and required preparation.

## AGDF Approval Summary (de; source=en)

- Ziel: Entwurf prüfen in das Cockpit einbinden, mit derselben Core-Prüfung und eindeutigem Bezug zum ausgewählten aktuellen Entwurf.
- Architektur: Ein gemeinsamer Prüfkern im bestehenden Core-Modul läuft innerhalb des begrenzten Quellen-Snapshots. MCP-App und lokale Browseransicht nutzen denselben Cockpit-Leseweg; keine zweite Prüfregel oder allgemeine Datei-/Tool-Brücke.
- Zugriff: Ein zusätzlicher streng geprüfter Leseaufruf bindet Sitzung, Snapshot, Vorhaben, Gate und erwartete Revision. Ziel und Dateipfad werden intern abgeleitet. Noch nicht registrierte Entwürfe erhalten einen Quellenbezug, keine erfundene Registrierung.
- Frische: Die Entwurfsdatei wird bereits bei Auswahl als begrenzte Quelle beobachtet. Vor der Prüfung und Veröffentlichung wird der Bezug geprüft; Dateiänderungen bei gleicher Revision, Auswahl-/Sitzungswechsel und verspätete Antworten entwerten alte Ergebnisse. Eine Prüfung veröffentlicht einen neuen Lesestand; Neuladen prüft nicht automatisch.
- Anzeige: Core liefert Ergebnis und passende Wiederherstellung; originale Befunde und Detailangaben bleiben einsehbar. Bestanden bedeutet nur Autorenprüfungen. Nicht verfügbare oder veraltete Prüfungen, echte Korrekturen und vorübergehende Lesefehler werden unterschieden.
- Bedienung: Eine gemeinsame Komponente im Entwurfskontext für schmale/breite und kompakte/große Anzeige. Stabile Fokuskennung, vorhandene Scroll-/Quellenklappen-Erhaltung, Tastatur und verständliche Statusmeldung; sichtbares Wiederholen oder Neuladen/Wiederöffnen, keine stillen Schleifen.
- Kompatibilität und Nachweise: Bestehende Aufrufe bleiben kompatibel; alte Server zeigen die begrenzte Nichtverfügbarkeit. Keine Kontroll-, Dokument- oder Freigabeänderung. Sieben PRD-Kriterien sind je einmal auf die Designentscheidungen abgebildet. Core-, Protokoll-, Browser- und frische native Nachweise sowie geschützte Quellen sind später zu prüfen.
- Entscheidungen: Prüfkern, Zugriff, Quellen-/Sitzungsfrische, Ergebnisdarstellung, zentrale App-Zuständigkeit, Bedienung und Kompatibilität sind festgelegt. TP konkretisiert Aufgaben, Tests und Beobachtungsfolge. Keine Archiv-, Installations-, Git- oder Veröffentlichungsarbeit; andere Freigaben bleiben geschützt. Approval: SD erlaubt danach den Aufgaben- und Testplan, noch keine Implementierung.
