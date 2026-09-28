# Copilot host observation

Date: 2026-09-28
Status: `unobserved` for fresh-session behavior
Installer: local `install:copilot -- --plugin-only` completed and reported plugin version `0.14.5`.
Generated payload: 108 files, 1,029,788 bytes; reviewed growth was 2,953 bytes with no new files.

Observed host capability: `copilot` is not on PATH. The AGDF installation status returns
`spawnSync copilot ENOENT` and cannot inspect a loaded plugin version. `gh extension list`
could not proceed because GitHub CLI authentication is absent. No Copilot session, prompt
response, Brownfield artefact, or direct acceptance exists.

Required next step: make the supported Copilot CLI available and authenticated, start a fresh
session, then record relevant and low-impact cases with loaded-plugin provenance.
