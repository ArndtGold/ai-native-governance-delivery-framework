// Read-only run classification shared by the Codex cockpit and the companion run view (companion core
// SDD-001, SDD-003). It lives apart from the cockpit so every runtime profile carries it, Copilot
// included, whose projection leaves the private cockpit out. Nothing here evaluates a gate rule.
import { ENDED_LIFECYCLES } from '../control-state/run-operations.js';

// The read-failure codes passed through unchanged, and every code `boundedCode` can return.
const READ_FAILURE_CODES = Object.freeze(['resource_denied', 'source_changed', 'timeout', 'resource_limit', 'read_failed']);
export const BOUNDED_READ_CODES = Object.freeze(['control_layout_unsupported', 'run_version_unsupported', 'control_invalid', ...READ_FAILURE_CODES]);

// Bounded reason code of a read failure.
export function boundedCode(error) {
  const code = error.code ?? error.message;
  if (code === 'AGDF_CONTROL_LAYOUT_UNSUPPORTED' || code === 'control_layout_unsupported') return 'control_layout_unsupported';
  if (code === 'AGDF_RUN_VERSION_UNSUPPORTED') return 'run_version_unsupported';
  // The configuration owner's codes (resources/configuration.js configurationError).
  if (code === 'AGDF_CONTROL_LAYOUT_INVALID' || code === 'configuration_invalid') return 'control_invalid';
  return READ_FAILURE_CODES.includes(error.code) ? error.code : 'read_failed';
}

// Read-only projection of the evaluated decision, never a second gate evaluator.
// Doctor warnings are already considered by evaluateGateCheck; they are not a UI veto.
export function projectCockpitAssessment(report, lifecycle) {
  const state = ENDED_LIFECYCLES.includes(lifecycle) ? 'ended'
    : lifecycle === 'completed' ? report.completion?.fulfilled === true ? 'completed' : 'unconfirmed'
    : lifecycle !== 'active' ? 'unconfirmed'
    : report.status === 'blocked' || (report.blocking_reason && report.blocking_reason !== 'none')
      || (report.missing_approval && report.missing_approval !== 'none') ? 'blocked'
    : report.status === 'open' && report.blocking_reason === 'none' && report.missing_approval === 'none' ? 'open'
    : 'unconfirmed';
  return { state, authorizes: false };
}
