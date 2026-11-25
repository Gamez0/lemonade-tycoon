// Experimental Android web payload only; does not change PC/web builds.
import { defineConfig } from 'vite';
import desktop from './config.desktop.mjs';

export default defineConfig({
    ...desktop,
    build: {
        ...desktop.build,
        outDir: 'android-web-dist',
        emptyOutDir: true,
    },
});
