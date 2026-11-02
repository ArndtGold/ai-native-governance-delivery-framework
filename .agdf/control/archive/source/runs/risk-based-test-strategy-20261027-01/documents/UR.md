# UR: Proportionate tests and evidence for delivery runs

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-27
Owner: agent

## 1. Problem

The user experiences long waits for all test cases to finish during delivery work.
The framework does not yet centrally require an explicit assessment of which tests
are necessary for the current Run, which existing tests already cover the need,
and which broader regression checks are executed in CI or a Nightly Build.
Without this distinction, repeated broad local execution can add waiting time,
while a reduced selection can leave its coverage and outstanding evidence unclear.
The reported waiting time is a user observation; its causes and magnitude have not
been measured in this Run.

The user also observes many evidence files within Runs and questions whether their
volume is necessary. Repeated test execution, duplicated reports, copied source
material and repeated evidence collection can increase authoring and review effort
without improving the basis for a decision. These are candidate sources of overhead,
not findings that every existing file is redundant. Substantive evidence must be
distinguished from technical records that bind artefacts, revisions and approvals.

The existing central Quality Contract is also insufficiently discoverable as an
overarching authority. The runtime manifest identifies `quality.md` as canonical,
but the Context Graph describes its exclusive review-gap ownership within a UX node,
the SoT registry lists runtime contracts only generally, and architecture references
are scattered. A reader must assemble the central contract's role and its consumers
from several places.

The contract also needs to distinguish a passing check from a check capable of
detecting the relevant defect, a claimed fix from a reverified finding, and sufficient
verification from unnecessary repetition. Its current output rules conflict on whether
the Quality Readiness projection is shown at `pass`; this leaves consumers with
contradictory instructions.

## 2. Goal

Make test planning and execution proportionate to the approved change and its risks,
so delivery agents obtain targeted feedback during the Run and can explain where
complete required regression coverage is obtained. Use the smallest sufficient body
of evidence for each decision: avoid redundant full test execution, evidence collection
and documentation without weakening acceptance, quality decisions or evidence integrity.
The human reviewer should spend less time searching, assigning and comparing evidence
and be able to identify the supported claims and remaining gaps directly.
Maintainers and agents must also be able to find the authoritative Quality Contract
from the Context Graph, SoT registry and architecture entry, understand its boundaries
and follow its application through SD, TP, reviews and QA.
Required checks must detect the behavior they claim to verify, resolved findings must
have appropriate re-verification, and verification must end once its obligations are
satisfied unless a concrete new reason requires further checking.

## Affected Users

- Maintainers and delivery agents who design tests, implement changes, collect evidence
  and review results.
- The human deciding whether the presented evidence is sufficient for acceptance.

## 3. Scope

- Extend the existing central contract `plugins/agdf/meta/contracts/quality.md` for assessing
  test necessity, execution placement and sufficient evidence before new tests,
  evidence documents or repeated executions are planned.
- Require consideration of approved acceptance criteria, changed behavior, affected
  interfaces, dependencies and regression risks, including existing reusable tests.
- Derive expected test results from approved requirements and domain rules. For defect
  corrections, demonstrate where feasible that the targeted regression check fails on
  the original defect for the intended reason and passes after correction. For critical
  new rules, include an appropriate negative case. A test that only repeats implementation
  logic or fails because its environment is broken does not demonstrate defect detection.
  If the original defect cannot safely or practically be replayed, record the reason
  and the alternative evidence and its limits in the existing test/review record.
- Distinguish targeted checks during the Run, required PR/merge CI checks and, where
  applicable, a full Nightly Build (NB). Define how the plan explains what runs where,
  why that selection is sufficient, and when its results are required.
- Require verification of the actual CI coverage rather than assuming that a CI
  build executes the full suite. Missing or unavailable automation stays explicit.
- For each evidence obligation, make its claim, acceptance/risk/rule basis and required
  decision point identifiable in the existing planning and review records. Record this
  proportionately; do not require a new document or a separate form for each proof.
- Assess existing test results, CI runs, observations and authoritative sources for
  reuse before collecting new evidence. References must identify a retrievable,
  revision-bound result and the limits of its applicability to the present scope.
  Re-execute or collect new evidence when relevant changes, environment differences,
  unavailable sources, contradictions or uncertainty invalidate that applicability.
- Permit one authoritative result to support multiple criteria, tasks, reviews or
  decisions through explicit mappings. A later gate or review alone is not a reason
  to copy the result, repeat its collection or create another report with the same content.
- Require a concrete added value for additional evidence files, source/log copies
  and repeated test runs, such as an uncovered claim, changed conditions, reproducibility
  or a required independent review. A summary cannot replace the underlying proof.
