# QA Report: bound Cockpit draft-check integration

## Quality Readiness (derived; non-authorizing)

| Dimension | Evidence owner | Outcome |
|---|---|---|
| Plan coverage | task-plan-review | pass — all seven tasks and all seven UX criteria fulfilled within their stated evidence boundaries |
| Solution integrity | clean-implementation-review | pass — shared Core/read/session/App ownership retained; no production workaround |
| Code quality | code-review | pass — actual 26-path incremental diff reviewed, unchanged product hashes |
| QA decision | qa-gate — sole decision owner | pass — NATIVE-001 resolved through the prepared exact-build native observation |

## Decision

- decision: pass
- Run: cockpit-draft-check-integration-20261009-01
- Evaluated revision: 9ac58d2e-3424-4965-bd9f-31b3d2e007d7
- Approved TP: .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/TP.md
- Approved TP digest: sha256:541fef03c6192ee7a567ce2b9067a7a1feeb540f7b83cfe74069988adae9a44b
- evidence: BROWNFIELD_ANALYSIS.md; CD_TESTS.md; CODE_REVIEW.md; TASK_PLAN_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; evidence/VERIFICATION.md; original command/build/browser logs; evidence/BUILD_IDENTITY.json, PROTECTED_FINAL.json, NATIVE_HOST_INTERACTION.json, NATIVE_FINAL_OBSERVATION.json/md, NATIVE_FINAL_HOST_PROTOCOL.json, NATIVE_PROBE_EVENTS.jsonl and NATIVE_PROBE_ROLLBACK.json.
- missing_evidence: none required by the approved TP. Raw capability frames and Host SDK teardown callback firing were not separately captured; no claim of those stronger diagnostics is made. Actual host initialization acknowledgement, original enforced UI capability path, native interactions and explicit reader close acknowledgement are present.
- risks: Manual native keyboard/size/focus/scroll observations are attributed to the user's prepared exact-build replies. Synthetic fixture proves authoring behavior without rewriting real approved sources. Native proof is Codex-specific; no other host/platform qualification or release claim follows. Original sandbox failures remain recorded with exact successful host reruns.
- required_next_step: Record this QA_REPORT tests relationship against the exact approved TP, prepare its fresh bound QA presentation and obtain a NEW deliberate Approval: QA.
- impact_codes: PRD AC-001 through AC-007; TP T-001 through T-007, SCN-001 through SCN-022.

## Evidence assessment

Approved target/Run and UR/PRD/SD/TP relationships remain exact. Brownfield preparation preceded implementation and confirms existing owners and source containment. Shared authoring validators and captured immutable view remain authoritative. Exact old/new selector checks, same-revision source changes, capture/replay/publication races, unsafe source boundaries, session/worker/pool/resource and observer adoption, publication quarantine, HTTP access guards, no writes, original non-authorizing report flags and guarded central App commit are tested and reviewed. The ephemeral controller rejects obsolete completions and has a finite deadline even on unresponsive transport.

All four supported standalone authoring gates were exercised. Five focused Core cases passed. Existing Core suites recorded 49 pass and one sandbox notification failure, with the exact two-case suite subsequently passing on the host. UI regression run recorded 142 pass and the final focused six-case suite passed separately (not counted as distinct additional aggregate tests). Nine actual authenticated HTTP cases passed outside sandbox, retaining initial loopback EPERM as environment evidence. Twenty-four actual built browser cases passed, with compact/expanded narrow/wide keyboard, long original results, source disclosure, scroll/reload and no-write coverage; rendered images were inspected. MCP contract/safety/protocol suites and final packaged scoped runtime under both supported protocol versions passed. Typecheck/build/sync/public plugin/payload checks passed. No assertion or production guard was weakened.

The actual incremental scope remains 26 product-source paths against the captured dirty baseline; PROTECTED_FINAL.json verifies all hashes unchanged since the qualified build. Fifteen approved/protected files and unrelated Run histories remain byte-identical. The measured payload budget has no speculative allowance. The official isolated runtime retains the verified SDK and UI sha256:859039c09e4c0ebc02cecc02b4954936538afb6749e42981b053a4ca0f687828.

