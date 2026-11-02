# CD+Tests: Central quality policy and focused verification

Decision: pass
Owner: Codex (cooperative implementation and semantic self-review)
Date: 2026-10-27
Run: risk-based-test-strategy-20261027-01

## Scope and source identity

Implemented approved TP T-001 through T-008 on branch agdf/run-test-selection-policy, against baseline e50f6b02afaef3f2dbd778eb6a15718e8c0b0f5c. All ten protected source identities in BROWNFIELD_ANALYSIS.md remain exact. No commit/push or installed-host mutation is claimed. Environment: macOS, Node 22.22.3, repository locked dependencies. Installed governance remains 0.20.1; candidate build is 0.20.2. The table below identifies tested source bytes independently of an uncommitted branch name.

| Final affected source | Raw SHA-256 |
|---|---|
| docs/architecture/01-systemarchitektur.md | sha256:ee0a284a38f47d397e40813be1c9e4b8ccee06f6f4f749df493db3176b61cc0b |
| docs/architecture/02-dispatcher.md | sha256:65008e5f0e5dae6a86161665ba5a813b3671464ceced6531f2e79a4ce0faddcc |
| docs/architecture/03-agentenkontrolle-zielbild.md | sha256:e448b5aeb4008c04e1caa893a0ad22968365bcbd9890fc5729ede3fe81bcc1c7 |
| docs/architecture/README.md | sha256:cd117a15ed8ef33233cc8f1546a2923ce1d2485fa81bd5276a9fe4c5fa18eeef |
| evals/manifest.json | sha256:c07e743db74ce0fb17c7b96487cd9e185c3aef02fb6f813d5593a97d506aa933 |
| evals/observations/deterministic-replay.json | sha256:10a15f92233c681d9ce2e100f7d792b756fe3894c5f035e3a60a1a27f9a5d61c |
| packages/cli/scripts/build-contract-test.js | sha256:eb0635dfeb8d36f201664f4b68be8ac8cc9ed8c52db861579011dc795bcfc25c |
| packages/cli/scripts/sd-definition-test.js | sha256:4dc1c41a463046e79936cae4891d8e72adaf27cef4ac2fffe876129a7b005cef |
| packages/cli/scripts/tp-definition-test.js | sha256:9fd89722929b815cee3b8370afc8e55bf88504d3d11984f072e1df19dfb06dca |
| plugins/agdf/control/templates/artefacts/SD.md | sha256:1bb2f883bd5bc6a548db79dbdc91296718e438f459a0bfcf50e44bdad6b08ff2 |
| plugins/agdf/control/templates/artefacts/TP.md | sha256:cc35f454045dd4a625ec48aa85b3054668d2f4cf54eeaa9d78cff9e41c9b5839 |
| plugins/agdf/meta/agdf-plugin.definition.json | sha256:c0d263e644b1a55658954b2eb5bbd260db2436cd5330bb83034c5a831d7b9a3e |
| plugins/agdf/meta/contracts/quality.md | sha256:75be32ae784d0a8483e9427b701c30302377ee18faa860a005b4ae4d14907197 |
| plugins/agdf/meta/contracts/sd-definition.md | sha256:9ec104f39f1e080a78b41c735791dd1520267aa608c64e6a40344885176d15ba |
| plugins/agdf/meta/contracts/tp-definition.md | sha256:72232f6fc3411e97e752f8aa7d0d993a5c5b3587595e82ef28a5e176208fefb7 |
| plugins/agdf/meta/copilot-payload-baseline.json | sha256:9c122518c787468112aed3c8a6f25be491a6de13d253b21e9b9a2e66e98de414 |
| plugins/agdf/skills/clean-implementation-review/SKILL.md | sha256:ad59db78f10035d6439d4ce58743934e68e3a6e94b3384376b5c7346e4d54c78 |
| plugins/agdf/skills/code-review/SKILL.md | sha256:5e31849f6e20b3bae599702c91a8b1159991c6cdef3a8721821e002994d0e574 |
| plugins/agdf/skills/qa-gate/SKILL.md | sha256:ad0ebdbc69a1f36e9ccb86991b053baee4063a9fcf9428ae5ea735e5ada229c5 |
| plugins/agdf/skills/sd-definition/SKILL.md | sha256:b38cc4320f12aa11a21c14fc9b8bf4f3aa7a45f22bf5262506811106bf2f581f |
| plugins/agdf/skills/task-plan-review/SKILL.md | sha256:8ae9cc237863484a19bdc94c8fc7f3c10b7a13386888bbfb2fc8cdde372aaf01 |
| plugins/agdf/skills/tp-definition/SKILL.md | sha256:825f5ba1856f665f0fa89c6fbb2c2cde293bf1f16949ba35a29974cf01896da1 |

