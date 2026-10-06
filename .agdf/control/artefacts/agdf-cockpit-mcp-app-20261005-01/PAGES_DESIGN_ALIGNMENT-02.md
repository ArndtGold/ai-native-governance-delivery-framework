# Pages design alignment — current implementation checkpoint

- Run: agdf-cockpit-mcp-app-20261005-01
- Source control revision: 47 / b7a89b40-0db8-45da-91e4-41a552c2906a
- Scope: requested alignment of existing compact, list, Run and document presentation; approved UR/PRD/SD/TP stay byte-identical.
- Status: scoped implementation and automated/browser qualification pass; current native reload is still open. No formal CR, QA or UAT conclusion.

## Cause and owners

Actual native source/DOM inspection showed that the host's important html/body font-family rule defeats the earlier root declaration. Local and inline Inter/JetBrains assets already existed. The application now sets the shared font on its own containers below that host boundary. There is no global important override or CSP relaxation.

Canonical Pages tokens now own the typography scale, weights, line heights, tracking and spacing alongside existing colors/fonts/radii. The generator feeds both Tailwind and the shared CSS projection. Cockpit style.css owns component geometry/type; theme.css maps palette, state and focus colors only. Legacy duplicated geometry/type rules were removed. Original Pages logo and race image remain in the shared head; document branding stays quieter. Host theme adaptation remains effective.

Expanded body/document content uses 16px, supporting text 14px, technical identifiers 12px with JetBrains Mono, and consistent 20/24/30px heading roles. Document paragraphs/list items have a 78ch upper bound. Shared spacing, fields, buttons and visible focus match the Pages source. Existing navigation, adaptive detail mode, close action and context-transfer semantics remain unchanged.

The new browser regression exposed a real 6px Run overflow at 320px from a long diagnosis code. Wrapping in disclosure summaries, status fields and context reference headings fixes its origin; no page overflow is merely hidden.

## Evidence

PAGES_DESIGN_VERIFICATION-02.json preserves source hashes, unchanged approvals, all 32 geometry observations and final prepared startup/UI identities. UI 59, HTTP five and all five actual browser journeys pass, as do Pages landing/build, typecheck, both UI builds, configuration and both actual stdio protocol eras. Generated design-token synchronization and git diff whitespace checks pass.

The font regression reproduces an important host body rule through same-origin CSS while preserving production CSP. All four views render Inter and load both shared fonts. Each view is checked in light/dark at 320/560/800/1280px, with no horizontal page overflow. The fixture's canonical source bytes remain unchanged and no external requests occur. Narrow list diagnostic entries are visually-hidden accessible table headings, not visible page overflow. Browser failure-path and navigation journeys remain passing.

context-evidence/pages-*.log preserves final checks; selected pages-*.png files preserve matrix screenshots. PAGES_REAL_CARD-02.png and PAGES_REAL_DOCUMENT-02.png are the actual exact-Run local browser preview, not native Codex acceptance. The user-facing read-only browser preview remains deliberately open at http://127.0.0.1:52667/card.html.

## Prepared runtime and actual-host boundary

The final owned local preparation copied the current UI and startup together. Only the verified own configuration was temporarily handled and restored byte-identically; no unrelated config/process was changed. Final UI digest: sha256:e8c49c2f08e66db806821ee0e4b737baaa1945321021051898b55d20c143bf12. Server digest: 18487936a6b65525905b0cd9da3b1e62fc87eade18c73b2cfdd1bf538646dbcb. Both stdio eras pass on this exact tuple. The existing chat's single exact-Run opening attempt returns Transport closed. Restart/reopen Codex and then open a fresh card to qualify native rendering. Earlier native product evidence remains historical with its own exact bytes.

The earlier production context was subsequently received in model context (context_id 489c145c-089b-459f-a7b3-fd82d170475b; source revision 46), including the exact Run, UR and explicit graph node. This extends acknowledgement evidence to observed model arrival; it is not final QA/UAT or answer-quality acceptance and is not a reason to resend the question.
