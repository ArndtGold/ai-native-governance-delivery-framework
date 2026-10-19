import { canonicalJson, digest, DIGEST_PATTERN } from './approval-command-contract.js';

export function validDecisionMaterial(sources, runId) {
  return Array.isArray(sources) && sources.length > 0 && sources.length <= 12
    && new Set(sources.map(s => s?.type)).size === sources.length
    && sources.every(s => s && Object.keys(s).sort().join(',') === 'digest,path,type' && typeof s.type === 'string'
      && typeof s.path === 'string' && s.path.startsWith(`.agdf/control/artefacts/${runId}/`)
      && !s.path.includes('..') && DIGEST_PATTERN.test(s.digest ?? ''));
}

export const decisionMaterialVersion = (runId, gate, sources) => digest(`agdf-decision-material/1\0${canonicalJson({ run_id: runId, gate, sources })}`);

