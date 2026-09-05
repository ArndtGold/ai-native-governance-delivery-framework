import { createCopilotFixture as fixtureHost, skills } from "./fixtures/host-compatibility/copilot.js";
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installCopilotGlobalPlugin, classifyCopilotMarketplaceList } from '../lib/installers/plugin-installers.js';
import { prepareCopilotMarketplace, digestDirectory, digestPluginSource } from '../lib/installers/local-marketplace.js';
import { verifyCopilotSkillDiscovery } from '../lib/installers/copilot-skill-discovery.js';
import { verifyCopilotMarketplaceTransport } from '../lib/installers/copilot-marketplace-transport.js';
import { buildCopilotPayloadInventory } from '../lib/public-plugin/copilot-profile.js';
import { pluginDefinition } from '../lib/cli/runtime-context.js';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const built = join(packageRoot, 'generated/plugins/copilot/agdf');
const fixture = mkdtempSync(join(tmpdir(), 'agdf-copilot-installer-'));
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value, null, 2)+'\n'); };

function changedPayload(name) {
  const root = join(fixture, name);
  cpSync(built, root, { recursive: true });
  const file = join(root, 'copilot-skills/agdf-gate-check/SKILL.md');
  writeFileSync(file, readFileSync(file, 'utf8')+'\nChanged source fixture.\n');
  const inventory = json(join(root, '.agdf-payload-inventory.json'));
  buildCopilotPayloadInventory({ profileRoot: root, version: pluginDefinition.version, baseline: inventory.baseline,
    mappings: inventory.entries.map(entry => ({ ...entry, sourceDigest: entry.source_digest })) });
  return root;
}


