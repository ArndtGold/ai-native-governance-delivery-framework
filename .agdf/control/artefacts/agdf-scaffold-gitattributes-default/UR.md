# UR: Ship The AGDF_RUN.md Merge-Union `.gitattributes` Entry Via `init` To Every Consumer Repository

Status: draft
Gate: UR
Gate approval: open
Date: 2026-07-10
Owner: agent

## 1. Problem

`agdf-run-md-merge-strategy` added a `.gitattributes` entry (`.agdf/control/AGDF_RUN.md merge=union`)
and an Operating Rules bullet to `plugin/control/README.md` for this repository only, by explicit
Non-Goal. Every other repository that adopts AGDF via `npx --yes @agdf/cli@latest init` (or `codex`,
`codex-repo`, `claude`, `opencode-repo`) still has no protection against the exact concurrent-edit
conflict risk on `AGDF_RUN.md` that this repository just hit live in this session — they would have to
independently discover and apply the same fix.

## 2. Goal

Make the same `merge=union` protection for `.agdf/control/AGDF_RUN.md` a default part of what `init`
(and the surface-specific bootstrap commands that call it) writes into a target repository, so every
AGDF-adopting repository gets the same conflict reduction without needing to know this incident
happened here.

## 3. Scope

- Extend `create-agdf/bin/create-agdf.js`'s scaffold-writing logic to also write a `.gitattributes`
  entry for `.agdf/control/AGDF_RUN.md merge=union` during `init` (and the commands that call it).
- Handle the case where the target repository already has a `.gitattributes` file non-destructively —
  reuse the existing precedent already in this codebase for exactly this situation (`AGENTS.md` →
  `AGENTS.agdf.md` fragment; `opencode.json` → `opencode.agdf.json` fragment): append via a fragment
  file with clear merge instructions, never silently overwrite or blindly append into an existing file.
- Update `create-agdf/package.json`'s `files` allowlist if a new template file is added.
- Extend `plugin/control/README.md`'s existing bullet (already added in `agdf-run-md-merge-strategy`)
  to state that `init` now writes this automatically, rather than describing it as a manual step only.

## 4. Non-Goals

- No change to the merge-strategy choice itself (`union`, not a custom driver) — already decided and
  evidenced in `agdf-run-md-merge-strategy`'s Brownfield Review.
- No attempt to solve true simultaneous editing of the same active run by two people at once — same
  boundary as the prior UR.
- No retroactive migration tooling for repositories that already ran `init` before this change; they
  can re-run `init` or apply the entry manually, consistent with how other scaffold additions are
  handled today.

## 5. Acceptance Signals

- A fresh `init` run in a clean target directory produces a `.gitattributes` with the
  `.agdf/control/AGDF_RUN.md merge=union` entry.
- An `init` run against a target directory that already has a `.gitattributes` file does not overwrite
  or corrupt it; the AGDF entry lands in a clearly-named fragment with explicit merge instructions,
  matching the existing `AGENTS.agdf.md`/`opencode.agdf.json` precedent.
- `create-agdf/scripts/smoke-test.js` and `test-routing.js` cover both cases (no existing
  `.gitattributes`, and pre-existing `.gitattributes`) and pass.
- `plugin/control/README.md`'s existing bullet is updated to reflect that `init` now writes this
  automatically.

## 6. Existing Source Of Truth

- `create-agdf/bin/create-agdf.js`: `agdfFragmentPath = "AGENTS.agdf.md"`,
  `openCodeConfigFragmentPath = "opencode.agdf.json"`, and the `existsSync(...) && !force` branching
  around line 644/678/779/839 — the established non-destructive-merge pattern to reuse.
- `.gitattributes` (this repository, added in `agdf-run-md-merge-strategy`) — the exact line to
  propagate.
- `plugin/control/README.md` — already carries the manual-step bullet to be extended.
- `create-agdf/scripts/smoke-test.js`, `create-agdf/scripts/test-routing.js` — existing test surfaces.

## 7. Risks And Unknowns

- Fragment-file naming for `.gitattributes` needs its own decision (e.g. `gitattributes.agdf` — a
  literal `.gitattributes.agdf` dotfile may be easy to miss; Brownfield Review/SD should confirm the
  most visible naming, consistent with how `AGENTS.agdf.md` stays discoverable).
- This is a `create-agdf` npm package behavior change affecting every downstream adopter, not just this
  repository — needs the same package-file-allowlist and packed-content verification rigor already used
  for other scaffold changes (e.g. `agdf-delivery-path-search`'s Brownfield Analysis).
- Whether existing installed versions of `create-agdf` in other repositories should be told to re-run
  `init` is a documentation/communication question, not a code question — out of scope unless
  Brownfield Review says otherwise.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
