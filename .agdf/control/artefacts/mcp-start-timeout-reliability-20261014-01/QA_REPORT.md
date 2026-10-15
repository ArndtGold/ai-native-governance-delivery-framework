# QA Report: Reliable MCP runtime and coherent Codex host setup

Status: draft
Gate: QA
Gate approval: open
Based on: Exact approved TP and registered Brownfield/CD+Tests/TP Review/Clean/CR evidence
Date: 2026-10-14
Owner: qa-gate, Codex cooperative assessment

## 1. QA Decision

Decision: pass

| Quality Readiness dimension | Evidence owner | Result |
|---|---|---|
| Plan coverage | task-plan-review | pass for all current technical obligations; later human/lifecycle transitions pending |
| Solution integrity | clean-implementation-review | pass |
| Code quality | code-review | pass; five normalized implementation findings resolved |
| QA decision | qa-gate, sole decision owner | pass |

Required current technical evidence is sufficiently strong: demonstrated faults are repaired at existing owners, final installed direct paths meet fixed workloads/refusals/recovery, every applicable approved UX branch is evidenced, and no open normalized required gap or SoT drift remains. This is a scoped technical decision, not human approval, native desktop qualification, release readiness or completed Run.

## 2. TP Coverage

- delivered_result: The installed regular AGDF launcher handles verified live contention with complete atomic owner records and retains Worker occupancy through confirmed termination. Its SDK acquisition and publication now share the unchanged 30-second allowance, so the old observed 33.427-second overrun cannot publish late. Codex setup/cleanup uses closed roles, exact wrapper/config revalidation and guarded rollback; visible source/status/role/ownership and App evidence stages stay separate. Optional Cockpit and deliberate diagnostic preparation preserve bound targets and historical descriptors without a duplicate product registration.

Registered TP_REVIEW.md verifies T-001 through T-010 fully_done. T-011 is partially_done only because this technical QA decision, new human QA/UAT and OR are later ordered actions; required pre-QA implementation and review obligations are complete. Those later actions remain mandatory and are not declared done. All 14 approved PRD criteria, 10 SD decisions and 32 TP scenarios have current evidence; all applicable UX Intent Fidelity rows are fulfilled in the approved actual/unobserved/retained branches. Conditional legacy retention and native-unobserved fallback are explicit SD outcomes, not waived new requirements.

## 3. Evidence

- BROWNFIELD_ANALYSIS.md, CD_TESTS.md, TP_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md and CODE_REVIEW.md are registered current cooperative evidence. QA consumes CR-MCP-001 through CR-MCP-005 as resolved without changing their types/routes. No independent peer review is claimed.
- Installed candidate 0.14.5+codex.local-0e4bdc1df572 matches frozen source, generated plugin, marketplace and cache. Actual configured producer: dispatcher 99ba11c32405acfb2445da5227d7049be836f3988789c2ee658838af79dcaece; server 57e00b512994b060995ff5875e89620f87bf5a275857ea217f87f2ba6f1dd6b1; SDK b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb; pinned Node 22.22.3 on darwin-x64.
- Actual final 20 cold/20 warm, ten three-client and ten separated product/diagnostic waves retain all 120 samples and pass. Product start p95 2.053s/max 2.134s; warm p95 0.553s/max 0.742s; three-client combined p95 2.530s/max 2.568s, within unchanged installed 5s/10s bounds. Existing fixture guards also pass at 0.895s cold and 0.799s warm.
- Actual installed surface-local CLI and STDIO prove one disposable effect, original UUID status and identical replay without another write, plus changed-payload/stale refusal. Actual installed functions on own full runtime copies refuse marker/server/dispatcher/SDK corruption, symlink and unknown/malformed/foreign/oversized lock states while preserving bytes. The controlled full-budget acquisition child receives 29970ms remaining timeout and returns at 30006.759ms with observed termination/cleanup overhead; the configured allowance is not extended.
- Complete MCP protocol/generation/safety/provenance/command/decision tests pass. Final malformed-owner/launcher/config hardening is separately requalified at its affected owners. Normal preparation/build and 56 compatibility source scenarios pass; 102 unchanged deterministic eval outputs/source bindings pass, not live model execution. Existing instruction/plugin-list/size guards pass. Legitimate exact payload is reviewed at 253 files/2218869 bytes with zero spare headroom; no guard/threshold is disabled.
- Actual host user/project config hashes are unchanged. The supported full local setup CLI renders en/de and fr-CA fallback output; the installed plugin-local validator is a distinct surface. Probe activation/completion/abort/repeat and rollback operate only on owned disposable states, and repeated preparation preserves the older descriptor. Existing capability/native-tuple and exact-bound text/document fallbacks pass.

