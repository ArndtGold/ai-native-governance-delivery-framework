# User Requirement: Sharpen create-agdf README For First Contact

## Work Item

- key: `create-agdf-readme-first-contact`
- title: Make the create-agdf README a clear first-contact guide without losing its technical reference value
- status: approved
- approval: `Approval: UR`

## User Need

The `create-agdf` README should help a new reader understand AGDF's purpose, fit and first successful setup before presenting the full command reference. It must retain the current precise runtime boundaries and surface-specific setup guidance, while making the recommended starting path, source-of-truth boundaries and contribution/operating links easier to find.

## Acceptance Criteria

1. The opening explains purpose, intended users, practical value and when AGDF is not the right level of process.
2. A concise Quick Start gives a first-time reader one clear, safe starting path and points to surface-specific alternatives without presenting every command as equally primary.
3. The existing command/target reference remains complete and factually unchanged unless a correction is evidenced.
4. Surface-specific installation preserves the distinction between Codex/Claude plugins, OpenCode's global npm/native-skill layer and repository-local governance surfaces.
5. Runtime, automation and governance boundaries remain explicit and do not overstate enforcement, compliance, autonomous correctness or release authority.
6. Readers can find the authoritative runtime/source documentation, publishing information and contribution, license and security/support guidance through concise links or clearly stated boundaries.
7. Existing validation for documentation/package assets passes; no CLI behavior, package metadata, generated runtime asset or release workflow changes are introduced.

## Scope Boundary

In scope: `create-agdf/README.md` structure, introductory and navigational copy, Quick Start framing and links to existing authoritative project material.

Out of scope: CLI behavior, command/flag syntax, generated assets, plugins, control-state runtime, package metadata, licensing terms, new contribution policy, security process, publishing workflow, commit, push, pull request or release.

## Evidence And Approval

- source discussion: README review in this Codex task on 2026-07-14
- observed gap: the current README is a strong technical reference but begins with a long undifferentiated command list and lacks a clear why/fit/first-success path plus contribution/security guidance.
- approval: `Approval: UR` received on `2026-07-14`
