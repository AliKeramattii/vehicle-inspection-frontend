import base from "./playwright.neshan-live.config";

// Explicit opt-in; the suite uses the same canonical app and real Neshan services.
const config = { ...base, testMatch: "regression-recovery-live.spec.ts", outputDir: ".agent/reference-review/regression-recovery/browser-results" };

export default config;
