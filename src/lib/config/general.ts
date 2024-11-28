import type {
  DateConfig,
  FeedConfig,
  FooterConfig,
  HeadConfig,
  HeaderConfig,
  ThemeConfig,
} from "$lib/types/general";

export const theme: ThemeConfig = [
  {
    name: "light",
    text: "Light",
  },
  // {
  //   name: "cmyk",
  //   text: "🖨 Light",
  // },
  // {
  //   name: "dracula",
  //   text: "🧛 Dark",
  // },
  // {
  //   name: "valentine",
  //   text: "🌸 Valentine",
  // },
  // {
  //   name: "aqua",
  //   text: "💦 Aqua",
  // },
  // {
  //   name: "synthwave",
  //   text: "🌃 Synthwave",
  // },
  {
    name: "night",
    text: "dark",
  },
  // {
  //   name: "lemonade",
  //   text: "🍋 Lemonade",
  // },
  // {
  //   name: "cupcake",
  //   text: "🧁 Cupcake",
  // },
  // {
  //   name: "garden",
  //   text: "🏡 Garden",
  // },
  // {
  //   name: "retro",
  //   text: "🌇 Retro",
  // },
  // {
  //   name: "black",
  //   text: "🖤 Black",
  // },
];

export const head: HeadConfig = {};

export const header: HeaderConfig = {
  // nav: [
  //   {
  //     link: "/hello-world",
  //     text: "Get Started",
  //   },
  //   {
  //     link: "/hello-world/elements",
  //     text: "Elements",
  //   },
  // ],
};

export const footer: FooterConfig = {
  // nav: [
  //   {
  //     link: "/atom.xml",
  //     text: "Feed",
  //   },
  //   {
  //     link: "/sitemap.xml",
  //     text: "Sitemap",
  //   },
  // ],
};

export const date: DateConfig = {
  locales: "ja-JP",
  options: {
    day: "numeric",
    month: "short",
    weekday: "long",
    year: "numeric",
  },
};

export const feed: FeedConfig = {};
