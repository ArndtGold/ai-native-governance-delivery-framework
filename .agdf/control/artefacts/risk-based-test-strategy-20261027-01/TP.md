# TP: Central quality policy and focused verification

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-27
Owner: Codex (TP author; human approval remains with Arndt Gold)
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

All paths below are repository-relative. Execution starts only after deliberate TP
approval and the existing implementation-preparation Brownfield Analysis. No production
change or test execution is claimed by this plan.

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Complete post-TP Brownfield Analysis; capture scoped changed-path baseline and protected UR/PRD/SD digests, CI/workflow and receipt-format boundaries. Reconfirm generators and existing tests before editing. | Codex | Approval: TP |
| T-002 | Extend quality.md once with proportional selection/placement, reusable evidence, sensitivity, finding re-verification and verification completion; reconcile its automatic-output contradiction. Preserve gap routing and deviation semantics. | Codex | T-001 |
| T-003 | Add quality to existing SD/TP runtimeContractModules and fallback lists; add concise phase-specific use in SD/TP contracts and current templates without new required columns or evidence files. | Codex | T-002 |
| T-004 | Apply shared rules through existing TP/Code/Clean review and qa-gate guidance; align concise pass versus actionable revise/block and preserve explicit detail/gate presentation. | Codex | T-002 |
| T-005 | Curate CG-QUALITY-CONTRACT, link the UX node, add the explicit SoT row and architecture entry/01 references; reconcile existing 02/03 references without copying full rules. | Codex | T-002 |
| T-006 | Extend existing SD/TP definition tests and existing build-contract checks for actual quality module/content/digest delivery, missing-module refusal and source-reference propagation. Prepare concrete semantic-case inputs and expected outcomes below. No new semantic rule engine or test inventory. | Codex | T-003, T-004, T-005 |
| T-007 | Generate through the normal build:prepare path; measure attributed payload growth, use the supported exact-size budget review if needed, then complete normal generation/assembly. Preserve file count and instruction budgets. | Codex | T-006 |
| T-008 | Execute the focused groups below on final relevant sources, record grouped results in CD_TESTS.md, reconcile graph/registry impact, then complete required TP/Clean/Code reviews and route to QA. Reuse results until relevant inputs change. | Codex | T-007 |

### Evidence grouping and completion

Use the existing `CD_TESTS.md` as the main implementation/check record, with compact
sections `Scope and source identity`, `Structural delivery`, `Semantic scenarios`,
`Propagation and regression` and `Limits and remaining gaps`. Keep command outputs
only when they add reproducibility/diagnostic value; prefer one grouped log per executed
command group. Required internal review/QA artefacts remain separate assessments and
reference this shared evidence. Technical writer-owned receipts are unchanged.

