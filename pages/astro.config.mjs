import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
    site: 'https://agdf.iself.eu',
    integrations: [tailwind()],
    output: 'static'
});
