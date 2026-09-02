import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Morphic",
    short_name: "Morphic",
    description:
      "Adaptive workspaces grounded in GitHub evidence and explicit approval.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f2",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