Fresh native evidence now satisfies the planned observation. Actual initializeMcpApp completion is logged for initId 5e000343-2a60-4979-bd24-8b0e231b9414; qualified server capability acceptance is enforced. The same unchanged build's native source/action/recovery sequence includes real passed/correction reports, original source disclosure, unchanged-revision invalidation, restoration/reload and explicit recheck. After the authorized restart, native invocation 56efcffd-832e-4658-ab40-4e9e19587388 recorded one actual Core busy from an isolated unpublished secondary reservation, then the user's explicit retry with identical selectors returned passed and original source digest. Secondary reservation cleanup is acknowledged. User replies to prepared exact-build compact/expanded controls are preserved verbatim and separately attributed.

Native session 25860da3-028e-4d60-b020-e5ffe58d17e7 closed through the actual native reader close operation with closed:true; subsequent access returned session_expired. User confirmed card closure. This proves explicit session cleanup and native view closure, not a separately observed Host SDK callback. The TP requires native initialization/capability and interaction/close evidence; the available native close path meets this bounded obligation. View disappearance alone was not substituted for backend cleanup. Temporary test-only adapter imports unchanged original modules, exposes no new product tool/writer, and manufactures no verdict; its startup block was restored while preserving other configuration. Original synthetic draft bytes were restored.

The refreshed Task Plan Review evaluates each task and all seven applicable UX criteria as fulfilled with suitable visible evidence. Stable NATIVE-001 remains evidence_gap/evidence_obligation and is resolved by durable observation, not reclassified or waived. Mandatory Code Review and solution-integrity reviews remain subordinate evidence. No applicable open finding, missing P0/P1 task, source-of-truth drift or blocking integrity risk remains. Documentation and exact proof levels are reconciled in Run-local evidence. This report is the sole QA pass decision; it is not human QA approval, UAT, OR, Git handoff or release authority.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| NATIVE-001 | evidence_gap | evidence_obligation | resolved | TASK_PLAN_REVIEW.md; evidence/NATIVE_FINAL_OBSERVATION.json/md and actual native events/host initialization prove approved TP T-006 SCN-018/021 | Prepare and present the exact passing QA_REPORT for NEW deliberate Approval: QA |

## Context Graph

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-local implementation, qualification, observation and reviewed MCP candidate list; no new general source authority claimed.
- memory_target: scope_artifact
- memory_reason: Exact Run qualification belongs to scope evidence; MCP candidates remain documented follow-up proposals.
- memory_refs: evidence/VERIFICATION.md; evidence/NATIVE_FINAL_OBSERVATION.json; MCP_CANDIDATES.md

## AGDF Approval Summary (de; source=en)

- Ergebnis: QA bestanden. Alle sieben Aufgaben und sieben Akzeptanzkriterien sind innerhalb der freigegebenen Grenzen nachgewiesen; NATIVE-001 ist geschlossen.
- Verhalten: Die Cockpit-Entwurfsprüfung nutzt den gemeinsamen Core, zeigt Originalbefunde und bleibt an Auswahl, Revision und Quellenfassung gebunden. Ändert sich die Quelle, wird der alte Prüfstand verworfen; Wiederholen bleibt eine bewusste Aktion.
- Nachweise: Core-, MCP-, HTTP-, UI- und Build-Prüfungen sowie die frische native Codex-Beobachtung sind getrennt dokumentiert. Der echte busy/Wiederholungsfall und der Sitzungsabschluss mit closed:true und session_expired sind bestätigt. Manuelle Bedienbeobachtungen sind als Nutzerangaben gekennzeichnet; ein eigener Host-SDK-Teardown-Callback wird nicht behauptet.
- Integrität: 26 Produktquellen und 15 geschützte Quellen-/Historien-Dateien unverändert; ursprünglicher lokaler Startblock wiederhergestellt. Keine Freigabe oder Quelle anderer Vorhaben verändert.
- Zusatzauftrag: Stellen mit Codesuche oder direkten Core-Aufrufen sind als MCP-Kandidaten in MCP_CANDIDATES.md festgehalten; daraus folgt keine neue Implementierungsfreigabe.
- Entscheidung: Approval: QA gibt diesen genauen Prüfbericht frei. UAT und weitere Abschluss-/Veröffentlichungsschritte bleiben eigene Entscheidungen.
