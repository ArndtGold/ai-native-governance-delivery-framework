# QA Report: Run-based Cockpit and worktree convention

Status: draft
Gate: QA
Gate approval: open
Based on: approved TP, CD+Tests, registered review-time evidence, Task Plan Review, Clean Implementation Review and Code Review
Date: 2026-10-31
Owner: Codex, qa-gate decision owner; cooperative self-review, no independent review claim
Run: run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5

## 1. QA Decision

Decision: pass

Technical QA passes for the approved isolated implementation and its required local/protocol/rendered evidence. This is the sole technical QA judgement. It is not integration/merge readiness, full-suite success, installed-host qualification, a release decision or human gate approval.

The judgement follows the approved SD/TP decision timing: targeted changed-behavior/package/browser proof precedes technical QA; the full exact-feature platform CI, including the unchanged isolated performance check, must pass before integration/merge. No currently applicable pre-QA normalized finding remains open or invalid. RUNOV-PERF-001 remains technically open in CD at its explicit future integration/merge decision point; this report does not reclassify or resolve it and proposes no deviation acceptance.

## 2. TP Coverage

- delivered_result: The existing desktop and compact Cockpit now show canonical Run inventory with Active/History, shared ordering/search/counts and deliberate current Run evaluation. Optional original backlog information is separately readable. Ordinary Run operations use existing per-Run transactions without new shared backlog writes/locks, while explicitly requested old captured recovery remains supported. New worktree placement/reuse/ignore guidance is normative under the owning primary checkout's .agdf/worktrees/ container.

TP_REVIEW.md assesses all twelve approved task IDs and all nine criteria: T-001 through T-010 are fully_done for the required implementation proof. T-011 is partially_done because exact-feature mandatory integration CI remains future; independent CI baseline completion, isolated reconciliation and inventory are verified. T-012's required review set is complete and this QA assessment is now prepared; deliberate human decisions and OR remain downstream. They are not falsely marked completed.

All current pre-QA implementation obligations have applicable proof. The six applicable UX Intent Fidelity rows are fulfilled, with visible evidence for visible behavior and actual Git/documentation evidence for the worktree convention. The TP has no individual P0/P1 priority labels; all its mandatory current criteria were assessed conservatively. No current critical implementation, Brownfield, solution-integrity or source-of-truth gap was identified.

## 3. Evidence

