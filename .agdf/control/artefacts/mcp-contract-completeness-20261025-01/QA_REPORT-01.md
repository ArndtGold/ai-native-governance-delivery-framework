# QA Report: Existing MCP contracts and guarded Codex command evidence

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-10-25
Owner: Arndt Gold
run_id: mcp-contract-completeness-20261025-01
source_revision: 9fdf3a25-ec68-4f9f-ac20-4f447248fc7a

Objective: Agents and MCP clients can discover, understand and consume the five existing AGDF command tools through consistent published contracts, with protocol-appropriate missing-capability errors, preserved Core authority and supported legacy behavior, as required by the approved UR.

## 1. QA Decision

Decision: pass

The approved renewed TP is fulfilled and all applicable criteria, scenarios and UX Intent Fidelity rows have concrete current evidence. Brownfield fit, solution integrity and actual code quality are sufficiently evidenced. There is no open or invalid applicable normalized finding. This is the sole qa-gate technical decision, supported by the three evidence reviews; it grants no human QA approval, UAT acceptance, native production qualification or release permission.

## 2. TP Coverage

- delivered_result: Modern UI-required MCP requests now return the typed -32021 protocol error and requiredCapabilities without protected execution. The five existing command tools expose meaningful field/payload help and compiling output schemas, with complete Core structural result validation at existing runtime boundaries. Canonical capability/version metadata and the exact approved Copilot payload ceiling agree with generated and packed consumers. Two additional guarded gpt-6.1-sol/low sessions each retrieved authoritative bindings through MCP and completed one original fixture UR approval with complete traces and unchanged protected settings.

TP_REVIEW-01.md records T-001 through T-010 fully_done, AC-001 through AC-008 fulfilled and all twenty SCN-001 through SCN-020 covered. It includes the actual low-impact discovery/error/recovery fidelity matrix: all applicable rows fulfilled with actual protocol/tool/native output. No visual redesign or preview criterion applies. QA evaluation/preparation fulfills the final review obligation; the human QA decision and later UAT/OR remain subsequent control steps.

Current approved reference: TP.md @ sha256:52f644123916ad5db5b102d8508d094db110a6e3d032e3ed23a2febdec7f0adb, deliberate approval operation d0d35927-8826-4b89-a9bb-45cb08641285. PRD remains acceptance owner; current C2 changes only the bounded native plan, retains UR/PRD/SD and the exact MCP limits. No plan/report self-approval is inferred from draft headers or fixture effects.

## 3. Evidence

All paths below are contained in this Run unless a product source is named. CD_TESTS-03.md provides the detailed implementation/test disposition; BROWNFIELD_ANALYSIS-03.md records fresh post-approval preparation and canonical owner reuse.

| Dimension | Authored evidence result | Evidence owner |
|---|---|---|
| Plan coverage | pass | TP_REVIEW-01.md; exact current TP, criteria/scenario and visible-behavior mapping |
| Solution integrity | pass | CLEAN_IMPLEMENTATION_REVIEW-01.md; public SDK seam, shared Core model and existing runtime/evaluation owners |
| Code quality | pass | CODE_REVIEW-01.md; actual implementation/test diff, faults and lifecycle review |
| QA decision | pass | This report; qa-gate is the sole final technical decision owner |

The local Codex reviews are cooperative authored judgments, not independent third-party review. Source, runtime, archive and harness/verifier digests are explicitly bound; evidence applicability, not a fresh rerun of unchanged suites, is claimed.

