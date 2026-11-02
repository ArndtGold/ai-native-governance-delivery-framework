# Baseline comparison

- assessed_at: 2026-10-08T18:30:08.764183+00:00
- candidate: 0.14.5+codex.local-0ad3b168da8e
- runtime_digest: 28272da8a656085b27358972926afa67051c2544328f0259dae3e667df65f278
- evidence_boundary: source/package/protocol; no new native model session observed

BASELINE-01.json was captured before source edits, including HEAD, dirty-path inventory and affected-file SHA-256 values. The original PRD suite passed before edits because it asserted the missing-UX terminal behavior (baseline-prd.log). compare-baseline.mjs reconstructs the other original source paths from that captured HEAD and checks their bytes against every recorded baseline hash before execution. Its source comparisons were executed after edits; they are not historical host timing observations or a full baseline model chain.

| Condition | Original source result | Candidate source result | Evidence |
|---|---|---|---|
| Required UX absent | terminal | UX owner continuation | baseline-comparison.json missing |
| Wrong Decision field | terminal | exact-field correction through UX owner | baseline-comparison.json malformed |
| Explicit UX blocked | terminal | terminal | baseline-comparison.json blocked |
| Valid normalized QA implementation obligation | terminal | approved-scope implementation continuation | baseline-comparison.json qa |
| Explicit status with internal next action | promises ongoing work | names next permitted action | baseline-comparison.json status |

The comparison uses injected synthetic control/target dependencies and the actual baseline/candidate service and renderer code. It does not prove native execution, approval provenance or wall-clock improvement. The packaged candidate chains separately exercise canonical writers and actual evaluation.

Invocation mistakes are separate: the first comparison harness omitted expectedVersion and was rejected before evaluation. The corrected harness supplies the declared version. Native fixture preparation initially used QA instead of QA_REPORT as the recording destination type; the writer rejected it without manufacturing a receipt. Corrected setup uses the declared existing type. These are harness mistakes, not product baseline findings.
