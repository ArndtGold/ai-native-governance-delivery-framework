# Canonical AGDF Logo Reuse

- Date: 2026-10-06
- User request: use agdf-logo.svg under pages.
- Canonical source: pages/public/assets/agdf-logo.svg; SHA-256 c0fdfed70c7df833e53498406fad85c1fe4c76e830588527c3c539792cad49df; source unchanged.
- Shared presentation component: packages/control-ui/src/BrandMark.tsx imports this original asset with Vite's inline query; no copied logo or parallel source.
- Compact card and browser brand use the same component. Display uses 34px square in the card and object-fit contain; decorative image has empty alt beside the existing AGDF heading.
- MCP build embeds a data:image/svg+xml URI; no logo network request or added CSP origin. Private UI remains self-contained.
- Typecheck, production MCP build, owned-runtime MCP stdio matrix and git diff --check passed. No new test mirrors the asset-only change.
- Browser layout preview reloaded at the existing localhost address. Image complete=true, embedded=true, correct aspect ratio and visible original symbol observed; LOGO_PREVIEW.png records this layout evidence.
- Latest UI: 622856 bytes; sha256:7d2e4b033524bab36816b6a5d706f9293b1a21a20f0bed5af50786afb528192b. Server digest: 1d674697f36967ffafa194b40cde450fb74f6eb095f875648d4a1511d78a133a.
- Owned runtime updated through the existing preparation/provenance writer, with original project configuration preserved. This refresh found no matching named process to stop.
- This is browser layout/build/protocol evidence, not new native Codex context/message proof. T-006 remains open and the prior host connection gap is not cleared by this logo change. CD+Tests remains in_progress; no QA/UAT/OR or VCS action.
