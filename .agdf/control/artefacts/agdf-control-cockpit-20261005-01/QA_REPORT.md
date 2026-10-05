# QA_REPORT: Local read-only AGDF control cockpit

Decision: pass
Gate: QA
Gate approval: open
Decision owner: qa-gate
Run: agdf-control-cockpit-20261005-01
Evaluated revision: 5889322c-c586-49b2-af25-cd062bbff51c
Based on: approved TP sha256:a796f192780d1ad7837dd860728d9dcbd4254ca01b573487a8e027775e282e3f
Date: 2026-10-05

## QA Gate

- decision: pass
- evidence: BROWNFIELD_ANALYSIS.md; CD_TESTS.md; TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CR.md; CONTEXT_RECONCILIATION.md; EVIDENCE/source-fingerprints.json; EVIDENCE/regressions-results.json; EVIDENCE/playwright-results.json; EVIDENCE/real-approved-run-parity.json; all 32 TP scenario records and browser screenshots
- missing_evidence: none for the approved local source/package/browser scope
- risks: observations do not lock external writers; two pre-existing out-of-control references remain explicitly unavailable; proof is local macOS/Node/Chromium and parameterized limit arithmetic, not cross-OS installation, a full-capacity stress benchmark, deliberate UAT, publication or measured time saving
- required_next_step: Present the revision-bound passing QA report for a new deliberate Approval: QA.
- impact_codes: AGDF_STATUS_CARD_PARALLEL_RULE_MODEL

## Decisive reason

The approved local read-only product is implemented and evidenced across its complete TP: all ten tasks, all 32 stable scenarios, all eleven applicable UX fidelity rows and the affected existing regressions are fulfilled. The three supporting reviews contain no open/unknown/contradictory gap. Core remains the sole evaluation/approval-rule owner and the browser does not gain mutation authority. This QA decision is made only by qa-gate and does not record human approval.

## Plan coverage

TP_REVIEW.md verifies T-001 through T-010 against approved PRD/SD/TP, with code and visible evidence. The 32 scenario mappings are resolved at their planned paths. Unreadable complete capture fails unavailable rather than empty as approved in SD; malformed/per-run evaluation failures retain partial inventory and failed refresh retains stale prior browser data. That interpretation does not add a live fallback or relax the PRD's prohibition on clearing known entries into successful emptiness. Scaled file-count/per-file/aggregate-boundary tests are identified separately from exact actual 2 MiB preview/8 MiB response tests and the real repository integration.

## Brownfield fit and solution integrity

BROWNFIELD_ANALYSIS.md proves the read seams and dirty-workspace boundary. CLEAN_IMPLEMENTATION_REVIEW.md verifies the existing Core owners, original target identity and approval proof, native live CLI/MCP default, immutable runtime resource catalog, one bounded capture retry, typed failures, loopback mediation and no second gate model/store/authority. Read-service workers do not execute Git/shell children. Private UI and dependencies remain excluded from public profiles. Native defaults and existing approval/control flows pass the affected suites. Context/ownership knowledge is reconciled with the existing node/registry and README.

## Code quality and normalized findings

Consume CR.md findings COCKPIT-CR-001 through COCKPIT-CR-004 as implementation_gap routed to CD+Tests, all resolved. Corrections concern the removed-run DTO/client validation, German unavailable/source feedback, bounded static asset reads, and denied-scope memoization. Their source and test evidence is durable; qa-gate does not reclassify them. No unresolved P0/P1, authority/security regression, source-of-truth drift or accepted implementation debt remains in this scope. Review and QA were performed by the implementing Codex agent; no independent reviewer is claimed.

## Executed validation

26 new tests pass: 4 snapshot, 2 provider, 4 projection, 5 HTTP/worker, 8 UI and 3 Chromium journeys. Ten affected existing suites pass: control-state, control-command, control-inspect, verified-change, interaction-presentation, plugin-mcp-runtime, runtime-integrity-layout, runtime-integrity-negative, payload-budget and package-contents. Clean lockfile installation (--ignore-scripts), synchronization, typecheck, build, exact payload inventory and git diff --check pass. Source fingerprints match the reviewed implementation; approved UR/PRD/SD/TP source digests remain unchanged.

