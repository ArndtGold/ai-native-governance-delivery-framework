import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { WorkStandLabel } from '../src/WorkStandLabel';
import { runData } from './scoped-fixtures';

afterEach(cleanup);
it('never labels an unconfirmed or mismatched assessment as current', () => {
  const data = runData('run-a');
  data.evaluation!.control_assessment = { state: 'unconfirmed', authorizes: false };
  const view = render(<WorkStandLabel data={data} current stale={false}/>);
  expect(screen.getByText('Zuletzt beobachteter Arbeitsstand')).toBeTruthy();
  data.evaluation!.control_assessment = { state: 'open', authorizes: false };
  data.persisted!.current_gate = 'UR';
  view.rerender(<WorkStandLabel data={{...data}} current stale={false}/>);
  expect(screen.getByText('Zuletzt beobachteter Arbeitsstand')).toBeTruthy();
  expect(screen.queryByText('Aktueller Arbeitsstand')).toBeNull();
  view.rerender(<WorkStandLabel data={{...data}} current={false} stale reopen/>);
  expect(screen.getByText('Sitzung nicht verfügbar. Cockpit erneut öffnen.')).toBeTruthy();
  expect(screen.queryByText('Datenstand nicht aktuell. Bitte aktualisieren.')).toBeNull();
});
