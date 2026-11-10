import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { approvalFixture, fixture } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';
const content = status => `# Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | fixture-a | My undertaking | ${status} | | UR | Check evidence |\n\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n`;
for (const theme of ['light', 'dark']) test(`actual ${theme} overview waits for deliberate reload after a file event`, async ({ page }) => {
  const f = fixture(), path = join(f.root, '.agdf/control/MASTER_BACKLOG.md'); fs.writeFileSync(path, content('Awaiting QA'));
  const service = await startControlServer({ dir: f.root });
  try {
    await page.goto(service.startupURL); await page.getByRole('button', { name: 'Legacy-Backlog', exact: true }).click(); await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
    await expect(page.getByText('Gespeicherter Stand laut Backlog: Awaiting QA')).toBeVisible();
    await page.getByRole('searchbox').fill('My undertaking');
    await page.getByText('Gespeicherte Angaben und Quellen', { exact: true }).click();
    let release;
    const hold = new Promise(resolve => { release = resolve; });
    await page.route('**/api/snapshot*', async route => { await hold; await route.continue(); });
    fs.writeFileSync(path + '.replacement', content('Awaiting UAT')); fs.renameSync(path + '.replacement', path);
    const deliberate=page.getByRole('button',{name:'Neuer Stand verfügbar · Aktualisieren'});
    await expect(deliberate).toBeEnabled({timeout:3000});
    await expect(page.getByText('Gespeicherter Stand laut Backlog: Awaiting QA')).toBeVisible();
    await expect(page.getByRole('button',{name:'My undertaking'})).toBeDisabled();
    await deliberate.click();
    const refresh = page.getByRole('button', { name: 'Stand wird aktualisiert …' });
    await expect(refresh).toBeDisabled({ timeout: 3000 });
    await expect(refresh.locator('.refresh-update-dot')).toBeVisible();
    await expect(refresh).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(refresh.locator('.cockpit-icon')).toHaveCSS('animation-name', 'cockpit-refresh-spin');
    await expect(refresh.locator('.refresh-update-dot')).toHaveCSS('background-color', theme === 'light' ? 'rgb(37, 99, 235)' : 'rgb(96, 165, 250)');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(refresh.locator('.cockpit-icon')).toHaveCSS('animation-name', 'none');
    await page.setViewportSize({ width: 320, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: evidencePath(`cockpit-refresh-${theme}-320.png`) });
    release();
    await expect(page.getByText('Gespeicherter Stand laut Backlog: Awaiting UAT')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.refresh-update-dot')).toHaveCount(0);
    await expect(page.getByRole('searchbox')).toHaveValue('My undertaking');
    await expect(page.locator('.row-source')).not.toHaveAttribute('open', '');
    await expect(page.getByText('Veraltet', { exact: true })).toHaveCount(0);
  } finally { await service.close(); f.close(); }
});

for (const theme of ['light', 'dark']) test(`${theme} changed original uses the header dot until deliberate reload`, async ({ page }) => {
  const f = fixture(), path = join(f.root, f.documentPath);
  fs.writeFileSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), content('Awaiting QA'));
  fs.writeFileSync(path, '# Before deliberate reload');
  const service = await startControlServer({ dir: f.root });
  try {
    await page.goto(service.startupURL); await page.getByRole('button', { name: 'Legacy-Backlog', exact: true }).click();
    await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
    await page.getByRole('button', { name: 'My undertaking' }).click();
    await expect(page.getByRole('heading', { name: 'Dokumente', exact: true })).toBeVisible();
    await page.locator('.resources button').filter({ hasText: /\/UR\.md/ }).click();
    await page.getByText('Originaldokument lesen', { exact: true }).click();
    await expect(page.locator('article.document')).toContainText('Before deliberate reload');
    fs.writeFileSync(path + '.replacement', '# After deliberate reload'); fs.renameSync(path + '.replacement', path);
    const refresh = page.getByRole('button', { name: 'Quelle geändert · Neu laden' });
    await expect(refresh).toBeEnabled({ timeout: 3000 });
    await expect(page.locator('main footer')).toContainText('Neuer Stand verfügbar · Vorheriger Datenstand bleibt sichtbar');
    await expect(page.locator('article.document')).toContainText('Before deliberate reload');
    await expect(page.getByText('Die Quelldaten haben sich geändert. Angezeigte Inhalte gehören zum vorherigen Datenstand. Bewusst neu laden.')).toHaveCount(0);
    for (const width of [320, 800]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(refresh.locator('.refresh-update-dot')).toBeVisible();
      await expect(refresh).toHaveAttribute('title', 'Quelle geändert · Neu laden');
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: evidencePath(`cockpit-source-change-${theme}-${width}.png`), fullPage: true });
    }
    await refresh.click();
    await page.getByText('Originaldokument lesen', { exact: true }).click();
    await expect(page.locator('article.document')).toContainText('After deliberate reload');
    await expect(page.locator('.refresh-update-dot')).toHaveCount(0);
    await expect(page.locator('main footer')).not.toContainText('Vorheriger Datenstand');
    await page.route('**/api/snapshot*', route => route.abort());
    await page.getByRole('button', { name: 'Neu laden', exact: true }).click();
    await expect(page.locator('.reading-feedback .notice strong')).toHaveText('Aktualisierung fehlgeschlagen');
    await expect(page.locator('.reading-feedback .notice')).toContainText('Vorheriger Datenstand bleibt sichtbar.');
    await expect(page.locator('main footer')).toContainText('Aktualisierung fehlgeschlagen · Vorheriger Datenstand bleibt sichtbar');
    await expect(page.getByRole('button', { name: 'Aktualisierung fehlgeschlagen · Wiederholen' })).toBeEnabled();
    await expect(page.locator('.refresh-update-dot')).toHaveCount(0);
    await expect(page.locator('article.document')).toContainText('After deliberate reload');
    await expect(page.getByText('Veraltet', { exact: true })).toHaveCount(0);
    await page.unroute('**/api/snapshot*');
    await page.getByRole('button', { name: 'Aktualisierung fehlgeschlagen · Wiederholen' }).click();
    await expect(page.getByRole('button', { name: 'Neu laden', exact: true })).toBeEnabled();
    await expect(page.locator('main footer')).not.toContainText('Aktualisierung fehlgeschlagen');
  } finally { await service.close(); f.close(); }
});

