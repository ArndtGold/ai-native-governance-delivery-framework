import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DecisionCard, type DecisionPort } from '../src/mcp/DecisionCard';
import { readDecisionBootstrap } from '../src/mcp/decision-bootstrap';
import { decisionView } from './decision-fixtures';
afterEach(() => { cleanup(); vi.useRealTimers(); });
function fixture() {
  const view = decisionView('de'); view.binding.gate = 'PRD';
  view.preview = { resource_id: crypto.randomUUID(), version: 'review-v1', task: 'Freigabe und fehlenden Nachweis prüfen', scenarios: ['Vollständig', 'Nachweis fehlt'], criterion_ids: ['AC-001'], content_digest: 'sha256:' + 'b'.repeat(64) };
  const port: DecisionPort = { submit: vi.fn(async () => ({})), document: vi.fn(async () => 'PRD'),
    preview: vi.fn(async () => '<p>Illustrative interaction</p>'), inspect: vi.fn(async () => ({})), expand: vi.fn(async () => {}) };
  return { view, port };
}
it('opens the bound preview beside the document, isolates it, returns focus and never decides from messages', async () => {
  const { view, port } = fixture(); render(<DecisionCard view={view} port={port}/>);
  expect(readDecisionBootstrap({ _meta: { agdf_decision: view } })).toBeTruthy();
  const open = screen.getByRole('button', { name: /Vorschau.*review-v1/ }); fireEvent.click(open);
  const iframe = await screen.findByTitle(view.labels.previewTitle);
  expect(iframe.getAttribute('sandbox')).toBe('allow-scripts'); expect(iframe.getAttribute('srcdoc')).toContain('Illustrative');
  await act(async () => window.dispatchEvent(new MessageEvent('message', { source: (iframe as HTMLIFrameElement).contentWindow, data: { type: 'approve', action: 'approve' } })));
  expect(port.submit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: view.labels.back }));
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: /Vorschau.*review-v1/ })));
  expect(port.submit).not.toHaveBeenCalled(); expect(port.preview).toHaveBeenCalledTimes(1);
});
it('keeps changed material unavailable for approval and supports a read retry after transport failure', async () => {
  const { view, port } = fixture(); port.preview = vi.fn().mockRejectedValueOnce(Error('transport')).mockResolvedValueOnce('<p>retry</p>');
  render(<DecisionCard view={view} port={port}/>); fireEvent.click(screen.getByRole('button', { name: /Vorschau.*review-v1/ }));
  await screen.findByText(view.labels.previewUnavailable); expect((screen.getByRole('button', { name: view.labels.approve }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: /Vorschau.*review-v1/ })); await screen.findByTitle(view.labels.previewTitle); expect(port.preview).toHaveBeenCalledTimes(2);
  cleanup(); const stale = fixture(); stale.port.preview = vi.fn(async () => { throw Error('preview_file_changed'); });
  render(<DecisionCard view={stale.view} port={stale.port}/>); fireEvent.click(screen.getByRole('button', { name: /Vorschau.*review-v1/ }));
  await screen.findByText(view.labels.previewChanged); expect((screen.getByRole('button', { name: view.labels.approve }) as HTMLButtonElement).disabled).toBe(true);
  expect(stale.port.submit).not.toHaveBeenCalled();
});
it('rejects preview metadata on another gate and leaves legacy cards unchanged', () => {
  const { view } = fixture(); view.binding.gate = 'SD'; expect(readDecisionBootstrap({ _meta: { agdf_decision: view } })).toBeNull();
  const legacy = decisionView(); expect(readDecisionBootstrap({ _meta: { agdf_decision: legacy } })).toBeTruthy();
});
it('shows an unavailable rendering path and keeps approval open when the preview port is absent or the frame fails', async () => {
  const missing=fixture();delete missing.port.preview;render(<DecisionCard view={missing.view} port={missing.port}/>);
  expect(screen.getByText(missing.view.labels.previewUnsupported)).toBeTruthy();
  expect((screen.getByRole('button',{name:missing.view.labels.approve}) as HTMLButtonElement).disabled).toBe(true);cleanup();
  const {view,port}=fixture();render(<DecisionCard view={view} port={port}/>);fireEvent.click(screen.getByRole('button',{name:/Vorschau.*review-v1/}));
  const frame=await screen.findByTitle(view.labels.previewTitle) as HTMLIFrameElement;
  await act(async()=>window.dispatchEvent(new MessageEvent('message',{source:frame.contentWindow,data:{type:'agdf-preview-unavailable'}})));
  expect(screen.getByText(view.labels.previewUnsupported)).toBeTruthy();expect(screen.getByRole('button',{name:view.labels.retryPreview})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:view.labels.back}));expect((screen.getByRole('button',{name:view.labels.approve}) as HTMLButtonElement).disabled).toBe(true);
  expect(port.submit).not.toHaveBeenCalled();
});

it('keeps approval disabled while retrying unavailable preview access', async () => {
  const { view, port } = fixture();
  let finish!: (html: string) => void;
  port.preview = vi.fn().mockRejectedValueOnce(Error('transport')).mockImplementationOnce(() => new Promise<string>(resolve => { finish = resolve; })).mockResolvedValue('<p>retry material</p>');
  render(<DecisionCard view={view} port={port}/>);
  fireEvent.click(screen.getByRole('button', { name: /Vorschau.*review-v1/ }));
  await screen.findByText(view.labels.previewUnavailable);
  fireEvent.click(screen.getByRole('button', { name: /Vorschau.*review-v1/ }));
  const approve = screen.getByRole('button', { name: view.labels.approve }) as HTMLButtonElement;
  expect(approve.disabled).toBe(true);
  fireEvent.click(approve); expect(port.submit).not.toHaveBeenCalled();
  await act(async () => finish('<p>retry material</p>'));
  await screen.findByTitle(view.labels.previewTitle);
  fireEvent.click(screen.getByRole('button', { name: view.labels.back }));
  expect((screen.getByRole('button', { name: view.labels.approve }) as HTMLButtonElement).disabled).toBe(true);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /Vorschau.*review-v1/ })));
  const readyFrame = await screen.findByTitle(view.labels.previewTitle) as HTMLIFrameElement;
  await act(async () => window.dispatchEvent(new MessageEvent('message', { source: readyFrame.contentWindow, data: { type: 'agdf-preview-ready' } })));
  expect(screen.queryByText(view.labels.previewUnavailable)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: view.labels.back }));
  await waitFor(() => expect((screen.getByRole('button', { name: view.labels.approve }) as HTMLButtonElement).disabled).toBe(false));
});
it('shows explicitly unanswered preview questions on the decision surface', () => {
  const { view, port } = fixture();
  Object.assign(view.preview!, { open_questions: ['Darf ein wichtiger Nachweis fehlen?'] });
  render(<DecisionCard view={view} port={port}/>);
  expect(screen.getByText('Darf ein wichtiger Nachweis fehlen?')).toBeTruthy();
});

it.each([[''], Array(17).fill('question'), ['x'.repeat(1201)], 'not an array'].map(questions => [questions]))('rejects malformed unanswered question metadata: %j', questions => {
  const { view } = fixture(); Object.assign(view.preview!, { open_questions: questions });
  expect(readDecisionBootstrap({ _meta: { agdf_decision: view } })).toBeNull();
});
