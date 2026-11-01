import { test, expect } from '@playwright/test';
import { structuredCurrentRun } from '../../../core/test/fixtures/current-structured-run.js';
import { withSyntheticQaContent } from '../../../core/test/fixtures/decision-content.js';
import { treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';

// The approvals are synthetic disposable prerequisites. Browser observation is
// limited to read-only presentation, never human acceptance or host qualification.
test('run model: normalized open findings remain visible without a saved summary', async ({ page }) => {
  const cleanup = [], run = structuredCurrentRun({ after(fn) { cleanup.push(fn); } });
  const accepted = result => expect(result.outcome, JSON.stringify(result)).toBe('accepted');
  for (const type of ['Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR']) {
    accepted(run.step('internal', `# ${type}\n\nDecision: pass\n\nSynthetic fixture prerequisites meet the declared isolated scope.\n`, { internal_step: type, decision: 'pass' }));
  }
  const report = '# QA Report\n\nDecision: revise\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| F1 | evidence_gap | evidence_obligation | open | Native observation pending | Capture the exact native observation |\n';
  accepted(run.record('QA', withSyntheticQaContent(report)));
  const before = treeBytes(run.f.root), service = await startControlServer({ dir: run.f.root });
  try {
    await page.addInitScript(({ secret, origin }) => { if (location.origin === origin) history.replaceState(null, '', location.pathname + '#' + secret); }, { secret: service.secret, origin: service.origin });
    for (const route of ['/card.html', '/']) {
      await page.goto(service.origin + route);
      await page.getByRole('button', { name: 'Synthetic current Run', exact: true }).click();
      if (route === '/card.html') await page.getByRole('button', { name: 'Run ansehen', exact: true }).click();
      const toggle = page.locator('.work-step-evidence > summary');
      await expect(toggle).toContainText('1 offener Berichtsbefund');
      await toggle.focus(); await page.keyboard.press('Enter');
      await expect(page.locator('.work-step-report-findings')).toContainText('Maßgeblicher Befund: F1');
      await expect(page.locator('.work-step-evidence')).toContainText('Im Run-Dokument sind keine Nachweislücken gespeichert.');
      await expect(page.getByText('Gespeicherte Run-Revision')).toHaveCount(0);
      for (const width of [390, 1000]) {
        await page.setViewportSize({ width, height: 1100 });
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: evidencePath(`run-model-findings-${route === '/' ? 'expanded' : 'card'}-${width}.png`), fullPage: true });
      }
      await page.locator('.work-step-report-findings').getByRole('button', { name: 'Qualitätsprüfung öffnen', exact: true }).focus(); await page.keyboard.press('Enter');
      await expect(page.getByRole('button', { name: 'Dokument schließen', exact: true })).toBeVisible();
      await page.getByText('Originaldokument lesen', { exact: true }).click();
      await expect(page.locator('article.document')).toContainText('Capture the exact native observation');
    }
  } finally { await service.close(); expect(treeBytes(run.f.root)).toEqual(before); for (const close of cleanup.reverse()) close(); }
});