Record tested source identity, environment, command/outcome and applicability. A stable
result may support multiple rows below. Do not rerun a group merely for another review.
After a relevant change repeat only affected groups, broadening if impact is uncertain.
Finish collection once all applicable scenarios and required coverage are accounted for,
findings/contradictions resolved and referenced results remain valid; continue the existing
reviews and human gates. Missing access or failed checks remain explicit gaps.

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-008 | SCN-001 | All three entry points identify and link one canonical owner. | CD_TESTS.md Structural delivery; graph/registry/architecture refs |
| AC-001 | SDD-005 | T-008 | SCN-015 | The curated general quality node is distinct from policy ownership; UX references reach it. | Same source-reference review; no separate command run |
| AC-002 | SDD-001 | T-008 | SCN-002 | Bounded change selects relevant existing checks; uncertain dependencies broaden or remain a gap. | CD_TESTS.md Semantic scenarios |
| AC-002 | SDD-002 | T-008 | SCN-010 | SD/TP receive the canonical module and apply it in existing sections. | Existing SD/TP definition test outputs |
| AC-003 | SDD-001 | T-008 | SCN-003 | Partial CI coverage and undeclared nightly cannot count as complete proof. | Semantic case assessment; authoritative inventory refs |
| AC-003 | SDD-002 | T-008 | SCN-016 | Existing SD/TP sections express placement and decision timing without a new table/schema. | Same semantic assessment and phase source review |
| AC-004 | SDD-003 | T-008 | SCN-004 | One retrievable applicable result can support multiple obligations without copying. | CD_TESTS.md Semantic scenarios |
| AC-004 | SDD-003 | T-008 | SCN-005 | Stale, expired, changed-environment or contradictory proof is rejected or bounded as a gap. | Same grouped assessment |
| AC-005 | SDD-003 | T-008 | SCN-006 | Duplicate collection has no automatic justification; a concrete reproducibility need can justify a copy. | Semantic and diff review |
| AC-006 | SDD-001 | T-008 | SCN-007 | Requirement-derived cases distinguish meaningful failure from infrastructure faults. | CD_TESTS.md Semantic scenarios |
| AC-006 | SDD-003 | T-008 | SCN-017 | Unsafe replay permits a justified adequate alternative with visible limits; it does not become a waiver. | Same grouped semantic assessment |
| AC-007 | SDD-003 | T-008 | SCN-008 | Status-only or aggregate-build closure stays unsupported; targeted adequate re-verification supports closure. | Semantic finding assessment |
| AC-008 | SDD-003 | T-008 | SCN-009 | Sufficient unchanged proof stops recollection; relevant new input reopens affected obligations, preserving reviews/gates. | Semantic stop/reopen assessment |
| AC-009 | SDD-002 | T-008 | SCN-010 | Canonical module/content/digest delivery and missing-module refusal work. | Existing SD/TP negative fixtures |
| AC-009 | SDD-003 | T-008 | SCN-018 | Shared evidence preserves required separate review assessments and the single final QA owner. | Same consumer source review |
| AC-010 | SDD-004 | T-008 | SCN-011 | Concise routine pass, four-dimension revise/block and requested full detail agree across sources; no approval follows from pass. | Semantic output examples; interaction regression output |
| AC-011 | SDD-001 | T-008 | SCN-012 | Approved sources, gate/receipt semantics and full CI inventory are preserved. | Scope/digest/diff review; ci-plan-test output |
| AC-011 | SDD-006 | T-008 | SCN-019 | Final source/propagation diff contains no excluded installation, history migration or new runtime authority. | Same final diff and qualification-limits review |
| AC-012 | SDD-006 | T-008 | SCN-013 | Generated profiles match canonical changes; exact justified size accounting retains file count and hard instruction budgets. | Build, budget, integrity and focused regression outputs |
| AC-012 | SDD-006 | T-008 | SCN-014 | Scenario outcomes identify actual evidence class and do not claim native agent obedience or measured savings. | CD_TESTS.md limits; required review assessments |

## 3. Test Plan

