# Material execution clarification: measured guard budgets

Status: open
Owner: AGDF maintainer through the existing TP owner
Finding: BUDGET-001
Current Run gate: CD+Tests; source clarification is not a silent gate rewind.

## Concrete question

May the dedicated TP skill's exactly measured package and instruction growth be included in an explicit TP revision, with the following exact new guard limits? The alternative is to retain the old limits and revise the planned scope/structure before further delivery.

| Guard | Approved/current cap | Measured required cap | Delta |
|---|---|---|---|
| Copilot max_files | 253 | 260 | 7 files |
| Copilot max_bytes | 2218869 | 2256982 | 38113 bytes |
| sessionStartBase maxNormalizedBytes | 1900 | 1912 | 12 bytes maximum across Codex/Claude/Copilot |

The seven additional shipped files are the TP SKILL.md, help.md and focused contract, the pure TP dispatch phase, TP planning facts, shared normalized-gap validation and shared Markdown table observations. Shared extracted code replaces existing copies rather than creating a second policy owner. Growth also includes registered discovery, bounded continuation/schema/CLI support, template and handoff content. The exact zero-headroom Copilot baseline is the prior scope's measured payload, not an external host maximum.

SessionStart contains the canonical unchanged activation kernel plus the exact schema-2 binding. The new --tp-action alternative makes the measured normalized totals 1910/1911/1912 bytes respectively. Discovery descriptions were shortened within their existing meanings to keep the separate 3000-byte discovery budget. Further lossy grammar/guard compression is not proposed merely to make these measured limits disappear.

## Approved source and blocking consequence

The approved TP states verbatim: "Package/footprint growth may fail existing guards; no limit increase is authorized by this plan."

source_ref: TP: Package/footprint growth may fail existing guards; no limit increase is authorized by this plan. @ sha256:3402e7822f2c9f5bd8f756e60ed112b02242f1d911d7c7b34519facb693948bf

TP SCN-013 and R-GENERATE/R-PACKAGE require unchanged guard baselines and full coherent package verification. full-generation-final.log fails AGDF_COPILOT_PAYLOAD_GROWTH; runtime-final.log fails AGDF_INSTRUCTION_FOOTPRINT_BUDGET_EXCEEDED. build:prepare reaches its owned dependency/UI stages successfully but stops at generation. Tests depending on that coherent full preparation cannot be counted as passing. Guard values have not been increased; no suppression or alternate full-package pass is claimed.

## Reviewable proposed treatment

After a substantive maintainer answer, use existing source_revision.preview for TP with a separate proposed copy, then separately confirmed apply, renewed TP presentation/approval and necessary fresh preparation/reviews. Proposed TP replacement constraint:

"For this dedicated tp-definition scope only, after canonical measured generation, permit Copilot max_files 260 and max_bytes 2256982, and sessionStartBase maxNormalizedBytes 1912. Update each baseline's rationale with this exact scoped inventory; retain every guard, completeness/integrity/activation check and all other limits. A later excess remains blocking. Re-run full preparation, package/conformance/activation/integrity checks, the final isolated authoring exercise, reviews and QA. No native-host, installation, release or VCS authority follows."

This text is a proposal and has changed neither the approved TP nor the guard files. A substantive answer is not an approval of a not-yet-presented TP revision. Preserve existing UR/PRD/SD because their semantics remain unchanged; SD forbids a silent increase, which this explicit revision would continue to respect. Final impact eligibility remains the existing preview owner's decision.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| BUDGET-001 | plan_gap | TP | open | Approved TP guard-preservation constraint blocks its own required package route for the measured new skill/runtime payload and revision syntax; see exact log results and proposed scoped values above. | Maintainer answers whether the exact measured guard delta may be proposed through the existing TP revision owner. |

Required answer: choose the exact scoped budget revision above, or keep current caps and identify the desired scope reduction. Until answered, dependent package qualification, CD+Tests completion, final QA and delivery remain blocked.
