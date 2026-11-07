# AGDF Control Scaffold

Explicit initialization creates `control_layout: "run-folders-v1"`. This is the only supported layout; Runs use control-state version 4. Missing, old or unknown layouts and Run versions are unsupported. Inspection preserves their bytes and reports the incompatibility. There is no migration, conversion, legacy projection, automatic reset or fallback.

## Current layout

```text
.agdf/control/
  config.json
  README.md
  SOT_REGISTRY.md
  CONTEXT_GRAPH.md
  AGENT_QUALITY_CONTRACTS.json
  BRAND.md
  templates/
  planned/<plan_id>/UR.md
  runs/<run_id>/
    RUN_STATE.md
    documents/                 UR, analyses, PRD, SD, TP, reviews, QA_REPORT, OR
    evidence/                  bounded supporting evidence
    control/
      presentations/           exact decision documents and optional preview snapshots
      RUN_STEP_PENDING.json    original operation intent, only while pending
    history/
      planning/UR.md           immutable handed-off planning source
      revisions/<operation_id>/manifest.json
      revisions/<operation_id>/files/
```

Configuration, templates and curated project context stay project-wide. A multi-Run closure preview is a target-wide decision proposal under `closure-previews/`; it changes no Run until deliberately applied. Run-owned outputs never use a separate top-level artefacts directory.

`BRAND.md` starts as a neutral English worksheet. Complete it with the project's
own design intent and declare the finished source in `SOT_REGISTRY.md` when it is
authoritative for design work.

`RUN_STATE.md` keeps identity, objective, mode and typed decisions, source bindings and operations. Approval status, current gate, current document references, relationship chains, evidence summaries and inventory are derived when read. They are not separately writable tables or a second state file. A binding embeds its reviewer attestation; no separate RECORD/REVIEW JSON repeats its mapping. A planned handoff records its source in the creation receipt and immutable planning snapshot, without an origin JSON copy.

Create a fresh scaffold in an explicitly confirmed existing Git repository:

```sh
create-agdf init --dir /absolute/project --language en
create-agdf doctor --dir /absolute/project --json
```

Initialization creates no Run or approval. `config` changes preferences through the existing configuration owner; it does not convert a store. Use current `run-create`, `run-step`, `run-present`, `run-approve`, `run-revise` and `run-close`, or their fixed MCP control groups. Read `operation-contract` for complete current inputs. Every mutation retains its original operation UUID and exact binding for replay; a successful historical receipt is not permission for a new effect.

Material staging is private and temporary. Record documents through the owning command, which publishes the file and canonical record together. Never edit a bound document or Run by hand and then reseal it. An allowed unapproved draft replacement needs current reviewed material and a fresh presentation. Approved source changes require the current source-revision preview and exact deliberate confirmation.

`doctor` and `gate-check` inspect integrity and current prerequisites; they do not create approvals. A prepared presentation binds exact reviewed material. Only a new deliberate reply to that presentation records a gate decision. The local cooperative seal detects unrecorded changes; it is not an independent signature or proof of human identity.

Planned needs are independent URs. The optional planning extension can author them; Core owns their admission, current inventory and explicit handoff. Planning neither starts a Run nor approves a gate. See [planned URs](planned-urs.md).
