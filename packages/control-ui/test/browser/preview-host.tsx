import React from 'react';
import { createRoot } from 'react-dom/client';
import { DecisionCard } from '../../src/mcp/DecisionCard';
import type { DecisionBootstrap } from '../../src/mcp/decision-bootstrap';
import '../../src/style.css';
import '../../src/theme.css';
import '../../src/mcp/style.css';
const data = window as unknown as { previewView: DecisionBootstrap; decisions: number };
const view = data.previewView;
data.decisions = 0;
createRoot(document.getElementById('root')!).render(<DecisionCard view={view} port={{
  preview: async () => { const response=await fetch('/preview'); if(!response.ok) throw Error('preview_unavailable'); return response.text(); }, document: async () => '# PRD', expand: async () => {}, inspect: async () => ({}),
  submit: async () => { data.decisions++; return {}; },
}}/>);
