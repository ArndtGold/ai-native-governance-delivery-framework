import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AboutCockpit } from '../src/AboutCockpit';

afterEach(cleanup);
it('shows the verified server build in short form and reveals the complete digest', () => {
  const digest = 'sha256:' + 'ab123456'.repeat(8);
  render(<AboutCockpit onClose={() => {}} provenance={{ schema_version: '1', version: '0.31.0', resource_digest: digest, resource_scope: 'server_validated', host_display: 'unconfirmed', candidate_match: 'unverified' }}/>);
  expect(document.activeElement).toBe(screen.getByRole('dialog', { name: 'Dein Projekt im Blick' }));
  expect(screen.getByText(/AGDF Cockpit 0\.31\.0/)).toBeTruthy();
  const summary = screen.getByText('Build ab123456…');
  const details = summary.closest('details')!;
  expect(details.open).toBe(false);
  fireEvent.click(summary);
  expect(details.open).toBe(true);
  expect(screen.getByText(digest)).toBeTruthy();
  expect(screen.getByText(/Host ist nicht unabhängig bestätigt/)).toBeTruthy();
});
it('does not invent provenance when none is provided', () => {
  render(<AboutCockpit onClose={() => {}}/>);
  expect(screen.getByText(/Version nicht verfügbar/)).toBeTruthy();
  expect(screen.getByText('Build nicht verfügbar')).toBeTruthy();
});
