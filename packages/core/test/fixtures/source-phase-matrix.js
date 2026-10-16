// One test-case inventory shared by the CLI/Core/MCP fixtures and CI partitions.
export const SOURCE_PHASE_MATRIX = Object.freeze({
  UR: ['PRD', 'SD', 'TP', 'CD+Tests', 'QA', 'UAT'],
  PRD: ['SD', 'TP', 'CD+Tests', 'QA', 'UAT'],
  SD: ['TP', 'CD+Tests', 'QA', 'UAT'],
  TP: ['CD+Tests', 'QA', 'UAT'],
});