The command groups below are execution recipes, not a second canonical test inventory.
Canonical npm scripts and scripts/ci-plan.mjs remain authoritative. All commands run
from this repository on the available macOS host using Node 22.22.3 and the lockfile
dependency versions. No fresh host/model session or external account is required.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | R-01 source-reference review plus affected build-contract checks in C-01 | Source checkout and generated profiles | TP approval, post-TP analysis, readable canonical sources | Codex | Three entry-point links and one canonical authority documented in CD_TESTS.md | Name broken/missing reference and correct through its owner before pass |
| AC-002 | SCN-002 | R-02 semantic cases: one local template change with existing coverage versus uncertain shared dependency | Source review | Final central policy and consumers; existing records | Codex | Different justified test selections, expected/assessed outcomes and source anchors | Keep the undecidable obligation open; clarify at existing owner |
| AC-002 | SCN-010 | C-01 bound module and phase-contract checks | Disposable test fixtures | Generated resources current; locked dependencies | Codex | quality content/digest present in actual SD/TP continuation | Repair scoped dependency defect; no fallback to fabricated module text |
| AC-003 | SCN-003 | R-02 partial/full inventory and essential-proof-timing cases; C-04 inventory regression | Source review and local fixtures | Canonical scripts/planner readable; no remote CI required for these assertions | Codex | Partial list rejected as complete; nightly absence/pending proof explicit; unchanged inventory verified | Retain coverage gap; never move jobs or drop checks to pass |
| AC-004 | SCN-004 | R-02 same valid result referenced by two mapped claims | Existing-record scenario | Retrievable source identity and matching applicability | Codex | Shared reference accepted without recollection or duplicate document | Require retrieval/applicability proof or mark a gap |
| AC-004 | SCN-005 | R-02 changed dependency, expired artifact and environment mismatch countercases | Existing-record scenario | Explicit tested versus current source/environment facts | Codex | Reuse limited or rejected; new evidence obligation visible | Preserve gap; no older green result relabeled as new execution |
| AC-005 | SCN-006 | R-02 next-gate-only repeat versus justified reproducibility copy; final diff review | Source/record review | Final guidance and file list | Codex | Added value distinguished without per-proof reports | Remove unnecessary duplication or record the actual need |
| AC-006 | SCN-007 | R-02 before-fix failure/after-fix success, mirrored test, infrastructure failure and unsafe replay cases | Reviewed examples; isolated structural fixtures in C-01 | Approved expected behavior and concrete input/outcome pairs | Codex | Genuine defect detection distinguished; bounded safe alternative where needed | Record effectiveness gap; never count infrastructure error as detection |
| AC-007 | SCN-008 | R-02 finding closure cases: code-only, green aggregate, targeted outcome plus side-effect proof, accepted deviation | Reviewed examples | Same original finding/condition and explicit candidate closure proof | Codex | Only adequate targeted/alternative proof supports technical resolution | Keep applicable finding/evidence gap open; use existing normalized route |
| AC-008 | SCN-009 | R-02 sufficient-proof/no-change and relevant-change/reopen pair | Reviewed examples | Required obligations/results and changed-input identity | Codex | Stop unnecessary collection in first case; reopen affected proof in second; no gate skipped | Revise completion claim; preserve mandatory reviews/approvals |
| AC-009 | SCN-010 | C-01 actual module/digest plus missing-module fixture and R-01 consumer-role review | Disposable fixtures and sources | Current generated runtime; no live Run mutation by tests | Codex | Canonical dependency delivery/refusal and unchanged roles | Scoped correction and targeted retry; broader authority change returns upstream |
| AC-010 | SCN-011 | R-02 pass/revise/block/detail-request examples and C-03 existing interaction regression | Local source/returned-output tests | Final quality/QA guidance; generated resources current | Codex | Consistent feedback and unchanged technical/human state; requested detail remains available | Resolve contradictory guidance; native rendering remains unverified |
| AC-011 | SCN-012 | R-03 scope/protected-source digest review and C-04 canonical inventory test | Checkout and local fixtures | Captured baseline; only this Run's authorized files changed | Codex | Approved sources unchanged; no workflow/receipt/history alteration or dropped tests | Stop affected work, preserve foreign bytes and route the actual scope violation |
| AC-012 | SCN-013 | C-00 generation/budget procedure, then C-01/C-02/C-03 as applicable | Checkout/generated/disposable fixtures | Locked deps/UI build assets; repository writes; package network only if missing prerequisites | Codex | Exact source delivery, integrity, unchanged file count/footprint budgets and focused regressions | Keep concrete failure/gap; no arbitrary budget increase or installed-host repair |
| AC-012 | SCN-014 | R-03 classification/claim review across grouped results | CD_TESTS.md and review artefacts | Actual final source identities and observed outcomes | Codex | Structural, semantic self-review and distribution evidence clearly separated; no unsupported host/savings claim | Correct claim or supply specifically authorized missing proof |
| AC-001 | SCN-015 | R-01 general/UX node and policy-ownership distinction; share SCN-001 source read | Source checkout | Curated graph and canonical quality contract | Codex | General node is navigation/context; quality.md remains normative | Correct duplicate ownership before pass |
| AC-003 | SCN-016 | R-01/R-02 existing SD/TP placement/timing record; share SCN-003 assessment | Source/record review | Final SD/TP guidance and templates | Codex | Placement and decision timing fit existing records without new required format | Correct the phase guidance or raise the actual upstream gap |
| AC-006 | SCN-017 | R-02 justified alternative versus unsupported waiver; share SCN-007 example group | Reviewed examples | Original failure purpose, unsafe-replay reason and alternative proof | Codex | Alternative supports the claim with bounded limits; inadequate proof remains a gap | Retain effectiveness/evidence finding |
| AC-009 | SCN-018 | R-01 separate-review assessment versus duplicated evidence; share SCN-010 consumer review | Source/record review | Existing roles and actual consumer guidance | Codex | Required reviews and qa-gate ownership persist while evidence is shared | Correct role/authority drift, without adding a new review owner |
| AC-011 | SCN-019 | R-03 excluded-change audit; share SCN-012 final diff review | Checkout/generated sources | T-001 baseline and final changed-path list | Codex | No excluded host/history/runtime changes | Stop excluded work and route its scope decision |

