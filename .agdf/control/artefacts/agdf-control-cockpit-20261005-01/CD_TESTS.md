# CD+Tests: Local read-only AGDF control cockpit

Status: done
Run: agdf-control-cockpit-20261005-01
Based on: approved TP (sha256:a796f192780d1ad7837dd860728d9dcbd4254ca01b573487a8e027775e282e3f)

## Implemented result

Private packages/control-ui implements an explicitly bound loopback read service and three German React views. Core owns immutable capture, scoped read seams, existing rule evaluation, target/approval integrity, projected DTOs and registered resources. Native CLI/MCP reads remain the default. No browser control writes, approvals, dispatch or Git execution exist.

## Task completion and evidence

T-001 preparation is recorded in BROWNFIELD_ANALYSIS.md. T-002/T-003 are control-read snapshot/provider and native-default seams; snapshot/provider logs and actual approved-run parity prove the boundary. T-004 is the Core projection/manifest with projection fixtures. T-005 is loopback/session/static/API/worker mediation with HTTP tests. T-006/T-007 are the React reducer, validated client, passive documents and visible freshness/retry/focus handling, verified by DOM and Chromium journeys. T-008 is the private exact-pin lockfile package with clean installation, typecheck, build and payload exclusion. T-009 executed all affected regressions and reviewed the actual implementation; formal review records follow the existing CR/QA owners. T-010 documents and executes local reproduction, pointer/keyboard navigation and full control-tree invariance.

All 32 approved TP scenario references resolve to EVIDENCE records. There are 26 new automated tests (10 Core, 5 HTTP/worker, 8 UI and 3 browser) plus ten passing existing suites. File-count/per-file/aggregate limit arithmetic uses scaled synthetic boundaries; actual preview/response limits and real repository capture are separate integration proof. Commands/logs, observed results and source fingerprints are preserved; screenshots came from the closed browser observation windows before recording evidence in this control tree.

## Operational observations

The observed real tree had 111 runs, 2739 files and 48,417,688 captured bytes. Actual capture/projection/related-read observation took approximately 4.9 seconds on this host during parallel validation; this is a dated observation, not a performance guarantee. Two existing runs reference resources outside .agdf/control and appear explicitly resource_denied; the reader does not widen the boundary. All normal read journeys preserved complete control membership and bytes. Mutations and hostile documents were tested only in temporary fixtures.

## Limits and disclosure

Only current local macOS/Node/Chromium source/package behavior is evidenced; no cross-OS host installation, publication, UAT or measured time saving is claimed. Node 22.22.3 and exact dependency pins are recorded by the lockfile/build logs. npm ci used --ignore-scripts; no dependency lifecycle execution is required by the successful build. The existing language/config repair remains independent and preserved. This document is implementation/test evidence, not the final QA decision or human approval.

## Evidence

- EVIDENCE/source-fingerprints.json
- EVIDENCE/regressions-results.json
- EVIDENCE/playwright-results.json
- EVIDENCE/real-approved-run-parity.json
- EVIDENCE/package-build.json and EVIDENCE/local-reproduction.json
- EVIDENCE/browser-*.png and all criterion-linked scenario records

Next step: canonical Code Review and supporting Task Plan/Clean Implementation Reviews, then qa-gate.