Detailed evidence: evidence/checks.json, scenario-evidence-index.json, causal-assessment.json, final-identities.json, installed-qualification.json, installed-recovery-raw.json/reviewed.json, host-setup-final.json, host-data-preservation-final.json and normal qualification logs. Earlier failures, child-probe prerequisite correction and collector field collision remain visible; reviewed evidence neither drops measurements nor invents a new execution.

## 4. Missing Evidence

- qualification_limits: Fresh native Codex desktop render/interaction/teardown, effective desktop policy and loaded final-session identity are unobserved; direct CLI/STDIO is separately proved. No fresh native Windows/filesystem or model-host qualification is claimed. Historical suppressed startup/timeout exceptions lack individual original phase/cause traces. Exact current ownership of historical probe wrappers and all old Cockpit namespace/live consumers is unconfirmed, so those entries remain retained under the approved compatibility branch.

These limits prohibit stronger claims and actual legacy removal; they do not replace missing required current direct-path proof, which is present. No native UI success, original historical incident explanation or completed legacy cleanup is inferred.

## 5. Risks

- delivery_risks: An existing desktop session can keep the old loaded runtime until a deliberate supported affected-client refresh. Conservative immutable claims and unproven legacy registrations remain retained. A slow first SDK acquisition now deliberately refuses at the existing 30-second budget and needs supported preparation/prewarm rather than more time. Qualification is local darwin-x64 and cooperative; no cross-host/native/model reliability guarantee follows. New human QA/UAT and OR are still pending, and no release or Git handoff is authorized.

No open required implementation, critical ownership/data-integrity, approval or SoT blocker remains in the reviewed current scope. Shared host App data, unrelated config, other Runs and user architecture/UI changes have not been altered by this delivery.

context_graph_impact: link_only
context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter; .agdf/control/CONTEXT_GRAPH.md#cg-native-interaction-authority; .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
context_graph_reconciliation: resolved
context_graph_required_action: none
context_graph_gate_effect: none
context_graph_evidence: Existing Core/runtime/Codex and native approval authorities remain unchanged; implementation/qualification facts and explicit compatibility exits are linked current Run evidence.
memory_target: scope_artifact
memory_reason: Exact current candidate, local workload and qualification boundaries, no separate mutable registry or memory write.

## 6. Required Next Step

Persist this exact QA_REPORT-tests-TP relationship through the existing reviewed writer, redispatch gate-check and present the current QA material. Await one new deliberate Approval: QA before UAT. Do not reuse prior approvals, refresh/restart the host automatically or perform VCS/release actions.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Start-/Timeout-Mechanismen dauerhaft beheben und die AGDF-MCP-/Hostkonfiguration sicher und nachvollziehbar betreiben.
- Ergebnis: Technische QA: pass. Vollständige Sperrmetadaten werden atomar veröffentlicht; echte Konkurrenz wartet höchstens 5,55 Sekunden. Erwerb und Veröffentlichung teilen weiterhin 30 Sekunden. Worker bleibt bis zum bestätigten Ende belegt; unklare Wirkung verlangt ursprüngliche UUID. Konfiguration, Wrapper, Referenzen und Rollback sind besitzgebunden. Der finale installierte Kandidat entspricht Quelle/Cache und besteht 120 Belastungswerte sowie Negativ-/Wiederholungsfälle. Start-p95 2,05 Sekunden, warm 0,55, parallel 2,53; bestehende Guards und Reviews bestehen.
- Grenzen: Direkte installierte CLI/STDIO ist geprüft; frische native Desktop-App-Darstellung/Interaktion, wirksame Desktoprechte, Windows-/Modellhost und einzelne historische Ausnahmeursachen sind nicht belegt. Unbewiesene Alt-Probe-/Cockpit-Ownership und Verbraucher bleiben ausdrücklich erhalten; keine erfolgreiche Entfernung oder native Freigabe wird behauptet.
- Risiken: Alte Sitzungen können alte Laufzeiten behalten. Langsamer erster SDK-Erwerb wird am vorhandenen Budget abgewiesen und braucht unterstützte Vorbereitung. Kein automatischer Neustart, fremder Prozessabbau, App-Daten-Purge, Git- oder Release-Schritt. Zehn technische Aufgaben sind fertig; neue menschliche QA/UAT und OR bleiben verpflichtend.
- Nächster Schritt: Eine neue Approval: QA auf diese dargestellte Version; danach erst UAT.
