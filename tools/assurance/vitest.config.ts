import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tools/assurance/tests/**/*.test.ts'],
    environment: 'node',
    globals: true,
  },
});
