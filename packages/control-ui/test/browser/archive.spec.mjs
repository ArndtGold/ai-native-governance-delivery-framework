import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { legacyArchiveFixture } from '../../../../scripts/support/legacy-archive-fixture.mjs';
import { importCockpitArchive } from '../../../../scripts/import-cockpit-archive.mjs';
import { startControlServer, evidencePath } from './server-fixture.mjs';
test('archive import is visible and readable in the real passive Cockpit without current approval actions', async ({ page }) => {
  const f = legacyArchiveFixture(); let service;
  try {
    const plan = importCockpitArchive(f.root); importCockpitArchive(f.root, { apply: true, expected: plan.source_digest });
    const before = fs.readFileSync(join(f.root, '.agdf/control/archive/INDEX.json'));
    service = await startControlServer({ dir: f.root });
    await page.addInitScript(({ secret, origin }) => { if (location.origin === origin) history.replaceState(null, '', location.pathname + '#' + secret); }, { secret: service.secret, origin: service.origin });
    await page.goto(service.origin);
    await page.getByRole('button', { name: /Archiv/ }).click();
    await page.getByRole('button', { name: 'Historisches Vorhaben', exact: true }).click();
    const archive = page.getByRole('article', { name: 'Altbestandsarchiv' });
    await expect(archive).toBeVisible(); await expect(archive.getByText(/Keine aktuelle Freigabe/)).toBeVisible();
    await expect(archive.getByText('completed', { exact: true })).toBeVisible();
    const ur = await archive.getByLabel('Archivdokument').locator('option').evaluateAll(options => options.find(option => option.textContent.endsWith('/UR.md')).value);
    await archive.getByLabel('Archivdokument').selectOption(ur);
    await expect(archive.getByText('Unveränderte Übernahme: äöü.', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: /freigeben|approve|fortsetzen/i })).toHaveCount(0);
    expect(fs.readdirSync(join(f.root, '.agdf/control/runs'))).toEqual(['.gitkeep']);
    expect(fs.readFileSync(join(f.root, '.agdf/control/archive/INDEX.json'))).toEqual(before);
    await page.screenshot({ path: evidencePath('agdf-cockpit-archive.png'), fullPage: true });
  } finally { await service?.close(); f.dispose(); }
});
