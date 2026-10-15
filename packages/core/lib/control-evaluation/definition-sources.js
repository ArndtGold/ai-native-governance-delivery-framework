import { readFileSync } from '../control-read/fs.js';
import { hasSymlinkComponent, containedRegularFile } from '../control-state/contained-file.js';
import { artefactFileDigest } from '../control-state/run-seal.js';
import { extractField } from './verified-change.js';

export const UX_DECISION_FORMAT = Object.freeze({ declaration: '- decision: ready | blocked | not_applicable', values: Object.freeze(['ready', 'blocked', 'not_applicable']), readiness_value: 'ready' });
export function inspectUxIntentDecision(content) {
  const decisions = [...content.matchAll(/^- decision:[ \t]*(.*)$/gmu)], decision = extractField(content, 'decision');
  return { decision, well_formed: decisions.length === 1 && !!decision, supported: UX_DECISION_FORMAT.values.includes(decision), ready: decisions.length === 1 && decision === UX_DECISION_FORMAT.readiness_value };
}

// Read-only facts shared by authoring consumers. Facts never grant correction permission.
export function inspectDefinitionSources(root, state, runId, gate, sourceTypes) {
  const sources = [];
  const issue = (code, path, expected, observed, repairable = false) => ({ sources, issue: { code, path, expected, observed, repairable } });
  const output = `.agdf/control/artefacts/${runId}/${gate}.md`;
  if (!state || hasSymlinkComponent(root, output)) return issue('unsafe_destination', output, 'contained non-symlink output', 'unsafe');
  for (const type of sourceTypes) {
    const path = String(state.artefacts.get(type)?.path ?? '').replace(/^`|`$/gu, '');
    const file = containedRegularFile(root, path);
    if (hasSymlinkComponent(root, path) || file.status !== 'valid') return issue('source_unavailable', path, type, file.status);
    sources.push({ type, path, digest: artefactFileDigest(root, path) });
  }
  const reviewSource = sources.find(source => source.type === 'Brownfield Review');
  const review = reviewSource ? readFileSync(containedRegularFile(root, reviewSource.path).path, 'utf8') : '';
  if (extractField(review, 'ux_intent_definition_required') === 'yes') {
    const canonical = `.agdf/control/artefacts/${runId}/UX_INTENT_DEFINITION.md`;
    const analysis = state.artefacts.get('UX Intent Definition');
    const path = String(analysis?.path || canonical).replace(/^`|`$/gu, '');
    if (path !== canonical || hasSymlinkComponent(root, path)) return issue('unsafe_ux_source', path, canonical, 'foreign or unsafe source');
    const file = containedRegularFile(root, path);
    if (file.status !== 'valid') return issue('ux_source_missing', path, '- decision: ready', file.status, file.status === 'missing');
    const content = readFileSync(file.path, 'utf8');
    const checked = inspectUxIntentDecision(content);
    if (!checked.well_formed) return issue('ux_decision_malformed', path, '- decision: ready', 'exact unambiguous field required', true);
    if (!checked.ready) return issue('ux_not_ready', path, '- decision: ready', checked.decision);
    if (analysis?.status !== 'done' || String(analysis.path).replace(/^`|`$/gu, '') !== canonical) return issue('ux_source_unrecorded', path, 'UX Intent Definition: done at this path', analysis?.status || 'unrecorded', true);
    sources.push({ type: 'UX Intent Definition', path, digest: artefactFileDigest(root, path) });
  }
  return { sources, issue: null };
}