- Distinguish substantive evidence from technical binding, approval and history records.
  Avoid unnecessary manually authored duplicates while preserving records required by
  the existing integrity and approval owners. Mandatory review responsibilities remain
  in place even when they reference shared evidence.
- Close a finding only after targeted re-verification of its original failure condition
  and relevant side effects, or an explicitly justified alternative within the existing
  finding owner. A code edit, a changed status or a green aggregate build alone does
  not establish resolution. Missing re-verification remains visible; human acceptance
  of an evidence deviation does not convert it into technical resolution.
- Define when technical verification is sufficient: required claims have valid evidence,
  applicable findings are resolved, required coverage is accounted for and no conflicting
  results remain. Stop redundant evidence collection at that point. Further checks need
  a concrete trigger such as changed inputs, invalidated evidence, an uncovered obligation
  or a new contradiction. Mandatory reviews, gates and human decisions still follow
  their existing owners; verification completion is not delivery approval.
- Apply the central policy through SD test/evidence strategy and TP executable test
  planning, with QA consuming the resulting evidence. Keep one normative policy owner.
- Make that ownership explicit and consistent in `.agdf/control/CONTEXT_GRAPH.md`,
  `.agdf/control/SOT_REGISTRY.md` and the architecture entry/existing-system description under
  `docs/architecture/`. Reconcile existing dispatcher and agent-control explanations
  where needed so readers can follow the same ownership without relying on UX-specific
  context or prior knowledge of the filename.
- These references must distinguish the central contract, its authoring/review consumers,
  the `qa-gate` technical decision and the human approvals. Explain ownership and link
  to canonical rules; do not duplicate complete rules or imply that documentation alone
  enforces them. Existing mode/depth and recording/approval contracts retain their domains.
- Resolve the conflicting Quality Readiness instructions at `pass` into one unambiguous
  display rule, with consumer guidance consistent with the existing interaction owner.
  Keep this correction bounded to the contradiction; it introduces no new UI or gate.
- Preserve complete required regression coverage across the declared execution paths.
  Deferring an essential change-specific check to a future nightly run cannot supply
  evidence for the present decision. Reused CI evidence must match the tested revision
  and relevant environment; unavailable results remain outstanding.
- Bound this first slice to the policy, its discoverable ownership in graph/registry/
  architecture, consistent authoring/review guidance, templates and proportionate
  verification. The design must assess whether a nightly split is applicable; this UR
  does not prescribe one.

## 4. Non-Goals

- Implement a Nightly Build, change required branch checks or relocate existing CI jobs
  in this first slice.
- Delete test coverage, relax assertions or raise timeouts to shorten execution.
- Create a second quality policy, an additional approval gate or an automatic waiver
  of missing evidence.
- Claim measured speed improvements, native-host qualification or a successful CI run
  from policy text or repository tests alone.
- Rewrite historical approved Run artefacts.
- Delete existing evidence, change retention or alter automatic binding, approval,
  presentation or audit-record formats and persistence behavior in this first slice.
- Introduce a separate evidence registry, a fixed file-count budget, a blanket
  single-document requirement or a new mandatory report about documentation overhead.
- Create a second quality-contract owner in the Context Graph, registry or architecture,
  or perform unrelated documentation restructuring.
- Require blanket mutation testing, repeated execution of every historical defect,
  extra reviewers for every change or a new report for test effectiveness.

## 5. Acceptance Signals

- A maintainer can locate the test/evidence-selection rule in the existing central quality
  contract; SD, TP and QA apply it without maintaining competing complete policies.
- Starting from the Context Graph, SoT registry or architecture entry, a reader can
  identify `plugins/agdf/meta/contracts/quality.md` explicitly as the shared quality-rule
  owner and follow a direct reference to it. This must work without starting at a UX node.
- Those entry points explain consistently that SD and TP apply the policy, reviews
  supply assessments, `qa-gate` owns the technical quality decision and human gate
  approvals remain distinct. They do not imply a new gate or an independent rule authority.
- Graph, registry, architecture and runtime references agree on the canonical source;
  none maintains a competing full policy or presents planned test/evidence rules as
  already implemented or universally machine-enforced.
- Before designing new tests, the agent identifies existing relevant coverage and
  explains the additional tests or evidence needed for the approved Run.
- A defect-fix example shows the targeted check detecting the original defect for the
  expected reason and passing with the fix, or a concrete replay limitation and bounded
  alternative. A critical-rule example rejects the relevant invalid behavior. Expected
  outcomes trace to requirements rather than merely copying implementation calculations.
- A test strategy makes the targeted Run checks, required CI checks and any applicable
  full nightly checks distinguishable, with a reason for their placement and the
  decision point by which required evidence must exist.
- A reviewer can determine whether the actual declared CI/nightly paths cover the
  required regression inventory and which results are still missing. A CI label alone
  is not treated as proof of full coverage.