## Structural delivery

- T-001: post-TP analysis and protected baseline captured in BROWNFIELD_ANALYSIS.md.
- T-002: one central quality owner now covers selection, placement/timing, valid evidence reuse, effective checks, re-verification and completion.
- T-003: existing module metadata delivers quality to actual SD/TP continuations; fallback refs, phase guidance and existing templates apply it.
- T-004: existing reviews/QA retain roles and apply shared rules; contradictory automatic pass guidance is reconciled, with explicit detail and human gate material retained.
- T-005: CG-QUALITY-CONTRACT, UX link, SoT row and architecture entry/01/02/03 references resolve to the same owner. Six actual Markdown target paths verified.
- T-006: existing tests extended; missing resource and mapping refusal plus restoration checked in disposable fixtures. No new test inventory or semantic engine.
- T-007: normal generation/assembly/release preparation completed after exact supported payload review; generated files were not hand-edited.
- T-008: focused commands and all nineteen mapped scenarios below completed. Required later reviews/QA reference this report rather than recollecting stable evidence.

## Semantic scenarios

These rows record concrete cooperative semantic self-review, with actual execution identified only where C-01/C-04 etc is named. They are not model/host observations or an independent review service. Expected outcomes derive from approved TP/PRD, not implementation assertions alone.

| Scenario / criterion | Concrete input facts | Expected outcome | Assessed result | Source / evidence class |
|---|---|---|---|---|
| SCN-001 / AC-001 | Graph, SoT registry, architecture README/01/02/03 each point to the same actual quality.md. | One discoverable normative owner. | Pass: all six direct references resolve; role/authority review agrees. | R-01 actual source/link review; CG-QUALITY-CONTRACT; quality introduction. |
| SCN-002 / AC-002 | A local template wording change already has definition coverage; alternatively the same change affects an unknown shared dependency. | First selects relevant existing definition/propagation checks; second broadens or keeps an explicit impact/evidence gap. | Pass: the policy requires criterion/risk/interface assessment and forbids locality as sufficient impact proof. | R-02 semantic self-review; Proportionate Tests And Evidence, paragraphs 1-2. |
| SCN-003 / AC-003 | CI executes only half the authoritative inventory; a proposed nightly has no declared workflow/result. Essential change-specific proof is needed for QA now. | Neither counts as complete regression/current QA proof; obtain required proof before QA or retain gap. | Pass: actual inventory, available-nightly and decision timing are explicit; no workflow/inventory change. | R-02; Proportionate Tests And Evidence paragraph 2; C-04. |
| SCN-004 / AC-004 | One accessible result identifies tested revision/environment and has justified applicability to two ACs. | Both obligations may reference that result without a new run or copy. | Pass: multiple mappings and existing grouped records are expressly supported. | R-02; Proportionate Tests And Evidence paragraph 3. |
| SCN-005 / AC-004 | Reuse candidate has an expired link, changed relevant dependency, incompatible environment or contrary result. | Limit/reject reuse and obtain affected proof or retain visible gap; never relabel old execution. | Pass: all four counterexamples invalidate unsupported applicability. | R-02; same paragraph as SCN-004. |
| SCN-006 / AC-005 | The next review asks for identical recollection solely because its gate changed; alternatively an expiring result must be preserved for reproducibility. | Gate change alone is insufficient; concrete reproducibility can justify a copy with provenance. | Pass: added value, retrievability and protected writer/history boundaries are distinct. | R-02; Proportionate Tests And Evidence paragraph 4. |
| SCN-007 / AC-006 | Requirement says missing quality must refuse authoring. Compare intended refusal/restoration with a mirrored always-true assertion or a parser crash in the test harness. | Real refusal plus restored valid continuation supports the rule; empty/mirrored checks and harness faults do not establish defect detection. | Pass: C-01 observes actual resource refusal, unchanged fixture runs and restoration. Initial JSON-parser harness errors were corrected, not counted as detection. | R-02 plus C-01 executed negative fixtures; Verification Effectiveness And Completion paragraph 1. |
| SCN-008 / AC-007 | An original finding is marked closed after only a code edit or green aggregate. Alternative evidence replays the failure condition and relevant side effects. A separate owner accepts a deviation. | First remains unsupported; adequate targeted evidence may resolve; accepted deviation is not technical resolution. | Pass: all branches agree with central re-verification and existing normalized gap rules. | R-02; Verification Effectiveness And Completion paragraph 2; Normalized Review Gaps. |
| SCN-009 / AC-008 | All required claims have current valid proof, no findings/contradictions; later a relevant dependency changes. | Stop duplicate collection first; reopen affected proof second, broaden if uncertain; mandatory reviews/approvals remain. | Pass: the completion condition and concrete restart triggers preserve existing gates. | R-02; Verification Effectiveness And Completion paragraph 3. |
| SCN-010 / AC-002/009 | Actual bound SD/TP continuations; remove required quality resource, then restore; remove metadata mapping in isolated reader fixture. | Canonical module/content/SHA delivered; missing resource refuses; missing mapping is caught by dependency assertion; restoration restores valid delivery. | Pass: build-contract and both definition tests executed all relevant paths; disposable fixtures only. | C-01 structural observations; role-specific consumer source review. |
| SCN-011 / AC-010 | Compare routine pass, revise/block with evidence gap, explicit detail request at pass and a pending human approval. | Pass: concise line/report. Revise/block: four canonical dimensions plus decisive source/reason/action. Detail: full overview permitted. None grants approval. | Pass: both formerly conflicting QA instructions and central output sections agree; existing interaction regressions pass. These are source/scenario outcomes, not live rendering. | R-02; Quality Readiness Projection and Chat Output Discipline; C-03 interaction tests. |
| SCN-012 / AC-011 | Compare ten protected source/workflow/owner digests and authoritative inventory planning with captured baseline. | No approved source, receipt/gate owner, required inventory or workflow alteration. | Pass: all digests match; unchanged planner passes 9 inventory tests; changed paths reviewed. | R-03 actual digest/diff audit; C-04. |
| SCN-013 / AC-012 | Canonical generation adds attributable policy/consumer bytes to 397-file Copilot profile. | Exact justified baseline update only; generated layout/source maps and hard instruction/profile limits pass. | Pass: final 397 files / 3,522,791 bytes, +13,330 bytes from 3,509,461; zero headroom and same max_files. All C-02 checks pass. | C-00/C-02 actual propagation and distribution checks. |
| SCN-014 / AC-012 | A semantic self-review and deterministic package replay succeed; no native session or elapsed-time comparison was run. | Report source/scenario/distribution proof only; no native obedience, universal enforcement or measured savings claim. | Pass: this report and downstream reviews preserve those qualification limits. | R-03 evidence-class review; Verification Effectiveness And Completion paragraph 3. |
| SCN-015 / AC-001 | General quality graph node plus UX-specific node and central contract. | Graph navigates/records context; only quality.md owns full shared rules; UX reaches general node. | Pass: node refs, invariants and explicit link agree; no second policy register. | R-01 shared with SCN-001. |
| SCN-016 / AC-003 | SD strategy and TP executable test plan must express Run/CI/available-nightly placement and deadline. | Existing sections/grouped evidence suffice; no mandatory new table columns/schema. | Pass: phase contracts/current templates add application prompts only; existing table shapes unchanged. | R-01/R-02 shared with SCN-003; SD/TP template diff. |
| SCN-017 / AC-006 | Original defect replay would mutate unsafe external state. Isolated adequate check demonstrates the same rule with explicit limits; alternatively only a waiver is offered. | Concrete safety reason plus adequate bounded alternative may support claim; waiver alone leaves evidence gap. | Pass: no blanket replay/mutation-testing obligation; adequacy and limits remain reviewable. | R-02 shared with SCN-007; Verification Effectiveness And Completion paragraph 1. |
| SCN-018 / AC-009 | TP, Clean and Code reviews use the same C-01 result. | Each retains own assessment/accountable role; qa-gate remains sole technical QA owner; no repeated collection solely for review. | Pass: consumer references retain role-specific purpose; separate review reports reference shared proof. | R-01 shared with SCN-010; quality introduction and review skills. |
| SCN-019 / AC-011 | Audit all final source and propagation changes against approved exclusions. | No installed-host change, history migration, universal evaluator, new register, CI deletion or altered human authority. | Pass: scoped diff contains policy, consumers, tests, navigation, exact budget and applicable deterministic fixture fingerprints only. | R-03 shared with SCN-012; final changed paths and source identities below. |

