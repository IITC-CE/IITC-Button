import { defineConfig } from "wxt";
import { readFileSync } from "fs";
import { resolve, join } from "path";

// Read manifest.json for base fields
const baseManifest = JSON.parse(
  readFileSync(resolve(__dirname, "src/manifest.json"), "utf-8"),
);

export default defineConfig({
  srcDir: "src",
  entrypointsDir: "entrypoints",
  publicDir: resolve(__dirname, "src/public"),

  modules: ["@wxt-dev/module-vue"],

  alias: {
    "@": resolve(__dirname, "src"),
  },

  manifest: ({ browser, mode }) => {
    const isBeta = !!process.env.BETA;
    const version = baseManifest.version ?? "3.2.5";

    // Build base manifest fields we control (WXT handles action/background/content_scripts)
    const result: Record<string, unknown> = {
      name: "IITC Button",
      description: "__MSG_extDescription__",
      default_locale: "en",
      icons: {
        "48": "assets/icons/48/icon.png",
        "128": "assets/icons/128/icon.png",
      },
      permissions: ["tabs", "storage", "unlimitedStorage"],
    };

    // Beta overrides
    if (isBeta) {
      result.name = "IITC Button Beta";
      const gitRevCount = parseInt(process.env.GIT_REV_COUNT ?? "0") % 65535;
      result.version = `${version}.${gitRevCount}`;
      result.icons = {
        "48": "assets/icons/48/icon-beta.png",
        "128": "assets/icons/128/icon-beta.png",
      };
    }

    const perms = result.permissions as string[];

    perms.push("webRequest", "alarms");

    result.host_permissions = [
      "https://intel.ingress.com/*",
      "http://*/*",
      "https://*/*",
    ];

    result.action = {
      default_title: "__MSG_titleDefault__",
      default_icon: {
        "48": isBeta
          ? "assets/icons/48/icon-beta.png"
          : "assets/icons/48/icon.png",
        "96": isBeta
          ? "assets/icons/96/icon-beta.png"
          : "assets/icons/96/icon.png",
      },
    };

    const isProd = mode === "production";

    if (browser === "chrome") {
      result.minimum_chrome_version = "120";
      perms.push("userScripts", "declarativeNetRequest");
      if (isProd) {
        result.content_security_policy = {
          extension_pages:
            "default-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:8000 https://*; img-src 'self' https://* data:",
        };
      }
      // web_accessible_resources for jsview and sandbox
      result.web_accessible_resources = [
        {
          resources: ["sandbox.html", "jsview.html"],
          matches: ["<all_urls>"],
        },
      ];
    } else if (browser === "firefox" || browser === "safari") {
      result.browser_specific_settings = {
        gecko: {
          id: isBeta ? "iitc-beta@modos189.ru" : "iitc@modos189.ru",
          strict_min_version: "109.0",
        },
        gecko_android: {
          strict_min_version: "113.0",
        },
      };
      perms.push("webRequestBlocking", "scripting");

      if (browser === "firefox" && isProd) {
        result.content_security_policy = {
          extension_pages:
            "default-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:8000 https://*; img-src 'self' https://* data:",
        };
      }
      // Safari: no CSP
      result.web_accessible_resources = [
        {
          resources: ["sandbox.html"],
          matches: ["<all_urls>"],
        },
      ];
    }

    return result;
  },

  // Zip configuration
  zip: {
    // Off by default so each build leaves exactly one zip in artifacts/.
    // The Firefox AMO sources zip is generated on demand by `npm run zip_sources` (wxt zip --sources).
    zipSources: false,
    // Built into .output first, then copied to artifacts/ via the zip hooks below.
    artifactTemplate:
      "{{name}}-v{{version}}-{{browser}}-{{manifestVersion}}.zip",
    sourcesTemplate: "iitc-button-v{{version}}-sources.zip",
    exclude: ["**/.DS_Store"],
    excludeSources: ["**/artifacts/**", "**/safari/**", "**/*.zip"],
  },

  hooks: {
    "zip:extension:done": async (wxt, zipPath) => {
      const { mkdirSync, copyFileSync } = await import("fs");
      const { resolve } = await import("path");

      const artifactsDir = resolve(wxt.config.root, "artifacts");
      mkdirSync(artifactsDir, { recursive: true });

      const browserLabel = wxt.config.browser;
      const mv = `MV${wxt.config.manifestVersion}`;
      const version = JSON.parse(
        readFileSync(resolve(wxt.config.root, "package.json"), "utf-8"),
      ).version;
      const name = "iitc-button";

      // wxt zip always runs in production mode, so no mode suffix is needed
      const filename = `${name}-v${version}-${browserLabel}-${mv}.zip`;

      const destPath = join(artifactsDir, filename);
      copyFileSync(zipPath, destPath);
      wxt.logger.success(`Artifact saved: artifacts/${filename}`);
    },

    "zip:sources:done": async (wxt, zipPath) => {
      const { mkdirSync, copyFileSync } = await import("fs");

      const artifactsDir = resolve(wxt.config.root, "artifacts");
      mkdirSync(artifactsDir, { recursive: true });

      const destPath = join(artifactsDir, "sources.zip");
      copyFileSync(zipPath, destPath);
      wxt.logger.success(`Sources artifact saved: artifacts/sources.zip`);
    },
  },

  vite: () => ({
    build: {
      sourcemap: false,
    },
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
      // Local-only: a linked (file:) dependency resolves to its real path outside
      // node_modules, which leaks WXT auto-imports into it and breaks the build.
      // Keeping symlinks unresolved keeps it under node_modules so WXT skips it.
      // Enable via the dev:*:link scripts (LINK_LIB=1); off for normal/CI builds.
      preserveSymlinks: !!process.env.LINK_LIB,
    },
  }),
});