Actual Chromium proves complete pointer and keyboard overview/detail/document/return journeys, focus restoration, original source documents, no external requests/storage, passive malicious content, invalid/missing/unsupported German states, five-second stale detection, deliberate reload, transient failure/retry and removed selection. Full control membership and file bytes/digests compare equal across the closed real read window; fixture mutation cases never alter the real repository. Reports/screenshots were persisted only after service closure.

The dated real observation contained 111 runs, 2739 files and 48,417,688 captured bytes; its capture/projection/related-read sequence took approximately 4.9 seconds on this host under parallel validation. This is an observation, not a performance promise. No mandatory host installation or public release test exists in this private local TP.

## Context Graph and documentation

- memory_target: context_graph
- memory_reason: Reusable source/snapshot/authority separation is reconciled into the existing control-state node; run-specific evidence remains local to the scope.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/SOT_REGISTRY.md#Physical-Package-Ownership; packages/control-ui/README.md
- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: CONTEXT_RECONCILIATION.md; CD_TESTS.md; EVIDENCE/real-approved-run-parity.json; EVIDENCE/playwright-results.json

## Human decision boundary

Passing QA supports fresh deliberate QA approval of this exact report and revision, followed by UAT of the delivered local result. No approval has been inferred from earlier UR/PRD/SD/TP responses or from this report. Commit, public release and host installation are not performed or authorized by this report.

## AGDF Approval Summary (de; source=en)

- Ergebnis: Das lokale React-Cockpit zeigt Übersicht, Run-Details und registrierte Dokumente aus dem ausdrücklich gewählten Repository. Die Oberfläche ist deutsch; Quelltexte bleiben in ihrer Originalsprache.
- QA-Entscheidung: pass. Alle zehn TP-Aufgaben, 32 Szenarien und elf UX-Abnahmekriterien sind durch Code-, Test- und sichtbare Browsernachweise erfüllt. qa-gate ist die einzige Instanz dieser Qualitätsentscheidung.
- Prüfungen: 26 neue Tests, zehn betroffene bestehende Prüfsuiten, Installation aus dem Lockfile, Typprüfung, Build, Paket-/Integritätsprüfung und Diff-Prüfung bestehen. Maus und Tastatur führen durch alle drei Ansichten und zurück.
- Sicherheit: Core wertet den erfassten Kontrollstand mit unveränderter Ziel- und Freigabeidentität aus. Der lokale Dienst prüft Sitzung, Host, Ursprung, Methoden und erlaubte Ressourcen; aktive Dokumentinhalte bleiben passiv. Der Browser kann keine Kontrolldaten, Freigaben oder Git-Operationen ausführen.
- Aktualität und Fehler: Veraltete Inhalte bleiben deutlich markiert; erst bewusstes Neuladen übernimmt neue Quellen. Fehler, Wiederholen, entfernte Auswahl sowie fehlende oder nicht darstellbare Dokumente wurden sichtbar geprüft.
- Unveränderlichkeit: Der vollständige Kontrollbaum war vor und nach den echten Lesewegen identisch. Absichtliche Änderungen und schädliche Dokumente wurden ausschließlich an temporären Testdaten geprüft.
- Reviews: Code Review, Planabdeckung und Lösungsintegrität sind bestanden. Vier korrigierte Implementierungsbefunde sind geschlossen; keine offene Pflichtlücke bleibt. Dokumentation und bestehender Context Graph sind abgeglichen.
- Grenzen: Zwei bestehende Runs mit Referenzen außerhalb des erlaubten Kontrollbaums bleiben sichtbar gesperrt. Die Nachweise gelten für diesen lokalen macOS-/Node-/Chromium-Betrieb; sie behaupten keine plattformübergreifende Host-Installation, Veröffentlichung, UAT oder gemessene Zeitersparnis. Große Erfassungsgrenzen wurden parametrisiert, Vorschau- und Antwortlimits zusätzlich am echten Grenzwert geprüft.
- Nächster Schritt: Eine neue bewusste QA-Freigabe dieser gebundenen Berichtsfassung ermöglicht die anschließende UAT. Diese Qualitätsentscheidung selbst ersetzt keine menschliche Freigabe.
