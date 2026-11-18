import { test, expect } from '@playwright/test';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer } from './server-fixture.mjs';

test('wide overview keeps a readable selected card beside the list and narrows safely', async ({ page }) => {
  const f = fixture(), before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(service.startupURL);
    const companion = page.locator('.overview-figure');
    await expect(companion).toBeVisible();
    const svg = () => companion.getAttribute('src').then(src => decodeURIComponent(src));
    expect(await svg()).toContain('data-accessory="overview-tablet"');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(async () => (await svg()).includes('<animate')).toBe(false);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(async () => (await svg()).includes('<animate')).toBe(true);
    const list = page.locator('.overview-split-list');
    const panel = page.getByRole('region', { name: 'Ausgewählte Anforderung' });
    await expect(panel.getByText('Wähle eine Anforderung, um ihren aktuellen Stand zu sehen.')).toBeVisible();
    const area = page.getByRole('combobox', { name: 'Bestandsbereich' });
    const status = page.getByRole('combobox', { name: 'Lifecycle' });
    const search = page.getByRole('searchbox', { name: 'Suchen' });
    const a = await area.boundingBox(), b = await status.boundingBox(), s = await search.boundingBox();
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);
    expect(b.x).toBeGreaterThan(a.x + a.width - 1);
    expect(s.y).toBeGreaterThan(a.y + a.height);
    expect(s.width).toBeGreaterThan(a.width + b.width);
    await page.setViewportSize({ width: 320, height: 900 });
    const narrowArea = await area.boundingBox(), narrowStatus = await status.boundingBox(), narrowSearch = await search.boundingBox();
    expect(narrowStatus.y).toBeGreaterThan(narrowArea.y + narrowArea.height);
    expect(narrowSearch.y).toBeGreaterThan(narrowStatus.y + narrowStatus.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const firstRow = await page.locator('.undertaking-list > li').first().boundingBox();
    expect(firstRow.y - (narrowSearch.y + narrowSearch.height)).toBeGreaterThanOrEqual(12);
    await expect(page.locator('.backlog-overview')).toHaveCSS('border-top-width', '0px');
    await page.setViewportSize({ width: 1600, height: 900 });
    await list.locator('[data-focus-id="fixture-a"]').click();
    await expect(panel.locator('.work-step')).toBeVisible();
    await expect(panel.locator('.run-figure')).toBeVisible();
    await expect(companion).toBeVisible();
    await expect(list.locator('.work-row-lifecycle--active')).toBeVisible();
    await expect(list.getByText('Aktueller Arbeitsstand')).toHaveCount(1);
    await expect(list.getByText('Zuletzt beobachteter Stand')).toHaveCount(1);
    await expect(list.getByText('Quellenangaben')).toHaveCount(0);
    await panel.getByText('Quellen und Datenstand').click();
    await expect(panel.getByText('Run-Kennung')).toBeVisible();
    await expect(panel.getByText('Listenquelle')).toBeVisible();
    await panel.getByText('Quellen und Datenstand').click();
    await expect(list.locator('[data-focus-id="fixture-a"]')).toHaveAttribute('aria-current', 'true');
    const geometry = await panel.locator('.work-step').evaluate(el => ({ width: el.getBoundingClientRect().width, text: el.scrollWidth, client: el.clientWidth }));
    expect(geometry.width).toBeGreaterThan(350);
    expect(geometry.text).toBeLessThanOrEqual(geometry.client + 1);
    const listBox = await list.boundingBox(), panelBox = await panel.boundingBox();
    expect(listBox.x + listBox.width).toBeLessThan(panelBox.x);
    const detailsLink = panel.getByRole('button', { name: 'Nachweise und weitere Dokumente' });
    await detailsLink.press('Enter');
    await expect(panel.getByRole('region', { name: 'Technische Details' })).toBeVisible();
    const back = panel.getByRole('button', { name: 'Zurück zum Vorhaben' });
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(detailsLink).toBeFocused();
    await status.click(); await page.getByRole('option', { name: 'Abgeschlossen' }).click();
    await expect(list.locator('[data-focus-id="fixture-completed"]')).toBeVisible();
    await expect(list.locator('[data-focus-id="fixture-a"]')).toHaveCount(0);
    await expect(panel.getByText('Wähle eine Anforderung, um ihren aktuellen Stand zu sehen.')).toBeVisible();
    await status.click(); await page.getByRole('option', { name: 'Aktiv', exact: true }).click();
    await list.locator('[data-focus-id="fixture-a"]').click();
    await expect(panel.locator('.work-step')).toBeVisible();
    await page.setViewportSize({ width: 700, height: 900 });
    await expect(page.getByRole('region', { name: 'Ausgewählte Anforderung' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Alle Vorhaben' })).toBeVisible();
    await page.getByText('Quellen und Datenstand').click();
    await expect(page.getByText('Run-Kennung')).toBeVisible();
    expect(treeBytes(f.root)).toEqual(before);
  } finally { await service.close(); f.close(); }
});

test('narrow overview keeps a long list scrollable beneath the filters', async ({ page }) => {
  const f = fixture(), before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await page.route('**/api/snapshot', async route => {
      const response = await route.fetch(), envelope = await response.json();
      const entry = envelope.data?.entries?.find(row => row.section === 'active');
      if (entry) {
        const entries = Array.from({ length: 20 }, (_, i) => ({ ...entry, key: `example-${i}`, original_key: `example-${i}`,
          identity: `run/example-${i}`, title: `Beispiel ${i}`, source: { ...entry.source, path: `.agdf/control/runs/example-${i}/RUN_STATE.md` } }));
        envelope.data.entries = [...entries, ...envelope.data.entries.filter(row => row.section !== 'active')];
        envelope.data.counts.active = entries.length;
      }
      await route.fulfill({ response, json: envelope });
    });
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto(service.startupURL);
    const list = page.locator('#backlog-list');
    await expect(list.locator('.undertaking-list > li')).toHaveCount(21);
    const dimensions = await list.evaluate(el => ({ visible: el.clientHeight, content: el.scrollHeight }));
    expect(dimensions.content).toBeGreaterThan(dimensions.visible);
    await list.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await expect(list.locator('.undertaking-list > li').last()).toBeVisible();
    expect(treeBytes(f.root)).toEqual(before);
  } finally { await service.close(); f.close(); }
});

test('wide list and long details scroll independently, and switching runs resets only details', async ({ page }) => {
  const f = fixture(), before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await page.route('**/api/snapshot*', async route => {
      const response = await route.fetch(), envelope = await response.json();
      if (envelope.data?.kind === 'work') {
        const entry = envelope.data.entries.find(row => row.key === 'fixture-a');
        const extra = Array.from({ length: 16 }, (_, i) => ({ ...entry, key: `example-${i}`, original_key: `example-${i}`,
          identity: `run/example-${i}`, title: `Beispiel ${i}`, source: { ...entry.source, path: `.agdf/control/runs/example-${i}/RUN_STATE.md` } }));
        envelope.data.entries = [entry, ...extra, ...envelope.data.entries.filter(row => row.key !== 'fixture-a')];
        envelope.data.counts.active += extra.length;
      }
      if (envelope.data?.kind === 'run' && envelope.data.run?.evaluation) {
        envelope.data.run.evaluation.next_action_de = Array.from({ length: 30 }, (_, i) => `Schritt ${i + 1}: Arbeitsstand prüfen und nächste Aufgabe vorbereiten.`).join(' ');
      }
      await route.fulfill({ response, json: envelope });
    });
    await page.setViewportSize({ width: 1600, height: 850 });
    await page.goto(service.startupURL);
    const list = page.locator('#backlog-list'), panel = page.locator('.overview-split-detail'), main = page.locator('.workspace--overview > main');
    await page.locator('[data-focus-id="fixture-a"]').click();
    await expect(panel.locator('.work-step')).toBeVisible();
    await expect.poll(() => panel.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    await expect.poll(() => list.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    const search = page.getByRole('searchbox', { name: 'Suchen' });
    const searchY = (await search.boundingBox()).y;
    await list.hover(); await page.mouse.wheel(0, 900);
    await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    expect(await panel.evaluate(el => el.scrollTop)).toBe(0);
    expect(Math.abs((await search.boundingBox()).y - searchY)).toBeLessThan(2);
    const listBefore = await list.evaluate(el => el.scrollTop);
    await panel.hover(); await page.mouse.wheel(0, 850);
    await expect.poll(() => panel.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    expect(await list.evaluate(el => el.scrollTop)).toBe(listBefore);
    expect(await main.evaluate(el => el.scrollTop)).toBe(0);
    const header = panel.locator('.page-title');
    const pbox = await panel.boundingBox(), hbox = await header.boundingBox();
    expect(hbox.y).toBeGreaterThanOrEqual(pbox.y - 1);
    expect(hbox.y).toBeLessThan(pbox.y + 30);
    await list.locator('[data-focus-id="fixture-completed"]').click();
    // A template Objective is no title; the shared rule falls back to the Run ID.
    await expect(panel.getByRole('heading', { name: 'Fixture Completed' })).toBeVisible();
    expect(await panel.evaluate(el => el.scrollTop)).toBe(0);
    expect(await list.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await page.setViewportSize({ width: 1600, height: 480 });
    expect(await main.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    expect(await list.evaluate(el => el.clientHeight)).toBeGreaterThan(100);
    await search.scrollIntoViewIfNeeded();
    await expect(search).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(treeBytes(f.root)).toEqual(before);
  } finally { await service.close(); f.close(); }
});
