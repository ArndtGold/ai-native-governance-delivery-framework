# CD+Tests — 0.20.0 Desktop matrix implementation

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-22
- owner: Codex, current bound implementation
- source_head: 7ce6e8385632c001f6cdcd94fdb242e07f2ee748
- source_state: dirty working tree; no shared-repository VCS or publication action performed

## Bound sources and work boundary

Implementation follows renewed approved UR/PRD/SD/TP and the recorded implementation-preparation
Brownfield Analysis at revision 26. PRD digest: sha256:1d6bf911c1d9229d6c54ddfc0fc74bb3402d0e1a8efff775ad5903d81b657a9e.
SD digest: sha256:0a1f8de1bb71b1ffbb317af7f5977dc9c0b617d3080fc62d7d998528fe7f11f1.
TP digest: sha256:0a00d7cd0c13858e038b38a8b18e6419cc4dc21375c4702db4c0d3e6b01a23ff.
These approved files were not edited during implementation. Historical quality reports are not
reused as current fulfillment. Foreign core-model-handoff-simplification artefacts remain untouched.

Scope: canonical release matrix, existing policy/candidate/observation/handoff owners, mandatory
Desktop publication gate, optional CLI diagnostics, compatibility reporting, guidance and necessarily
coupled regression tests. No safety guard, approval check, ownership test, CLI pin, history rule,
ordinary CI command, payload allowance or existing timeout was relaxed. No native run is fabricated.

## Actual implementation

Schema-2 hostSupport requires Codex Desktop and Windows Claude Desktop session, upgrade and
recovery. Codex OS resolves only from a reviewed observed tuple. Codex CLI Windows/Linux remains
unqualified; Claude Windows CLI is separate. Copilot/OpenCode remain experimental with coverage.

Schema-3 Desktop records require an exact reviewed tuple/candidate, loaded identity, actual native
call captures, expected non-authorizing outcomes and contract hashes, scoped installation/consent,
discovery and cleanup, and primary transition/baseline/preservation facts. Human reports are an
explicit different kind with zero qualified credit. Empty/unverified templates do not pass.

Generalized imports retain containment, reference hashes, reviewed bundle/tuple, immutable scoped
paths, staged recheck and rollback. Default/full release validation requires both Desktop sets;
validate-cli is explicitly optional and cannot qualify Desktop or grant publication. The publication
graph retains existing tag/version/registry/provenance/package checks and gates every npm publish
on Desktop evidence plus repository tests. All ordinary CI inventory/timeouts remain intact.

Compatibility reporting separates attributed original handchecks from qualified native claims.
Source policy remains canonical; package assets and compatibility output were regenerated through
existing owners. Distribution profile values are unchanged. Formatting compaction preserved the
hard Copilot payload cap of 397 files / 3,488,492 bytes without adding allowance.

The first full verification correctly rejected the stale request-activation source fingerprint
following the host policy change. Only evals/request-activation/manifest.json source_fingerprint.value
was recomputed with computeRequestActivationSourceFingerprint after reviewing its two bound sources.
All 39 deterministic corpus cases, callbacks and original unavailable host observations were preserved;
the focused request-activation chain passes. Compatibility correctly rejected its stale snapshot and
was regenerated through its existing owner (56/0), without relabeling model/native observations.
Original failure logs and REQUEST_ACTIVATION_REBIND.json retain both before/after digests.

## Task disposition

| Task | Current state | Evidence / remaining work |
|---|---|---|
| T-001 | Complete | Recorded BROWNFIELD_ANALYSIS.md; exact initial status/inventory/timeouts in BASELINE.json |
| T-002 | Complete | Canonical schema-2 policy, validated target selection, legacy generated CLI projection and contract tests |
| T-003 | Complete | Existing full candidate inventory and strict source/payload identity retained; fixed reported_sources output normalization tested |
| T-004 | Complete for implementation | Strict Desktop validator and distinct attributed report branch tested; actual native qualification remains T-010 |
| T-005 | Complete for implementation | Scoped Codex/Claude import, explicit preflight captured identity, incomplete templates and default/full matrix safeguards tested |
| T-006 | Complete for implementation | Existing released-baseline/production transition helpers reused; strict Desktop primary/transition/cleanup rejection fixtures added; no claim of new Desktop lifecycle execution |
| T-007 | Complete | Mandatory Desktop publication graph and optional strict CLI workflow tested; 161 commands/117 jobs and per-lane assignments preserved |
| T-008 | Complete | Existing producer/render pipeline refreshed; two original human reports; current public guidance and RELEASE_READINESS.md |
| T-009 | Partial | Prepared 0.20.0 assets and local checks; full verification passed below; authorized clean shared final source not available |
| T-010 | Partial | Original handchecks retained; 79 old Windows Claude CLI files/five cases rechecked; six Desktop candidate-bound primary records unavailable |
| T-011 | Not completed | Current formal reviews and QA cannot be claimed; retain actual evidence gaps and gate eligibility |

## Executed verification

Evidence directory: evidence/DESKTOP_MATRIX_IMPLEMENTATION_20261022/ (relative to this run).

- npm run test:release-qualification: 19 current deterministic tests pass in maintenance during
  full verification, including legacy/native negatives, Desktop identity/capabilities/transition,
  report discrimination, immutable import, full-matrix bypass and optional CLI/preflight safeguards.
- node scripts/native-probes/release-evidence-test.mjs and maintained release-workflow contracts:
  pass, including legacy route rejection and mandatory publication ancestry.
