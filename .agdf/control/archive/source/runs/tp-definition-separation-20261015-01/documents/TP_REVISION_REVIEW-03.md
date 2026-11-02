# Bounded TP revision ready for separate application confirmation

Status: proposed; source_revision.preview accepted; apply not performed
Owner: Codex

The maintainer explicitly answered the budget question and requested the bounded change. The final proposal permits exactly Copilot 260 files/2256982 bytes and sessionStartBase 1912 normalized bytes. No extra headroom, guard suppression, requirement, design, installation, release or VCS scope is added. All task, scenario, acceptance and SD decision IDs remain identical. The proposed TP also clearly distinguishes the original missing-dependency baseline from the subsequently observed successful locked install/UI build.

Reviewable files: TP_REVISION_CANDIDATE-03.md, TP_REVISION_DIFF-03.patch and BUDGET_LIMITS-02.patch. The proposal binds both candidate and patch digests in intended_change. TP_REVISION_FINAL_REVIEW-03.json records the accepted preview, pure structural content check and git apply --check success. These checks neither apply a source revision nor approve TP. The initial 02 preview remains historical; use only the final 03 proposal/preview for this confirmation.

The exact current Core preview retains UR/PRD/SD and supersedes TP. Code/test files remain. Existing Brownfield Review applicability is unproven under its old receipt and must be reassessed; Brownfield Analysis, CD+Tests and review fulfillment must be renewed after the TP revision. The existing gate sequence and new deliberate TP approval remain mandatory; no previous Approval: TP is transferred. No approved source, guard limit or canonical Run revision changed during this preparation.

The runtime contract requires source_revision.preview followed by separately confirmed source_revision.apply; its apply contract uses confirmation exact_material_confirmation. The technical selector is retained in TP_REVISION_PREVIEW-03.json, with operation 3cd66b57-0286-4f9a-b6bc-8da05908418d and preview digest sha256:cd5833b90677542f1f5a310af5597c2dbc3287176297022fa064ca9bed8a58ba. Human confirmation should refer to this concrete reviewed impact, not host tool permission or a fabricated past reply.

Required next step: the maintainer separately confirms applying this final exact preview. Then the agent uses the existing apply owner, performs the returned analytical reassessment, records/presents the revised TP, obtains its new deliberate approval and continues only the resulting authorized work. The scope answer itself does not become an independently authenticated human signature or an approval of a not-yet-presented TP revision.

Process correction: the exact technical revision preview should have been prepared before the previous scope confirmation request. It is now complete and retained, so no further question about the numerical limits is needed; only the existing separate apply boundary remains.
