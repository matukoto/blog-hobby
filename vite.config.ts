import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import { generateAmazonLinkCardSnapshot } from './src/lib/server/amazon-link-card';
import { generateArticleOgpImages } from './src/lib/server/ogp';

function ogpGenerationPlugin() {
  const generationEnvKey = 'BLOG_HOBBY_OGP_GENERATION_DONE';
  let hasGenerated = false;

  return {
    name: 'ogp-generation',
    apply: 'build',
    async buildStart() {
      if (hasGenerated || process.env[generationEnvKey] === '1') {
        return;
      }
      hasGenerated = true;
      process.env[generationEnvKey] = '1';

      const postsDir = resolve(process.cwd(), 'src/lib/posts');

      await Promise.all([
        generateArticleOgpImages({
          postsDir,
          outputDir: resolve(process.cwd(), 'static'),
        }),
        generateAmazonLinkCardSnapshot({
          postsDir,
          outputFile: resolve(
            process.cwd(),
            'src/lib/generated/amazon-link-card-data.json'
          ),
        }),
      ]);
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
