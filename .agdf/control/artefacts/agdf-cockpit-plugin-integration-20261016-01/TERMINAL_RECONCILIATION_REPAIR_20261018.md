# Closed-card reconciliation and intrinsic measurement repair — 2026-10-18

Run: `agdf-cockpit-plugin-integration-20261016-01`.
Input revision: `4c06ecc1-316b-43d9-9d36-778a6393828a` (37).
Scope: existing approved TP; retained-card defect correction, not a new qualification or source exception.

## Native observation and updated human result

Native candidate `0.14.5+codex.local-7fe0f005673c`, trace `b951ae65-7fb9-46b3-9b9e-084d1d7eb46f`, provider connection `9396bf0d-b4dd-42ba-8be4-dd964d7d52a3`, Core session `8a9c742d-8d35-48dc-93a5-b60d1b5823a9`, Host chatgpt `26.1013.40934`. The public SDK trace records invalidation/close and the inline request at sequence 40, inline acknowledgement at sequence 42, size notification 518x1987 at sequence 43, then teardown at sequence 44. The available panel inventory was empty afterwards. Raw console evidence is bounded and is not claimed to be a complete Host trace.

The human subsequently reported: “jetzt ist die Karte weg und es flimmert nicht mehr.” This is positive native observation of eventual card disappearance and cessation of flickering for the preceding candidate. It supersedes the earlier assumption that this exact card remained indefinitely visible. Exact elapsed disappearance time, continuous absence of intermediate flickering and qualification of changed candidate bytes are not established. The large emitted size remains an observed app defect even though the Host eventually removed the card.

## Reproduced production defect

App and HostProbe were sibling keyed children using the same session identifier. React reported a duplicate key. A strengthened close regression required the old `.shell`, `.compact-cockpit` and `.host-probe` subtrees to be absent, and failed against the existing keys: the old main view remained in the DOM after confirmed close. Distinct `app:` and `probe:` key prefixes preserve per-session remount behavior while removing the ambiguity. The same regression then passes, without CSS hiding of stale subtrees. This is a reproduced React reconciliation defect, not proof of the Host's complete internal flicker mechanism.

The final-size owner now measures the dedicated terminal section rather than the outer container. The regression gives the outer geometry height 1987 and the terminal height 112. Against the previous measurement implementation it fails with 1987; the corrected implementation emits 736x112 after the inline acknowledgement. Intrinsic terminal flow and explicit heading/paragraph spacing bound its content layout. No arbitrary hardcoded production height or repeated resize loop was introduced. Public inline handshake, observer cleanup, context invalidation and validated Core retirement owners remain unchanged.

## Verification and installed candidate

Two red reproductions are retained separately: incorrect measurement target and stale subtree reconciliation. Final initial-run suite: 27 passed. Complete UI suite: 23 files / 259 passed. TypeScript noEmit and production MCP build pass; changed-file diff whitespace check passes. These tests establish source behavior, not native rendering of changed bytes.

Installed candidate: `0.14.5+codex.local-cebb272906fd`.
Source digest: `cebb272906fd310a0d68faf8eee905c54e1d012ffc885b9aa2dbd6e81b83963d`.
UI digest: `sha256:2832b1d94a43656c8af2201ade0a8b4236e621af6acbe7b542ea0534bb128d86`.
Immutable runtime generation: `4a9dee79383de5e78b94b981fdfca85b44ff463aadc6edf8ef7962d7439524a1/0.14.5`.

Normal owned rollback and public Codex CLI marketplace/plugin installation completed. Installer result is partial with failure:null, exact installed version verified and activation pending_restart. Stable plugin, native cache and immutable runtime bytes match the tested candidate. Both actual project/user configuration hashes remain unchanged. No direct cache/journal edit, Legacy disablement, VCS operation or qualification bypass occurred.

## Remaining continuation

The new installed bytes require activation and a fresh native final-size/teardown observation. The previous candidate's positive human report remains valid within its own scope. Legacy retirement still requires the approved matching qualification and complete effective provider-origin inventory through the existing guarded owner. Repeating the earlier invalid partial transition would not add evidence, so no identical failed retirement was retried. CD+Tests is not complete; final CR and QA remain pending.

Evidence: `evidence/terminal-reconciliation-20261018/` with SHA256SUMS.json. Continuity: INLINE_MODE_HANDSHAKE_REPAIR_20261018.md, INLINE_SIZE_NATIVE_FAILURE_20261018.md, LEGACY_CUTOVER_REVIEW_20261018.md and canonical CD_TESTS.md. No earlier sealed evidence is rewritten.
