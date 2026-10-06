import fs from 'node:fs';
import { defineConfig } from 'vite';
import web from './config.prod.mjs';

// Keep legacy/public research assets in the web preview, outside the PC package.
export default defineConfig({
    ...web,
    publicDir: false,
    build: {
        ...web.build,
        outDir: 'desktop-dist',
        rollupOptions: {
            ...web.build.rollupOptions,
            input: { reboot: 'index.html' },
        },
    },
    plugins: [...web.plugins, {
        name: 'desktop-distribution',
        transformIndexHtml(html) {
            return html.replace(/\s*<link rel="icon"[^>]*>/, '');
        },
        generateBundle() {
            this.emitFile({ type: 'asset', fileName: 'licenses/OFL-Oswald.txt',
                source: fs.readFileSync(new URL('../public/fonts/OFL-Oswald.txt', import.meta.url)) });
        },
    }],
});
