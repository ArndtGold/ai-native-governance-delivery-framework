# QA Report: Versioned defaults and immediate MCP input relief

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-10-30
Owner: Codex, sole technical qa-gate assessment
Objective: Deliver centrally versioned plugin preferences and shorter MCP calls with validated target-bound resolution, preserved authority and original-operation recovery.

## 1. QA Decision

Decision: pass

Technical pass applies to the approved implementation and bounded Codex CLI MCP transport. The three evidence dimensions support this sole qa-gate decision; none grants a human approval. No applicable open/invalid normalized finding or unfulfilled applicable UX row remains. No deviation acceptance is proposed.

## 2. TP Coverage

- delivered_result: The plugin ships schema-validated defaults for chat_language, artifact_language, presentation_route and gate_check_variant. Confirmed project values override plugin defaults and valid explicit call values override project values. Nine MCP tools can omit presentation language, seven command groups can omit fixed protocol constants, and delivery/status inherit their scoped representation preferences. Invalid present settings fail clearly; target/Run/revision/digest/reply bindings and original-operation replay remain enforced. Current native cwd omission returns a no-effect error.

TP Review records T-001..T-010 fully_done with high-confidence evidence and all implementation acceptance due before QA satisfied. T-011 was partially_done at its review because review registration, this sole QA assessment and its fresh presentation necessarily follow; all three reviews are now recorded and this assessment completes its technical decision part. Presentation is the immediate next operation. T-012 remains not_done as expressly human-gated future QA/UAT/OR work; no downstream completion or approval is inferred.

CD+Tests maps SCN-001..024 to actual source/resource, configuration, schema, authority, context, presentation, original-recovery, legacy, two-SDK, generation, package/budget and native observations. Those rows cover AC-001..011 and SDD-001..008. SCN-025/AC-012 is supported by the current same-candidate TP/Clean/Code reviews and this sole QA assessment; its fresh presentation remains required before human response. This does not mark a planned future gate as already approved. UX-S1..UX-S4 are all fulfilled with real SDK/model-visible feedback, final native shortened/explicit calls and immutable delivery/error/no-effect observations, rather than code-only claims. No UI preview or native click qualification was in the approved scope. No P0/P1 implementation gap is open.

## 3. Evidence

Current QA authoring-inputs at revision 87f5238d-6a4c-4cc9-adf4-0422ac424bd9 were read through all 17 pages. Manifest: sha256:eb51956b94bbad7e0914a3446aa5c5b3db86f460a8440d74922163a5adf1b710. Authoring template QA_REPORT comes from the version-matched plugin, digest sha256:606c4213b8f00e409b9dcba2b45be9131d7b90705c0911d6a38c5fbbe256bd68; the repository scaffold was not used as a fallback.

After initial recording, decision-content preparation rejected unescaped less-than comparison symbols in the performance prose because the conservative report observer treats uncertain HTML as excluded content. The unapproved report now uses plain limit wording; technical results, evidence, scope and decision are unchanged. All 18 current authoring-input pages were consumed at revision 5cb3430d-ef7d-4ca0-a726-1a16d38be1b9, manifest sha256:554d82caedbeed19716ca5dffea9cb4e38c1873a5020ce417f4f582c31f45bb8 with the same template/source digests. Pure content observation confirms result, limits, risks, localized result/limits/risks and decision. Canonical readiness still must pass before presentation; no product parser policy or approved source was changed to bypass the check.

Approved TP: sha256:5256fc869495413d7806da6e4ba0f30b238205d947fbbf6b25216bf8392aaeda. SD: sha256:c3b0dbfa250a7e991e4a02e30221d19baf1456592016eac37153b46e506d1791. PRD: sha256:81229effc36ffb32a5606bb7b666ecada7de9f747e4901bba7082f1f79d51dc8. Current Run-local reports:

