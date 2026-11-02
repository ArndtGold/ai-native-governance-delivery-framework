# Planned URs in the current Run model

New projects use `control_layout: "run-folders-v1"`. Each planned need lives in
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
receives its initial unapproved `documents/UR.md` and immutable
`history/planning/UR.md`. The creation receipt owns its origin binding; no separate
origin JSON is written. Retrying the original UUID returns that Run; a later start
of the same source also refers to it. After transfer, planning writes reject edits;
active source revision belongs to the Run. Normal UR review/approval still follows.
The planning-local `TRANSFER.json` is a transfer receipt protecting the source
from reuse after its Run becomes unavailable. It is not origin authority or a
maintained inventory; an unconfirmed marker is reported rather than trusted.

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

## Current-format boundary

Only explicit `run-folders-v1`, version-4 Runs and current wrapped operation
records are supported. Older layouts and record versions are reported as
unsupported without mutation. There is no layout migration or legacy fallback.
Use a fresh target for current work; preserve unsupported data separately.

A handoff publishes one unapproved Run with documents/UR.md and the exact
immutable history/planning/UR.md snapshot. Its creation receipt binds that source;
no separate origin JSON or current-pointer table is maintained. Replay keeps the
original UUID and selected source digest. Pending recovery validates its captured
owned files before completing or rolling back the original effect.

Current Run mutations use independent Run/resource locks and wrapped version-7
journals. Another valid Run journal does not exclude unrelated work. Unknown
ownership, unsupported journals or changed bytes stop recovery without deletion.
