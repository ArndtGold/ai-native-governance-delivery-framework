// Observe an authored technical result, never decide or approve QA. Status may
// also be lifecycle metadata (draft/done); Decision is always a result claim.
export function readReportDecision(text) {
  if (typeof text !== 'string') return null;
  const results = new Set();
  for (const [, field, raw] of text.matchAll(/^(?:- )?(decision|status):[ \t]*([^\r\n]*)$/gimu)) {
    const value = raw.trim().replace(/^`([^`]+)`$/u, '$1').toLowerCase();
    const result = value === 'passed' ? 'pass' : value;
    if (['pass', 'revise', 'block'].includes(result)) results.add(result);
    else if (field.toLowerCase() === 'decision') return null;
  }
  return results.size === 1 ? [...results][0] : null;
}