| Dimension | Report | Exact digest / conclusion |
|---|---|---|
| Brownfield fit | BROWNFIELD_ANALYSIS.md | sha256:880178de0e51b814f5e9007b5be594af9405cd1097b23b5cab2726d9bf8b7844; existing owners reused |
| Implementation/tests | CD_TESTS.md | sha256:0eedbc2dbdf3f1423239bb7afd0c53a7e251daeca46aa926b120a8d40e75d027; pass with exact candidate, scenarios, failures and reuse |
| Plan coverage | TP_REVIEW.md | sha256:a80b3aeacd832f259107d29eb5c88523648a0f9f3574432044f4e93513853ab0; pass for tasks due before QA, conditional downstream tasks visible |
| Solution integrity | CLEAN_IMPLEMENTATION_REVIEW.md | sha256:9917ada83fad8bde447eacca58859e3faf955766d496cf972055ecb8a46b84a0; pass, no parallel config/ledger/authority |
| Code quality | CODE_REVIEW.md | sha256:8c441675f03526b01dd2e1fa05e764c8184ce31f11d1846a21d4a576110364e9; pass, CR-001..003 resolved with targeted evidence |

The reports refer to the same 99-file product candidate based on HEAD 1833c8b4a5e3184bbcb1dde97c09a33f086dd3eb, not the unrelated dirty index. current-candidate-inputs.json compact SHA-256: 1a1279afd089b79da451a50448a8eacc280bef55b60f222da508ffcf29a35a5a. Final source/candidate drift is empty; ten protected hashes are unchanged (delivered-preservation.json). Changing live Run bookkeeping is excluded from this product manifest.

Actual raw evidence is retained under probe-results/mcp-defaults-run-3ab79b5a/ with evidence-index.json. Final build, artifact-language/Core configuration, package contents/build, payload, contract, safety, boundaries and source/generated runtime integrity pass. Both SDK eras and full current protocol/generation pass. Latest 22 source-revision cells and 44 approval interruption checkpoints include original retained resolution and conflicting/tampered-envelope rejection. Safe oversized-config before/after regression proves rejection before read (old 1/1 versus final 0/0 reads), supported by final Core and SDK cases. New/legacy format readers and unsupported old-reader refusal are exercised.

Fresh native codex-delivered.json: Codex CLI 0.163.0, Node v22.22.3, macOS x64, six direct app-server calls, shortened/explicit read/write equivalence, one effect per fixture, original replay after config change, cwd-omission error, zero model calls, no credential copy/install, exit 0 and cleanup/personal-settings/control preservation. Final dispatcher 130ebcc93db0419e7dc48784e7115b225b0cd8c498a9f33bba7f906fab207dce and server 027441e6cd0bf07d4b4ae1e16163f1767d8768c8aba01427d0afd8b399c5d0c5 equal assembled packages. Offline harness passes 4/4. SDK discovery covers all nine regular tools; native discovery deliberately enables only inspect/run.

Unchanged local performance thresholds pass in a separate 20+20 sample run: cold p95 1417.455 ms (limit 1500), warm 337.645 ms (limit 1000). Descriptor limits remain inspect 4954/5000 and aggregate 24033/24576 bytes. The approved exact Copilot payload baseline was regenerated through its owner to 440 files/4647526 bytes; generic hard caps did not change. Deterministic guidance replay is 113/113, compatibility freshness 56/0. These are structural/deterministic results, not fresh model-task evaluations.

Earlier valid family results were reused with tested identity and impact reasoning in CD+Tests; final diagnostic/pre-read guard changes have targeted final verification and native execution. The CLI npm orchestration timed out, while its child later reported 63/63 passing Core tests; four trailing preview scripts separately exit 0. This is segmented coverage, not a claimed aggregate npm pass. Original missing-build prerequisites, stale assertions/fingerprints, target/error defects, generation fixture race, native key-order comparison and parallel-load performance failure remain retained with their repairs/rechecks. QA consumes CR-001..003 as resolved under their original implementation_gap/CD+Tests routing; it neither reclassifies them nor treats status alone as proof.

Context graph and documentation are consistent with the approved link_only action. Canonical guidance/generators include both JSON resources, omissions, explicit overrides, no native cwd inference and error/recovery behavior. Existing Core semantics/family persistence remain the owners.

