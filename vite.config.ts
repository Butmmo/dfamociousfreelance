// Migration note: this replaces @lovable.dev/vite-tanstack-config, a
// Lovable-authored wrapper that used to bundle tanstackStart, viteReact,
// tailwindcss, tsConfigPaths, nitro (Cloudflare preset by default),
// Lovable's dev-only component tagger, VITE_* env injection, and
// React/TanStack dedupe. The @ alias and env injection come for free from
// tsConfigPaths and Vite itself, so nothing extra is needed for those.
//
// Deploy target: set NITRO_PRESET to whatever Nitro preset matches your
// host (e.g. "node-server", "vercel", "netlify", "cloudflare-pages") —
// defaults to "node-server" so a plain `vite build` produces a runnable
// Node server out of the box.
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    }),
    viteReact(),
    nitro({ preset: process.env.NITRO_PRESET ?? "node-server" }),
  ],
});
