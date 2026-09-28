import { defineConfig, ESBuildOptions } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  esbuild: {
    transformOptions: {
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      },
    },
  } as ESBuildOptions,
});
