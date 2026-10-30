// Template prompts and status-only values that never count as authored content. Pure, so the
// run inventory and other `node:`-free readers share the same rule.
const prompts = new Set(['describe the trustworthy outcome.', 'what outcome should become possible?',
  'which tp tasks are fully done, partially done or not done?', 'what remains unverified?', 'which risks remain and what is their impact?']);
export function isDecisionContentPlaceholder(value) {
  if (typeof value !== 'string') return true;
  const text = value.trim().replace(/^`([^`]+)`$/u, '$1').replace(/\s+/gu, ' ').toLowerCase();
  return !text || prompts.has(text) || /^(?:todo|tbd|<[^>]+>|(?:draft|done|ready|blocked|pass|revise|block)(?:\s*\|\s*(?:draft|done|ready|blocked|pass|revise|block))+)$/.test(text);
}