- context_graph_impact: link_only
- context_graph_refs: CG-MCP-DISPATCH-ADAPTER; docs/architecture/core-mcp-command-flow.md
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing node references the maintained architecture document; the updated document back-links it and describes defaults, resolution, original replay and transport owners.

## 4. Missing Evidence

- qualification_limits: Native Desktop/UI interactions, human UAT, installed-plugin update, other hosts/platforms, GitHub CI, model-task outcomes, token/cost improvement and power-loss durability were not observed. Qualification here is repository/package checks plus isolated native Codex CLI MCP transport on macOS x64.

No mandatory evidence is missing for this approved bounded technical decision. Full source verify:commit/whole smoke CI was not run against protected unrelated staged work; isolated scoped obligations and documented applicable family coverage supply this Run's evidence. No CI result or human acceptance is inferred. Reviews are semantic self-review by Codex, not an independent human assessment. Locked dependencies were reused; the report does not claim a fresh online registry install.

## 5. Risks

- delivery_risks: Existing descriptor/payload budgets have narrow headroom; retained resolution metadata consumes existing material/delivery capacity. Native adapters still require explicit working_directory. Volatile operation context retains existing expiry/generation-loss uncertainty and restaging rules; unsupported old readers reject new records. Broader host/UI, installation and human acceptance remain pending.

The original parallel-load performance failure remains disclosed despite the separate threshold pass; no speedup is claimed. Uncommitted intended changes coexist with protected unrelated work, so later VCS/install handoff must preserve that boundary and obtain its own authorization/checks. No unresolved blocking implementation/ownership/security finding is known in this candidate. This pass grants no release or roadmap commitment.

## 6. Required Next Step

Prepare and deliver a fresh bound QA presentation, then wait for the maintainer's deliberate Approval: QA on that exact material. Only valid QA approval permits the current UAT path; later UAT/OR and VCS/install actions retain their own gates and authority.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Plugin-Defaults zentral als versionierte JSON-Dateien ausliefern und wiederholte MCP-Eingaben reduzieren, bei erhaltener Ziel-, Revisions- und Freigabebindung.
- Ergebnis: Vier validierte Voreinstellungen mit Vorrang explizite Angabe > bestätigtes Projekt > Plugin sind umgesetzt. Neun MCP-Werkzeuge können die Präsentationssprache weglassen, sieben Befehlsgruppen zusätzlich feste Protokollwerte. Darstellungsroute und Statusvariante wirken nur beim jeweiligen Vorgang. Ungültige Einstellungen liefern eine klare Diagnose; ursprüngliche Vorgänge und Präsentationen behalten ihre Werte und Identität.
- Grenzen: Der native Codex-CLI-Test bestand mit sechs direkten MCP-Aufrufen, ohne Modellaufruf oder Installation. UI-Klicks, Desktop-Abnahme, andere Hosts, GitHub-CI, menschliche UAT und Kosten-/Tokenersparnis sind nicht nachgewiesen. Das Arbeitsverzeichnis muss im aktuellen nativen Adapter weiterhin explizit angegeben werden.
- Risiken: Geringer Spielraum in bestehenden Größenbudgets; Auflösungsmetadaten zählen innerhalb dieser Grenzen. Flüchtige Vorgangskontexte behalten ihre bisherigen Ablauf- und Wiederanlaufgrenzen. Ältere, nicht unterstützte Leser verweigern neue Datensatzversionen. Die Änderungen sind uncommitted; fremde lokale Arbeit ist geschützt.
- Prüfergebnis: Technisches QA pass. Plan-, Struktur- und Code-Review sind erfasst; keine offenen Befunde im vereinbarten Umfang. Die ursprünglichen Fehlläufe und gezielten Nachprüfungen sind dokumentiert. Die Umsetzungstasks sind abgeschlossen, nachgelagerte menschliche Freigaben und Closeout bleiben offen.
- Nächster Schritt: Die neue, gebundene QA-Präsentation prüfen und nur mit Approval: QA freigeben. Daraus folgt noch keine UAT-, Installations-, Git- oder Release-Freigabe.
