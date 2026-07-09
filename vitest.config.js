import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // pipeline.test.js is a manual demo script (run via `npm run test:pipeline`),
    // not a vitest suite.
    exclude: ["**/node_modules/**", "server/test/pipeline.test.js"],
  },
});
