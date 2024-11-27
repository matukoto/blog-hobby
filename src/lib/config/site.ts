import type { SiteConfig } from "$lib/types/site";

export const site: SiteConfig = {
  author: {
    avatar: "/favicon.svg",
    bio: "茫洋の海",
    name: "matukoto",
    status: "🔔",
  },
  description: "Powered by SvelteKit/Urara",
  domain: import.meta.env.URARA_SITE_DOMAIN ?? "urara-demo.netlify.app",
  lang: "ja-JP",
  protocol:
    (import.meta.env.URARA_SITE_PROTOCOL ?? import.meta.env.DEV)
      ? "http://"
      : "https://",
  subtitle: "Sweet & Powerful SvelteKit Blog Template",
  themeColor: "#3D4451",
  title: "Top Page",
};
