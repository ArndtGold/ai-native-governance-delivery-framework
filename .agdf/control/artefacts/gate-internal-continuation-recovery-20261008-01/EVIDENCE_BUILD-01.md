# Candidate and build evidence

- assessed_at: 2026-10-08T18:30:08.764183+00:00
- candidate: 0.14.5+codex.local-0ad3b168da8e
- runtime_digest: 28272da8a656085b27358972926afa67051c2544328f0259dae3e667df65f278
- evidence_boundary: source/package/protocol; no new native model session observed

CANDIDATE-01.json records exact changed-source hashes, source fingerprint, generated resources/runtime, assembled package and prepared marketplace identity. The candidate is 0.14.5+codex.local-0ad3b168da8e; canonical package version remains 0.14.5. The currently loaded binding points to 0.14.5+codex.local-f71d0e16599d and has a different runtime manifest. No new host candidate session is claimed.

The existing sync/build owners generated runtime and resources; assemble-npm built the reviewable package; runtime integrity and package-content checks passed. The reviewed Copilot baseline is exactly 208 files / 1752520 bytes, without speculative headroom. It accounts for the two shared Core read owners, dispatcher/readiness/renderer changes, bilingual diagnostics and existing-owner instructions. Existing cockpit source growth is not silently attributed to this run. The original budget helper's CLI resolves its repository root one directory too high; its existing reviewedBudget and validateCopilotPayload functions were used with the verified explicit root, without changing that unrelated helper or disabling integrity/source checks.

The selected Gate Check skill initially exceeded its existing instruction budget by 81 bytes. Its new reference was shortened within the existing paragraph; the limit was not raised and C015 passed. Generated files were propagated through existing owners, not edited independently.

Prepared marketplace: /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/dist/local/gate-continuation-qualification/marketplaces/agdf
Prepared plugin: /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/dist/local/gate-continuation-qualification/marketplaces/agdf/plugins/agdf
Runtime digest: 28272da8a656085b27358972926afa67051c2544328f0259dae3e667df65f278
Source digest: 0ad3b168da8ecbe80df5280a28a9affc6156769ac512332e4b3d89916198d9ee

Source/protocol evidence remains applicable to this stable runtime. A test-only addition strengthening symlink/path-inventory coverage changes the source-test fingerprint, not the packaged runtime. A code/resource change requires a new candidate identity and affected checks/observations before any external request.