try {
  const host = fixtureHost(join(fixture, 'host with spaces'));
  const first = host.install();
  assert.equal(first.verificationStatus, 'healthy');
  assert.ok(first.evidence.includes('discovered_plugin_skills:10'));
  const canonical = dirname(dirname(first.pluginRoot));
  const firstSource = json(host.settingsPath).extraKnownMarketplaces.agdf.source;
  assert.equal(firstSource.source, 'git');
  assert.equal(fileURLToPath(firstSource.url), canonical);
  assert.equal(digestDirectory(join(host.checkout, 'plugins/agdf')), digestDirectory(first.pluginRoot), 'Git checkout must preserve package bytes even with autocrlf enabled');
  const initialCommit = execFileSync('git', ['-C', canonical, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  assert.equal(host.install().verificationStatus, 'healthy');
  assert.equal(execFileSync('git', ['-C', canonical, 'rev-parse', 'HEAD'], { encoding: 'utf8' }), initialCommit, 'repeat install must keep deterministic transport');
  assert.deepEqual(json(host.settingsPath).extraKnownMarketplaces.agdf.source, firstSource);
  const updatedPayload = changedPayload('updated payload');
  const next = host.install(updatedPayload);
  const nextSource = json(host.settingsPath).extraKnownMarketplaces.agdf.source;
  assert.equal(next.installedVersion, first.installedVersion);
  assert.notEqual(nextSource.ref, firstSource.ref, 'changed source at the same version must invalidate the host catalog cache');
  assert.equal(digestPluginSource(join(host.checkout, 'plugins/agdf')), digestPluginSource(updatedPayload));
  assert.equal(json(host.settingsPath).model, 'auto');
  assert.equal(json(host.settingsPath).enabledPlugins.unrelated, false);

  const disabled = json(host.settingsPath);
  disabled.enabledPlugins['agdf@agdf'] = false;
  writeJson(host.settingsPath, disabled);
  const previousSettings = readFileSync(host.settingsPath, 'utf8');
  const previousPayload = digestDirectory(next.pluginRoot);
  host.state.failSkills = true;
  assert.throws(() => host.install(), /missing, disabled or shadowed/);
  assert.equal(readFileSync(host.settingsPath, 'utf8'), previousSettings, 'failed discovery must restore the old registration');
  assert.equal(digestDirectory(next.pluginRoot), previousPayload, 'failed discovery must restore the prior package');
  assert.equal(digestPluginSource(join(host.checkout, 'plugins/agdf')), digestPluginSource(updatedPayload), 'failed discovery must reinstall the prior native plugin');
  host.state.failSkills = false;

  const legacy = fixtureHost(join(fixture, 'legacy'));
  const old = prepareCopilotMarketplace({ dataRoot: join(fixture, 'legacy/data'), builtPluginRoot: built }); old.commit();
  rmSync(join(old.root, '.git'), { recursive: true });
  rmSync(join(old.root, '.gitattributes'));
  const marker = json(join(old.root, '.agdf-owned.json')); delete marker.copilot_transport_revision;
  writeJson(join(old.root, '.agdf-owned.json'), marker);
  const settings = json(legacy.settingsPath);
  settings.extraKnownMarketplaces.agdf = { source: { source: 'directory', path: old.root } };
  writeJson(legacy.settingsPath, settings);
  assert.ok(legacy.install().evidence.includes('directory_marketplace_registration_migrated'));
  assert.equal(json(legacy.settingsPath).extraKnownMarketplaces.agdf.source.source, 'git');

  const sourceDigest = digestPluginSource(built, pluginDefinition.version);
  for (const [kind, modify, expected] of [
    ['missing', values => values.slice(1), /missing/],
    ['disabled', values => values.map((value, i) => i ? value : { ...value, enabled: false }), /disabled/],
    ['shadowed', values => values.map((value, i) => i ? value : { ...value, source: 'personal-copilot' }), /shadowed/],
    ['duplicate', values => [...values, values[0]], /missing/],
    ['invalid-path', values => values.map((value, i) => i ? value : { ...value, path: 'relative' }), /unexpected installed path/],
    ['mixed-roots', values => [skills(updatedPayload)[0], ...values.slice(1)], /different plugin/],
  ]) assert.throws(() => verifyCopilotSkillDiscovery(JSON.stringify(modify(skills(built))), { definition: pluginDefinition, sourceDigest }), expected, kind);
  assert.throws(() => verifyCopilotSkillDiscovery('not json', { definition: pluginDefinition, sourceDigest }), /invalid JSON/);
  assert.throws(() => verifyCopilotSkillDiscovery('{}', { definition: pluginDefinition, sourceDigest }), /skill list/);
  assert.throws(() => verifyCopilotSkillDiscovery(JSON.stringify(skills(updatedPayload)), { definition: pluginDefinition, sourceDigest }), /stale or modified/);

  const foreign = fixtureHost(join(fixture, 'foreign'));
  const foreignSettings = json(foreign.settingsPath);
  foreignSettings.extraKnownMarketplaces.agdf = { source: { source: 'git', url: 'https://example.invalid/foreign.git' } };
  writeJson(foreign.settingsPath, foreignSettings);
  assert.throws(() => foreign.install(), /non-AGDF Copilot marketplace/);
  assert.deepEqual(json(foreign.settingsPath), foreignSettings);
  assert.equal(existsSync(join(fixture, 'foreign/data/marketplaces/agdf-copilot')), false);
  assert.equal(classifyCopilotMarketplaceList('agdf (Local: /one)\nagdf (Local: /two)', '/one').state, 'conflict');

  assert.throws(() => prepareCopilotMarketplace({ dataRoot: join(fixture, 'no-git'), builtPluginRoot: built,
    transportAdapters: { exec() { throw new Error('Git unavailable'); } } }), /Git unavailable/);
  assert.equal(existsSync(join(fixture, 'no-git/marketplaces/agdf-copilot')), false);
  const attributes = join(canonical, '.gitattributes');
  writeFileSync(attributes, '* text\n');
  assert.throws(() => verifyCopilotMarketplaceTransport(canonical, next.sourceDigest), /Git content mismatch/);

  console.log('Copilot installer tests passed (native Git checkout, same-version updates, migration, rollback, discovery and isolation)');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