### Concrete command groups

**C-00 — prepare and propagate once for the final source batch.**
Use `npm run build:prepare`, whose canonical order prepares UI resources, generates,
assembles and runs release preparation. This is preparation/verification, not release
publication. Existing lockfile dependencies are prerequisites; use `npm ci --ignore-scripts`
at the root when absent. The canonical prepare path handles its UI dependencies.
Repository package downloads may require host permission; no login, installed-plugin
mutation or native session is part of this task.

If that normal path fails specifically with `AGDF_COPILOT_PAYLOAD_GROWTH` after writing
a valid inventory, retain the failure and run `node scripts/payload-budget.js` to obtain
the supported size report. Review source mappings/component deltas first. Only when the
count remains 397 and all growth is attributable to approved changes may the existing
`node scripts/payload-budget.js --accept --files 397 --bytes <observed bytes> --reason <reviewed attribution>`
record the exact measured total. Supply the literal observed integer and a concrete
attribution; do not invent a limit. Its report still validates inventory, digests,
profile and source mappings. Rerun `npm run build:prepare` once after that changed
baseline to complete normal budget-enforced generation. Other failures do not authorize
baseline reset or unrelated repair; missing/inconsistent prerequisites remain gaps.

**C-01 — actual contractual delivery and focused authoring regression.**

- `node packages/cli/scripts/build-contract-test.js`
- `npm --prefix packages/cli run test:sd-definition`
- `npm --prefix packages/cli run test:tp-definition`

Extend the existing definition-test assertions, which currently expect only two modules,
to also compare delivered quality content and digest with the canonical/packaged source.
In the existing disposable fixtures, removing the required quality resource must fail
closed; restoring it must restore the valid continuation. An isolated removed-module
mapping must be caught by the dependency assertion. Keep original readiness/approval
refusals; no test touches this live Run or creates synthetic production approvals.

**C-02 — distribution/instruction integrity, once after generation.**

- `npm --prefix packages/cli run test:instruction-footprint`
- `node plugins/agdf/scripts/check-runtime-integrity.mjs`
- `npm --prefix packages/cli run test:runtime-integrity-layout`
- `npm --prefix packages/cli run test:copilot-profile`
- `node scripts/payload-budget.js`

Report final files/bytes and source attribution in the existing implementation record.
Do not raise instruction budgets, relax profile exclusions or add payload headroom.
Use the unchanged generators and baseline owner; generated output is never hand-edited.

**C-03 — affected routing/output and package-consumer regression.**

- `npm --prefix packages/cli run test:interaction-presentation`
- `npm --prefix packages/cli run test:skill-evals`
- `npm --prefix packages/cli run eval:skills`
- `npm --prefix packages/cli run test:package-contents`

Deterministic skill evaluations retain their existing routing/structure evidence class.
They are not proof that a live agent follows the new policy. The interaction test guards
unchanged derived/detail/presentation interfaces; automatic text semantics also require
the source/scenario assessment, not a new runtime output engine.

**C-04 — inventory and scope preservation.**

- `node scripts/ci-plan-test.mjs`
- `git diff --check`
- Compare `git diff --name-only`, relevant untracked paths and protected-source digests
  with the T-001 baseline; inspect any unexpected path rather than automatically staging it.

Full broad regression stays in `.github/workflows/agdf-guardrails.yml` / `verify-agdf.yml`
and canonical inventory partitions. Do not run the complete smoke suite after each edit.
This plan does not authorize push/PR creation or claim remote CI success. Any later
authorized CI result must identify its exact tested commit; if a subsequent acceptance
requires that result, its absence remains a gap at that decision point.

