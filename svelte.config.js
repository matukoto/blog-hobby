import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-auto";
import { mdsvex } from "mdsvex";
import { budouxPreprocess } from "svelte-preprocess-budoux";
import mdsvexConfig from "./mdsvex.config.js";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ...mdsvexConfig.extensions],
  kit: {
    adapter: adapter(),
  },

  preprocess: [
    preprocess({
      postcss: true,
    }),
    budouxPreprocess({ language: "ja", attribute: "data-budoux" }),
    mdsvex(mdsvexConfig),
  ],
};

export default config;