- Approved TP sha256:c459a2c031a7b536655f10d86d8940565f103ac06fc4d7ba41e68d92907f211e; approved PRD sha256:f07e94c8b4f1580749794e3e3ef129aef42d387c14465aefb01f88ac24a0d057 and SD sha256:47420849b40b40d8601c57bb77e9030d1fd922b5729c4148db5346ef583f0a96. All eighteen current bound authoring-input pages were consumed; their version-matched QA_REPORT template is sha256:606c4213b8f00e409b9dcba2b45be9131d7b90705c0911d6a38c5fbbe256bd68, manifest sha256:6956f8acd3125f72f1c39f3d338b65ac183faa7be29e3c8b73e67655f29f2f52.
- Brownfield Analysis sha256:0640a54c21d02d99e98cab606be090282edeb553a65225977cb68b4f97892f99 and approved ready UX input retain their actual scope and implementation-preparation roles.
- CD_TESTS.md sha256:53be087514e1b23d960b4a8bbd829af5dd61a0afc4a04f051e92b3542e431d53 and registered review-time EVIDENCE-a6eb75566fb3397f92065fb0b40fa2016e13b219d114768e1ba12c713e439f03.md sha256:a6eb75566fb3397f92065fb0b40fa2016e13b219d114768e1ba12c713e439f03. The additive evidence explicitly accounts for the later identity-boundary production changes, so the older unchanged-production applicability statement is not applied to them.
- TP_REVIEW.md sha256:15e280833e4ad0aef25939fa41135d06eef76a1a37ac64799274b078455722c3: complete individual task/criterion/UX assessment and later obligations, no current pre-QA task gap.
- CLEAN_IMPLEMENTATION_REVIEW.md sha256:2d40a26e4c3f3472fcacbf2b4aa2b8aa7a7dde61afa224d681de77e48f69811c: clean primary solution at existing owners, explicit bounded legacy recovery/reading, no parallel index/control store or workaround.
- CODE_REVIEW.md sha256:6313ea0bf3213107d5bbe7e7268f986285cc4fa91022cfc6642a145348390758: actual changed production/test scope assessed; RUNOV-CR-001 is resolved by a genuine original-guard regression replay and its targeted current correction/side-effect proof.
- Original and reconciliation manifests retain 127 files; every hash was verified. Original writer/independent-Run/revision/material/legacy-journal v1-v5, required-source, HTTP/STDIO, worktree and historical-proof observations remain retrievable. Actual failing conditions and identified rechecks remain visible, not relabeled clean aggregates.
- Review manifest evidence/review/manifest.json sha256:a18ee1fddfcd605ef6f7f0637a2a9e99a59664a2b2eabac7061ea97be891379c pins 33 actual files. All thirty-three hashes and current source hashes were checked: corrected old-guard replay, UI 7/7, Core/scoped 22/22, typecheck, current builds, six rendered overview/version cases, current built-resource SDK case, exact current STDIO in both protocol eras and compatibility record/check 56/56.
- Current paired resource ui://agdf/cockpit/v2.html has digest sha256:9ec5ac5c9b1f871e253b37ab0805eea02048bb5a2c07da7eb024a16d19cb323f, source sha256:d0acdc9c76e627f9c8a2f74c456f1aaeb02c9dc7aaec6595c2dd558750bbe166. The non-activated owned preparation and actual STDIO result match that digest exactly; old 1ff747df payload proof remains explicitly historical.
- RUNOV-DOCS-001 is resolved by Arndt Gold's deliberate Doku ok, reviewed metadata with unchanged approved translation text/source binding and the actual passing community checker (32 required files, four forms). This is documentation confirmation, not Approval: QA.
- RUNOV-INTEGRATION-001's former unfinished-independent-CI premise is resolved by the exact PR47/head/check receipts and conflict-free c79972c2 baseline adoption. Those baseline results do not qualify this feature's unpublished changes.

## 4. Missing Evidence

- qualification_limits: Mandatory exact-feature Ubuntu/Windows CI, including the unchanged isolated cold tools/list budget, remains unqualified before integration/merge. The broad local verification chain is incomplete, and the extra review-time prepare continuation was interrupted after its build/generation/assembly stages; neither is an aggregate pass. Native installed-host rendering/operation and coordinated runtime cutover are unobserved. Current claims are limited to the isolated source, package, protocol and rendered synthetic/browser environments with their actual tested bindings.

RUNOV-PERF-001 remains open in its CD source row with evidence_gap and evidence_obligation unchanged. Candidate cold p95 2379.791/1522.431 ms and unchanged-main p95 1912.955 ms exceed 1500 ms on this host; warm budgets pass. A new regression is not established, and a passing timing qualification is not supplied. The approved timing makes the exact-candidate dedicated CI result mandatory before integration/merge; it is not a missing additional local pre-QA test. No further local cold sample is required by this gate, and no threshold or failed output is changed.

Historical full UI/browser/package observations retain original bindings. Current targeted rechecks qualify the changed boundary and current resource; older aggregates are not renamed as current executions. The first sandbox browser launch and initially incomplete test fixture are not counted as intended product regression failures.

## 5. Risks

- delivery_risks: Integration remains prohibited until the exact feature candidate's required matrix and isolated performance lane pass. The existing cold timing uncertainty remains visible. Future operational adoption requires coordinated writers and a matching v2 runtime/UI pair; arbitrary old writers are not made safe by a configuration flag. After new mutations, downgrade compatibility must be demonstrated through the approved recovery path or a forward fix. No live host, foreign checkout, workflow, timing/native baseline or credential was changed by this delivery.

