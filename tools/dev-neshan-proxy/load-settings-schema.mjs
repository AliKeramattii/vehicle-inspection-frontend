import { registerHooks } from "node:module";

// Native Node TS does not use Next's bundler resolution. Keep that difference
// confined to this tool: only this known schema dependency is remapped.
const schemaUrl = new URL("../../src/config/site-settings.schema.ts", import.meta.url).href;
const assetUrl = new URL("../../src/config/vehicle-assets.ts", import.meta.url).href;
let pending;
export function loadSettingsSchema() {
  pending ??= (async () => {
    const hooks = registerHooks({
      resolve(specifier, context, nextResolve) {
        if (context.parentURL === schemaUrl && specifier === "./vehicle-assets")
          return nextResolve(assetUrl, context);
        return nextResolve(specifier, context);
      },
      load(url, context, nextLoad) {
        // These two erasable, import/export TS modules are ESM only in this tool.
        // No package-wide module switch or frontend compiler change is needed.
        return nextLoad(url, url === schemaUrl || url === assetUrl ? { ...context, format: "module-typescript" } : context);
      },
    });
    try { return await import(schemaUrl); }
    finally { hooks.deregister(); }
  })();
  return pending;
}
