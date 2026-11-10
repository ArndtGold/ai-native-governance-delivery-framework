import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CockpitInfo } from '../src/CockpitInfo';
import { readRenderBootstrap } from '../src/mcp/bootstrap';

describe('Cockpit provenance', () => {
  const provenance = { schema_version: '1' as const, version: '0.31.0', resource_digest: 'sha256:' + 'a'.repeat(64),
    resource_scope: 'server_validated' as const, host_display: 'unconfirmed' as const, candidate_match: 'unverified' as const };
  it('shows the distinction between server resource and unconfirmed host display', () => {
    render(<CockpitInfo provenance={provenance}/>);
    fireEvent.click(screen.getByText('Info'));
    expect(screen.getByText(/Kandidatenvergleich nicht überprüft/)).toBeTruthy();
    expect(screen.getByText(/Anzeige durch den Host nicht unabhängig bestätigt/)).toBeTruthy();
    expect(screen.getByText(provenance.resource_digest)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Prüfsumme des Kandidaten'), { target: { value: provenance.resource_digest } });
    expect(screen.getByText(/stimmt mit dem angegebenen Kandidaten überein/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Prüfsumme des Kandidaten'), { target: { value: 'sha256:' + 'b'.repeat(64) } });
    expect(screen.getByText(/weicht vom angegebenen Kandidaten ab/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Prüfsumme des Kandidaten'), { target: { value: 'ungueltig' } });
    expect(screen.getByText(/Prüfsumme ungültig/)).toBeTruthy();
  });
  it('does not accept invalid claims from render metadata', () => {
    const value = { structuredContent: { schema_version: '1', authorizes: false, target: { target_id: 't', display_path: '/p' } },
      _meta: { agdf_cockpit: { session_id: '00000000-0000-4000-8000-000000000000', render_generation: 1,
        target: { target_id: 't', display_path: '/p' }, provenance } } };
    expect(readRenderBootstrap(value)?.provenance).toEqual(provenance);
    expect(readRenderBootstrap({ ...value, _meta: { agdf_cockpit: { ...value._meta.agdf_cockpit, integration_surface: 'codex' } } })?.integrationSurface).toBe('codex');
    expect(readRenderBootstrap({ ...value, _meta: { agdf_cockpit: { ...value._meta.agdf_cockpit, integration_surface: 'unknown-host' } } })?.integrationSurface).toBeUndefined();
    expect(readRenderBootstrap({ ...value, _meta: { agdf_cockpit: { ...value._meta.agdf_cockpit,
      provenance: { ...provenance, host_display: 'confirmed' } } } })?.provenance).toBeUndefined();
  });
});
