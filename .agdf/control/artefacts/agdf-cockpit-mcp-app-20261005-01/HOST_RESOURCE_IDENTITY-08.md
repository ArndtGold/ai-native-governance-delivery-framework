# Native resource identity check

Run: agdf-cockpit-mcp-app-20261005-01. Source revision: 72 / 0942d805-4b08-419b-9d62-6fd17ce0107f. Observation: 2026-10-06T20:49:41Z and following reads. Status: T-012 remains open.

The MCP Apps backend exposes a third panel, init e6aee75b-2668-4b50-b9c8-bb3a61e83da4. It is an overview with last data time 2026-10-06 21:24:12 Europe/Berlin, disabled refresh, and explicit session-expired feedback. The observation time is more than 30 minutes later. This is consistent with the approved idle limit; no session-limit change or automatic renewal is justified.

The third panel's actual inline module hashes to 0f7d6964421de87699a8f6707fa45ddea03f11c1d2b2a4d49756cd67b215004f, the historical T-006 UI. The current prepared module hashes to a235f9db6ec72dbf9e747f964197d896d5ce439f241d6ca1e0ac7a845bae9421. Thus this panel cannot qualify the current production handoff controller.

The named live connection responds to resources/list, resources/read, and a fresh agdf_cockpit call with the exact conversation run_id. The resource read tool truncates its returned HTML representation; its first 23,000 characters exactly match the current prepared HTML. This proves the inspected prefix only, not a complete live-resource digest. The current prepared full resource digest remains sha256:2da0c09c9921220c127f782de0e7281f9243f5fe17246cc423175c92e2143e5f.

The fixed resource URI is ui://agdf/cockpit/v1.html. OpenAI's official UI guidance explicitly treats a resource URI as a cache key and requires a new URI for breaking HTML/JS/CSS changes: https://developers.openai.com/plugins/build/chatgpt-ui . Host resource caching is therefore a supported explanation for the old module; it is not yet established that a card newly opened during this observation also loads the old module. The fresh named card is still inline and absent from the backend panel inventory. The backend cannot expand inline cards.

If the fresh card also loads the old module, the durable candidate is a paired resource-contract version change: change the Core-owned resource URI, rebuild its manifest/HTML, update all references through existing composition, qualify the owned package, and reconnect tool/resource metadata together. SD.md line 85 currently binds the exact v1 URI, and TP forbids architecture/version fallback without the source revision route. This is a non-authorizing diagnosis and candidate, not a source revision, implementation permission or change to approved artefacts.

No new synthetic or production question was sent. The prior accepted synthetic question must not be repeated. No current app-only no-write window has started; bookkeeping is outside such a window. CD+Tests remains in_progress; no CR, QA, UAT, OR or host-currentness claim is added.
