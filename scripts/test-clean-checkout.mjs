import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { copySourceFixture, copyFixtureDependencies } from './support/source-fixture.js';
const root = mkdtempSync(join(tmpdir(), 'agdf-clean-source-'));
try {
  copySourceFixture(root, { dependencies: false });
  for (const path of ['node_modules', 'dist', 'packages/cli/generated', 'packages/core/generated', 'packages/cli/runtime']) assert.equal(existsSync(join(root, path)), false, path);
  // Exact bundled dependency files from the current lock, never registry-selected replacements.
  copyFixtureDependencies(root);
  const environment = { ...process.env, npm_config_offline: 'true', AGDF_DATA_DIR: join(root, 'fixture-data') };
  const invoke = file => execFileSync(process.execPath, [join(root, file)], { cwd: root, env: environment, encoding: 'utf8', stdio: 'pipe' });
  execFileSync(process.execPath, ['--input-type=module', '-e', 'await import("./scripts/sync-package-assets.js")'], { cwd: root, env: environment, stdio: 'pipe' });
  for (const path of ['packages/cli/generated', 'packages/core/generated', 'packages/cli/runtime']) assert.equal(existsSync(join(root, path)), false, `generator import must not write ${path}`);
  invoke('scripts/sync-package-assets.js'); invoke('scripts/assemble-npm.mjs');
  assert.equal(JSON.parse(readFileSync(join(root, 'dist/npm/assembly.json'))).version, JSON.parse(readFileSync(join(root, 'packages/core/package.json'))).version);
  invoke('scripts/check-package-boundaries.mjs');
  invoke('packages/cli/scripts/release-workflow-contract-test.js');
  invoke('scripts/community-health-test.mjs');
  invoke('scripts/check-community-health.mjs');
  invoke('packages/cli/scripts/repository-control-startup-test.js');
  invoke('packages/cli/scripts/test-routing.js');
  console.log('Fresh current source: no initial generated/dist/node_modules; exact bundled dependencies; complete profile/assembly build, isolated Core, npm entrypoints, community and startup checks passed.');
} finally { rmSync(root, { recursive: true, force: true }); }
