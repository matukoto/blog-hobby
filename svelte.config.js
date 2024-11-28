import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";

import mdsvexConfig from "./mdsvex.config.js";

/** @type {import("@sveltejs/kit").Config} */
export default {
  extensions: [".svelte", ...(mdsvexConfig.extensions ?? [])],
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      platformPloxy: {
        configPath: "./wrangler.toml",
        environment: undefined,
        experimentalJsonConfig: false,
        persist: false,
      },
      routes: {
        exclude: ["<all>"],
        include: ["/*"],
      },
    }),
  },
  preprocess: [mdsvex(mdsvexConfig), vitePreprocess()],
};
