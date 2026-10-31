import { canonicalInitPlan } from '../../lib/resources/canonical-init-plan.js';
import { generatedFilesForTarget as currentPlan } from '../../../cli/lib/scaffold/plan.js';
// Explicit historical test input. Production init and new-layout tests use the
// current plan; this fixture preserves real v2/journal-1..5 regression coverage.
export function generatedFilesForTarget(target, root, force, language) {
  return target === 'init' ? canonicalInitPlan(language, undefined, { layout: 'master-backlog-v1' }) : currentPlan(target, root, force, language);
}
