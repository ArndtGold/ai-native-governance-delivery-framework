# AGDF 0.20.0 release readiness — final local QA

Date: 2026-10-24
Run: release-0200-codex-claude-20261020-01
Status: local implementation and verification complete; technical QA revise with a bounded human deviation decision prepared.
Authority: no QA/UAT/OR approval, commit, push, merge, tag, import or publication is granted here.

## Result and exact applicability

All 27 canonical repository verification stages pass in the isolated snapshot, including the full
CLI/MCP smoke chain. Source digest: 9888565d0513806fda85ef1eb860f1c6a8e9e32800497a9229a502bd3264cfc4.
See evidence/QA_FINISH_20261024/FINAL_VERIFICATION.md, VERIFICATION.json and verification.log.
The targeted release suite passes 34/34. Deterministic compatibility fixtures: 56 scenarios,
zero unexpected failures. Mac fixture results do not establish native Windows behavior.

The three-file importer correction is implemented and Code/Clean reviewed. The legacy omission
of authorizes is accepted only for Codex failure_case with hash-checked primary authorizes false;
explicit unsafe values and other scopes remain rejected. Original records are not rewritten.
Three traceability relationship defects are corrected through the canonical writer; approved
artefacts, approval seals and gates remain intact. The aggregate Delivery Map has no block/revise
findings; thirteen pre-existing objective warnings remain visible.

## Native evidence

| Original host tuple | Native cases | Review/import boundary |
|---|---|---|
| Codex CLI 0.163.0, gpt-6-luna, macOS 15.7.7, x64, Node v22.22.3 | 5/5 PASS | Agent capture/bundle review complete; specified Windows review/import absent and accepted as a residual gap |
| Claude Code CLI, Windows, frozen recorded tuple | 5/5 PASS | Existing exact review and repository import preserved |

All ten actual original records and their exact locked reviews pass the complete canonical
read-only validate --all-hosts route in a temporary tree. No repository import or projection write
was performed by that validation. Desktop handchecks remain human-reported, non-gating and not
qualified; Windows/Linux Codex diagnostic scopes and experimental adapters gain no qualification.

Original candidate: 8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692.
Original clean commit: 460027fabc58fe0da041bbabe117519dd1f696b7.
All five shipped payload inventories remain identical to that candidate. Three changed tooling/test
files still change source identity: publication of those changes requires an authorized clean final
commit/candidate and its required CI/native evidence. The old records qualify only the original
candidate. Remote CI 40079920556 succeeded only for 94ef61c9f0aa5a2041269236affc6556c33ed5a3,
not for the current uncommitted correction. Root HEAD remains that commit.

## Immutable return package

Original archive: /Users/arndtgold/codex-cli-bundle-8e2b8699.tar.gz
SHA-256: 2d9798679652f8bf80acd529496e4b0f09fdb35cb3b73ca1382c82f89241ea36
All 44 protected Codex files/archive and 26 imported Claude files remain byte-identical.
No native case was repeated to change its result. No native work-tmp remains.
Archive scan found no token-like secrets, email addresses, auth.json, config directory or work-tmp;
20 absolute /Users/ path occurrences in 16 files remain reported and unchanged.

New final transfer: /private/tmp/codex-cli-windows-return-8e2b8699-final.zip.
Its manifest covers the unchanged original archive, correction patch, current reviews and final
verification evidence. The older transfer ZIP remains unchanged. See the final WINDOWS_RETURN.md.

## Remaining bounded QA decision

The maintainer explicitly accepted the Windows review/import gap. The final QA proposal preserves
three medium evidence findings: that Windows gap (TPR-102), final changed-source candidate/CI/native
proof (TPR-105), and the final combined repository-import projection (TPR-106). Technical QA stays
revise; proposed human acceptance is limited to internal review/handoff and grants no publication
or changed-source qualification. The exact current presentation still needs deliberate human QA
acceptance; the Windows-only disposition is not reused as that approval.

Existing staged evidence additions were observed in the root index; attribution is unknown and
they were preserved. No reset, unstage, new root commit or push was performed. See INDEX_OBSERVATION.md.
