import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, envField } from "astro/config"
import tsconfigPaths from "vite-tsconfig-paths"

import { MY_WEBSITE_URL } from "./src/constants"

export default defineConfig({
  integrations: [sitemap()],
  site: MY_WEBSITE_URL,
  env: {
    schema: {
      GITHUB_TOKEN: envField.string({ context: "server", access: "secret" }),
    },
    validateSecrets: true,
  },
  vite: {
    plugins: [tsconfigPaths(), tailwindcss()],
  },
})
