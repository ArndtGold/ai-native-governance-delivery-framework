# Summary validation and recovery fix

- assessed_at: 2026-10-08T19:15:56.940769+00:00
- run: gate-internal-continuation-recovery-20261008-01
- candidate: 0.14.5+codex.local-8f578728e735
- runtime_digest: 668cf476a06c93027cead7615eed2c47ef5414500eb93d002cb6aaba41bfa8c9
- mcp_dispatcher_digest: 31cdf187b33826ea9bb70cfb12f477c522c836a598a0acc8b1fdb8d350c66002
- reviewer: Codex; same-agent review, no independent reviewer claimed
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- memory_target: scope_artifact
- memory_reason: bounded run evidence; no source-of-truth ownership change

## Cause and approved scope

EVIDENCE_NATIVE-03.md records the prior actual extra user turn. The own unapproved summary existed, but combined `Ziel und Umfang:` and `Entscheidungskontext:` labels did not meet the canonical parser. PRD product readiness omitted summary validation; presentation therefore failed late and generic recovery incorrectly implied an absent summary. This corrects approved AC-002/AC-004 and TP T-002/T-004/T-005/T-006, with no approved source edit or new requirement.

## Primary solution

PRD readiness invokes the existing presentation summary validator with resolved languages before taking the registered-ready route. Its diagnosis uses the existing renderer/locale owner, exact source path, canonical reason and required field. A malformed own unapproved summary remains in existing prd_definition continuation. Existing typed canonical replacement and fresh reevaluation remain mandatory. Existing instructions require validation before recording, one condition-specific correction and stopping unchanged failure. This instruction-level attempt boundary is not a new persistent retry counter. Ready drafts retain explicit human editing intent; approved/foreign/unsafe sources and status retain their restrictions. Public schema, phase and approval transport are unchanged.

## Final checks and applicability

SUMMARY_CHECKS-01.json contains twelve passing affected checks; summary-check-prd.log records the additional final packaged PRD suite pass and SUMMARY_PRD_CHAIN-01.json its canonical chain. These cover early diagnosis, localized invalid/missing/duplicate/incomplete/overlong summaries, typed replacement, protected sources, explicit status and full control path/byte inventories. Eight new actual locale renders in SUMMARY_LOCALE_RENDERS-01.json were inspected across all registered packs en/de for goal/scope/decisions/missing block. They are source render evidence, not native displayed screenshots. sync-package-assets completed on the final source and exact payload inventory was reviewed (208 files, 1,758,095 bytes, no threshold headroom). Previous growth-guard failures during incomplete sync are preserved; no waiver was introduced.

Prior CHECKS-01.json evidence remains applicable only to unchanged named mechanisms. Source binding, contract, locale, control, instruction, runtime and package checks affected by this correction were rerun. No unrelated cockpit/UI deltas were changed. The complete previous run baseline remains historical; no earlier model timing is reconstructed.

## Installed and actual desktop chain

QUALIFICATION_PLAN-02.md and SUMMARY_NATIVE_FIXTURE-01.json were prepared before the switch. SUMMARY_INSTALLATION-01.json records the canonical installer healthy result and unchanged separate cockpit config. SUMMARY_FRESH_CONNECTION-01.json proves fresh actual stdio provenance. SUMMARY_DESKTOP_IDENTITY-01.json and SUMMARY_NATIVE_BEFORE-01.json prove that the real desktop MCP loaded dispatcher 31cdf187b33826ea9bb70cfb12f477c522c836a598a0acc8b1fdb8d350c66002 before behavior was attributed to it.

The new disposable saved-filter fixture has complete resolved synthetic scope, a no-UX test route and synthetic setup receipts only. They never authorize this production run. Actual desktop before: registered malformed PRD at ee2f7b84-a089-4e99-8f8a-d30aacb40d18 returns nonterminal prd_definition with exact approval_summary_user_goal_missing and `- Ziel:` diagnosis. One editorial correction preserves the full substantive body and approved UR. Installed canonical validation observes goal then decisions failure, then ready=true before writing. SUMMARY_NATIVE_RECORDING-01.json records typed replacement to 6392b041-1dc0-431f-8c15-6785d616cfca. Actual fresh desktop after: SUMMARY_NATIVE_AFTER-01.json returns nonterminal presentation_required. The test stops at that pending boundary; no test-product approval is requested or fabricated.

| Observation | Prior actual failure | Corrected actual case |
|---|---|---|
| Bound malformed own summary | terminal presentation failure | nonterminal existing authoring continuation |
| Diagnosis | generic missing summary | exact canonical reason, source and required label |
| Correction and recording | required additional explicit revise steering | one validated typed replacement within the same authorized turn |
| Avoidable additional user restart prompts for this case | one observed extra user turn | zero |
| Real pending decision | preserved | preserved, no approval given |

These are actual desktop model/tool actions in this existing session, not an independent fresh model session or visual proof. The fresh stdio connection is separately identified. This one corrected positive case does not satisfy every native case of the complete approved plan. No claim is made that all gates or all runs now need zero extra prompts.

## Remaining obligations

QF-002 is resolved by early validation, exact diagnosis, source/package checks and the installed actual positive chain. QF-001 remains open: current-candidate actual unchanged-failure stop, post-terminal no-tool sequence, interruption/changed-revision behavior, representative displayed readability, full QA implementation/evidence fixture and consolidated complete native ledger remain missing. Old native partial observations are historical or narrowly applicable; they are not automatically upgraded to this changed candidate. Baseline timing and same-agent limits remain explicit. QA remains revise, no Approval: QA/UAT/release.
