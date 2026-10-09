import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { runWorkSummary } from '../../../core/lib/control-evaluation/run-work-summary.js';
import { recordBacklogSummary } from '../../../core/lib/control-state/backlog-summary.js';
import { parseRunState } from '../../../core/lib/control-state/run-state-parser.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';
import { upsertTableRow, replaceFirstScalar, replaceSectionScalar } from '../../../core/lib/control-state/run-state-edits.js';
import { sealRunState } from '../../../core/lib/control-state/run-seal.js';

test('open normalized report findings stay visible when the Run-document evidence list is empty', async ({ page }) => {
  const f = fixture(), prefix = '.agdf/control/artefacts/fixture-a/';
  let run = readFileSync(f.runPath, 'utf8');
  for (const gate of ['UR', 'PRD', 'SD', 'TP']) {
    writeFileSync(join(f.root, prefix, gate + '.md'), '# ' + gate + '\n');
    run = upsertTableRow(run, 'Approvals', 0, gate, [gate, 'approved', 'isolated fixture']);
    run = upsertTableRow(run, 'Artefacts', 0, gate, [gate, prefix + gate + '.md', 'approved', '']);
  }
  for (const step of ['Brownfield Review', 'Brownfield Analysis', 'CD+Tests', 'CR']) {
    const path = prefix + step.replaceAll('+', '').replaceAll(' ', '_') + '.md';
    writeFileSync(join(f.root, path), '# Evidence\n- decision: pass\n');
    run = upsertTableRow(run, 'Artefacts', 0, step, [step, path, 'done', 'isolated fixture']);
  }
  run = replaceSectionScalar(run, 'Mode/Slice Decision', 'decision', 'structured_delivery');
  run = replaceSectionScalar(run, 'Mode/Slice Decision', 'scope_reason', 'Isolated report-findings presentation regression');
  run = replaceSectionScalar(run, 'Mode/Slice Decision', 'evidence', 'test fixture');
  run = replaceFirstScalar(run, 'current_gate', 'QA');
  const body = '- decision: revise\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| F1 | evidence_gap | evidence_obligation | open | Native observation pending | Capture the exact native observation |\n';
  for (const [type, file] of [['QA', 'QA_REPORT.md'], ['TP Review', 'TP_REVIEW.md']]) {
    writeFileSync(join(f.root, prefix, file), body);
    run = upsertTableRow(run, 'Artefacts', 0, type, [type, prefix + file, 'revise', '']);
  }
  writeFileSync(f.runPath, sealRunState(f.root, run));
  expect(runWorkSummary(f.root, run, f.runPath)).toMatchObject({ kind: 'qa_evidence_open', open_obligation_count: 2, limitations: [] });
  const path = join(f.root, '.agdf/control/MASTER_BACKLOG.md');
  writeFileSync(path, readFileSync(path, 'utf8').replace('|---:|---|---|---|---|---|---|', '|---:|---|---|---|---|---|---|\n| P1 | fixture-a | Report findings fixture | QA evidence open | | | Capture native observation |'));
  const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await page.addInitScript(({ secret, origin }) => { if (location.origin === origin) history.replaceState(null, '', location.pathname + '#' + secret); }, { secret: service.secret, origin: service.origin });
    for (const route of ['/card.html', '/']) {
      await page.goto(service.origin + route);
      await page.getByRole('button', { name: 'Report findings fixture', exact: true }).click();
      if (route === '/card.html') await page.getByRole('button', { name: 'Run ansehen', exact: true }).click();
      const toggle = page.locator('.work-step-evidence > summary');
      await expect(toggle).toHaveText('Nachweise und offene Punkte · 2 offene Berichtsbefunde');
      await toggle.focus(); await page.keyboard.press('Enter');
      await expect(page.locator('.work-step-report-findings')).toContainText('Ein Sachverhalt kann in mehreren Berichten geführt sein.');
      await expect(page.locator('.work-step-evidence')).toContainText('Im Run-Dokument sind keine Nachweislücken gespeichert.');
      await expect(page.locator('.work-summary')).toContainText('2 offene Berichtsbefunde in den registrierten Berichten.');
      for (const width of [390, 1000]) {
        await page.setViewportSize({ width, height: 1100 });
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: evidencePath(`report-findings-${route === '/' ? 'expanded' : 'card'}-${width}.png`), fullPage: true });
      }
      await page.locator('.work-step-report-findings button').first().focus(); await page.keyboard.press('Enter');
      await expect(page.getByRole('button', { name: 'Dokument schließen', exact: true })).toBeVisible();
    }
  } finally { await page.close(); await service.close(); expect(treeBytes(f.root)).toEqual(before); f.close(); }
});

test('saved action and evidence limitation wrap without clipping in compact and expanded views', async ({ page }) => {
  const f = fixture(), path = join(f.root, '.agdf/control/MASTER_BACKLOG.md');
  const action = 'Capture the complete current native observation, including a narrow view, visible source identity and the required keyboard sequence. '.repeat(4) + 'FINAL REQUIRED OBSERVATION';
  let source = readFileSync(path, 'utf8').replace('|---:|---|---|---|---|---|---|', '|---:|---|---|---|---|---|---|\n| P1 | fixture-a | Saved evidence undertaking | QA evidence open | | | ' + action + ' |');
  const run = readFileSync(f.runPath, 'utf8'), base = runWorkSummary(f.root, run, f.runPath);
  source = recordBacklogSummary(f.root, source, 'fixture-a', 'Active Backlog', { ...base, kind: 'qa_evidence_open', phase: 'QA', display_action: action }, parseRunState(run).meta.revision_id);
  writeFileSync(path, source); const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await page.addInitScript(({ secret, origin }) => { if (location.origin === origin) history.replaceState(null, '', location.pathname + '#' + secret); }, { secret: service.secret, origin: service.origin });
    for (const route of ['/card.html', '/']) {
      await page.goto(service.origin + route);
      await expect(page.getByRole('button', { name: 'Saved evidence undertaking' })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      for (const width of [390, 1000]) {
        await page.setViewportSize({ width, height: 1000 });
        const result = await page.locator('.undertaking-list .row-step').evaluate(e => {
          const s = getComputedStyle(e), range = document.createRange(); range.selectNodeContents(e);
          return { height: e.getBoundingClientRect().height, textHeight: range.getBoundingClientRect().height,
            scrollHeight: e.scrollHeight, clientHeight: e.clientHeight, clamp: s.webkitLineClamp,
            horizontalOverflow: document.documentElement.scrollWidth > innerWidth };
        });
        expect(result.clamp).toBe('none'); expect(result.height).toBeGreaterThanOrEqual(result.textHeight);
        expect(result.scrollHeight).toBeLessThanOrEqual(result.clientHeight + 1); expect(result.horizontalOverflow).toBe(false);
        await expect(page.getByText('Gespeicherte Beobachtung; aktueller Run noch nicht verglichen.')).toBeVisible();
        expect(await page.locator('.undertaking-list .row-step').textContent()).toContain('FINAL REQUIRED OBSERVATION');
        await page.screenshot({ path: evidencePath(`backlog-summary-${route.includes('card') ? 'compact' : 'expanded'}-${width}.png`), fullPage: true });
      }
      await page.locator('.row-source summary').focus(); await page.keyboard.press('Enter');
      await expect(page.getByText('Gespeicherte Run-Revision')).toBeVisible();
    }
  } finally { await page.close(); await service.close(); expect(treeBytes(f.root)).toEqual(before); f.close(); }
});
