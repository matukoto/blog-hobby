import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import { generateArticleOgpImages } from './src/lib/server/ogp';

function ogpGenerationPlugin() {
  return {
    name: 'ogp-generation',
    apply: 'build',
    async buildStart() {
      await generateArticleOgpImages({
        postsDir: resolve(process.cwd(), 'src/lib/posts'),
        outputDir: resolve(process.cwd(), 'static'),
      });
    },
  };
}

export default defineConfig({
  plugins: [sveltekit(), ogpGenerationPlugin()],
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'client',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium', headless: true }],
          },
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**'],
        },
      },

      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        },
      },
    ],
  },
});
