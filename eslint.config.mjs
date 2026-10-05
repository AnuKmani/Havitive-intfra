import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendor theme assets copied from the Laravel site.
    "public/**",
  ]),
  {
    rules: {
      // The theme's jQuery plugins need plain <img> tags and full page loads between pages.
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      // The theme stylesheets and fonts are loaded in the site's root layout on purpose.
      "@next/next/no-css-tags": "off",
      "@next/next/no-page-custom-font": "off",
    },
  },
]);

export default eslintConfig;
