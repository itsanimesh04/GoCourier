import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    hookTimeout: 90000,
    exclude: ['node_modules/**', 'dist/**']
  }
});