for (const pathname of ['/', '/card.html']) test(`workshop robot tracks the selected Run in ${pathname}`, async ({ page }) => {
  const f = await approvalFixture();
  const service = await startControlServer({ dir: f.root });
  try {
    await page.setViewportSize({ width: pathname === '/' ? 900 : 420, height: 900 });
    await page.addInitScript(({ secret, origin, pathname }) => {
      if (location.origin === origin) history.replaceState(null, '', pathname + '#' + secret);
    }, { secret: service.secret, origin: service.origin, pathname });
    await page.goto(service.origin + pathname);
    await page.locator('.run-link[data-focus-id="fixture-a"]').click();
    const image = page.locator('img.run-figure');
    const source = async () => decodeURIComponent(await image.getAttribute('src'));
    await expect(page.locator(pathname === '/' ? '.breadcrumbs img.run-figure' : '.compact-navigation img.run-figure')).toBeVisible();
    const docs = page.getByRole('region', { name: 'Dokumente', exact: true });
    const draft = page.getByRole('region', { name: 'Entwurfsprüfung', exact: true });
    const evidence = page.locator('.work-step-evidence > summary');
    const details = page.locator('.work-step-details > summary');
    if (pathname !== '/') {
      await expect(docs).toBeHidden();
      await expect(draft).toBeHidden();
      await expect(evidence).toBeHidden();
      await details.click();
    }
    await expect(docs).toBeVisible();
    await expect(draft).toBeVisible();
    await expect(evidence).toBeVisible();
    if (pathname !== '/') { await details.click(); await expect(docs).toBeHidden(); }
    await image.evaluate(node => node.decode());
    const waiting = await source();
    expect(waiting).toMatch(/url\(#metal\).*url\(#visor\)/s);
    expect(waiting).toContain('>UR</text>');
    expect(waiting).toContain('dur="12s"');
    expect(waiting).not.toContain('data-gesture');
    await image.screenshot({ path: evidencePath(`workshop-robot-waiting-${pathname === '/' ? 'expanded' : 'compact'}.png`) });

    const change = f.context.call('presentation_decision.record', {
      gate: 'UR', presentation_id: f.presentationId, action: 'request_change', comment: 'Synthetic workshop robot check',
    }, f.binding());
    expect(change.outcome).toBe('accepted');
    await expect.poll(source, { timeout: 12_000 }).toMatch(/data-gesture="\d+".*repeatCount="1"/s);
    const blocked = await source();
    expect(blocked).toContain('#ff9b8c');
    expect(blocked).not.toContain('>UR</text>');
    await image.screenshot({ path: evidencePath(`workshop-robot-blocked-${pathname === '/' ? 'expanded' : 'compact'}.png`) });

    const refresh = page.getByRole('button', { name: 'Neu laden', exact: true });
    await refresh.click();
    await expect(refresh).toBeEnabled();
    expect(await source()).toBe(blocked);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(source).not.toContain('<animate');
    expect(await source()).toContain('#ff9b8c');

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(source).toContain('dur="12s"');
    await page.route('**/api/snapshot*', route => route.abort());
    await refresh.click();
    await expect.poll(source).not.toContain('<animate');
    await expect(page.getByRole('button', { name: 'Aktualisierung fehlgeschlagen · Wiederholen' })).toBeEnabled();
  } finally {
    await service.close();
    f.close();
  }
});
