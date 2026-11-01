import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { clarifiedUr } from '../../../core/test/planned-fixtures.js';
import { mutatePlannedUr } from '../../../core/lib/control-state/planned-entry.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';

test('planned UR overview uses Core ordering and source detail without Run/gate creation', async ({ page }) => {
  const f = fixture({ layout: 'planned-urs-v1' });
  for (const title of ['Beta', 'Alpha']) mutatePlannedUr(f.root, { kind: 'planned_ur.create', operation_id: randomUUID(), expected_digest: null,
    priority: 'high', content: clarifiedUr.replace('Independent work', title) + '\nUntrusted <script>window.__bad=true</script> source text.\n' });
  const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await page.addInitScript(({ secret, origin }) => { if (location.origin === origin) history.replaceState(null, '', location.pathname + '#' + secret); }, { secret: service.secret, origin: service.origin });
    await page.goto(service.origin + '/');
    await page.getByRole('button', { name: /Geplant/u }).click();
    await expect(page.locator('.undertaking-list h3')).toHaveText(['Alpha', 'Beta']);
    await page.getByRole('searchbox').fill('Alpha');
    await expect(page.locator('.undertaking-list h3')).toHaveText(['Alpha']);
    await page.getByRole('button', { name: 'Alpha', exact: true }).click();
    await expect(page.getByRole('article', { name: 'Geplante UR' })).toContainText('Keine Run-Freigabe');
    await expect(page.getByRole('article', { name: 'Geplante UR' })).toContainText('.agdf/control/planned/');
    await expect(page.getByRole('button', { name: /freigeben|approve|starten/iu })).toHaveCount(0);
    expect(await page.evaluate(() => window.__bad)).toBeUndefined();
    for (const width of [390, 1000]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: evidencePath(`planned-ur-${width}.png`), fullPage: true });
    }
    expect(treeBytes(f.root)).toEqual(before);
  } finally { await service.close(); f.close(); }
});