- node --test scripts/ci-plan-test.mjs: 9/9 pass. Baseline/current comparison preserves all 161
  command entries and 117 planned jobs with exact command multisets in every OS/Node lane and
  no increased existing timeout. See CI_COVERAGE.json.
- npm run test:host-compatibility, compatibility:record and compatibility:check: pass. Refreshed
  deterministic comparison evaluates 56 cases with zero unexpected failures. No native credit added.
- npm run build: pass with 113 skill evaluations and package/runtime integrity. Final full plan
  independently exercises current generation, build contracts, evals, preparation and runtime checks.
- npm --prefix packages/cli run release:prepare: pass; 0.20.0 coherence/history/profile checks retained.
- npm run verify:ci: pass, exit 0. All 27 stages of the complete canonical local plan completed;
  see full-verification-attempt-2.log and VERIFICATION_RESULTS.json. The first invocation failed
  at the stale derived activation fingerprint and remains retained as a failed attempt.
- Scoped git diff --check for .github, CONTRIBUTING.md, INSTALL.md, README.md, docs, evals,
  packages, plugins and scripts: pass. Global command fails on pre-existing additional blank line
  at EOF in sealed BROWNFIELD_REVIEW.md:124. The initial baseline already contains it. Canonical
  source bytes remain protected; no manual seal rewrite or hidden exclusion makes a global pass.

Unchanged platform-conditional live Windows shim assertions are skipped on darwin; this local
verification does not execute those native Windows checks. Ordinary Windows CI inventory remains
mandatory and unchanged, with no fresh remote execution claimed.

Actual rejection checks in RELEASE_ELIGIBILITY.json retain candidate_source_dirty and
native_required_matrix_missing_or_duplicate. Diagnostic candidate is
5143cc192852d091d9792124832805e34adcb8193689857a1217dc311486dd7f, dirty=true.
No clean export/ref, current GitHub CI result, new native Desktop session, human acceptance,
QA/UAT/OR completion, registry success, tag or publication is asserted.

All 1,593 software-source inventory entries match the frozen post-rebind digest
98c2eed9443cac05f01c1af8bf2037d71ba868a65e66449c9554528ee12a851c.
Only evals/request-activation/manifest.json differs from the earlier prepared snapshot, for the
reviewed derived fingerprint. All prepared payload inventories are identical to that snapshot.
Approved source/analytical digests remain exact. See SOURCE_STABILITY_FINAL.json and
METADATA_SCOPE_CHECK.json. HEAD is unchanged and no shared index paths are staged.

## Native evidence recovery and minimum remaining input

DESKTOP_HANDCHECKS_20261022.md preserves the maintainer's confirmation of all three scenarios
for both hosts. Original Windows context applies to Claude; Codex OS is not inferred from this Mac.
Human report scenarios stay reported_pass, with unknown app/model/session/candidate fields null.

The original Claude CLI candidate 830d8b9414a6e7b4eb4080ff5ce64daeb4b064cbf5fffc8680c4d2876604ebff
is tied to clean source 97454ec2fcb0b4e194219ad31d962d4d8c24cae3, Claude Code 2.1.302,
claude-sonnet-5-5, Windows x64 and Node v22.22.3. All 79 indexed file sizes/hashes and five native
cases passed a current bounded review against their original policy. Original bytes/index were not
modified; original review/import remains pending. CLI evidence is not Desktop evidence and has not
been relabeled as the new policy's candidate.

No candidate-bound Desktop primary reference is available in the supplied relevant original run
material. Current macOS 15.7.7 / local Claude 1.40609.0 metadata and installed AGDF 0.14.5 are only
present-day local facts. They cannot establish the original Windows/Codex Desktop test identity.
No private whole-profile/transcript search, host install, remote access or new model run was done.

Following the maintainer's direction to minimize additional input, the smallest useful next input
is one existing original session/log/export reference per Desktop host, preferably identifying the
tested/loaded candidate. Recover actual metadata and supported capabilities from that reference
first. Ask only for specific facts still missing afterward, without repeating the existing scenario
confirmation or requiring a blanket six-case rerun. A reference is reviewed for final-candidate
applicability; a different candidate or missing transition facts remain explicit gaps. See
DESKTOP_EVIDENCE_RECOVERY.md and MINIMUM_REMAINING_EVIDENCE.md.

## Decision and normalized gaps

Decision remains revise. Implementation and deterministic tests cannot fulfill unavailable required
Desktop native observations or create a clean shared final release ref. Publication remains blocked.

- E-DESKTOP-CODEX: evidence_gap -> evidence_obligation. Owner: original observer/native Codex
  Desktop executor and evidence reviewer. Missing candidate-bound session/upgrade/recovery primary
  records, actual reviewed tuple and effective loaded identity. Recover existing references first.
- E-DESKTOP-CLAUDE: evidence_gap -> evidence_obligation. Owner: original Windows Desktop observer
  and evidence reviewer. Same three Desktop records; original CLI tuple cannot substitute.
- E-CLEAN-SOURCE: evidence_gap -> evidence_obligation. Owner: maintainer/VCS handoff. No authorized
  clean final shared source exists for recomputation/qualification; no automatic VCS action inferred.
- E-SEALED-EOF: existing protected formatting diagnostic -> canonical analytical artefact owner.
  No semantic acceptance/source change is proposed. Preserve sealed bytes until the owner permits
  exact correction; do not bypass integrity or claim global whitespace success.

Reassess original evidence/current candidate before targeted safe execution. Follow only the
canonical next operation; no passed review, QA, UAT, OR or release authorization is inferred.
