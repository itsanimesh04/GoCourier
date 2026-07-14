import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    hookTimeout: 90000,
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'dist/**', 'frontend/dist/**']
  }
});