| Criteria | Concrete verification |
|---|---|
| AC-001 / SCN-001, SCN-002 | implementation-02/capability-wire.json retains nine actual request/response frames, original IDs, exact -32021 data, malformed-meta -32602, SDK input-error/unknown distinctions, alternating per-request capabilities and exactly one supported execution. Both protocol-era capability suites pass. |
| AC-002 / SCN-003 through SCN-006 | Actual dual-era ordinary/decision/cockpit/whole-flow/error suites, Core 70-case input parity, full/minimal result variants and App/text postprocessing preserve valid callers and domain meanings. |
| AC-003 / SCN-007, SCN-008 | Actual tools/list exposes all eleven fields on each of five tools with direct help and payload meaning; expanded operation help, local refs and examples agree. Both new native sessions retrieve original bindings through MCP. |
| AC-004 / SCN-009, SCN-010 | All five declared schemas compile; positive/negative/fallback/minimal/uncertain results and malformed producer/postprocessor/oversized/executor faults are checked. Pure error projection and single-effect/original-operation assertions remain effective. |
| AC-005 / SCN-011 | Canonical annotation/manifest/profile mismatch tests and README review; normal build, three npm archives and real consumers pass, including offline profiles and both eras. Copilot is exactly 397 files / 3509461 bytes with zero headroom. |
| AC-006 / SCN-012 through SCN-014 | Target/Run/revision/source/presentation/human-response/original-UUID checks, full/expanded source revisions, generation/provenance/tamper, actual Transport forwarding/EOF drain, worker/deadline/termination/lock assertions pass. No installed runtime was replaced. |
| AC-007 / SCN-015 through SCN-018 | Final ordinary aggregate 23343 bytes; decision-enabled aggregate 24509 <=24576; each command <=8192. Input/result 65536/1048576 remain enforced. Full unchanged fixed-fixture 20 cold +20 warm measurements: p95 1011.622 <=1500 ms and 670.668 <=1000 ms. Original infeasible probes and contended failed attempt remain retained; no sample/fixture/threshold change. |
| AC-008 / SCN-019, SCN-020 | implementation-03 binds actual repaired verifier/guard sources and offline regressions; c2-prerequisites-01/guarded-preflight proves zero-model preflight. Both c2-native/repetition-01 and repetition-02 immutable reports, events, rollouts and final texts prove gpt-6.1-sol/low, one original bound UR effect, complete trace, no detour and identical before/pre-session/after protected manifests. |

evidence/c2-prerequisites-01/criterion-evidence-assessment.json maps every current criterion and scenario. source-freeze.json compares complete candidate/root Core/CLI/MCP/UI input inventories, locks/manifests/baseline and repaired harness/verifier hashes. runtime-freeze.json binds assembled server/dispatcher/SDK; archive-applicability.json verifies the same three tarballs against passed retained consumers. Candidate HEAD c327c50deae6e5b4fd8071c9e03b1ef2803df6ae plus those exact modified source inventories identifies the tested candidate; HEAD alone is not the payload identity. Environment: darwin-x64, Node 22.22.3, SDK server/client 2.0.0, Codex CLI 0.163.0.

Current CD_TESTS-03.md retains resolved normalized rows F-003 (tested auditor/guard and actual protected success), F-004 (direct owner decision/current renewed TP and exact three-invocation ceiling) and E-001 (two qualified C2 observations). Their original classifications/routes are unchanged. The original unguarded cohort remains unqualified in evidence/native-01/ and prior CD_TESTS-02.md remains historical revise; derived audit repair did not erase the original settings violation. All failed build/cache/deadline/performance attempts and their scoped resolutions remain visible in retained evidence.

## 4. Missing Evidence

- qualification_limits: Native evidence covers only two synthetic T7 fixture sessions on this macOS/Codex CLI 0.163.0/gpt-6.1-sol/low/candidate/guard tuple. Each session used 13 MCP calls and recovered from eight/seven SDK-invalid calls (nine/eight isError results); this proves bounded completion after supported correction, not efficient first-attempt use, usability improvement, comparative superiority, cross-host support or production human-origin proof. Model-session wall times were 85665/81495 ms, separate from synthetic MCP p95. Dollar cost is unavailable; ordinary existing-account usage was consumed and measured, with no additional API route. General MCP conformance and native App-host/installed-release qualification remain outside this scope.

No required current acceptance evidence is missing. C2 total input tokens 831430 (758016 cached), output tokens 3497; failed original session usage remains separately retained. No statistical or causal comparison between the original and protected cohorts is supported. No more real model invocation is permitted within the exhausted maximum of three for this Run. Unchanged broad test results were freshly assessed for exact applicability rather than silently described as newly executed.

## 5. Risks

- delivery_risks: Decision-enabled discovery has only 67 bytes of remaining aggregate budget, and the Copilot payload has zero headroom; future payload/metadata changes require remeasurement against the unchanged limits. The observed native argument mistakes create extra calls/latency despite task completion. The original unguarded run's config trust entry remains present and unmodified because cleanup/restoration was explicitly excluded from C2. This report establishes the isolated candidate and checked source projections, not a replacement of the live installed runtime or a release.

No blocking source-of-truth drift, unsupported SDK fallback, open normalized gap or incomplete applicable UX row was found. Existing product legacy/text behavior is intentional compatibility, and the native-only macOS guard has no platform/authentication fallback. Foreign files, incomplete original dist/npm, existing duplicate dependencies and predecessor inspection UAT were preserved. This technical pass does not authorize their cleanup, VCS changes, installation, publication or further paid/native attempts.

