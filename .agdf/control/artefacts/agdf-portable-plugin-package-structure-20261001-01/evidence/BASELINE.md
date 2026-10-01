# Implementation baseline

Captured on 2026-10-01 before implementation, at HEAD
`23665b773107170bc875edf52d6769c7c5c005f1`, run revision 12,
`9541d743-f180-4bd6-a7b2-76a88048f5d7`.

[BASELINE.json](BASELINE.json) records exact approved UR/PRD/SD/TP hashes,
task-relevant tracked source hashes and a temporary owned-input snapshot location.
All four approved hashes match their recorded approval evidence. Missing tracked files
remain missing in the snapshot. Snapshot restoration may affect only this task's
subsequent edits; the snapshot is never permission to overwrite unrelated changes.

[SOURCE_CONSUMERS_BASELINE.json](SOURCE_CONSUMERS_BASELINE.json) records all 2,603
tracked textual path hits, with current candidates, historical control, other-run
control, dated evidence and historical reviews separated. Hits require semantic
classification during T-005: host terminology and generated destinations are not
old canonical-source reads. No historical control or observation is to be rewritten.

The pre-existing deletion of `create-agdf/scripts/repository-control-startup-test.js`
and untracked files ending in ` 2` are unrelated. Exact existence/content hashes are
in BASELINE.json. `sync-plugin-runtime.js` recursively copies `lib/control-state`,
so its five untracked duplicate modules can enter runtime output; npm's `lib` inclusion
can also ship them. This is concrete package-evidence interference. Preserve these
files, report actual contaminated output, and do not silently clean them or relax
payload assertions. An isolated tracked-source fixture can establish deterministic
migration behavior, but cannot certify this workspace's actual package contents.
Any required affected check that remains blocked routes to an open QA evidence gap.

No product/build test, packed-output acceptance, installed-cache change or native
host observation is claimed by this baseline.
