# Planned URs and legacy cutover

New projects use `control_layout: "planned-urs-v1"`. Each planned need lives in
`.agdf/control/planned/<plan_id>/UR.md`, with exactly one initial `Planning schema:
planned-ur-v1`, `Planning id:` and `Planning priority: high|normal|low` scalar.
The existing UR template and `ur-definition` owner apply in both planning and Run
mode. The entire canonical file supplies source identity; edits require its digest.
Planning remains UR-only, may save incomplete clarification and grants no approval.

Core supports this without an extension. The optional **AGDF Planning** Codex
package organizes dialogue and delegates every write and readiness check to Core.
It contains no second runtime/MCP server, UR template, control engine or saved list.
Its supported qualification target for this change is Codex CLI; repository tests
do not establish native support for Desktop/Cockpit or another host.

## Core CLI

Use an explicit absolute project directory. A new capture derives its identity
from the original UUID; the human supplies a need rather than a technical ID.

```sh
create-agdf init --dir /absolute/project
create-agdf planned --dir /absolute/project --action list
create-agdf planned --dir /absolute/project --action create --evidence /absolute/UR.md --priority high --operation <uuid>
create-agdf planned --dir /absolute/project --action inspect --plan-id <returned-plan-id>
create-agdf planned --dir /absolute/project --action replace --plan-id <id> --source-digest <inspected-sha256> --evidence /absolute/updated-UR.md --operation <uuid>
create-agdf planned --dir /absolute/project --action start --plan-id <id> --source-digest <inspected-sha256> --operation <uuid>
```

Replacement edits the same file and keeps its planning identity. Starting requires
a complete, clarified UR and deliberate selected-source handoff. Exactly one Run
receives its initial unapproved UR and immutable `PLANNED_UR.md` /
`PLANNED_ORIGIN.json`. Retrying the original UUID returns that Run; a later start
of the same source also refers to it. After transfer, planning writes reject edits;
active source revision belongs to the Run. Normal UR review/approval still follows.

`inventory` combines planned needs and canonical Runs. Planning order is priority,
normalized title and identity; Runs retain existing Core ordering. Transferred
sources are references on the resulting Run, not another undertaking. Readers
never repair, migrate or persist a list. Partial/malformed/unavailable sources stay
visible separately from empty inventory. Cockpit source selectors are opaque,
snapshot-bound and read-only; planning views have no gate approval action.

## MCP and authoring

The fixed groups remain. `agdf_inspect` exposes `planned-inventory`,
`planned-entry`, planning-scoped `authoring-inputs` and original operation status.
`agdf_record` exposes `planned_material.stage`, `planned_ur.create` and CAS
`planned_ur.replace`; `agdf_run` exposes `run.create_from_planned`.
Use operation-contract for the exact variant and all required envelope fields.
Planning uses `planning: {plan_id, expected_digest}` instead of Run/revision;
mixed scopes and cross-source material grants are rejected. Material/source caps
remain 128 KiB, chunks 16 KiB, requests 64 KiB. Read all authoring input pages.

Dispatch the existing `ur-definition` with explicit planning scope. Run mode and
gate semantics retain their owners. Missing capability is a dependency diagnosis,
not permission to construct a runtime, use shell fallback or fabricate a Run.

Install the extension deliberately after compatible Core:

```sh
create-agdf codex --package planning --plugin-only
codex plugin remove agdf-planning@agdf-planning
```

Core metadata must expose `planned-ur-v1` protocol 1. Fresh-session tool capability
checks additionally detect disabled or missing Core. Removing the extension does
not remove Core or project control. Neither planning nor native tests authorize a
global installation, authentication change, release or Git operation.

## Existing projects

An absent `control_layout` retains historical `master-backlog-v1`; an unknown value
blocks writes. A config edit alone is not a migration. Preview/apply/recover are
explicit commands owned by control-maintenance:

```sh
create-agdf layout-migrate --dir /absolute/project --action preview
create-agdf layout-migrate --dir /absolute/project --action apply --operation <uuid> --preview-digest <sha256> --confirmation 'Migrate planned layout: <sha256>'
create-agdf layout-migrate --dir /absolute/project --action status --operation <original-uuid>
create-agdf layout-migrate --dir /absolute/project --action recover --operation <original-uuid> --pending-digest <inspected-sha256>
```

Equivalent typed `agdf_project` kinds are `planned_layout.preview/apply/recover`.
MCP preview pages bind the complete document digest and source snapshot. Decode
and read all pages; a stale cursor is rejected. Every row, original priority/link,
unknown row, prose and unparsed span is accounted for. Explicit unique links may
associate a Run; title/key similarity never does. Usable explicit legacy URs are
preserved as source snapshots and imported as open drafts. Missing/ambiguous
associations, unreadable sources and custom priorities remain visible. No old
status or approval is promoted to a new decision.

Apply requires all writers upgraded/quiescent and a complete unblocked preview.
The bounded synchronous cutover supports at most 256 Run locks per project and
a 32 MiB transaction journal; oversized proposals are refused without truncation.
It freezes new admission, drains independent in-flight operation claims, preserves
raw original backlog/config/Run/source bytes, then audits active genuine sealed v2
Runs to v3 with a new revision and `control_layout.migrate` receipt. Ended v2 Runs
remain byte-exact/read-only. Genuine unsealed ended v2 is explicitly retained as
unverified history; its declarations are not promoted to trusted approvals. An
unsealed active Run or changed/invalid seal still blocks cutover. Existing
approvals/source history are retained.
Old pending journals/creation stages must be resolved before cutover. Old approval
presentations become stale when the Run revision advances.

Immutable snapshots and row dispositions live under
`.agdf/control/maintenance/planned-layout/<source-digest>/`. The configuration
change is the global commit point selecting the planned layout. Normal Run writes already leave retained legacy backlog bytes untouched in both layouts. Run-only legacy projects without a backlog are supported; its absence is bound by omission of that known optional path from the source manifest and rechecked before effects.
Before commit, recovery restores only exact known owned effects; after commit it
finishes the original operation. Unknown/foreign bytes or ownership stop recovery
and retain the freeze. No timeout authorizes removal of a claim or marker.

Ordinary v3 Run operations use the selected resource lock and strict v6 journal,
with no backlog member or shared backlog lock. Another Run's validated v6 journal
does not exclude independent work. Legacy journals 1–5 retain frozen semantics.
The old 0.20.2 parser rejects v3, and its direct creation requires the now-absent
mandatory backlog. This is cooperative compatibility, not protection against a
deliberately invoked old binary or manual filesystem edits.
