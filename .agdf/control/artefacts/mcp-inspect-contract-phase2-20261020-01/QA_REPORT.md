# QA Report: understandable MCP inspection and complete document delivery

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-10-20
Owner: Codex acting through qa-gate

## 1. QA Decision

Decision: pass

The scoped implementation satisfies the approved inspection/document outcome. Plan coverage, solution integrity, source review, generated/packed SDK behavior and an actual complete Codex document delivery are sufficiently evidenced. CR-AUDIT-001 was reproduced, repaired at its existing owner, tested and explicitly resolved in the current Code Review. No applicable normalized finding or UX fidelity gap remains open. This is the technical qa-gate decision, not human QA approval, UAT, release or merge authority.

## 2. TP Coverage

- delivered_result: The existing agdf_inspect now describes its arguments and binding provenance, supplies on-demand usage and a bounded validated presentation catalog, and lets an agent select the exact existing snapshot and deliver all of its ordered pages. The observed Codex replacement delivered the complete original 77796-byte UR through MCP without shell or direct-file data access.

TP_REVIEW.md records 9/9 scoped tasks fully_done, the eight approved criteria and all sixteen stable scenarios. Its five applicable UX Intent Fidelity rows are fulfilled with actual response/trace evidence, rather than code existence alone. Later human QA/UAT/OR decisions are not inferred as task completion. No priority labels were invented.

The original TP source is unchanged at sha256:e6cedc82d181424cdc8e3751f77fbfef3acb0529e5f205b0e12670ed4d176ed6. The first failed session remains preserved. The separately authorized one replacement is bound by NATIVE_REPLACEMENT_AUTHORIZATION-01.md and canonical receipt 51d1fee5-235a-41bc-9439-0790395b7e20. Across both attempts there were two real sessions, not a retroactively successful single attempt. The later direct human yes explicitly authorized CD+Tests recording and continued reviews; it did not approve this QA gate.

## 3. Evidence

- Brownfield fit: BROWNFIELD_ANALYSIS.md identifies existing Core/CLI/MCP, generator and harness owners. CLEAN_IMPLEMENTATION_REVIEW.md confirms their reuse, justified bounds/metadata guards, no second reader/catalog index/native runner and no new approval authority.
- Current reviewed code: CODE_REVIEW.md (source CODE_REVIEW-02.md) and probe-results/mcp-inspect-contract-phase2/reviewed-diff.json bind the final 17 non-control changed files. Rechecking every listed file found no post-review change. The protected foreign artefact directory was preserved.
- Canonical build and full MCP tests passed, including actual packed CLI/MCP archive success/error smoke, effective SDK input/output validation in both existing protocol eras, source/package boundaries, local development installation and runtime integrity negatives. These results qualify the shipped product candidate; final later edits affect only evaluation/tests and graph links.
- Core catalog/document/preview and CLI parity regressions cover complete/absent/ambiguous discovery, 16/page, exact 256 records and 1 MiB record bytes, 1024 directory entries and overflow, corruption/foreign/symlink records, stale/cross-domain cursors, historical reads, >2-page UTF-8 exact reconstruction and no control mutation. The final production-path race test changes the real directory after the initial scan snapshot: it returns presentation_catalog_changed; a fresh stable scan may then return unique.
- Actual tools/list agdf_inspect definition: 4998 bytes, with described fields and effective input/output schema validation. Existing agdf_* names remain. The one existing selected locale projection is compacted with parsed-value equality and declared compact_json inventory transformation. Fresh actual payload: 395 files / 3440927 bytes, zero reserved headroom, below the prior 3442564-byte cap.
- Final evaluator regression suite: 44/44 pass, zero skips. The direct-tool and computed-member admission repair rejects both CR-AUDIT-001 reproductions and escaped inspect handles. Complete exec/rollout invocation sequences are reconciled; real duplicate pages, missing/conflicting mirrors, contradictory success/error flags, wholly missing/truncated data, resource data reads and shell/process/eval detours fail qualification.
- Original native replacement files remain unchanged at probe-results/codex-t4-2026-10-20T08-53-36-748Z/. The original T4 predicate succeeded. Final separately named same-trace verifier: probe-results/mcp-inspect-contract-phase2/native-replacement-verifier-cr-final.json @ sha256:81607fd15c1ac9eed89daff193c446217e62baebf9779cf090ff0e2e24f0f36c. Its strict_t4_document_flow_v1 result proves unique legitimate catalog discovery, exact original binding, 3 ordered pages / 77796 bytes, digest sha256:2191669a88137efcb281bb8bf428260c41a49e45d2697763c1c214895b2ac04f and contiguous full document in the final user output. No new model invocation occurred during evaluator repairs/replays.
- Actual tuple: Codex CLI 0.163.0, gpt-6.1-sol/high, darwin-x64, Node 22.22.3. Retained session records: 2026-10-20T08:53:59.879Z–08:58:25.196Z. Process exit 0, no timeout or output-cap violation. Temporary credential/fixture/runtime roots were removed; repository control/personal configuration manifests were unchanged. Existing ChatGPT-account access was used without API-key fallback or separately authorized API expenditure; actual USD cost is unavailable.
- Actual replacement metrics: 10 AGDF calls with 5 errors recovered by the agent, plus 2 empty host resource-catalog listings which supplied no identifier/binding/document. Usage: 312269 input tokens (265600 cached), 15376 output tokens, 232 reasoning output tokens. Empty metadata-only discovery is recorded separately; it is not a document/helper access or hidden identifier supply.
- Protocol ergonomics: unchanged 32-call matrix, 9 SDK validation and 9 AGDF failures flagged, zero protocol errors/unclassified tool errors/failure_without_isError. Existing comparator against the preserved historical protocol baseline returns expected changed: 9 isError and 9 failure_without_isError corrections inherited from Phase 1, description/definition coverage and response-size/token changes, with zero class/outcome changes. Its difference exit is not misreported as an unchanged comparator pass or a native cohort comparison.
- Logs/digests: probe-results/mcp-inspect-contract-phase2/evidence-manifest.json, checks/agdf-phase2-cr-audit-regression.log, checks/agdf-phase2-document-review-final.log, checks/agdf-phase2-payload-final.log and checks/agdf-phase2-protocol-comparison.log. Earlier raw native reports and corrective records remain available; the canonical internal writer's CD_TESTS.md projection is the current implementation report, not the old incomplete checkpoint.