Knowledge disposition remains memory_target: scope_artifact for this Run's detailed candidate/evidence. BROWNFIELD_ANALYSIS-03.md retains existing Brownfield links and records context_graph_impact: none, context_graph_reconciliation: not_applicable, context_graph_required_action: none and context_graph_gate_effect: none. No new graph claim, source owner or project-memory mutation is introduced; there is no outstanding reconciliation action for this scope.

## 6. Required Next Step

Present this exact QA result with its qualification limits and risks through the current canonical gate presentation, then await a new deliberate Approval: QA. Only that new human decision can advance to UAT. TP approval and synthetic fixture approvals cannot be transferred. QA acceptance does not approve release, installation, VCS or another native session.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Agenten und MCP-Clients verstehen und verarbeiten die fünf bestehenden AGDF-Befehle anhand konsistenter Verträge; Capability-Fehler, Core-Zuständigkeit und Legacy-Verhalten bleiben korrekt getrennt.
- Ergebnis: Fehlende benötigte UI-Capability liefert modern -32021 mit requiredCapabilities ohne geschützte Ausführung. Alle fünf Werkzeuge haben Feld-/Payload-Hilfe und Ausgabeschemas; vollständige Core-Ergebnisprüfung schützt die bestehenden Laufzeitgrenzen. Metadaten und tatsächliche Paketverbraucher stimmen überein. Beide zusätzlich genehmigten geschützten Codex-Sitzungen mit gpt-6.1-sol und Reasoning low haben je eine korrekt gebundene Fixture-UR freigegeben, mit vollständiger Spur und unveränderten geschützten Einstellungen.
- Prüfung: Zehn Aufgaben, acht Kriterien und zwanzig Szenarien sind belegt. Planabdeckung, Strukturprüfung und Code Review sind pass; qa-gate entscheidet technisch pass. Tatsächliche STDIO-Fehler, beide Protokollversionen, Ein-/Ausgaben, Einmalausführung, Freigabe-/Wiederholungsgrenzen, Generation, Beendigung/Locks sowie Build, Archive und Verbraucher sind geprüft. Beibehaltene Ergebnisse wurden anhand identischer aktueller Eingaben auf Gültigkeit geprüft; sie werden nicht als neu ausgeführte Tests bezeichnet.
- Budgets: Alle MCP-Grenzen bleiben unverändert. Größte Command-/Decision-Komposition 24.509 von 24.576 Byte, je Werkzeug höchstens 8.192 Byte; Eingabe/Ergebnis 65.536/1.048.576 Byte. Der feste Test mit je zwanzig Kalt-/Warmläufen ergibt p95 1.011,622/670,668 ms bei Grenzen 1.500/1.000 ms. Copilot bleibt genau bei 397 Dateien und 3.509.461 Byte ohne Puffer.
- Grenzen: Die nativen Nachweise gelten für zwei synthetische T7-Sitzungen auf diesem Mac mit Codex-CLI 0.163.0 und dem exakt geprüften Kandidaten. Beide brauchten 13 MCP-Aufrufe; acht beziehungsweise sieben SDK-Eingabefehler und neun beziehungsweise acht isError-Ergebnisse bleiben dokumentiert. Laufzeiten 85,665/81,495 Sekunden sind getrennt vom synthetischen MCP-p95. Kein Nachweis effizienter Erstversuche, einer Verbesserung gegenüber früheren Kohorten, vollständiger MCP-Konformität, anderer Hosts oder echter menschlicher Produktionsfreigaben. Normale Kontonutzung wurde gemessen; Dollar-Kosten sind nicht verfügbar.
- Risiken: Nur 67 Byte MCP-Gesamtreserve und kein Copilot-Puffer; künftige Änderungen müssen erneut gemessen werden. Eingabekorrekturen verursachen zusätzliche Aufrufe und Zeit. Der ursprüngliche Fehlversuch bleibt wegen der Konfigurationsänderung nicht qualifiziert; seine Daten und der bestehende Trust-Eintrag bleiben erhalten. Insgesamt wurden die höchstens drei erlaubten echten Modellaufrufe verbraucht; keine weiteren Durchläufe oder Bereinigungen sind freigegeben.
- Nächster Schritt: Nur diese konkrete QA-Fassung mit Approval: QA freigeben. Danach folgt UAT. TP-Freigabe und Fixture-Erfolge ersetzen diese Entscheidung nicht; Installation, Release, Veröffentlichung und VCS-Aktionen bleiben außerhalb des Umfangs.
