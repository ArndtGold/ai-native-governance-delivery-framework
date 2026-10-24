# AGDF 0.20.0 release readiness: candidate 8e2b8699 and local import correction

Date: 2026-10-24
Run: release-0200-codex-claude-20261020-01
Status: native execution complete for the original candidate; Windows import and final release evidence outstanding.
Authority: this report grants no QA/UAT approval, commit, push, tag, merge or publication.

## Candidate and correction

Original candidate: 8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692,
clean commit 460027fabc58fe0da041bbabe117519dd1f696b7. The source/payload identity revalidates in
/Users/arndtgold/agdf-rc-460027fa. PR head 94ef61c9 contains evidence-only subsequent commits.

The current local diff changes three candidate source/test files: codex-host-e2e.mjs,
lib/release-observation.mjs and release-handoff-test.mjs. It fixes future producer output and
reads old immutable failure-case records through mandatory primary proof. It is reviewed locally;
it is not silently assigned the original candidate identity. A separate patched tool can evaluate
the clean original source. Releasing the changed source requires its own applicable final evidence.

## Current native evidence

| Host/surface | Observed cases | Review/import | Qualification boundary |
|---|---|---|---|
| Claude Code CLI, Windows | 5/5 PASS for 8e2b8699 | Existing exact review and import under claude/cli | Original candidate and frozen Windows tuple only |
| Codex CLI, macOS | 5/5 PASS for 8e2b8699 | Agent primary review complete; Windows import outstanding | CLI 0.163.0, gpt-6-luna, macOS 15.7.7/x64, Node v22.22.3; not yet a completed publication scope |
| Codex Desktop | Original maintainer handcheck retained | Human-reported only | Manually checked, not qualified, non-gating |
| Claude Desktop | Original maintainer handcheck retained | Human-reported only | Manually checked, not qualified, non-gating |
| Codex CLI, Windows/Linux | Existing pinned diagnostic scope | No mandatory-matrix credit | Unqualified |
| Copilot/OpenCode | Existing adapters/regression coverage | No native qualification inferred | Experimental |

The corrected evaluator accepts all ten original records mechanically, with their exact candidate,
source, loaded identities, tuples, contained hashed captures and clean removal. This is not an
assertion that the Codex Windows import or complete reviewed publication validation has run.

## Verification and reviews

- Original-head CI: AGDF Guardrails 40079920556, success for
  94ef61c9f0aa5a2041269236affc6556c33ed5a3:
  https://github.com/ArndtGold/ai-native-governance-delivery-framework/actions/runs/40079920556.
- Local correction: 34/34 release-qualification tests; release-evidence-test, syntax and diff checks pass.
- Full local verify:ci is not green. LOCAL_VERIFICATION.md lists the completed canonical stages,
  preserved failures, regenerated compatibility evidence (56 scenarios, zero unexpected failures),
  selected-release Delivery Map pass, foreign aggregate relationship findings and incomplete CLI retry.
  Pages check/build/landing/public-documents pass. No complete CLI smoke pass is claimed.
- Current Code Review and Clean Implementation Review pass the exact local correction; cooperative
  agent review, not independent human acceptance. TP Review retains the remaining evidence gaps.
- Historical implementation, candidate, review and CI results remain attached to their original scope.

## Return package and immutable evidence

Original archive: /Users/arndtgold/codex-cli-bundle-8e2b8699.tar.gz
SHA-256: 2d9798679652f8bf80acd529496e4b0f09fdb35cb3b73ca1382c82f89241ea36.
All 44 watched original files are unchanged. No completed case was repeated or edited.
No work-tmp remains. Archive scan: no token-like secrets/email addresses or auth/config directories;
20 /Users/ path occurrences remain in 16 files, unchanged and reported.

CODEX_BUNDLE_REVIEW.json and CODEX_PRIMARY_REVIEW.json in QA_RECHECK_20261024 identify the
agent review and exact bundle/tuple. WINDOWS_RETURN.md gives the transfer/import sequence.
The transfer ZIP /private/tmp/codex-cli-windows-return-8e2b8699.zip contains the original archive,
review, correction patch and review evidence. Its original archive member is byte-identical.

## Remaining bounded obligations

1. Execute the specified Windows review/import against the clean original candidate, using a separate
   corrected tool checkout. No Windows executor is exposed to this chat; no Windows action is claimed.
2. Refresh the existing compatibility outputs and complete reviewed matrix validation under the
   appropriate clean snapshot. An import creates uncommitted evidence; the no-commit/no-push
   constraint is retained, not bypassed to satisfy cleanliness checks.
3. Establish final-snapshot verification/CI before releasing the source-changing correction, then
   renew TP Review and QA. Never relabel or repeat old cases to change their result.

These are explicit remaining limits. No deviation acceptance or human gate decision is inferred.
