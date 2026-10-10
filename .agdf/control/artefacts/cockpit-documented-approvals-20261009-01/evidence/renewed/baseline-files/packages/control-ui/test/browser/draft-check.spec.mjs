import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { artifactReadinessFixture, readyPrd } from '../../../core/test/fixtures/artifact-readiness.js';
import { treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';

test('SCN-015/016/018: built compact/expanded checks use actual Core, preserve keyboard/disclosure/position and wrap long findings', async ({ page }) => {
  const f = artifactReadinessFixture(); f.root = fs.realpathSync(f.root);
  fs.writeFileSync(f.path, readyPrd);
  const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  const requests = [];
  page.on('request', req => { if (req.url().includes('/api/draft-check/')) requests.push(req.url()); });
  try {
    await page.addInitScript(({ secret, origin }) => { if (location.origin === origin) history.replaceState(null, '', location.pathname + '#' + secret); }, { secret: service.secret, origin: service.origin });
    for (const route of ['/card.html', '/']) {
      await page.goto(`${service.origin}${route}?run_id=${f.runId}`);
      // Entry supports initial Run only through the existing transport snapshot selector.
      await page.evaluate(async ({ secret, run }) => {
        const response = await fetch('/api/snapshot?run_id=' + run, { headers: { 'x-agdf-session': secret } });
        if (!(await response.json()).data?.run) throw Error('Fixture selected run unavailable');
      }, { secret: service.secret, run: f.runId });
      // Existing browser entry starts with overview: add a real stored pointer in this isolated target.
      const backlog = `${f.root}/.agdf/control/MASTER_BACKLOG.md`;
      if (!fs.readFileSync(backlog, 'utf8').includes('| synthetic-draft |')) {
        fs.writeFileSync(backlog, fs.readFileSync(backlog, 'utf8').replace('|---:|---|---|---|---|---|---|', '|---:|---|---|---|---|---|---|\n| P1 | synthetic-draft | Draft check fixture | In Progress | | | Check draft |'));
      }
      await page.reload();
      await page.getByRole('button', { name: 'Draft check fixture', exact: true }).click();
      const action = page.getByRole('button', { name: 'Entwurf prüfen', exact: true });
      await expect(action).toBeVisible();
      const count = requests.length;
      await page.locator('.draft-check summary').click();
      await expect(action).toBeVisible(); expect(requests.length).toBe(count);
      await action.focus(); await page.keyboard.press('Enter');
      await expect(page.locator('.draft-check')).toContainText('Entwurfsprüfung bestanden');
      await expect(action).toBeFocused(); await expect(page.locator('.draft-check details')).toHaveAttribute('open');
      expect(requests.length).toBe(count + 1);
      await expect(page.locator('.work-step-approvals .draft-check')).toHaveCount(0);
      for (const width of [390, 1100]) {
        await page.setViewportSize({ width, height: 900 });
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect(page.locator('.draft-check')).toContainText('Entwurfsprüfung bestanden');
        await page.screenshot({ path: evidencePath(`draft-check-${route === '/' ? 'expanded' : 'compact'}-${width}.png`), fullPage: true });
      }
      expect(treeBytes(f.root)).toEqual({ ...before, '/.agdf/control/MASTER_BACKLOG.md': fs.readFileSync(backlog).toString('base64') });
      fs.writeFileSync(f.path, readyPrd.replace('before_prd | resolved', 'before_prd | open').replace('| Scope |', '| ' + 'Long concrete authoring finding '.repeat(12) + '|'));
      await page.getByRole('button', { name: /Neu laden|Aktualisieren/ }).click();
      await expect(page.locator('.draft-check')).toContainText('Noch nicht geprüft');
      await action.click(); await expect(page.locator('.draft-check')).toContainText('Korrekturen erforderlich');
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: evidencePath(`draft-check-${route === '/' ? 'expanded' : 'compact'}-long-findings.png`), fullPage: true });
      fs.writeFileSync(f.path, readyPrd);
    }
  } finally { await page.close(); await service.close(); fs.rmSync(f.root, { recursive: true, force: true }); }
});
