import { expect, it } from 'vitest';
import { cockpitHostFromName, cockpitTitle } from '../src/host-label';

it('uses only recognized host-reported names and leaves unknown hosts neutral', () => {
  expect(cockpitTitle(cockpitHostFromName('Codex'))).toBe('AGDF Cockpit für Codex');
  expect(cockpitHostFromName('chatgpt', 'codex')).toBe('codex');
  expect(cockpitHostFromName('chatgpt', 'claude')).toBe('unknown');
  expect(cockpitHostFromName('chatgpt')).toBe('unknown');
  expect(cockpitTitle(cockpitHostFromName('Claude Code'))).toBe('AGDF Cockpit für Claude Code');
  expect(cockpitTitle(cockpitHostFromName('Codex Simulator'))).toBe('AGDF Cockpit');
  expect(cockpitTitle(cockpitHostFromName(undefined))).toBe('AGDF Cockpit');
  expect(cockpitTitle('preview')).toBe('AGDF Cockpit · lokale Vorschau');
});
