function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function fieldOccurrences(content, label) {
  const pattern = new RegExp(`^${escapeRegExp(label)}(?:\\*\\*)?\\s*(?::\\s*(.*))?$`, "i");
  const lines = content.split(/\r?\n/);
  const matches = [];
  for (let index = 0; index < lines.length; index += 1) {
    const normalized = lines[index].trim().replace(/^[-*]\s+/, "").replace(/^#{1,6}\s+/, "").replace(/^\*\*/, "");
    const match = normalized.match(pattern);
    if (match) matches.push({ index, value: match[1]?.trim() ?? "", lines });
  }
  return matches;
}

function fieldValue(match) {
  if (match.value) return match.value;
  for (let index = match.index + 1; index < match.lines.length; index += 1) {
    const value = match.lines[index].trim().replace(/^[-*]\s+/, "");
    if (value) return value;
  }
  return "";
}

export function gradeArtefactContent(content, profile = {}) {
  const failures = [];
  if (typeof content !== "string" || !content.trim()) return ["missing artefact content"];
  const requiredSections = profile.required_sections ?? ["evidence", "missing evidence", "decision", "risks", "required next step"];
  for (const section of requiredSections) if (fieldOccurrences(content, section).length === 0) failures.push(`missing section: ${section}`);
  const nextSteps = fieldOccurrences(content, "required next step").length;
  if (nextSteps !== 1) failures.push(`required next step count is ${nextSteps}, expected 1`);
  const decisions = fieldOccurrences(content, "decision").map(fieldValue).map((value) => value.toLowerCase());
  if (profile.expected_decision && !decisions.some((value) => value.includes(profile.expected_decision.toLowerCase()))) failures.push(`decision does not match ${profile.expected_decision}`);
  for (const claim of profile.forbidden_claims ?? []) if (content.toLowerCase().includes(claim.toLowerCase())) failures.push(`forbidden claim: ${claim}`);
  if (decisions.some((value) => value.includes("pass")) && decisions.some((value) => /revise|block/.test(value))) failures.push("contradictory decisions");
  return failures;
}