- Reduced local execution has a visible scope/risk justification. Uncertain impact,
  uncovered interfaces or insufficient existing evidence require a broader selection
  or an explicit evidence gap.
- A future nightly run or an older green build cannot be presented as a passing test
  of the current change. Required missing results remain visible to QA.
- The policy permits avoiding redundant full-suite repetitions while retaining the
  existing complete CI coverage unless a separately approved change alters it.
- A reviewer can identify the claim and decision served by each required evidence
  item or coherent evidence group through existing records, without a parallel inventory.
- When one current, retrievable and applicable result covers multiple obligations,
  those obligations reference it rather than producing duplicate proof. Its source,
  tested revision/environment and applicability limits remain traceable.
- When relevant changes or missing source access invalidate a proposed reuse, the
  need for fresh evidence or an explicit gap is visible before the decision.
- An additional file, source/log copy or repeated execution has a concrete purpose
  beyond having reached another gate. A required separate review may use shared proof
  while retaining its own assessment and accountable owner.
- A bounded change can use compact evidence references and a concise assessment;
  broader risks receive the necessary additional proof. Neither file count nor text
  volume is treated as evidence of quality or as a reason to suppress required proof.
- Technical receipts and protected history remain valid; evidence simplification
  creates no parallel registry or mandatory per-proof documentation ceremony.
- A finding cannot be marked technically resolved solely because files changed or a
  general build passed. Its existing resolution evidence includes the targeted outcome
  and applicable side-effect check, or the justified alternative and remaining limits.
- Once required claims and coverage are sufficiently verified and findings/conflicts
  resolved, the plan/review can identify that technical checking is complete. An unchanged
  situation or a later gate alone does not trigger another test run or evidence document;
  a relevant change or newly discovered gap does. Required decisions remain in force.
- The contract and affected consumer instructions agree on one behavior for presenting
  Quality Readiness at `pass`; they no longer both require and prohibit that projection.

## 6. Existing Source Of Truth

- `plugins/agdf/meta/contracts/quality.md`: central quality/evidence contract, normalized
  review gaps and QA decision boundaries.
- `plugins/agdf/meta/agdf-runtime-contract.md`: canonical runtime-module index, already
  identifying the Quality module; a reference surface, not a second policy owner.
- `.agdf/control/CONTEXT_GRAPH.md` and `.agdf/control/SOT_REGISTRY.md`: existing context
  and ownership navigation to reconcile, without changing historical approved sources.
- `docs/architecture/README.md` and `01-systemarchitektur.md`: architecture entry and
  existing-system explanation; `02-dispatcher.md` and `03-agentenkontrolle-zielbild.md`
  contain existing quality references to keep consistent. These documents explain
  the canonical contract and its limits rather than defining parallel rules.
- `plugins/agdf/meta/contracts/sd-definition.md` and
  `plugins/agdf/control/templates/artefacts/SD.md`: solution-design authoring and the
  existing Test And Evidence Strategy section.
- `plugins/agdf/meta/contracts/tp-definition.md` and
  `plugins/agdf/control/templates/artefacts/TP.md`: executable task/test mapping and
  scenario evidence obligations.
- Existing review and `qa-gate` guidance: consumers of evidence and outstanding gaps.
- `plugins/agdf/meta/contracts/modes.md`: existing effect/risk-based artefact depth.
- `plugins/agdf/meta/contracts/gate-artifact-preparation.md`, `control-scaffold.md`
  and `interaction.md`: existing recording, binding, presentation and history owners;
  their technical records are distinct from author-created substantive evidence.
- `scripts/ci-plan.mjs`, `scripts/ci-plan-test.mjs`, `scripts/verify-ci.mjs`, canonical
  package scripts and `.github/workflows/agdf-guardrails.yml` / `verify-agdf.yml`:
  current executable CI inventory, partitioning and coverage checks. Policy prose
  must not introduce a competing test inventory.
- Current repository inspection shows PR/main CI partitioning and no scheduled nightly
  trigger. This is a source-level observation, not an executed CI result.

## 7. Risks And Unknowns

- Test duration, redundant execution and evidence authoring/review effort have not been
  baselined; later work must not promise numerical savings without measurements.
- Brownfield Review and PRD must identify the existing authoring/review consumers that
  need a central-policy reference without broad unrelated cleanup.
- Existing graph references must be reconciled without inventing a second quality owner
  or rewriting approved Run history. Architecture must separate current contract
  ownership from the new policy behavior this Run still needs to deliver.
- SD must resolve how sufficient targeted coverage is justified and when uncertainty
  requires escalation to broader testing. File locality alone may miss dependencies.
- Nightly execution is a possible placement for expensive regression checks, not an
  existing guaranteed service. Introducing it requires a separate CI scope decision.
