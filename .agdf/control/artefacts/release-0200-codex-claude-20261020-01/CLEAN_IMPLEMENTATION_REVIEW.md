# Clean Implementation Review — 0.20.0 CLI matrix

- decision: pass
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-24
- reviewer: Claude (Claude Desktop Code, Windows)
- reviewed_diff: 5fb2642c..7a41879e (candidate 5e84374e)

## Clean Implementation Review

- decision: pass
- primary_solution: The approved matrix lives in the one canonical owner, hostSupport schema 3 in
  plugins/agdf/meta/agdf-plugin.definition.json, read through the one policy owner release-policy.mjs.
  One evaluator (assertNativeRecord and assertHostReleaseEvidence) selects required, optional-cli or
  optional-desktop cases by an explicit scope. One import path (importNativeEvidence with evidenceScope) and
  one validate path handle every host and surface. The publication workflow keeps its single evidence job.
  Reports extend the existing run/render owners. No new service, register, validator or decision authority.
- evidence: release-policy.mjs, release-observation.mjs, release-handoff.mjs, release-candidate.mjs,
  codex-host-e2e.mjs, publish-agdf.yml, scripts/host-compatibility run/render; release qualification 32/32;
  Code Review pass with independent re-review; remote CI run 39994196802 118/118.
- fallbacks_retained:
  - Schema 1 and 2 branches in the policy reader, evaluator and import remain so historical candidates can be
    read under their own predicates. This is SDD-001 of the approved SD. Target state: new eligibility uses
    schema 3 only; validate --all-hosts rejects schema 1 and 2, so the branches cannot open publication.
    Exit condition: they go when no historical candidate evidence needs interpretation, decided with that
    evidence's retention.
  - Without a repository root a mandatory Codex record must equal the checkout commit. Only direct evaluator
    calls without a repository take this path; it is stricter than the git proof, never weaker. Every
    production caller (import, validate, optional Desktop) passes the repository.
  - The pinned Codex Linux/Windows diagnostics and their workflow remain, as decided in SDD-003 and SDD-007,
    and are excluded from eligibility.
- workaround_or_shim_risk: The root cause of CR-101 was fixed at its owner. The binding now proves exact
  candidate source through git ancestry instead of comparing an unauthenticated field; the guide states the
  rule. The Copilot payload baseline and the request activation fingerprint were re-pinned to exact measured
  values with recorded rationale, not given headroom.
- parallel_structure_risk: Low. isCandidateSource repeats the path rules of inventory() and manifestInputs
  repeats the manifest normalization, both in the same file and on the same constants (SOURCE_ROOTS,
  SOURCE_FILES, OUTPUT_PARTS, evidenceOutput). If they ever diverge, the ancestry check rejects valid evidence
  rather than accepting changed source, and the publication-flow and candidate tests would expose it.
- brownfield_fit: Fits the existing owners named in the Brownfield Analysis. Historical evidence and
  candidates stay unchanged; CI inventory and timeouts are unchanged apart from the gate rename; the native
  harnesses keep their structure.
- missing_evidence: The ten native records for 5e84374e (TP Review TPR-101, TPR-102) are outside this
  review's scope.
- required_next_step: Run the QA gate on the recorded reviews and the open native evidence obligations.

## Advisory

- Use manifestInputs inside inventory() at the next touch of release-candidate.mjs so the manifest
  normalization has one implementation.
- The SD phrases the Codex binding as equality with the candidate commit; the implementation proves the
  same exact source through git ancestry with an evidence-only diff. QA confirms that reading.
- No Context Graph impact: context_graph_impact none; memory_target scope_artifact (run evidence).
