# Payload Constraint Conflict

Run: sd-definition-separation-20261004-01
Status: open; revision preparation selected; supported late source revision unavailable
Date: 2026-10-04

The approved SD requires unchanged payload limits, including: "Do not change ceilings,
benchmarks or assertions as an expedient." The approved TP likewise forbids relaxed ceilings
and requires a return to the PRD/SD owner when required content cannot fit.

Existing canonical Copilot baseline: plugins/agdf/meta/copilot-payload-baseline.json,
193 files / 1,581,171 bytes. The first candidate observation was 198 files / 1,608,502 bytes.
After concise localized recovery wording the current observation is 198 files / 1,608,420 bytes
(+5 files / +27,249 bytes). No budget/assertion/check has been raised, disabled or bypassed.

Evidence: /private/tmp/agdf-sd-build.log, /private/tmp/agdf-sd-instruction.log. The shared build
and instruction-footprint suite both stop at AGDF_COPILOT_PAYLOAD_GROWTH. The discovery-description
aggregate has been brought inside its existing ceiling by shortening only affected gate-check/SD
discovery text; this does not resolve the separate runtime-payload baseline.

On 2026-10-05 the user selected the recommended controlled revision preparation with “leg los”.
PAYLOAD_REVIEW-01.json records the exact additional files and existing-file deltas; the two
contract projections have separate existing host/runtime consumers and one canonical source.
PAYLOAD_REVISION_PROPOSAL-01.md contains the concrete proposed requirement change and baseline.
The restriction already exists in UR and PRD, so a design-only edit would not resolve it.
The installed canonical run-revise attempt rejected this CD+Tests state with
prd_revision_boundary_invalid; see PAYLOAD_REVISION_ATTEMPT-01.json. No supported late source
revision path is currently available. Old approvals cannot be transferred or approved sources
resealed to cover the changed constraint. The baseline remains unchanged; no new gate approval
has been requested without a supported fresh canonical presentation.

Unaffected implementation and focused verification continue. Full candidate/package/MCP verification,
final review completion and QA pass remain outstanding; no installation/VCS/release is authorized.