## 4. Missing Evidence

- qualification_limits: Evidence is local source/package/protocol coverage plus one successful explicitly authorized Codex replacement task. It does not qualify other native hosts/models, personal-runtime activation, fresh remote CI, statistically improved discovery efficiency or an error-free first attempt. Historical Windows/Claude data is a different cohort. Actual USD cost is unavailable; the account/billing route and token usage are recorded.

No mandatory evidence for this scoped technical decision remains missing. The original taskset, fixture, prompt/predicate and historical baseline remain byte-identical. No Claude or further native session, test removal, increased timeout or relaxed original acceptance predicate was used to obtain this result.

## 5. Risks

- delivery_risks: The successful task required recovery from five incorrect MCP calls, so the change improves capability but does not establish smooth first-use discovery or a population success rate. Qualification depends on the exact retained source/host/model/verifier evidence; another host or installation needs its own observation. The initial harness failure and historical unnormalized strict reports remain visible. All reviews are cooperative Codex reviews, not independent human attestation.

No unresolved critical defect, blocking Brownfield risk, current SoT drift or applicable open review finding remains in scope. Conservative syntax admission may reject an unfamiliar future pure wrapper; such a trace remains unqualified until explicitly reviewed, rather than being silently accepted.

## 6. Required Next Step

Present this exact source-bound QA report through the canonical preparation/presentation owner and obtain a NEW deliberate `Approval: QA`. Then follow the freshly evaluated UAT route. Do not infer approval from the earlier yes, a technical pass, historical phase approvals or a green test log.

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing node entry mcp_inspect_document_contract_phase2_20261020 links the current implementation, strict native proof, initial failure and qualification limits; CD_REVIEW_REPAIR-01.md binds the graph digest.
- memory_target: scope_artifact
- memory_reason: Exact qualification and review findings belong to this run; reusable bounded inspection/evidence invariants are linked in the existing Context Graph node.
- memory_refs: .agdf/control/artefacts/mcp-inspect-contract-phase2-20261020-01/; .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Das bestehende agdf_inspect soll verständliche Parameter und einen legitimen Weg zum vollständigen unveränderten Dokument bieten.
- Ergebnis: Argumentbeschreibungen, Nutzungshinweise und begrenzter Präsentationskatalog sind umgesetzt. Build, vollständige MCP-/Paketprüfungen, 44 Auswerter-Tests und der neue Katalog-Race-Test bestehen. Der ausdrücklich erlaubte Codex-Ersatzlauf fand die vorhandene UR und lieferte alle drei Seiten mit exakt 77796 Bytes vollständig aus. Code Review, Planerfüllung und Strukturprüfung sind bestanden; die gefundene Auswerterlücke ist korrigiert und mit dem vorhandenen Trace erneut geprüft. Werkzeugdefinition 4998 Bytes; Copilot exakt 395 Dateien / 3440927 Bytes, ohne erhöhte Grenzen.
- Grenzen: Belegt ist ein erfolgreicher Codex-Lauf auf CLI 0.163.0 mit gpt-6.1-sol/high unter macOS. Der erste fehlgeschlagene Versuch bleibt erhalten; insgesamt gab es zwei ausdrücklich erlaubte Sitzungen. Weitere Hosts/Modelle, statistische Erfolgsquoten, neue Remote-CI oder die Aktivierung einer persönlichen Installation sind nicht nachgewiesen. Tatsächliche USD-Kosten sind unbekannt; Kontozugang und Tokenverbrauch sind dokumentiert.
- Risiken: Im erfolgreichen Lauf korrigierte der Agent fünf Fehlaufrufe; ein reibungsloser Einstieg ist deshalb noch nicht belegt. Die Reviews sind kooperative Codex-Prüfungen. Es bleibt kein offener blockierender Befund im freigegebenen Umfang.
- Freigabewirkung: Technische QA-Entscheidung pass. Erst eine neue ausdrückliche Approval: QA auf diese Fassung erlaubt den nächsten UAT-Schritt. Die bisherige Zustimmung zu CD+Tests und Reviews ist keine QA-/UAT-, Veröffentlichungs- oder Merge-Freigabe.
