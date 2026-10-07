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

The same build also serves `/card.html` as an interactive compact browser format. Open it with the
current startup fragment (replace the startup URL's `/` with `/card.html` and preserve its fragment).
It uses the same authenticated read service and App instance as the full reader. After explicitly
selecting a run, `Run ansehen` expands that run. The expanded Run view offers `Zusammenfassung | Details`
only when its actual workspace container is at least 720px wide. Document views have no content switch;
their breadcrumb returns to the same Run and retains its selected content mode. Both buttons change the content
inside the same expanded surface: the summary shows the existing Run goal, status, open items and
Core next action; Details shows the Run's controls, sources and diagnostics.
Neither button requests a host display mode, remounts the reader or reads sources again. Narrowing below 720px returns to Summary; widening does not restore Details automatically; compact chat cards retain `Run ansehen` without this switch.
The native host owns returning to inline mode. Breadcrumbs identify navigation destinations.
The quiet top-right `Dokument schließen` icon uses the same document-to-Run route and restores focus
to the registered source. It remains available at narrow widths and has a 44px target and labelled tooltip.
Refresh lives with the observed data timestamp, gaining visible `Daten aktualisieren` text when stale.
The default `/` remains the full browser reader. Neither format is a static layout mock or evidence of
the native Codex MCP bridge.

Card, overview, run detail and document views share `BrandHeader` and its single stylesheet.
It reuses the original Pages logo and race-control image, project identity and read-only label.
The document variant uses a smaller logo/header and weaker decorative image. Content stays on plain
reading surfaces. Pages owns the palette, font families, type scale, line heights, weights and spacing
in `pages/src/design/tokens.json`; its Tailwind theme and the cockpit consume the same projection.
The app sets its font family on its own surface so host overrides on `html`/`body` cannot silently
replace Inter. JetBrains Mono identifies source IDs and code. Shared component layout/type lives in
`src/style.css`, palette/theme adaptation in `src/theme.css`, brand variants in `src/brand.css` and
compact-format layout in `src/mcp/style.css`. Expanded text and documents use the readable base scale;
compact cards and supporting labels use its smaller roles. Host light/dark and surface colors remain
adaptive. The font assets stay local or embedded, without additional font-domain access.

`Neu laden` obtains a new source view. Navigation keeps valid selection in memory; a removed run
returns to overview with an explanation. The service checks source membership/identity/digests before
related reads, and the browser checks every five seconds while visible and on returning to visibility.
The visible compact MCP card automatically re-reads a changed source view and its explicitly selected
run together. Gate, revision, approvals and next step therefore come from the same new view. It preserves
selection and keyboard focus; a removed run returns to overview without choosing another. Checks pause
when the document is hidden or the card leaves the viewport, and resume with a check on visibility return.
Without IntersectionObserver, document visibility is the fallback. Detection uses polling, not push,
so the normal delay is up to five seconds plus read latency. During refresh the previous data is labelled;
on failure it remains stale until deliberate reload/retry. Expanded run/document views retain deliberate
reload after change detection. Refresh never grants approval, continues delivery, publishes model context
or sends a message.
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

The browser worker accepts one running and one waiting request. Browser limits are 20,000 files, 256 MiB captured
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
node --test packages/core/test/cockpit-context-test.js packages/core/test/cockpit-session-test.js packages/core/test/cockpit-publication-test.js
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

## Embedded Codex reader and context handoff

The compact reader fills its available container. At widths of at least 640px it arranges
selection and run information in two columns; narrower cards remain stacked. Large inventories
offer temporary search by title, Run ID or gate without changing the inspected selection.
Collapsed inventory hints list the exact affected Runs and their registered source paths.
The browser card uses the same layout with a centered 1100px ceiling.
All reading views lead with the undertaking and source-backed orientation. The overview uses
the canonical human title as its selection link, retains the Run ID underneath and shows goal,
readable phase/status and reported open points. Its optional attention projection copies blocker,
missing approval and evidence count from the already captured Core evaluation; it adds no reads
or policy evaluation. Older snapshots without that projection show an explicit detail-check hint.
Run detail presents the title, objective, open evidence and reported next allowed action before
the original control/source disclosure. A persisted/Core discrepancy remains visible outside it.
Document views explain the registered document type and identify its undertaking while keeping
the original source content/language. Shared UI wording is owned by `src/presentation.ts` and
grants no authority or inferred business progress. Generic or unclear canonical titles are shown
as sourced; this presentation never rewrites approved requirements or invents a project-specific
next action. Narrow lists become stacked entries instead of forcing horizontal table scrolling.
When an explicit initial Run is successfully loaded and valid, the compact card hides the
inventory counts, search and selector. It shows the Run title/ID, gate, status and next step
directly. “Anderen Run wählen” reveals the existing picker and focuses its search or selector;
the inspected Run stays selected until the user chooses another. Closing the picker performs
no read. Overview opening retains the picker, as do missing, invalid or unavailable Run states.

The minimal actual-host feasibility checkpoint is recorded separately from final product
qualification. The source implementation now reads exact run-owned graph references and prepares
checked context packets. Final native qualification and human QA/UAT remain required; source tests,
protocol results and prior synthetic probes do not establish the complete host journey.

In an expanded Run or document view, open **Verknüpfter Kontext ansehen**. Core resolves only
semicolon-separated exact `CG-...` IDs or `.agdf/control/CONTEXT_GRAPH.md#CG-...` references from the
canonical run field. Optional backticks are supported. File-only, malformed, absent, ambiguous,
unreadable and oversized references stay visible; no links or related nodes are followed recursively.
Graph content is passive, using the same document renderer. The browser has the additive authenticated
GET `/api/context/<run_id>?snapshot=<snapshot_id>` route and no host-context/message operations.

For native handoff, first inspect a registered document. Select at most 16 available graph nodes;
each unavailable reference requires a deliberate exclusion decision. **Kontext übergeben** prepares
the exact inspected document plus selected nodes on the server, revalidating the capture before and
after composition. All provenance, included/excluded records and original source text count towards
the 64 KiB UTF-8 packet limit. Nothing is truncated. There are at most 64 explicit references. A new
preparation first acquires exclusive connection ownership, which must be released before another preparation. Each view retains at most one ephemeral packet; arbitrary content, paths or digests cannot
be supplied by the client. The acknowledged packet is available for inspection in the view.

Only after the host acknowledges that context does **Frage zu diesen Quellen senden** become available.
That separate deliberate action validates the packet again and submits a neutral question naming
its context ID, Run and source. Acceptance means the host accepted submission; it does not prove an
answer, approval or source correctness. An explicit rejection and an uncertain/lost acknowledgement
are shown separately. Questions are never automatically retried. Missing negotiated methods leave
the corresponding action disabled while sources remain readable.

Source/Run switches, refresh, observed staleness, visibility changes and teardown disable handoff
immediately and serialize server/host invalidation behind an already submitted bounded publication.
A new render in another view leaves existing views intact. Each immutable controller uses its own
session, while the existing Core service coordinates one exclusive publication owner per connection.
`invalidate_context` clears the owner packet and returns its pending opaque invalidation ID without
releasing ownership. Nonowners receive `host_publication_required: false` and send no host update.
A failed begin response also grants no host update. After the host acknowledges the own invalidation,
`complete_context_invalidation` checks the same session and exact token and releases ownership.
Repeated begin returns the same pending ID. One bounded receipt per live view permits completion-only
retry after a lost completion response; never repeat an acknowledged host update. A lost host
invalidation acknowledgement requires a fresh connection and actual host-context qualification.
Owner close, expiry or worker loss quarantines publication without disabling other views' reading or
available read slots. A still-active owner can complete its already pending acknowledged release.
No timer grants takeover. Metadata diagnostics expose no direct publication/message bypass.
Shutdown attempts cannot erase
historical messages or guarantee receipt after process loss. All packets remain timestamped,
non-authorizing observations; canonical governance independently checks a later requested action.
No packet or Run selection is restored from URL or browser storage.

Prepare with the existing owners from the repository root, using a supported Node executable:

```sh
npm --prefix packages/control-ui run typecheck
npm --prefix packages/control-ui run build:mcp
node --input-type=module -e "import {syncPackageAssets} from './scripts/sync-package-assets.js'; syncPackageAssets({surface:'codex'});"
node scripts/prepare-cockpit-local.mjs --dir /absolute/path/to/repository
node --test packages/core/test/cockpit-session-test.js packages/core/test/cockpit-publication-test.js
node --test packages/cli/scripts/codex-cockpit-config-test.js
node packages/cli/scripts/cockpit-mcp-test.js
```

The opt-in profile is `dist/local/codex-cockpit/`; its reviewable project snippet is
`codex-project-config.toml`. It uses an absolute Node/runtime/root and the separate connection name
`agdf-cockpit-local`. Install only that entry through the supported trusted-project
`.codex/config.toml` workflow, preserving any existing configuration. Global config and installed
governance remain separate. Review/read-back of configuration does not prove an app was rendered.
The current named runtime must be stopped and its project entry removed before replacing its runtime;
preparation refuses replacement while that named entry remains registered.

In a fresh host connection, invoke `agdf_cockpit` with
`{ "run_id": "explicitly-named-run" }` when the request identifies a Run for viewing or the
conversation already unambiguously establishes that Run with the user. In that conversation,
even “open the cockpit” must carry the established Run ID. Use `{}` only for an explicitly
requested overall overview or when no unambiguous conversation Run exists; ask which Run to
view when several could be intended. Never infer a Run from directory, recency or inventory.
The wire field remains optional to support overview access, not to permit dropping an
established conversation Run. The model-facing tool description is owned by
`packages/core/lib/control-inspect/cockpit-contract.js`; preparation publishes that same definition.
The ID is an ephemeral display request: the ordinary inventory and scoped Run read validate it
before display. Unknown/removed IDs retain their requested identity; no alternative is selected.
Opening publishes no model context, sends no question and grants no approval. Rendering another
view does not remount existing readers. Only a newer bootstrap in the same receiving view replaces
its own reader/controller and retires its captured old session; display-mode changes preserve selection. Prepare the updated schema
and HTML together and discover them in a fresh host connection.
Inspect the compact card, request a supported
larger mode and exercise a run, registered document, explicit graph selection and checked packet.
Use the separate deliberate question action only after context acknowledgement. Record actual host/version,
advertised capabilities/display result, visible outcomes and exact server/UI digests. The current
connection retains at most four active or retiring independent views. Each has its own capture,
registrations, deadlines and lazy worker. MCP capture is limited to 64 MiB per view (256 MiB aggregate);
worker old-generation is 256 MiB, with one active plus one queued job per view (eight aggregate).
The browser keeps its 256 MiB capture and 768 MiB worker old-generation defaults. Worker replacement
awaits predecessor termination; retiring sessions count until teardown. Fifth-view capacity rejection
does not evict a visible view. Only accepted own activity renews idle expiry (30 minutes); absolute
lifetime is eight hours. Foreign selectors and activity in another view do not renew it.
Expired MCP sessions show a specific reopening instruction and disable further reads through the
retired session. Reopen the cockpit in the chat with the same explicit Run ID; a fresh render
remounts the reader with the new session. Transient read failures instead retain the requested
route, so reload/retry reads that same Run or document rather than falling back to the overview.
Failures are explicit. No browser/protocol fixture substitutes for actual Codex UI evidence.

Rollback closes only this cockpit widget/server, removes only its named project entry and then
removes the owned profile after needed evidence is copied into the run directory. Remove a whole
project config only if it was created exclusively for this entry and its bytes still match the
registration receipt. Preserve foreign additions, the ordinary AGDF connection, shared runtimes
and any existing browser process. Final native qualification and full QA/UAT/OR remain open until recorded.

The embedded inline entry reads the existing inventory immediately. Selecting a run shows its
Core gate, persisted working state, open evidence and recorded approvals in a compact card.
The default work unit stays in one column: saved decision, current Core `control_assessment`,
and one registered-source action precede initially closed evidence and approval disclosures.
Doctor warnings are handled by Core gate evaluation; React adds no independent warning veto.
Missing assessment, stale observations and persisted/evaluated mismatches remain unconfirmed.
Original evidence and approval references remain available behind separate disclosures.
The source action preserves the selected Run and snapshot and requests expansion; if the host
stays inline, the registered document is readable in the card with a return to the work state.
The existing branded header and canonical Pages fonts, colors and spacing remain unchanged.
The shared React reading controller keeps that explicit selection when changing display mode;
there is no URL/storage-based run assignment. Missing or stale reads stay visible and require
refresh before opening a current detail view. Production context handoff remains separately qualified
from the earlier synthetic host feasibility probes.

Brand values have one owner: `pages/src/design/tokens.json`. The Pages Tailwind configuration
and the cockpit consume its generated `pages/src/styles/design-tokens.css` projection;
`node pages/scripts/design-tokens.mjs --check` checks drift. Both UI build paths regenerate it.
`pages/src/styles/fonts.css` owns the local Inter/JetBrains Mono faces, with verified files,
package provenance and OFL licenses under `pages/public/assets/fonts/`. Browser builds emit
local font assets; the MCP build embeds them in its single resource without font-domain access.
`src/theme.css` maps the shared palette to surface roles; the embedded layer respects the
host's light/dark theme and background/text variables. Its connection placeholder styles are
scoped separately, so they cannot override the compact card.

Run titles in the read projection prefer the bound UR heading and retain objective/run-ID
fallbacks. They do not change gate evaluation or approval receipts. In the compact view the
current action, prerequisites/control qualification and open evidence share the `WorkStep`
component. Stored approvals remain source facts; a missing approval, Core blocker, incomplete
read or failed control qualification cannot be hidden by those approvals. Evidence retains
its original description, impact and next-step fields, including unknown records. The view
does not infer whether an unclassified record is a prerequisite or an output of the current
step. Expanded views expose only registered current-step and Run State source selectors,
including summary mode; compact views disclose the same evidence beside Run navigation.
Lists group step and attention in one cell and lead to this same Run, without detail-level
approval claims from an inventory snapshot. General inventory warnings remain below the
selected run.

The shared branded header stays at the top while content scrolls inside the application,
including registered documents. Run context and refresh remain in that header. Its measured
height supplies scroll clearance for focused controls, including return to the source selector.
Expanded Run views use a sliding selection surface for Summary/Details from 720 pixels of
workspace width. Both labelled buttons retain keyboard and pressed-state semantics; reduced
motion suppresses the animation. Documents have no view selector. Narrowing the workspace
returns to Summary without changing the Run or read state; widening keeps Summary until the
user deliberately selects Details. Sticky positioning applies inside the app, not to the outer
Codex chat scroll container.

Read feedback has one shared owner across compact and expanded views. A source change retains
the selected Run and its previous facts; it does not imply that the Run is missing. Previous
read state qualifies the work-step and footer, and the registered sources remain available for
explicit refresh/navigation. Summary mode leads with the work unit. Original goal/identity
and evidence descriptions are disclosed without invented translation or classification; direct
registered evidence selectors remain visible.

Pages owns shared surface, controlled-surface and semibold link recipes in `pages/src/styles/surfaces.css`, consumed by its landing page and the Cockpit. The MCP host selects light/dark mode; its neutral color variables no longer replace AGDF brand roles. Cards and Run panels use the shared surface class; expanded documents share one reading surface with an integrated context access; the current work step uses the controlled variant. Expanded Run entry defaults to Summary; deliberate Details survives document navigation, and another Run starts in Summary. Browser checks compare computed recipes with isolated Pages reference classes under both themes and neutral host overrides, including text contrast.

Pages also owns the primary/secondary action recipes in `pages/src/styles/actions.css`.
Secondary actions stay transparent, including hover; primary actions alone use the filled
brand color. Document tiles use semibold titles and normal-weight descriptions and metadata.
Heading line heights come from the shared type scale. Expanded work-step padding is 24 pixels;
compact work steps and narrow panels retain 16-pixel padding. The standard expanded header is
72 pixels high and may grow to fit wrapped content. Compact controls use the shared spacing
scale. The browser component regression compares normal and hover styles with the actual
built Pages stylesheet in both themes, supplementing the surface/contrast and responsive tests.

Shared surfaces are neutral white / opaque dark-900, with dark-300 / dark-600 borders.
The shared canvas role is dark-100 / dark-950. Controlled work areas retain the same
neutral fill and use a three-pixel turquoise leading edge; this accent conveys work focus,
not approval or success. Browser checks assert surface separation and text/link contrast
across both themes, in addition to matching the Pages recipes.

The work unit leads with saved phase/decision and a separate Core-owned assessment. Supporting
evidence and saved approvals are folded in one column at every width. The UI never grants work
from approval counts, an empty evidence list or its own doctor-status veto. Registered current-step
sources lead, with Run State kept distinct. Unknown and stale observations retain their originals.

Document orientation reuses the first complete paragraph of one explicitly authored
`AGDF Approval Summary (de; source=en)` from the actual source. It rejects fenced/ambiguous or
oversized declarations and reports a missing summary instead of inventing or translating one.
The document status comes from the exact registered artefact row in the bound Run observation;
the existing Core assessment stays separate. Foreign target/snapshot/Run/resource/path bindings
cannot inherit status. Stale views show dated facts and unconfirmed current work. Source metadata
and passive exact originals start folded. Programmatic heading focus uses a visible underline;
interactive keyboard focus retains the Pages recipe. Approval labels and source actions are stacked.

Expanded document views group their heading, read feedback, source orientation, disclosures and context access on one neutral Pages surface. The centered reading surface is bounded to 80ch including padding, with symmetric gutters and a shared inner text edge. The context access remains a keyboard-accessible 44px text action; its content expands within the reading surface. Exact originals have no additional card frame or shadow inside that surface. The branded header is unchanged.
