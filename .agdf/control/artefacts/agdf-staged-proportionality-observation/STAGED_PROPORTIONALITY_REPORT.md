# AGDF Staged Proportionality Observation

- Status: `block`
- Evidenzgrenze: staged live routing observations with deterministic offline grading
- Profil/Protokoll: `staged-v2` / `2`
- Serie: `codex-gpt-5.6-sol-agdf-0.11.4-staged-v2-20260729-r3`
- Surface/Modell: `codex` / `gpt-5.6-sol`
- Runtime/AGDF/Adapter/Runner: `codex-cli 0.145.0` / `0.11.4` / `2.1.0` / `2.0.0`
- Freshness: `fresh`
- Beobachtungen: 216
- Coverage: 72/72 Szenarien aus 40 Fällen
- Stage-/Pfad-Szenarien: 40/40
- Kritische Under-Governance: 2
- Stage-Abweichungen: 3
- Pfad-Over-Governance: 7
- Small-Segment Over-Governance: 0/8 (0 %)
- Ambiguous/Stale/Incomplete: 8

| Szenario | Lifecycle | Soll-Stage | Stage-Konsens | Soll-Pfad | Pfad-Konsens | Status |
|---|---|---|---|---|---|---|
| PB-001:intake | intake | ungated_execution | ungated_execution | trivial_change | trivial_change | correct |
| PB-002:intake | intake | ungated_execution | ungated_execution | trivial_change | trivial_change | correct |
| PB-003:intake | intake | ungated_execution | ungated_execution | quick_task | quick_task | correct |
| PB-004:intake | intake | ungated_execution | ungated_execution | quick_task | quick_task | correct |
| PB-005:intake | intake | ungated_execution | ungated_execution | quick_task | quick_task | correct |
| PB-006:intake | intake | ungated_execution | ungated_execution | quick_task | quick_task | correct |
| PB-007:intake | intake | ungated_execution | ungated_execution | quick_task | quick_task | correct |
| PB-008:intake | intake | ungated_execution | blocked | quick_task | n/a | block |
| PB-009:intake | intake | ur | ur | n/a | n/a | correct |
| PB-009:post_brownfield_decision | post_brownfield_decision | n/a | n/a | compact_delivery | compact_delivery | correct |
| PB-010:intake | intake | ur | n/a | n/a | n/a | block |
| PB-010:post_brownfield_decision | post_brownfield_decision | n/a | n/a | compact_delivery | compact_delivery | correct |
| PB-011:intake | intake | ur | ungated_execution | n/a | n/a | block |
| PB-011:post_brownfield_decision | post_brownfield_decision | n/a | n/a | compact_delivery | compact_delivery | correct |
| PB-012:intake | intake | ur | ur | n/a | n/a | correct |
| PB-012:post_brownfield_decision | post_brownfield_decision | n/a | n/a | compact_delivery | compact_delivery | correct |
| PB-013:intake | intake | ur | ur | n/a | n/a | correct |
| PB-013:post_brownfield_decision | post_brownfield_decision | n/a | n/a | compact_delivery | compact_delivery | correct |
| PB-014:intake | intake | ur | ur | n/a | n/a | correct |
| PB-014:post_brownfield_decision | post_brownfield_decision | n/a | n/a | compact_delivery | compact_delivery | correct |
| PB-015:intake | intake | ur | ur | n/a | n/a | correct |
| PB-015:brownfield_candidate | brownfield_candidate | n/a | n/a | verified_change | verified_change | correct |
| PB-016:intake | intake | ur | ur | n/a | n/a | correct |
| PB-016:brownfield_candidate | brownfield_candidate | n/a | n/a | verified_change | n/a | block |
| PB-017:intake | intake | ur | ur | n/a | n/a | correct |
| PB-017:brownfield_candidate | brownfield_candidate | n/a | n/a | verified_change | n/a | block |
| PB-018:intake | intake | ur | ur | n/a | n/a | correct |
| PB-018:brownfield_candidate | brownfield_candidate | n/a | n/a | verified_change | verified_change | correct |
| PB-019:intake | intake | ur | ur | n/a | n/a | correct |
| PB-019:brownfield_candidate | brownfield_candidate | n/a | n/a | verified_change | verified_change | correct |
| PB-020:intake | intake | ur | ur | n/a | n/a | correct |
| PB-020:brownfield_candidate | brownfield_candidate | n/a | n/a | verified_change | n/a | block |
| PB-021:intake | intake | ur | ur | n/a | n/a | correct |
| PB-021:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_slice | structured_slice | correct |
| PB-022:intake | intake | ur | ur | n/a | n/a | correct |
| PB-022:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_slice | n/a | block |
| PB-023:intake | intake | ur | ur | n/a | n/a | correct |
| PB-023:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_slice | structured_slice | correct |
| PB-024:intake | intake | ur | ur | n/a | n/a | correct |
| PB-024:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_slice | structured_slice | correct |
| PB-025:intake | intake | ur | ur | n/a | n/a | correct |
| PB-025:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_slice | structured_slice | correct |
| PB-026:intake | intake | ur | ur | n/a | n/a | correct |
| PB-026:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_slice | structured_slice | correct |
| PB-027:intake | intake | ur | ur | n/a | n/a | correct |
| PB-027:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_slice | structured_slice | correct |
| PB-028:intake | intake | ur | ur | n/a | n/a | correct |
| PB-028:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_slice | n/a | block |
| PB-029:intake | intake | ur | ur | n/a | n/a | correct |
| PB-029:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_slice | n/a | block |
| PB-030:intake | intake | ur | ur | n/a | n/a | correct |
| PB-030:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_slice | structured_slice | correct |
| PB-031:intake | intake | ur | ur | n/a | n/a | correct |
| PB-031:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_delivery | structured_delivery | correct |
| PB-032:intake | intake | ur | ur | n/a | n/a | correct |
| PB-032:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_delivery | structured_delivery | correct |
| PB-033:intake | intake | ur | ur | n/a | n/a | correct |
| PB-033:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_delivery | structured_delivery | correct |
| PB-034:intake | intake | ur | ur | n/a | n/a | correct |
| PB-034:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_delivery | structured_delivery | correct |
| PB-035:intake | intake | ur | ur | n/a | n/a | correct |
| PB-035:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_delivery | structured_delivery | correct |
| PB-036:intake | intake | ur | ur | n/a | n/a | correct |
| PB-036:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_delivery | structured_delivery | correct |
| PB-037:intake | intake | ur | ur | n/a | n/a | correct |
| PB-037:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_delivery | structured_delivery | correct |
| PB-038:intake | intake | ur | ur | n/a | n/a | correct |
| PB-038:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_delivery | structured_delivery | correct |
| PB-039:intake | intake | ur | ur | n/a | n/a | correct |
| PB-039:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_delivery | structured_delivery | correct |
| PB-040:intake | intake | ur | ur | n/a | n/a | correct |
| PB-040:brownfield_candidate | brownfield_candidate | n/a | n/a | structured_delivery | structured_delivery | correct |
