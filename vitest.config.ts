/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig(
  {
    test: {
      environment: "happy-dom",
      globals: true,
      include: ["**/__tests__/**/*.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        reportsDirectory: "./coverage",
        include: ["src/**/*.{ts,tsx,astro}"],
        exclude: [
          "**/*.d.ts",
          "**/*.test.*",
          "**/*.spec.*",
          "src/env.d.ts",
          "src/types.ts",
          "src/consts/index.ts",
          "src/actions/index.ts",
          "src/content/config.ts",
          "src/layouts/**",
          "src/pages/**",
          "src/styles/**",
          "src/utils/behaviors/index.ts",
          // Exclude .astro files with client scripts (tested via extracted .ts modules)
          "src/components/page-select.astro",
          "src/components/show-button.astro",
          "dist/",
        ],
      },
    },
  },
  {
    site: "https://openplato.org/",
    trailingSlash: "always",
  },
);
