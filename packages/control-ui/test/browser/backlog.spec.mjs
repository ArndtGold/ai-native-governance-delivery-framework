import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer } from '../../server/service.mjs';

function storedBacklog(planned = true) {
  return '# Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | fixture-a | Unterlagen schneller zuordnen | In progress | | UR | Quellen prüfen und den nächsten Arbeitsschritt anhand der bestätigten Voraussetzungen vorbereiten. |\n\n## Planned / Parking Lot\n' + (planned ? '| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 2 | planned-a | Beratung vorbereiten | Needs UR | | | Umfang klären. |\n' : 'Nicht auswertbare Tabelle.\n') + '\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n| fixture-completed | Frühere Umsetzung | Completed | none | Ergebnis dokumentiert. |\n| superseded-a | Abgelöstes Vorhaben | Superseded | none | Durch ein neues Vorhaben ersetzt. |\n';
}
async function overview(page, service) {
  await page.goto(service.startupURL);
  await expect(page.getByRole('button', { name: 'Aktiv 1', exact: true })).toBeVisible();
}
test('backlog areas filter stored entries locally, keep search on return, and match Pages in light/dark at four widths', async ({ page }) => {
  const f = fixture(); fs.writeFileSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), storedBacklog());
  const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  const requests = []; page.on('request', r => { const url = new URL(r.url()); if (url.pathname.startsWith('/api/')) requests.push(url.pathname + url.search); });
  try {
    await overview(page, service);
    await expect(page.getByRole('button', { name: 'Aktiv 1' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Geplant 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archiv 2' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Frühere Umsetzung' })).toHaveCount(0);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
      for (const width of [320, 560, 800, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.locator('.backlog-overview')).toHaveCSS('font-family', 'Inter, system-ui, sans-serif');
        await expect(page.locator('.backlog-overview')).toHaveCSS('background-color', theme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(15, 23, 42)');
        // Wait for the Pages color transition before inspecting or saving the theme.
        await expect(page.getByRole('button', { name: 'Geplant 1' })).toHaveCSS('background-color', theme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(15, 23, 42)');
        const contrasts = await page.locator('.backlog-switch button').evaluateAll(elements => {
          const luminance = color => color.match(/[\d.]+/g).slice(0,3).map(Number).map(v => { const x=v/255; return x<=.04045 ? x/12.92 : ((x+.055)/1.055)**2.4; }).reduce((sum,v,i) => sum+v*[.2126,.7152,.0722][i],0);
          return elements.map(e => { const s=getComputedStyle(e),fg=luminance(s.color),bg=luminance(s.backgroundColor); return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05); });
        });
        expect(contrasts.every(ratio => ratio >= 4.5)).toBe(true);
        const controls = await page.locator('.backlog-switch button').evaluateAll(elements => elements.map(e => { const b = e.getBoundingClientRect(); return { height: b.height, width: b.width, top: b.top, background: getComputedStyle(e).backgroundColor }; }));
        expect(controls.every(c => c.height >= 44 && c.width >= 44)).toBe(true);
        expect(new Set(controls.map(c => c.top)).size).toBe(1);
        expect(controls[0].background).not.toBe(controls[1].background);
        await page.screenshot({ path: `/private/tmp/agdf-backlog-${theme}-${width}-17.png`, fullPage: true });
      }
    }
    await page.getByRole('button', { name: 'Geplant 1' }).focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Beratung vorbereiten' })).toBeVisible();
    await page.getByRole('searchbox').fill('kein Treffer');
    await expect(page.getByText('Keine gespeicherten Vorhaben für diese Suche.')).toBeVisible();
    await page.getByRole('button', { name: 'Archiv 2' }).click();
    await expect(page.getByRole('searchbox')).toHaveValue('');
    await expect(page.getByText('Ergebnis laut Backlog: Durch ein neues Vorhaben ersetzt.')).toBeVisible();
    await expect(page.locator('.row-source[open]')).toHaveCount(0);
    expect(requests.filter(p => !p.startsWith('/api/freshness') && !p.startsWith('/api/backlog-titles'))).toEqual(['/api/snapshot']);
    expect(requests.filter(p => p.startsWith('/api/backlog-titles')).every(path => new URL('http://local'+path).searchParams.get('rows').split(',').length <= 12)).toBe(true);
    await page.getByRole('searchbox').fill('fixture-completed');
    await page.getByRole('button', { name: 'Frühere Umsetzung' }).click();
    await expect(page.locator('.page-title h1')).not.toHaveText('Gespeicherte Vorhaben');
    await page.getByRole('button', { name: 'Alle Vorhaben', exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Archiv 2' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('searchbox')).toHaveValue('fixture-completed');
    await expect(page.getByRole('button', { name: 'Frühere Umsetzung' })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Aktuellen Stand prüfen' })).toHaveCount(0);
  } finally { await service.close(); expect(treeBytes(f.root)).toEqual(before); f.close(); }
});
test('a malformed planned section does not turn its count into zero or obscure readable active entries', async ({ page }) => {
  const f = fixture(); fs.writeFileSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), storedBacklog(false));
  const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await overview(page, service);
    await expect(page.locator('.notice')).toHaveCount(1);
    await expect(page.locator('.notice')).toContainText('Teilweise verfügbar · Geplant');
    await expect(page.getByRole('button', { name: 'Unterlagen schneller zuordnen' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Geplant Nicht verfügbar' })).toBeVisible();
    await page.getByRole('button', { name: 'Geplant Nicht verfügbar' }).click();
    await expect(page.getByText(/Dieser Bereich ist nicht auswertbar/)).toBeVisible();
    await expect(page.getByText('In diesem Bereich sind keine Vorhaben gespeichert.')).toHaveCount(0);
    await expect(page.locator('.notice')).not.toHaveAttribute('open');
  } finally { await service.close(); expect(treeBytes(f.root)).toEqual(before); f.close(); }
});
