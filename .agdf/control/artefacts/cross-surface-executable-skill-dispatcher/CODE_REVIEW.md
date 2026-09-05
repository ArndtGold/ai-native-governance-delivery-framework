# Code Review: Cross-surface Executable Skill Dispatcher

Revision: 10
Decision: pass
Date: 2026-09-05
Review mode: direct review by the implementing agent, not independent-agent evidence.
Baseline: 4d38db394d05bf2afb5280dc3af92dfee042a2bb.


## Codex Follow-up Review

- decision: pass for the bounded follow-up diff against `/private/tmp/agdf-codex-followup-baseline/`.
- evidence: exact registry/recovery-owner equality, strict untranslated-value rejection, native
  environment fixtures, 40 reference cases and real-repository generated-runtime replay.
- correctness: native Codex PLUGIN_ROOT precedes its Claude compatibility alias; explicit surface
  and the specific Copilot marker retain precedence. No new target, run or gate inference exists.
- regression: the prior fixtures forced the host and used English control, masking both defects;
  the new cases exercise those boundaries independently. Locale formatting is preserved.
- security/ownership: no renderer weakening, trust/permission mutation, hook manifest change or
  added runtime search. Existing dirty work remains outside this correction.
- missing_evidence: corrected installed profile and fresh host execution under CSED-QA-01.
- required_next_step: QA consumes resolved code findings and retains the open host evidence.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CSED-CODEX-09 | implementation_gap | CD+Tests | resolved | Canonical recovery locale entries and German ambiguous-run replay | Retest the corrected installed host. |
| CSED-CODEX-10 | implementation_gap | CD+Tests | resolved | Native-variable precedence and generated SessionStart fixtures | Retest the corrected Codex binding in a fresh task. |

## Reviewed Scope

Actual diff and affected neighbours: binding.js, CLI command registry, local-validator child env,
OpenCode transform, SessionStart generator, all ten skill entry blocks, composed-profile and
footprint consumers, integrity/consent/lifecycle/hardening tests, new transport tests and the
reviewed offline replay fingerprints. Generated profiles and payload budgets were checked.
Target resolver, gate semantics, activation kernel and permissions are unchanged. The current
locale-registry addition is assessed in the follow-up review above.

## Findings

No open code defect remains evident in the reviewed scope. Resolved issues found during this work:

1. The original tuple omitted Electron child env and exact argument names. The shared owner and
   code-derived grammar correct both without weakening --cwd rejection or target pairing.
2. Runtime suitability needed positive evidence, bounded failure and stale-file invalidation.
   The probe is fixed, repository-free and cached only for the exact current launch identity.
3. Inherited Node bootstrap module configuration could run code before the fixed probe. It is
   rejected before spawn and is never printed. The parent env remains untouched.
4. Real Electron emitted OS stderr despite correct output and exit 0. Stderr is bounded but is
   not treated alone as failure. Error, signal, timeout, overflow and malformed stdout still fail.
5. Source-only fixtures had advertised nonexistent installed runtime paths. Explicit source
   fixture paths now preserve the new missing-runtime failure rather than bypass it in production.
6. The missing-entrypoint layout test had expected the obsolete permissive binding. Its new
   assertion requires unavailable, no executable binding and the unchanged passive kernel.
7. Review removed an unused production serializer. Model argument construction is not falsely
   represented as enforcement by a helper used only in tests.
8. The offline replay stamp was stale. A compatibility review found no changed case-specific
   source or judgement text outside dispatch blocks. Only reviewed source fingerprints changed;
   no observation, threshold, case rule or provenance kind was relabelled as live execution.

## Evidence And Limits

CD_TESTS.md records green focused/aggregate tests, all corrected red tests, exact measurements
and the rollback fixture. CSED-RUNTIME-01 proves the real local Electron process chain only.
The 2000 ms E2E timeout was retained after one transient failure under concurrent aggregate load.
Native Windows/Linux execution, real loaded models, visible output fidelity and fresh-session
adherence remain an explicit evidence gap, not an unsubstantiated defect or a fabricated pass.
No other user change was included. The unrelated image was not edited.
The existing wrapper owns dispatch-time version/digest/provenance validation.

- required_next_step: evaluate plan coverage and the retained host evidence gap through qa-gate.
