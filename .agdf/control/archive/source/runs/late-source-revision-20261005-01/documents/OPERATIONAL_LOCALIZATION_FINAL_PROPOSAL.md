# Exact operational localization correction

Run: late-source-revision-20261005-01. Proposed, not applied.

The complete shared plan passed through the source/CLI/SD tests, then failed its unchanged operational string scan: the analytical route blocker and the prohibition on skipping renewed source approvals lacked registered locale mappings. The two existing policy strings are now registered in en/de. The unchanged operational localization tests pass. The normal workspace guard correctly reports 200 files / 1,686,414 bytes against the last approved 1,685,700 limit.

Exactly +714 bytes, no new payload files, no reserve. Proposed max_files=200, max_bytes=1686414. Normal isolated full build passes; existing compatibility recorder passes all 56 cases. The complete unchanged frozen repository shared plan passed all 20 stages with exit 0. FINAL_SHARED_VERIFICATION.json pins candidate identity, all stages and the complete log digest. Actual blocked status cards pass en/de/fr-CA; MCP cold p95 658.503 ms <=1500 and warm p95 561.292 ms <=1000, 20 samples each. Only macOS Node 22 is observed; the three required remote CI lanes and installed native-model behavior remain unverified.

The five saved exact production changes are the numeric baseline, three matching generated compatibility files and one new immutable observation. All before/after hashes and saved bytes are in OPERATIONAL_LOCALIZATION_FINAL_PROPOSAL.json and proposals/operational-localization-final. Earlier approved refreshes and observations are preserved. No verifier, source approvals, original design run, live native evidence, VCS or installed cache changes. The approved TP requires the separate exact numeric decision and protects the three generated files.