The resolved invalid-directory defect no longer hides the valid inventory or permits an unsafe selector; current tests reject forged valid/selectable claims and assert source immutability. Existing per-Run revision/source/material/seal/replay checks remain at the same owners. No retained-debt waiver, product-semantic change or hidden fallback was accepted.

## 6. Required Next Step

Present this exact QA report through the existing gate-check/presentation owner for a new deliberate human Approval: QA. It permits only the normal next human/lifecycle stages under their own rules; it does not authorize publication, integration, merge or host cutover.

## 7. Gate Approval

Approve this QA decision only with:

Approval: QA

No Approval: QA is recorded by this report. The earlier Doku ok confirms only the human documentation review. This report does not replace UAT or OR.

## Context Graph Impact

- Situation: Canonical Run inventory and Run-only transactions replace normal shared-backlog coordination; the worktree convention remains with its existing normative owner.
- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: warning
- context_graph_evidence: Existing graph/SoT entries reflect Run-only writing, optional old captured recovery, shared inventory, paired reader v2/context v1 and the current compatibility fingerprint 0103db4de2473a79bc9eebb989a28eb26c02960a4ab54c6a0f080bdbf9a9e618. Historical evidence remains historical; future feature integration and native limits are explicit.
- memory_target: scope_artifact
- memory_reason: The QA judgement and candidate/environment-qualified evidence are specific to this Run.
- memory_refs: this report; TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; CD_TESTS.md

## AGDF Approval Summary (de; source=en)

- Ziel: Unabhängige Runs ohne verpflichtende gemeinsame Backlog-Pflege im Cockpit auffindbar machen und eine einheitliche Worktree-Regel unter dem zuständigen Haupt-Checkout festlegen.
- Ergebnis: Die technische QA besteht für die isolierte Umsetzung mit ihren gezielten lokalen, Protokoll-, Paket- und sichtbaren Browsernachweisen. Beide Cockpit-Ansichten verwenden Runs mit Aktiv/Historie, Suche und sicherer Auswahl; alte Backlog-Daten bleiben getrennt lesbar. Normale Run-Operationen pflegen und sperren das gemeinsame Backlog nicht mehr. Historische Recovery bleibt erhalten. Die Worktree-Regel einschließlich Ignore-Prüfung, Wiederverwendung und ausdrücklich gewählten Ausnahmen ist dokumentiert. TP-, Clean- und Code-Review sind erfasst; der dabei gefundene Fehler bei ungültigen Verzeichnisnamen ist behoben und gezielt geprüft. Deine Doku-Bestätigung und der bestandene Doku-Check sind berücksichtigt.
- Grenzen: Die Pflicht-CI des exakten Feature-Stands einschließlich des unveränderten isolierten Performancechecks muss vor Integration/Merge noch bestehen. Der lokale Timing-Fehlschlag bleibt offen dokumentiert; auch unverändertes main überschritt das Budget, eine neue Regression ist nicht belegt. Es gab keinen weiteren lokalen Performance-Test. Die breite lokale Prüfung und der zusätzliche Vorbereitungslauf werden nicht als vollständig bestanden ausgegeben. Native Host-Installation, produktive Umstellung und Plattformqualifikation sind nicht belegt; die lokale Paketvorbereitung ist nicht aktiviert.
- Risiken: Vor Integration sind die noch fehlenden Pflichtnachweise erforderlich. Schreibende Laufzeiten müssen später koordiniert mit der passenden Oberfläche umgestellt werden; ein Rückwechsel nach neuen Schreibvorgängen braucht den genehmigten Kompatibilitäts-/Recovery-Nachweis. Deine QA-Freigabe ersetzt diese Pflichten nicht und erteilt keinen Commit-, Push-, Merge-, Release- oder Installationsauftrag. Als nächster Schritt wird deine bewusste Entscheidung zu genau diesem QA-Bericht erbeten; UAT und OR folgen danach nach ihren bestehenden Regeln.
