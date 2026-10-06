import { designTheme } from './scripts/design-tokens.mjs';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
    darkMode: 'class',
    theme: { extend: designTheme },
    plugins: [],
}
