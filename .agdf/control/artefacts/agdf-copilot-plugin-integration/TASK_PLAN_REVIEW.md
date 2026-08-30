# Task Plan Review: Plugin-Only AGDF Integration for GitHub Copilot

Decision: pass
Revision: 2
Date: 2026-08-30
Reference: approved `TP.md` revision 2

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CPI2-T01 | fully_done | `copilot` owns the existing plugin handler; registry/help/runtime-check tests reject `copilot-plugin` and `both` before mutation. | none | none |
| CPI2-T02 | fully_done | Scaffold plan and presentation no longer contain Copilot or combined branches; Codex, OpenCode, init and config smoke coverage passes. | none | none |
| CPI2-T03 | fully_done | `release:prepare` retains root manifest, `copilot-skills/**`, hook, contracts and runtime while package tests reject obsolete root Copilot repository assets. | none | none |
| CPI2-T04 | fully_done | `npm run install:copilot` delegates to `copilot`; local orchestration, exact version and exit-code tests pass. | none | none |
| CPI2-T05 | fully_done | `test:copilot-repository-retention` preserves user fixtures byte-for-byte across install, update, status, rejected disable, uninstall and failure. | none | none |
| CPI2-T06 | fully_done | Lifecycle, consent, routing, Agent Skills, package, Runtime Integrity and aggregate smoke suites pass against plugin content. | none | none |
| CPI2-T07 | fully_done | Root, install and package READMEs plus CLI help use the public `copilot` command; local contributor command remains `npm run install:copilot`. | none | none |
| CPI2-T08 | fully_done | Pages shows Copilot as an installable plugin, renders the canonical command and passes build plus landing regression. | none | none |
| CPI2-T09 | fully_done | Release preparation, focused suites, package build/content, Runtime Integrity, 66/66 skill evals, aggregate smoke and `git diff --check` pass. | none | none |
| CPI2-T10 | fully_done | Local install verified `agdf@agdf` `0.13.8`; official pinned CLI lists local Marketplace `agdf`. Existing direct hook execution remains valid; fresh post-update app session is explicitly pending restart. | Fresh post-update loaded-session observation is unavailable in this terminal run. | warning only; no loaded-session overclaim |
| CPI2-T11 | fully_done | Task Plan, Clean Implementation and Code Review pass; Context Graph and run evidence are reconciled. | none | none |

## Summary

- fully_done: 11
- partially_done: 0
- not_done: 0
- out_of_scope_changes: none; unrelated product-maturity-roadmap changes remain excluded
- risks: fresh Copilot app loading and native Linux/Windows parity remain separate host-evidence obligations
- required_next_step: prepare QA evidence without claiming QA pass
