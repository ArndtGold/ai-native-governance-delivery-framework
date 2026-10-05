# AGDF Control Cockpit

Private local React application for reading one explicitly selected repository's `.agdf/control`.
The interface is German; documents retain their source language. Overview → run detail → registered
document and back share an observed source version. Gate evaluation comes from existing AGDF Core.

## Local use

From the repository root, with Node 22.12+ in the 22 line, Node 24+, or another newer line supported
by the pinned tool engines:

```sh
npm --prefix packages/control-ui ci
npm run sync-package-assets
npm --prefix packages/control-ui run typecheck
npm --prefix packages/control-ui run build
npm --prefix packages/control-ui run start -- --dir /absolute/path/to/repository
```

Open the exact startup link shown by the process. It includes a bootstrap fragment copied
into browser memory and immediately removed from the address bar. The service binds only to
`127.0.0.1` and defaults to an available OS-assigned port. Optionally specify `--port 4380`.
Stop with Ctrl+C; the worker/listener close and the process session expires. A full browser reload
needs the current startup link again because no session secret is saved in browser storage.
Do not share the startup link or copy its secret into diagnostic evidence. Startup never installs
a host plugin, opens a browser automatically, or selects a repository from the working directory.

`Neu laden` obtains a new source view. Navigation keeps valid selection in memory; a removed run
returns to overview with an explanation. The service checks source membership/identity/digests before
related reads, and the browser checks every five seconds while visible and on returning to visibility.
Changed or failed data is explicitly marked as previous/stale until deliberate reload/retry succeeds.
An observation does not lock external writers or promise future freshness.

## Read boundary

Only registered control resources are offered via opaque run/snapshot-scoped IDs. Markdown is passive,
images/unknown links remain inert, JSON/text are escaped, and binary/invalid UTF-8/missing/oversized
sources keep identity and an availability explanation. Evaluator-only captured files are not
automatically registered browser resources. Explicit non-control artefact references may therefore
make an existing run unavailable for complete captured evaluation; the cockpit does not widen its
filesystem boundary to hide this limitation. Source repair happens outside the cockpit.

The captured Core read provider isolates bytes, config, discovery, seals and approval binding identity
without replacing Core rules. Ordinary CLI/MCP readers retain their live behavior. Git-based
verified-change observations are explicitly unavailable in the browser's no-child-process read lane.
Persisted run statements, lifecycle, evaluation, QA/UAT and approval records are presented separately.
The UI cannot write files, create runs, submit approvals, dispatch agents, or execute Git.

One worker accepts one running and one waiting request. Limits are 20,000 files, 256 MiB captured
bytes, 32 MiB per captured file, 2 MiB document preview, 8 MiB serialized API response and ten seconds
per queued/active read request. Symlinks/special files are rejected. A capture retries at most once
after mutation; exhausted limits are explicit failures, never silent truncation or a successful empty list.
Cancelling a running read drops its response while allowing bounded worker completion; a timeout
terminates/replaces the worker and requires a new snapshot. No permanent snapshot or browser database exists.

## Verification

Build before service/browser tests. Browser tests use the Chromium version matched by Playwright;
install it locally if it is missing (`npm --prefix packages/control-ui exec -- playwright install chromium`).
No installed-host or cross-OS verification is implied by source tests on one machine.

```sh
node packages/core/test/control-read-snapshot-test.js
node packages/core/test/control-read-provider-test.js
node packages/core/test/control-cockpit-projection-test.js
npm --prefix packages/control-ui test
npm --prefix packages/control-ui run test:browser
```

Fixtures are temporary; browser mutation/retry/removal scenarios do not edit the real repository.
The real repository journey compares every control entry and file digest before/after the closed
observation window. Test reports/screenshots are written outside the control tree. Source and test
evidence is distinct from final QA or a measured time-saving claim.

React dependencies and built assets remain in this private package, outside public CLI/plugin/MCP
payloads. Shared Core source/runtime additions use the existing synchronization/integrity pipeline
and measured payload budget. `dist`, browser reports and local dependencies are ignored.
