import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bankroller: the terminal for serious bettors",
    short_name: "Bankroller",
    description:
      "Track every bet, sharpen your edge with closing-line value, and publish your picks to build a verified track record.",
    start_url: "/",
    display: "standalone",
    background_color: "#252526",
    theme_color: "#00e5a0",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