## Propagation and regression

| Group | Executed commands and final result | Durable output / applicability |
|---|---|---|
| C-00 | build:prepare initially stopped at expected Copilot growth; supported payload report/accept after source attribution; final sync-package-assets, assemble-npm and release:prepare each exit 0. Release history 11, transactional release-bump 20, 49 version surfaces, 63 public-plugin candidates and portable schema tests pass. | [prepare](evidence/C00-prepare.log). Original build:prepare attempts did not pass end-to-end: final remaining normal stages were resumed after fixing known prerequisites. |
| C-01 | build-contract-test; test:sd-definition; test:tp-definition all exit 0. Real quality content/SHA and missing-resource refusal/restoration verified. | [contracts](evidence/C01-contracts.log). Build check predates only the final QA wording correction and fixture rebindings, outside its tested dependency behavior; its result remains applicable. SD/TP final runs use final generation. |
| C-02 | test:instruction-footprint; check-runtime-integrity; test:runtime-integrity-layout; test:copilot-profile; payload-budget all exit 0. | [integrity](evidence/C02-integrity.log). Final 397 files / 3,522,791 bytes; unchanged hard instruction limits, exclusions and permissions. |
| C-03 | test:interaction-presentation pass; test:skill-evals pass; eval:skills 113/113 pass across 14 skills; test:package-contents pass with 1,355 files. | [consumers](evidence/C03-consumers.log). Existing deterministic evidence only; no native model/host run. Interaction result remains applicable after unrelated fingerprint-only fixture maintenance. |
| C-04 | ci-plan-test 9/9 pass; final diff --check pass; six links and all ten protected hashes pass. | [inventory](evidence/C04-inventory.log). Authoritative CI/workflows remain unchanged; no remote CI execution claimed. |