- Evidence may differ by revision, platform, runtime and execution path. Reuse must
  retain those limits, and repository tests cannot establish native-host behavior.
- External CI artifacts or logs can expire. A link is sufficient only while the needed
  result remains retrievable; preservation must follow actual review/retention needs.
- A generic justification requirement could itself create more paperwork. Design must
  use existing mappings and concise grouped explanations instead of per-file reports.
- Brownfield Review must distinguish avoidable authoring duplication from mandatory
  runtime history. Reducing technical history requires a separate scoped design.
- A documentation rule guides agent behavior; any claim of machine enforcement must
  be bounded to the validation actually implemented and tested.
- Replaying an original defect may be unsafe, expensive or impossible in a changed
  environment. The policy must permit a reasoned alternative without treating an
  infrastructure failure as successful defect detection or hiding missing proof.
- The verification stop condition must never skip a required independent assessment,
  waive open evidence gaps or transfer a technical result into a human approval.
- PRD/design must resolve the `pass` display contradiction with the existing interaction
  owner and reconcile consumers; this UR does not select a new presentation design.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

After deliberate UR approval, continue through existing Brownfield Review and
Mode/Slice routing, then derive the PRD. Later gate artefacts and implementation
require their existing prerequisites and approvals.

## AGDF Approval Summary (de; source=en)

- Problem: Lange Testläufe und viele Nachweisdateien erzeugen Aufwand. Testwirksamkeit, Befundnachprüfung und das Ende ausreichender Prüfungen sind nicht deutlich genug geregelt. quality.md ist teilweise schwer auffindbar und enthält widersprüchliche Darstellungsregeln bei pass.
- Ziel: Für jede Entscheidung die kleinste ausreichende Menge an Tests und Nachweisen verwenden. Maintainer, Agenten und freigebende Menschen sollen weniger suchen, zuordnen und vergleichen müssen; Abdeckung und offene Lücken bleiben sichtbar.
- Umfang: Den bestehenden Qualitätsvertrag quality.md um proportionale und wirksame Tests/Nachweise ergänzen, in Context Graph, SoT und Architektur verankern und den pass-Darstellungswiderspruch auflösen. Run-Tests, CI und optional Nightly unterscheiden. Aussage, Regel-/Risikobezug und Zeitpunkt klären; Wiederverwendung vor Neuerhebung.
- Zuständigkeit: Graph, Registry und Architektur verweisen direkt auf quality.md als gemeinsamen Regelgeber. SD und TP wenden ihn an, Reviews liefern Bewertungen, qa-gate entscheidet technisch; menschliche Freigaben bleiben gesondert. Bestehende Zuständigkeiten für Modus, Aufzeichnung und Freigabe bleiben erhalten. Keine vollständigen Regelkopien.
- Erfolg: Gültige Nachweise über nachvollziehbare Referenzen mehrfach nutzen; Revision, Umgebung und Grenzen erhalten. Zusätzliche Dateien und Wiederholungen brauchen Mehrwert. Änderungen, unzugängliche Quellen oder Widersprüche erfordern Nachprüfung oder eine sichtbare Lücke.
- Wirksamkeit: Erwartungen aus Anforderungen ableiten. Fehlerkorrekturen möglichst am ursprünglichen Fehler scheitern und mit Korrektur bestehen lassen; kritische neue Regeln durch Negativfälle prüfen. Unmögliche oder unsichere Wiederholung braucht begründete Alternativen mit Grenzen. Befunde erst nach gezielter Nachprüfung des Fehlers und relevanter Nebenwirkungen schließen.
- Prüfabschluss: Sind Pflichtaussagen und Abdeckung belegt und Befunde/Widersprüche geklärt, endet zusätzliche Beweiserhebung. Weitere Prüfungen brauchen einen konkreten Anlass. Ein weiteres Gate allein genügt nicht; verpflichtende Reviews und menschliche Entscheidungen bleiben erforderlich.
- Grenzen: Keine CI-Umstellung, kein Nightly-Aufbau, keine Abdeckungsreduktion, keine Löschung alter Nachweise und keine Änderung technischer Freigabe-/Integritätsbelege. Kein paralleles Register, kein neuer Bericht je Nachweis, keine pauschale Mutationstestpflicht und kein breiter Doku-Umbau. Bestehende Owner gelten; Dokumentation allein beweist keine Durchsetzung.
- Risiken: Einsparungen sind ungemessen. Indirekte Auswirkungen, veraltete oder ablaufende Quellen und Grenzen der Wiederverwendung sind im Design zu klären. Begründungspflichten dürfen keine zusätzliche Dokumentationsbürokratie erzeugen; vorhandene Zuordnungen genügen.
- Nächster Schritt: UR prüfen und mit Approval: UR freigeben; danach Brownfield Review, Mode/Slice und PRD nach bestehendem Verfahren.
