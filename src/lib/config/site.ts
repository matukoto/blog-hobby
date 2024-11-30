import type { SiteConfig } from "$lib/types/site";

export const site: SiteConfig = {
  author: {
    avatar: "/assets/favicon.svg",
    bio: "茫洋の海",
    name: "matukoto",
    status: "🔔",
    metadata: [
      {
        // text: 'matukoto',
        icon: "i-simple-icons-github",
        link: "https://github.com/matukoto",
      },
      {
        icon: "i-simple-icons-zenn",
        link: "https://zenn.dev/kesu",
      },
      {
        icon: "i-simple-icons-bluesky",
        link: "https://bsky.app/profile/matukoto.bsky.social",
      },
    ],
  },
  description: "Powered by SvelteKit/Urara",
  domain: import.meta.env.URARA_SITE_DOMAIN ?? "matukoto.dev",
  lang: "ja-JP",
  protocol:
    (import.meta.env.URARA_SITE_PROTOCOL ?? import.meta.env.DEV)
      ? "http://"
      : "https://",
  subtitle: "matukoto blog",
  themeColor: "#3D4451",
  title: "Top Page",
};