### Resolved execution diagnostics and bounded maintenance

1. Expected Copilot growth stopped generation. Supported inventory review attributed all added bytes to policy/module/templates/review guidance. The final exact ceiling is 3,522,791 bytes (+13,330); max_files remains 397 with zero headroom. No instruction-budget or exclusion relaxation.
2. Assembly found an incomplete dist/npm with six empty directories, zero files and no assembly marker. After read-only inspection, only those empty directories were removed with rmdir; normal assembly succeeded. No foreign bytes or installed runtime were removed.
3. Initial new negative fixtures attempted to parse a JSON result, but missing packaged resource correctly refuses launcher startup before JSON. The test harness was corrected to assert actual nonzero startup and diagnostic, unchanged fixture Run bytes, restoration and valid continuation. Initial SyntaxError is a harness failure, not red-before evidence of a product defect.
4. Existing skill-evals detected stale source fingerprints after changed contracts/skills. Reviewed all 56 affected deterministic observations for 8 skills; rebound only source_fingerprints in manifest and source_fingerprint on those existing observations using the existing fingerprint owner. Compared all other case/observation fields unchanged, corpus version unchanged. Cases, routes, expected actions, thresholds, native observations and model results were not altered. Fresh deterministic replay passes 113/113; it is not newly collected model evidence.

## Context Graph and knowledge

- context_graph_impact: new_node_required
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-quality-contract; .agdf/control/CONTEXT_GRAPH.md#cg-ux-intent-before-prd; .agdf/control/SOT_REGISTRY.md; docs/architecture/README.md
- context_graph_reconciliation: reconciled
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Canonical quality node created, UX navigation linked, SoT ownership and six architecture/context references verified against quality.md.
- memory_target: context_graph
- memory_reason: Shared ownership persists in curated project context; execution diagnostics stay in this Run.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md; .agdf/control/SOT_REGISTRY.md

## Limits and remaining gaps

No applicable unresolved implementation or required scoped evidence finding remains. Remote PR/merge CI was not started (no push/PR authorization); no full smoke suite was recollected locally. No native installed-agent behavior, live rendering, independent reviewer, universal enforcement or quantified time/file savings was measured. Those claims are outside approved acceptance and must not follow from source/scenario/distribution checks. Required technical reviews and deliberate QA/UAT approvals remain separate steps. This pass records CD+Tests only and grants no delivery/release authority.
