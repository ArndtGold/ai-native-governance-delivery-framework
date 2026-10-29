// Classification only: package.json npm chains remain the executable inventory.
// A nested script inherits its parent's area unless it has a more specific owner.
export const TEST_DOMAINS = {
  activation: { label: 'Activation & skills', shortLabel: 'Skills', scripts: [
    'test:instruction-footprint', 'test:request-activation', 'test:request-activation-callbacks',
    'test:request-activation-host-schema', 'test:gate-check-missing-control', 'test:task-target-resolution',
    'test:skill-dispatch', 'test:host-command', 'test:agent-skills-conformance', 'test:skill-evals',
    'eval:skills', 'test:proportionality', 'test:delivery-path-search', 'test:delivery-path-search-unit',
    'test:delivery-path-search-generator',
  ] },
  installation: { label: 'Installation & hosts', shortLabel: 'Install', scripts: [
    'test:canonical-init', 'test:install-setup-contract', 'test:install-setup-interaction',
    'test:install-setup-service', 'test:install-control-migration', 'test:install-control-repair',
    'test:control-maintenance', 'test:runtime-check-consent', 'test:local-marketplace',
    'test:claude-cache-recovery', 'test:claude-packaged-app-copy', 'test:claude-install-hardening', 'test:claude-companion',
    'test:copilot-profile', 'test:copilot-installer', 'test:local-preparation',
    'test:local-development-install', 'test:lifecycle', 'test:copilot-repository-retention',
    'test:opencode-hardening',
  ] },
  delivery: { label: 'Delivery & readiness', shortLabel: 'Delivery', scripts: [
    'test:cli-gates', 'test:prd-readiness', 'test:next-action', 'test:intake-continuation',
    'test:prd-definition', 'test:sd-readiness', 'test:sd-definition', 'test:tp-definition',
    'test:parent-reconciliation',
  ] },
  runs: { label: 'Run commands & recovery', shortLabel: 'Runs', scripts: [
    'test:control-inspect', 'test:control-command', 'test:control-command-process', 'test:control-state',
    'test:run-command-flow', 'test:run-step-transaction', 'test:run-recovery', 'test:run-close', 'test:run-lock',
    'test:verified-change',
  ] },
  revisions: { label: 'Source revisions', shortLabel: 'Revision', scripts: [
    'test:run-revision', 'test:late-source-revision', 'test:late-source-revision-performance',
  ] },
  mcp: { label: 'MCP & Cockpit', shortLabel: 'MCP', scripts: [
    'test:mcp-lifecycle', 'test:plugin-mcp-runtime', 'test:plugin-mcp-cockpit-variant',
    'test:claude-plugin-mcp', 'test:codex-plugin-mcp', 'test:mcp-server',
  ] },
  presentation: { label: 'Presentation & language', shortLabel: 'Language', scripts: [
    'test:artifact-language', 'test:interaction-presentation', 'test:operational-localization',
  ] },
  packages: { label: 'Packages & integrity', shortLabel: 'Packages', scripts: [
    'release:prepare', 'test:release-workflows', 'test:release-registry-state',
    'test:cli-modularization', 'test:local-validator', 'test:package-build', 'test:package-contents',
    'test:control-command-package', 'test:runtime-integrity-layout', 'test:runtime-integrity-negative',
  ] },
};

const scripts = new Map();
for (const [domain, { scripts: names }] of Object.entries(TEST_DOMAINS)) for (const name of names) {
  if (scripts.has(name)) throw Error(`Duplicate CI script classification: ${name}`);
  scripts.set(name, domain);
}

export function scriptDomain(packageName, script, inherited) {
  if (packageName === 'create-agdf') return scripts.get(script) ?? inherited;
  if (packageName === '@agdf/mcp-server') {
    return script === 'test:late-source-revision' ? 'revisions' : 'mcp';
  }
  return inherited;
}

// Only cross-cutting files need an override; everything else inherits its npm suite.
const files = new Map([
  ['packages/cli/scripts/smoke-test.js', 'packages'],
  ['packages/cli/scripts/test-routing.js', 'activation'],
  ['packages/core/test/artifact-readiness-test.js', 'delivery'],
  ['packages/core/test/run-command-revision-test.js', 'revisions'],
  ...['report-decision', 'decision-content', 'presentation-decision', 'presentation-document']
    .map(name => [`packages/core/test/${name}-test.js`, 'presentation']),
  ['packages/mcp-server/test/revision-command.test.js', 'revisions'],
]);

export function commandDomain(path, inherited) {
  const domain = files.get(path) ?? inherited;
  if (!Object.hasOwn(TEST_DOMAINS, domain)) throw Error(`Unclassified CI test: ${path}; assign its npm suite a CI domain`);
  return domain;
}
