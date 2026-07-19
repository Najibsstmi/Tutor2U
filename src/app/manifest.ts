import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    icons: [
      {
        src: siteConfig.brand.logo192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: siteConfig.brand.logo512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: siteConfig.brand.logo512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
