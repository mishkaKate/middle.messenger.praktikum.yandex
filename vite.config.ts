/// <reference types="vitest/config" />
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
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,ts}'],
  },
});
