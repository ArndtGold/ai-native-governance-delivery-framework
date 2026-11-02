# AGDF 0.20.0 release readiness — Desktop matrix revision

Date: 2026-10-22
Run: release-0200-codex-claude-20261020-01
Status: implementation prepared; final Desktop candidate qualification pending
Gate authority: none. No QA, UAT, OR or publication approval is asserted.

## Current release scope

| Host / surface | Required cases | Available evidence | Qualification |
|---|---|---|---|
| Codex Desktop Code; original OS unknown | session, upgrade, recovery | Maintainer reports all three passed; original app/model/session/candidate and primary references unavailable | Pending candidate binding and reviewed primary evidence |
| Claude Desktop Code; Windows test-computer context | session, upgrade, recovery | Maintainer reports all three passed; original Desktop app/model/session/candidate and primary references unavailable | Pending candidate binding and reviewed primary evidence |
| Codex CLI, Windows/Linux | Outside mandatory Desktop matrix | Optional diagnostics only | Unqualified |
| Claude CLI, Windows | Outside mandatory Desktop matrix | Five cases rechecked on original clean candidate 830d8b94; 79 indexed files match | Historical CLI evidence only; original review/import pending |
| Copilot / OpenCode | Retained adapter and regression coverage | Experimental support intent retained | Experimental |

The two attributed human reports preserve the confirmed normal invocation, upgrade and recovery.
Unknown values remain null. Reports receive zero machine-qualified native credit; repository fixtures
and ordinary Linux/Windows regression tests do not establish installed Desktop behavior.

Original reports: DESKTOP_HANDCHECKS_20261022.md and the separately published human_report inputs.
Detailed recovery/disposition: evidence/DESKTOP_MATRIX_IMPLEMENTATION_20261022/DESKTOP_EVIDENCE_RECOVERY.md.

## Implemented behavior and canonical owners

- plugins/agdf/meta/agdf-plugin.definition.json owns schema-2 hostSupport, the two mandatory Desktop
  targets, optional CLI policy and explicit unqualified Codex CLI OS scopes. Existing pins remain.
- Existing release policy/candidate/observation/handoff owners validate actual Desktop identity,
  native calls, loaded runtime, reviewed tuple/bundle, baseline transition, preservation and cleanup.
  Human reports are a separate discriminated input. Templates are unverified; unknowns never pass.
- Default and --all-hosts release validation require both complete Desktop sets. The explicit
  validate-cli command retains strict Codex diagnostics without publication credit. All publication
  paths require the Desktop gate plus existing tests/tag/version/registry/provenance checks.
- Existing compatibility contract/producer/render owners retain attributed reports separately from
  qualified native_sources/native_targets. Reviewed imports remain scoped, immutable, contained and
  rechecked; original CLI files and their candidate association were not rewritten.
- Existing generation and release preparation produce coherent 0.20.0 package assets. Distribution
  profile values and the exact Copilot cap of 397 files / 3,488,492 bytes were preserved. Canonical
  JSON formatting was compacted where needed; no payload allowance or timeout was increased.

Public execution guidance: docs/maintenance/release-0.20.0.md (repository root).

## Current verification

| Check | Result / boundary |
|---|---|
| Release qualification suite | 19 deterministic tests pass in current full verification maintenance stage; no native Desktop execution implied |
| Release workflow / legacy route safeguards | Pass; all publication ancestors protected; optional CLI cannot substitute Desktop |
| Compatibility producer and freshness | Pass; 56 adapter cases, zero unexpected failures; zero qualified Desktop cases |
| npm run build | Pass; 113 skill evaluations; package/runtime integrity checked |
| Release preparation | Pass; 0.20.0 package/profile/history safeguards retained |
| CI planner / inventory | 9 planner tests pass; 161 original commands across 117 planned jobs unchanged in each OS/Node lane; original timeouts not increased |
| npm run verify:ci | Pass, exit 0; all 27 canonical local stages completed. See VERIFICATION_RESULTS.json and full-verification-attempt-2.log |
| Scoped source whitespace | Pass for .github, CONTRIBUTING.md, INSTALL.md, README.md, docs, evals, packages, plugins and scripts |
| Global git diff --check | Fails on one pre-existing sealed BROWNFIELD_REVIEW.md blank line at EOF; protected source was not edited |
| Final clean release source | Unavailable: working tree is dirty; no automatic stage, commit, reset or clean export represented as a shared final ref |
| Fresh remote CI / Desktop model session | Not executed for this working-tree revision; historical CI and original host runs are separate evidence |

Evidence logs, original baseline, CLI review, release rejection and CI comparison are retained under
evidence/DESKTOP_MATRIX_IMPLEMENTATION_20261022/. Unchanged live Windows shim assertions are skipped on darwin and are not claimed as executed.
Full verification results remain local repository
verification, not a claim that new GitHub jobs or installed-host acceptance passed.

The first current full verification stopped at the expected stale request-activation source
fingerprint after the host-policy revision. The existing fingerprint owner recomputed only that
manifest value after source review. All 39 deterministic cases and callback/host-schema checks pass;
no expected behavior, activation guard or historical host observation was changed. Compatibility
was then regenerated after its correct stale-snapshot rejection. Both failures remain in evidence;
the second complete invocation passed after this repair.

## Candidate and publication boundary

Prepared diagnostic candidate: 5143cc192852d091d9792124832805e34adcb8193689857a1217dc311486dd7f.
Source HEAD: 7ce6e8385632c001f6cdcd94fdb242e07f2ee748; dirty=true.
See PREPARED_DIAGNOSTIC_CANDIDATE.json and RELEASE_ELIGIBILITY.json in the evidence directory.

Actual negative checks reject dirty source with candidate_source_dirty and missing Desktop rows with
native_required_matrix_missing_or_duplicate. Required Desktop cases: six. Qualified records: zero.
Two human reports are retained. Publication remains ineligible. Policy/probe changes produce a new
candidate; earlier CLI or unspecified Desktop results cannot be relabeled for this identity.

## Minimum remaining evidence and closeout

Recover one existing original Desktop session/log/export reference per host, with tested candidate
or loaded runtime identity if present. Review it before asking for any remaining specific fact.
The existing confirmation of all three scenarios needs no repetition. A commit label alone does
not supply missing native capability/transition observations. No blanket rerun, credentials,
whole-profile export, remote access or daily-profile replacement is requested or authorized.
See MINIMUM_REMAINING_EVIDENCE.md for the bounded disposition.

Current local macOS/app metadata is recorded only as present-day metadata. It cannot establish the
original Windows Claude or Codex Desktop tuple and does not qualify prepared AGDF 0.20.0.

All 1,593 software-source inventory entries stayed unchanged during the full second verification;
approved source digests match exactly. Prepared payload inventories are unchanged by the derived
fingerprint repair. See SOURCE_STABILITY_FINAL.json and METADATA_SCOPE_CHECK.json.

T-001 through T-008 have implementation evidence. T-009 remains partial until an authorized clean
source is available. T-010 remains partial because the six Desktop cases lack current-candidate
primary evidence. T-011 reviews/QA are not completed. CD+Tests must retain revise while these
required obligations remain open; later human approvals, OR and publication cannot be inferred.

Previous readiness bytes, including dated legacy CLI matrix and earlier verification history, are
preserved at evidence/DESKTOP_MATRIX_IMPLEMENTATION_20261022/READINESS_BEFORE_DESKTOP_MATRIX.md.
They are historical evidence and do not define this renewed mandatory matrix.
