// One test-case inventory shared by the CLI/Core/MCP fixtures and CI partitions.
export const SOURCE_PHASE_MATRIX = Object.freeze({
  UR: ['PRD', 'SD', 'TP', 'Brownfield Analysis', 'CD+Tests', 'QA', 'UAT'],
  PRD: ['SD', 'TP', 'Brownfield Analysis', 'CD+Tests', 'QA', 'UAT'],
  SD: ['TP', 'Brownfield Analysis', 'CD+Tests', 'QA', 'UAT'],
  TP: ['Brownfield Analysis', 'CD+Tests', 'QA', 'UAT'],
});
