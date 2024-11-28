import type { Icon } from "$lib/types/icon";

import { site } from "$lib/config/site";

export const favicon: Icon = {
  sizes: "48x48",
  src: `${site.protocol + site.domain}/assets/favicon-48x48.png`,
  type: "image/png",
};

export const any: { [key: number]: Icon } = {
  180: {
    sizes: "180x180",
    src: `${site.protocol + site.domain}/assets/favicon.svg`,
    type: "image/png",
  },
  192: {
    sizes: "192x192",
    src: `${site.protocol + site.domain}/assets/favicon.svg`,
    type: "image/png",
  },
  512: {
    sizes: "512x512",
    src: `${site.protocol + site.domain}/assets/favicon.svg`,
    type: "image/png",
  },
};

export const maskable: { [key: number]: Icon } = {
  192: {
    sizes: "192x192",
    src: `${site.protocol + site.domain}/assets/favicon.svg`,
    type: "image/png",
  },
  512: {
    sizes: "512x512",
    src: `${site.protocol + site.domain}/assets/favicon.svg`,
    type: "image/png",
  },
};
