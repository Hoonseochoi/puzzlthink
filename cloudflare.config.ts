import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "puzzlthink",
    entrypoint: "vinext/server/fetch-handler",
    workersDev: true, // keep puzzlthink.<account>.workers.dev as a direct check URL
    domains: ["www.puzzlthink.com", "puzzlthink.com"],
    compatibilityDate: "2026-11-20",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
    },
  }),
});
