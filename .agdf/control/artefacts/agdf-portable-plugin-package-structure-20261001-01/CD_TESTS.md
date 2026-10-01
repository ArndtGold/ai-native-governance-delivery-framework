# CD+Tests — portable package and local Codex installation

Run: agdf-portable-plugin-package-structure-20261001-01
Date: 2026-10-01
Revision: 3
Status: done

Approved UR/PRD/SD/TP bytes are unchanged. Prior staged migration and duplicate-cleanup evidence remains under evidence/ and evidence/duplicate-remediation/. This correction addresses QA-I001 within T-003/T-006/T-008; the user additionally authorized the active Codex installation and its correction.

Existing local marketplace owner now projects the same source-derived install identity into portable root and Codex fallback. Shared provenance and standalone integrity normalize only owned version fields, enforce exact root identity, and retain hashing of every other field. Canonical generated/public/package and Claude versions remain 0.14.5. Three older version fixtures now include the root manifest; assertions and rollback checks were retained.

## Fresh verification

Eight package/runtime groups pass: local-development-install (includes release preparation), local-marketplace, runtime-integrity-layout, runtime-integrity-negative, codex-plugin-mcp, copilot-profile, local-preparation, package-contents. Root-version drift and root-description tampering fail integrity as required; same-source installation remains idempotent.

Actual normal npm pack with scripts enabled produced all three 0.14.5 archives: 642/5/9 files. Unpacked root/fallback versions match canonical 0.14.5; unpacked shared-runtime integrity passes; every actual Copilot inventory size/hash matches (136 files / 1274994 bytes). No removed supplemental module/build-only templates appear; package exports and exact dependencies resolve.

The shared provenance module grows by exactly 332 bytes; the measured Copilot baseline records only that addition, retaining 136 files and no spare headroom. Prior duplicate cleanup did not relax its limit.

npm run install:codex exits 0. Codex plugin list independently reports installed/enabled 0.14.5+codex.local-d4ca33a48e88. Actual installed root/fallback versions match and installed runtime integrity passes (10 skills / 16 control files). Host discovery, hook trust/execution and fresh model/session behavior remain unverified; installer requires restart/fresh session.

Evidence: evidence/codex-install-remediation/{CHECKS,INSTALLED,INVARIANTS,PACKED_OUTPUTS,PACKED_PROFILE_CHECKS}.json and logs. Temporary archive tooling used a task-owned npm cache after a sandbox cache-write failure and adjusted extraction/JSON decoding for Python 3.9/npm lifecycle output; production packing succeeded. Externally created commits 8becf22 and 3abf3b4 were observed, without VCS actions by this execution; correction source hashes still match the successful verification snapshot.

Required next step: mandatory refreshed Code Review, Clean Review, TP Review and sole qa-gate. No QA/UAT approval, publication or fresh-host claim inferred.
