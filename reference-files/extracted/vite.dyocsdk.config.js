import { defineConfig } from 'vite';

const libName = 'DYOCSDK';
const fileName = 'dyocsdk';

export default defineConfig({
    build: {
        target: 'esnext',
        emptyOutDir: true,
        copyPublicDir: false,
        lib: {
            entry: './src/dyocsdk/index.ts',
            name: libName,
            formats: ['es'],
            fileName: fileName,
        },
        outDir: './src/dyocsdk/dist',
        rollupOptions: {
            output: {
                assetFileNames: `${fileName}.[ext]`,
            },
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            treeShaking: true,
        },
    },
});