### Source and semantic review recipes

- R-01: Follow actual relative references from CONTEXT_GRAPH, SOT_REGISTRY and architecture
  README/01 to quality.md; inspect the general/UX node relation, canonical module metadata,
  SD/TP fallback lists and phase/review prompts. Record broken links, competing rule
  definitions and owner confusion as findings. Existing file reads/search are sufficient.
- R-02: For each listed case, put its concrete input facts, expected decision and assessed
  result next to the applicable central section in CD_TESTS.md. Use paired counterexamples
  rather than a checklist of matched words. This is cooperative semantic review by Codex;
  required later reviews retain their own assessment. Never invent live test execution.
- R-03: Review the final diff and original-source identities against the approved exclusions;
  classify the evidence actually obtained. Verify no claim exceeds its environment,
  tested revision or execution path. Reconcile graph/registry completion before clean handoff.

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Exact scenarios and execution grouping | SD: Execution scenarios and command grouping | resolved | Use SCN-001 through SCN-019, grouped C-00 through C-04 and R-01 through R-03 above. SCN-015 through SCN-019 reuse the same source/scenario checks for distinct design obligations; no additional command repetitions. Share CD_TESTS.md and repeat only invalidated groups. | Codex, TP author |
| Evidence access and execution scope | TP | resolved | Local source/fixture/generated checks need no external account or native session. Locked dependencies and canonical prepare resources are explicit prerequisites; unavailable access is a gap, never implied consent to credentials/host changes. | Codex, TP author |
| Payload growth handling | TP | resolved | Use the existing supported payload report/accept CLI only after attributed measurement, unchanged 397-file count and approved exact-size method; complete normal budget-enforced generation afterward. No arbitrary ceiling/headroom or instruction-budget change. | Codex, TP author |
| Full CI versus focused Run checking | TP | resolved | Execute the affected local groups once on final relevant sources; keep broad regression in existing unchanged CI. No repeated full local smoke, no push authorization and no unobserved remote success claim. | Codex, TP author |

## 4. Brownfield Scope

Recheck quality.md, SD/TP contracts/skills/templates, plugin-definition module arrays,
the four review/QA skills, existing definition/build tests, source generators and
payload-baseline/report owner. The current source inspection confirms SD/TP module
assertions in `packages/cli/scripts/sd-definition-test.js` and `tp-definition-test.js`
expect the old two-module arrays. Tests must reflect actual canonical delivery, not
merely alter those arrays to silence a failure.

Inspect graph/registry and architecture README/01/02/03 before scoped curation. The
existing resource reader, evaluator/projection, CLI/MCP schemas, locale catalog and
explicit status/detail paths are reused unchanged. No new dependency is selected.

### Derivation and source identity

Approved primary SD.md @ sha256:14957409b7da639c29c59a31645c3e96028298b03d34b6f8fa968ff24af80115.
Approved product PRD.md @ sha256:c679089a7bf6320bffe6f3a0d843ace0c7d9997528121287b866796fd48cc1ab.
Analytical BROWNFIELD_REVIEW.md @ sha256:2ae4db4322f8c6cbfd92a011088d5e6967d2a2cea84365a6f8dad20328279473.
Every criterion/associated design choice is mapped above; the SD later_tp obligation
is resolved once in Planning Decisions. This is cooperative author self-review,
not independent semantic assurance. No approved source is edited by this plan.

## 5. Out Of Scope

CI restructuring/nightly scheduling, reduced coverage or weakened checks, new evidence
schemas/registries, arbitrary payload/instruction-budget increases, receipt/history
changes or evidence deletion, new runtime policy enforcement, native model sessions,
installed-plugin updates, broad unrelated fixes, commits/push/PRs/releases/publication.
This plan adds no new human gate and does not bypass existing reviews or approvals.

## 6. Risks And Blockers

- Required module delivery, evidence applicability, finding closure or normal generation
  failing is a concrete revise/block finding according to the existing owner; never a
  reason to weaken tests or silently declare completion.
