import { sveltekit } from "@sveltejs/kit/vite";
// @ts-expect-error ts(7016)
import LightningCSS from "postcss-lightningcss";
import TailwindCSS from "tailwindcss";
import unoCSS from "unocss/vite";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";

import tailwindConfig from "./tailwind.config";
import unoConfig from "./uno.config";

export default defineConfig({
  css: {
    postcss: {
      plugins: [TailwindCSS(tailwindConfig), LightningCSS()],
    },
  },
  envPrefix: "URARA_",
  plugins: [unoCSS(unoConfig), imagetools(), sveltekit()],
});
