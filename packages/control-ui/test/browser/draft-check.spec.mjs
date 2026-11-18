import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { artifactReadinessFixture, readyPrd } from '../../../core/test/fixtures/artifact-readiness.js';
import { treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';

test('SCN-015/016/018: built compact and expanded views automatically check the draft and wrap findings', async ({ page }) => {
  const f = artifactReadinessFixture(); f.root = fs.realpathSync(f.root);
  fs.writeFileSync(f.path, readyPrd);
  const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  const requests = [];
  page.on('request', req => { if (req.url().includes('/api/draft-check/')) requests.push(req.url()); });
  try {
    await page.addInitScript(({ secret, origin }) => { if (location.origin === origin) history.replaceState(null, '', location.pathname + '#' + secret); }, { secret: service.secret, origin: service.origin });
    for (const route of ['/card.html', '/']) {
      await page.goto(`${service.origin}${route}`);
      const count = requests.length;
      await page.locator(`.run-link[data-focus-id="${f.runId}"]`).press('Enter');
      if (route === '/card.html') await page.locator('.work-step-details > summary').press('Space');
      const status = page.getByText('Formale Prüfung bestanden', { exact: true });
      await expect(status).toBeVisible();
      await expect(page.getByRole('button', { name: 'Entwurf prüfen', exact: true })).toHaveCount(0);
      expect(requests.length).toBe(count + 1);
      if (route === '/card.html') {
        const disclosure = page.getByText('Prüfquelle und Originalbefunde', { exact: true });
        await disclosure.press('Space');
        await expect(disclosure).toBeFocused();
        await expect(disclosure.locator('..')).toHaveAttribute('open', '');
        expect(requests.length).toBe(count + 1);
      }
      await expect(page.locator('.work-step-approvals .draft-check')).toHaveCount(0);
      for (const width of [390, 1100]) {
        await page.setViewportSize({ width, height: 900 });
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect(status).toBeVisible();
        await page.screenshot({ path: evidencePath(`draft-check-${route === '/' ? 'expanded' : 'compact'}-${width}.png`), fullPage: true });
      }
      expect(treeBytes(f.root)).toEqual(before);
      fs.writeFileSync(f.path, readyPrd.replace('before_prd | resolved', 'before_prd | open').replace('| Scope |', '| ' + 'Long concrete authoring finding '.repeat(12) + '|'));
      await page.locator('.refresh-control').click();
      await expect(page.getByText('Korrekturen erforderlich', { exact: true })).toBeVisible();
      expect(requests.length).toBe(count + 2);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: evidencePath(`draft-check-${route === '/' ? 'expanded' : 'compact'}-long-findings.png`), fullPage: true });
      fs.writeFileSync(f.path, readyPrd);
    }
  } finally { await page.close(); await service.close(); fs.rmSync(f.root, { recursive: true, force: true }); }
});
