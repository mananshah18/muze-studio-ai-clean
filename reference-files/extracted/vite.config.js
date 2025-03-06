import { defineConfig } from 'vite';

export default defineConfig({
    optimizeDeps: {
        esbuildOptions: {
            treeShaking: true,
        },
    },
});
