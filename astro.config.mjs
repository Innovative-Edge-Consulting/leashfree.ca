import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://leashfree.ca",
  output: "static",
  integrations: [react()]
});