- Unexpected generated-file growth, mismatched sources, new permission requirements or
  need to change runtime/approval semantics requires scope/design clarification first.
- Locked-dependency availability is an execution prerequisite, not an observed failure.
  Infrastructure errors and missing external results remain distinct from product defects.
- Semantic case assessment and deterministic fixtures cannot establish native agent
  compliance, independent review or numerical savings; claims must retain those limits.
- Stop repeated collection after sufficient final evidence; invalidate affected results
  on relevant change and do not skip required reviews/QA/human gates.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

After valid approval, continue with the existing Brownfield Analysis before CD+Tests,
then required reviews and a separately presented QA decision. No installation or VCS
action is authorized by TP approval alone.

## AGDF Approval Summary (de; source=en)

- Ziel: Den freigegebenen zentralen Qualitätsvertrag mit acht Aufgaben und gezielten, wiederverwendbaren Prüfgruppen umsetzen. Alle zwölf PRD-Kriterien und sechs SD-Entscheidungen sind konkreten Szenarien zugeordnet.
- Umfang: Nach TP-Freigabe zuerst Brownfield Analysis und Ausgangsstand sichern; quality.md ergänzen, SD/TP-Modulzuordnung und vorhandene Planungs-/Reviewtexte anpassen, Graph/SoT/Architektur verankern, bestehende Tests erweitern und normal generieren.
- Prüfung: Neunzehn zugeordnete Szenarien prüfen Auffindbarkeit, Auswahl, CI-Abdeckung, Wiederverwendung, Mehrwert neuer Belege, Testwirksamkeit, Befundnachprüfung, Prüfabschluss/Wiederöffnung, Rollen, Ausgaben und Paketweitergabe. Fünf Teilaspekte nutzen dieselben Prüfungen für verschiedene Designpflichten; dadurch entstehen keine zusätzlichen Befehlsläufe.
- Befehle: Bestehende SD-/TP-/Build-Contract-Tests, Instruktions-/Laufzeit-/Copilot-Prüfungen, Interaktions-/Skill-Evals-/Pakettests sowie CI-Inventarprüfung gezielt ausführen. Vollständige Regression bleibt in den bestehenden CI-Partitionen; kein vollständiger lokaler Lauf nach jeder Änderung.
- Nachweise: Ein gemeinsamer CD_TESTS-Bericht mit gruppierten Ergebnissen und Quellenidentität genügt als Testnachweis. Pflichtreviews bewerten eigenständig und referenzieren ihn. Unveränderte Ergebnisse wiederverwenden; nur betroffene Gruppen nach relevanten Änderungen wiederholen.
- Paketgrenze: Normaler build:prepare-Pfad. Bei ausschließlich nachgewiesenem Paketwachstum den vorhandenen Budgetbericht und unterstützten Review-Befehl verwenden; exakt gemessene Bytes, weiterhin 397 Dateien und unveränderte Instruktionsbudgets. Danach normal mit aktiver Budgetprüfung generieren.
- Entscheidungen: Die offene SD-Ausführungsfrage ist gelöst: konkrete Szenarien, Befehlsgruppen, Nachweisort, Voraussetzungen und Verhalten bei fehlenden Ergebnissen sind festgelegt. Kein neuer Nachweisstandard und kein neues Register.
- Grenzen: Keine CI-Umstellung, kein Nightly-Aufbau, keine Nachweislöschung, keine Änderungen an Freigabe/Historie, keine Installation, nativen Modellsitzungen oder VCS-/Release-Aktionen. Remote-CI, Einsparungen und native Agentenbefolgung werden nicht vorgetäuscht.
- Risiken: Fehlende Abhängigkeiten, widersprüchliche Evidenz oder unerwartete Paket-/Scopeänderungen bleiben offene Befunde. Fachliche Selbstprüfung und deterministische Tests ersetzen keine unabhängige oder native Qualifikation; Pflichtreviews und menschliche Freigaben bleiben erhalten.
- Nächster Schritt: Mit Approval: TP diese Fassung freigeben; danach Brownfield Analysis und erst bei erfüllten Voraussetzungen Implementierung und Tests.
