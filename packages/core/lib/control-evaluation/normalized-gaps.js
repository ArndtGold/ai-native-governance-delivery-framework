import { readRuntimeContract } from '../resources/contracts.js';
// Consume the sole normative route table rather than introduce a second type-to-route map.
export function declaredRoutes() {
  const contract = readRuntimeContract('quality');
  if (!contract.ok) return new Map();
  const text = contract.content;
  const body = text.split('## Normalized Review Gaps')[1]?.split(/^## /mu)[0] ?? '';
  const routes = new Map();
  for (const line of body.split('\n')) {
    const row = line.match(/^\|\s*`([a-z_]+)`\s*\|[^|]*\|(.+)\|\s*$/u);
    if (!row) continue;
    const targets = [...row[2].matchAll(/`([^`]+)`/gu)].flatMap(m => m[1].split('|').map(v => v.trim()));
    routes.set(row[1], targets);
  }
  return routes;
}

export const NORMALIZED_GAP_COLUMNS = Object.freeze(['finding_id', 'gap_type', 'routing_target', 'gap_status', 'evidence', 'required_next_step']);
export function validNormalizedGap(row, routes = declaredRoutes()) {
  const [id, gap, target, status, evidence, action] = row;
  // Resolved rows retain their classification and concrete resolution evidence,
  // but do not route new corrective work. Apply action/assessment obligations to
  // open work rather than requiring a fictitious next repair after resolution.
  const open = status === 'open';
  return row.length === 6 && !!id && id.length <= 128 && routes.size === 6 && routes.get(gap)?.includes(target) === true
    && ['open', 'resolved'].includes(status) && !!evidence && evidence.length <= 4096 && !!action && action.length <= 2048
    && !/^(?:none|tbd|todo|<)/iu.test(evidence) && !/^(?:tbd|todo|<)/iu.test(action)
    && !(open && /^none(?:\b|$)/iu.test(action))
    && !(gap === 'requirements_gap' && target === 'UR' && !/changed (?:user )?(?:intent|scope)/iu.test(evidence))
    && !(open && gap === 'emergent_risk' && !/earliest[- ]owner assessment/iu.test(evidence));
}
