import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({ build: { rolldownOptions: { input: {
  index: fileURLToPath(new URL('./index.html', import.meta.url)),
  card: fileURLToPath(new URL('./card.html', import.meta.url)),
} } } });
