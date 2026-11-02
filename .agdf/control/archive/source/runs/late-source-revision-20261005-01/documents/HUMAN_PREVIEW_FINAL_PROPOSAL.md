# Exact final preview correction proposal

Run: late-source-revision-20261005-01. Status: proposed, not approved or applied in the workspace.
Source candidate: sha256:640219d88e96df81a474ca6f25e48ef9c086ac7aad4491012dbe6b02172b8031 (CANDIDATE_HUMAN_PREVIEW.json).

The AC-001 defect was reproduced by HUMAN_PREVIEW_BEFORE_FIX.log. The normal human CLI preview omitted intended change, exact apply digest, source path/digest bindings, analytical dispositions and reasons, invalidated step evidence, and the obligation to recheck retained work. The fix adds these to the existing renderer and complete en/de copy; actual packaged CLI tests pass for en/de and fr-CA fallback, including 51 output observations. No Core authority, approval formula or MCP input changed.

The additional Copilot payload is exactly 2,800 bytes: one existing runtime renderer +728, two existing locale projections +1,036 each. Runtime manifest digest changes with zero length change. File count remains 200. Proposed exact max_files=200, max_bytes=1685700, zero file/byte reserve. PACKAGE_HUMAN_PREVIEW_PROPOSAL.json lists the per-file attribution and full inventory hash.

Five proposed production paths are listed with before/after hashes and exact saved bytes in HUMAN_PREVIEW_FINAL_PROPOSAL.json and proposals/human-preview-final/. They are the numeric baseline with truthful rationale, the three generated compatibility outputs, and one new immutable adapter observation. Existing compatibility:record reran 56 cases with zero unexpected failures for source fingerprint cc514b60e304df68f23259ead3b94be9519135f978aa6d934993eaba7d6066b7. The old observations, actual native evidence, original design run/approvals and verifier policy stay unchanged. Two existing duplicate compatibility files were temporarily moved/restored only in the disposable copy so the generator's foreign-output guard stayed enforced; they are not deletions in this proposal.

Normal full build passes in the isolated proposed candidate. The complete unchanged shared plan is running there; it is not yet green. The workspace normal guard currently correctly refuses 200/1685700 against the last approved 200/1682900 limit. Bounded Codex and focused checks do not waive it. This proposal cannot mark CD+Tests, CR or QA complete.

Approval would authorize exactly the five saved files, followed by normal workspace regeneration and final candidate/evidence reconciliation. It grants no AGDF gate approval, approval transfer to the predecessor run, VCS, install or release authority. T-007 requires a separate decision for the exact numeric candidate; TP protects the generated compatibility files, so the new corresponding refresh is also explicitly included.
