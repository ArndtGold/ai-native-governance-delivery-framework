# UR: Safe Legacy Profile Upgrade Recovery

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-09-01 after same-run, same-gate and revision revalidation
Date: 2026-09-01
Owner: Arndt Gold

## 1. Problem

An AGDF-owned and internally consistent 0.13.8 Claude/Codex marketplace could not be upgraded by the
public 0.14.3 installer. Version 0.14.3 requires the current complete distribution-profile contract,
so the older contract was rejected before its ownership, provenance and payload integrity could
authorize a safe rebuild. The supported uninstall command removed the Claude registration but
retained the shared marketplace, leaving the same blocker in place.

After the owned marketplace was removed transactionally, Claude installation encountered a second
recoverable Windows failure: a stale installer-owned temporary cache directory caused `EPERM` during
the final cache rename. Removing only that temporary entry and retrying completed the verified
0.14.3 installation.

The current behavior protects against unknown state, but it also blocks a legitimate upgrade and
forces expert manual recovery.

## 2. Goal

Allow a verified AGDF-owned installation using an explicitly supported historical profile contract
to upgrade safely to the current canonical payload. Preserve fail-closed handling for unknown,
unowned, malformed or tampered installations, and recover deterministically from bounded
installer-owned Windows cache rename failures.

## 3. Scope

- Recognize only explicitly versioned historical distribution-profile contracts.
- Require coherent AGDF ownership, semantic version, installation provenance, manifests, runtime
  digest, source digest and marketplace digest before migration.
- Rebuild the replacement exclusively from the current canonical payload; never copy historical
  plugin files into the new stage.
- Use the existing atomic stage, backup, commit and rollback transaction.
- Add bounded retry and cleanup for stale installer-owned Claude cache temporary directories when a
  Windows rename fails with `EPERM`.
- Keep installation, loaded-session evidence and AGDF gate approval as separate authority planes.
- Add positive upgrade, tamper, rollback, host-failure and Windows cache-contention evidence.

## 4. Non-Goals

- Accepting arbitrary incomplete or future profile contracts.
- Trusting an installation from version strings or paths alone.
- Deleting unowned, ambiguous or user-created files.
- Weakening provenance, digest, marketplace or runtime validation.
- Claiming loaded-host success, UAT, release or cross-platform parity from repository tests.
- Publishing, committing, pushing or releasing automatically.

## 5. Acceptance Signals

The need is ready for Brownfield Review when:

1. a known valid historical profile can be distinguished from malformed or tampered state;
2. migration authority requires complete ownership and integrity evidence;
3. the replacement contains only current canonical content;
4. every failure before commit restores the exact prior owned installation;
5. Windows recovery touches only installer-owned temporary cache entries and uses bounded retries;
6. successful installation still requires host restart and fresh-session evidence; and
7. approval of this UR authorizes only Brownfield Review, not implementation.

## 6. Existing Sources Of Truth

- `create-agdf/lib/runtime/plugin-provenance.js` owns distribution-profile and provenance validation.
- `create-agdf/lib/installers/local-marketplace.js` owns marketplace classification and atomic
  replacement.
- `create-agdf/lib/installers/plugin-installers.js` owns Claude and Codex host-command sequencing and
  rollback.
- `create-agdf/lib/fs-swap.js` owns bounded Windows rename retry for AGDF-owned filesystem swaps.
- `create-agdf/scripts/local-marketplace-test.js` owns marketplace migration, tamper and rollback
  fixtures.
- The `agdf-cross-host-runtime-integrity`, `windows-native-install-viability` and
  `agdf-copilot-plugin-integration` runs are evidence sources, not authority for this new scope.

## 7. Risks And Unknowns

- Historical compatibility could become an unintended permanent downgrade path.
- A broad cache cleanup could delete valid Claude state.
- Claude CLI cache behavior may differ across versions and platforms.
- Shared Claude/Codex marketplace ownership requires migration without breaking either registration.
- Brownfield Review must decide whether profile migration and Claude cache recovery form one bounded
  change or separate delivery slices.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
