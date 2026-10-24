# Autofix observations, 2026-10-24

## QA normalization

The serving dispatcher reports AGDF 0.14.5 with matched provenance. Its normalized-gap reader
rejects required_next_step values beginning with none even on resolved findings. The current
repository reader permits none for a resolved finding. No installed runtime or private profile
was changed. The QA owner replaced its resolved TPR-103 action with a concrete preservation
instruction; renewed Code/Clean/TP reviews preserve the earlier resolutions in historical files
and use compatible concrete actions. Core accepted the reviews and now routes QA follow-up to
evidence rather than blocked. Findings were not reclassified to bypass a gate.

## Compatibility projection

The full local verifier stopped at compatibility-freshness with source_snapshot_changed.
The prescribed build:prepare and compatibility:record/check regenerated derived outputs and
passed 56 scenarios with zero failures, fingerprint
ba5213c3a1bf45901b1bc12ced48d216b06f3cdc4314613c83f51816ffe34cdb.
The generated report changes fixture observation platform from Windows to this Mac; the
imported native Claude records stay attached to their original Windows tuple. No synthetic
fixture result is promoted to native qualification.

## Build cleanup recovery

The first preparation published the new assembly.json (owner agdf:npm-assembly, version 0.20.0)
and then spent several minutes removing the previous ignored output. lsof identified
 dist/.npm-stage-9JVPdL-previous/create-agdf 2/generated/.opencode
as its open directory. Only our own assemble-npm process was terminated; this interrupted
attempt remains in compatibility-refresh.log. The remaining old directory was not deleted by
a separate cleanup command. The normal preparation was rerun against the fresh output;
assembly passed in 3.3 seconds and the complete preparation/record/check command exited 0.
The old ignored output is outside candidate identity and is not a native work-tmp directory.

## Project-wide Delivery Map

The resumed canonical verifier passed transactions and stopped at delivery-map with exit 2.
delivery-map-all.json confirms the selected release Run's map status is pass. The aggregate
contains a foreign invalid entry gate-semantic-review-enforcement-20261023-01, a foreign PRD/UR
relationship conflict, two foreign missing QA/TP relationships and incomplete objectives in
other Runs. These foreign objectives and decisions were not invented or edited. All later
canonical stages are being executed separately; their results cannot erase this failure.

## Remaining execution boundary

No Windows executor is exposed in this chat. The requested Windows import has not occurred.
A reviewed transfer ZIP and exact record review are prepared. Existing no-commit/no-push,
immutable-case and original-candidate restrictions remain in force. An imported evidence tree
cannot be declared a clean final release snapshot by ignoring those restrictions.

## Empty-directory cleanup

The invalid gate-semantic-review-enforcement-20261023-01 entry was inspected: an empty real
directory, no RUN_STATE.md, no files, no symlink and no tracked paths. rmdir removed exactly that
empty directory. No existing foreign Run source, approval, state or other content was removed.
The CLI smoke failure was caused by copying this empty entry into its fixture; its failed attempt
remains in verify-ci-after-delivery-map.log. The failed MCP chain and remaining CLI commands are
retried without changing tests or weakening the production inventory check.

## Final bounded verification disposition

LOCAL_VERIFICATION.md supersedes progress wording above. The empty invalid entry was removed;
the selected release Delivery Map passes, while three genuine foreign relationships and thirteen
incomplete objectives remain. Canonical assembly was rerun for incomplete derived output. Pages
checks pass. The broad supplemental CLI retry was stopped and remains incomplete, with its actual
passed subsets retained. The complete verifier is not green. No foreign governance decisions or
native evidence were altered to change that result.
