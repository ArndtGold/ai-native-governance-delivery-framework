# Brownfield Analysis: linked UR list titles

Mode: pre_implementation_analysis
Decision: pass
Run: agdf-cockpit-mcp-app-20261005-01
Date: 2026-10-07
Reviewer: Codex implementing agent; cooperative source review

## Scope and evidence

Approved TP T-001 through T-012, especially SCN-084 through SCN-100. Exact source/index/dirty/diagram baseline in IMPLEMENTATION_BASELINE_UR_TITLES-21.json. Source reads: cockpit-backlog.js, cockpit.js, cockpit-contract.js, cockpit-session.js, control-read/snapshot.js/fs.js/cockpit-worker.js, UI App/state/api/types/Overview/useCardVisibility, MCP transport and HTTP service. Initial baseline collection exceeded its output buffer before writing files; corrected bounded collection and this analysis were persisted before implementation.

## Current coverage and owners

Partially done: dependency capture/freeze/replay/revalidation, direct Core Run/document/context, four view slots/exclusive publication, strict transports, three-area Overview and Pages UI. Dated checkpoints 13/16/17/18 remain historical; full host/QA and old test gaps remain. Not done: row selectors/title operation, unique explicit UR link/passive H1, reverse area order and visible title controller/cache.

Extend Core cockpit-backlog projection and shared markdownLink/resolvedBacklogLinkTarget, not generic evaluator or canonical writers. Existing snapshot owner needs optional contained-file observation that can record denied symlink metadata without following it, return per-source fallback/oversize, and revalidate recorded anchors; ordinary FS denial remains sticky, no live fallback. Missing/oversized title text is local fallback; capture/worker/aggregate/time/source race remains whole-scope failure. Core reader owns immutable replacement and opaque row selectors; worker/session/schema own private operation. Both HTTP/MCP delegate same semantics. UI common types/api/state validate fresh backlog parents/digest. App retains navigation ownership; a focused controller owns viewport batching/cache/cancellation. Freshness must avoid racing active title replacement; old responses cannot revive navigation. No duplicate reader/title database or writer projection.

## Risks, mitigation and next path

Risks: weakening sticky denial; old capture retained during candidate; forged rows discarding valid scope; title/freshness/navigation races; previous title cache portrayed as current/complete search. Approved SD4.1.2 resolves boundaries; use production read/worker/stdio and UI tests SCN084..100 plus prior source/packet/publication/transaction/default-profile regressions. Minimal Core and coordinated adapters/UI first, then exact build/runtime and early actual native feasibility. No new product/design gap found. Preserve diagram/index and approved sources. Existing canonical lock/revision/journal writes and Run-only approval/backlog limitation unchanged.

Context Graph impact: update_existing_node; reconciliation open_gap in existing run-owned nodes until verified curation. Planning creates no graph/memory record. Record preparation then scoped CD+Tests, no QA/UAT/OR claim or automatic accepted-question repeat. No delegation, Git or installation widening.
