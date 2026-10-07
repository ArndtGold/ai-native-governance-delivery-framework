# Backlog order and linked UR title impact

Date: 2026-10-07. Reviewer: Codex implementing agent; cooperative review, not independent assurance.

## Request and conflict

The user explicitly requests newest stored backlog rows first within each area and the corresponding linked UR heading as the displayed list title. The refined request retains a backlog-only initial read with bounded lazy UR reads for visible rows, rather than a writer-maintained duplicated title. SD section 4.1 currently states: No file read/evaluation is performed merely to decorate an overview row. Section 4.1.1 also forbids linked artefact reads for rows. TP T003/SCN-061 therefore cannot authorize the additional read operation. Earliest affected source is SD.

## Upstream applicability

UR/PRD still require identifiable canonical sources, bounded passive reads, explicit Run choice, readable supported surfaces and separate observation/authority. PRD section 8 explicitly delegates concrete APIs and source capacity to SD. No new user, acceptance criterion, writer, context publication, message action or effective gate rule is introduced. AC-001/002/003/007/008/009/010 cover presentation, stored-versus-effective state, passive reading, races/failures and compatibility. Existing Brownfield and UX owners and first journey remain applicable; the design must stay at the existing Core capture seam, not create a second title database.

## Resolved design boundary

Initial snapshot reads only MASTER_BACKLOG. Reverse the original row order separately in Active, Planned and Archive; do not alter source order or claim chronology from file timestamps. Counts and stored status/next step are backlog facts. Once visible, request up to twelve server-issued row selectors in one serialized title batch. Resolve exactly one explicit UR-labelled relative Markdown link per requested row using shared backlog link normalization and existing safe capture containment; reject ambiguous, malformed, remote, encoded escape and symlink targets. No Run discovery, Run evaluation, inferred UR path or recursive links. Capture complete bounded original bytes, extract the first real H1 outside fenced code/frontmatter/comments as passive text, remove a leading UR: only for display and disclose title provenance. Missing/unsupported/oversized titles fall back locally to original backlog title without losing membership/counts.

Every title batch replaces the one current immutable capture with backlog plus its bounded requested URs, returns fresh matching backlog identity and row selectors, and preserves independent views and unchanged four-view/64 MiB/256 MiB limits. If backlog changes during or between reads, refuse mixed identities and require refresh. Previously observed title metadata may stay only in a bounded in-memory UI cache labelled as observed stored content, never current gate evidence or transferable context. Refresh/new backlog digest clears it. Search covers stored backlog facts and already loaded title metadata only, with an honest visible scope note; no hidden full-UR search. No durable title projection/write route is added.

## Retained implementation and evidence

SCOPED_READ_IMPLEMENTATION-13.md, HOST_SCOPED_FEASIBILITY-16.json, BACKLOG_UI_EVIDENCE-17.json and BACKLOG_VISUAL_EVIDENCE-18.json retain dated scoped implementation/native/browser observations. Current production already has passive stored backlog projection, three-area UI/search and direct selected Run reads. This title/order change is not implemented. Existing code/tests remain and require renewed TP qualification; no historical evidence or Git index is rewritten. Full CR/QA/UAT/OR and broader TP obligations remain open.

## Renewed qualification

TP must explicitly distinguish backlog-only start from bounded visible UR-title transitions, include safe link forms and first-heading extraction/fallback, exact dependency instrumentation and fixed capacity, current/backlog-change/late-response isolation, independent views and no-write observations, search scope, reverse ordering in all areas, keyboard/navigation and Pages light/dark narrow/wide rendering, both private adapters and fresh exact native runtime/UI tuple. No automatic source/context question is included.
