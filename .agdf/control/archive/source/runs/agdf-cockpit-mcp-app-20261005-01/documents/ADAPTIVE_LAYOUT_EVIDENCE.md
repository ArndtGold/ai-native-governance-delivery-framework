# Adaptive cockpit layout evidence

Date: 2026-10-06. Run: agdf-cockpit-mcp-app-20261005-01.

## Executed scope

Shared compact reader now fills its container; browser card uses a centered 1100px ceiling. Header minimum reduced from 96 to 76px, tighter vertical spacing, one read-only label. Container queries at 640px arrange search/selection and run/status evidence in two columns, retaining stacked narrow layout. Expanded embedded detail uses its own container width rather than the outer viewport. Canonical Pages logo, image, fonts and theme owners remain shared.

Search is temporary component state for inventories above twelve runs. It filters title/run ID/gate without navigation, persistence or automatic selection; inspected selection remains available even outside search results. Collapsed inventory notice reports the exact affected count and lists registered source paths with explicit diagnostic navigation. Current inventory has two resource_denied entries among 112 runs, not 112 invalid runs. No source repair or approval is performed.

## Checks

- TypeScript noEmit pass. Browser and self-contained MCP builds pass; built resource 981773 bytes, sha256:8a7d2da0b7f2c2b33c3aea1f3be40286431c448627645e275111c102f605b9ea.
- Existing plus two meaningful UI regressions: 20/20 pass. Search cannot choose a run or erase its inspected identity; partial inventory exposes affected sources and explicit diagnostic read. Existing focus, generation, freshness and retained-view assertions remain enabled. One stale copy assertion was updated to the deliberately shortened introduction; race behavior assertion unchanged.
- HTTP/read-worker suite 5/5 pass. Initial sandbox attempt blocked socket binding with EPERM; focused rerun with loopback permission passed.
- Actual interactive browser reader: manual run selection, inventory expansion, Run ansehen, registered UR document, back to detail and card passed.
- Card observed at 320, 560, 800 and 1280px; detail at 320, 800, 1280px; document at 320 and 800px. All scrollWidth equals viewport width. Card columns at 800px: 426/284px; at 1280px: 606/404px. Detail columns at 800px: 370/370px. Exact geometry in ADAPTIVE_LAYOUT_OBSERVATIONS.json; screenshots ADAPTIVE_CARD*.png.

## Review and limits

Cooperative diff review: canonical transport/read ownership unchanged, search has no read or writer side effect, filtered selection retained, notices preserve partial state and source/code provenance, container rules do not alter default browser rail. No new font/image owner or external connection. Browser observations qualify layout/reading only. Updated native resource not activated in this change; current prepared MCP runtime/config preserved to avoid interrupting the restored native connection. Native screenshot supplied by user demonstrates the previous resource renders, not the new layout or context/message methods.

## Requested next contract change

Optional initial run_id in agdf_cockpit conflicts with the exact approved SD empty object. No run-parameter implementation was performed before revision. Bound SD revision will retain UR/PRD intent, invalidate dependent SD/TP approval and require renewed TP plus preparation/implementation evidence.
