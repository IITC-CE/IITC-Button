const manifest_transformer = (manifest) => {
  const browser = process.env.BROWSER;
  const manifest_version = process.env.MANIFEST_VERSION;
  const is_beta = !!process.env.BETA;

  if (is_beta) {
    manifest.name = `${manifest.name} Beta`;
    manifest.browser_action.default_icon["48"] =
      "assets/icons/48/icon-beta.png";
    manifest.browser_action.default_icon["96"] =
      "assets/icons/96/icon-beta.png";
    manifest.icons["48"] = "assets/icons/48/icon-beta.png";
    manifest.icons["128"] = "assets/icons/128/icon-beta.png";

    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, "0");
    let day = String(currentDate.getDate()).padStart(2, "0");
    let hours = String(currentDate.getHours()).padStart(2, "0");
    let minutes = String(currentDate.getMinutes()).padStart(2, "0");
    let seconds = String(currentDate.getSeconds()).padStart(2, "0");

    let formattedDate = `${year}${month}${day}.${hours}${minutes}${seconds}`;
    manifest.version = `${manifest.version}.${formattedDate}`;
  }

  if (manifest_version === "2") {
    manifest_v2_transformer(manifest, browser);
  } else if (manifest_version === "3") {
    if (browser === undefined) {
      throw Error("BROWSER environment variable is not set");
    }
    manifest_v3_transformer(manifest, browser);
  } else {
    throw Error("MANIFEST_VERSION environment variable is not set");
  }
  manifest.manifest_version = parseInt(manifest_version);
};

const manifest_v2_transformer = (manifest, browser) => {
  manifest.content_scripts = [
    {
      matches: ["<all_urls>"],
      run_at: "document_start",
      js: ["js/content-script.js"],
    },
  ];
  manifest.permissions.push("<all_urls>");
  manifest.permissions.push("webRequest");
  manifest.permissions.push("webRequestBlocking");
  manifest.background.page = "background.html";

  if (browser === "safari-ios") {
    manifest.background.persistent = false;
  }
};

const manifest_v3_transformer = (manifest, browser) => {
  manifest.host_permissions = [
    "https://intel.ingress.com/*",
    "http://*/*",
    "https://*/*",
  ];
  manifest.content_security_policy = {
    extension_pages:
      "default-src 'self'; connect-src 'self' http://localhost:8000 https://*; img-src 'self' https://iitc.app",
  };
  manifest.content_scripts = [
    {
      matches: ["<all_urls>"],
      run_at: "document_start",
      js: ["js/content-script.js"],
    },
  ];
  manifest.permissions.push("webRequest");
  manifest.permissions.push("alarms");

  manifest.action = manifest.browser_action;
  delete manifest.browser_action;

  if (browser === "chrome") {
    delete manifest.browser_specific_settings;
    manifest.minimum_chrome_version = "120";
    manifest.permissions.push("userScripts");
    manifest.permissions.push("declarativeNetRequest");
    manifest.background.service_worker = "js/background.js";

    manifest.web_accessible_resources = [
      {
        resources: ["jsview.html"],
        matches: ["<all_urls>"],
      },
    ];
  }
  if (browser === "firefox" || browser === "safari") {
    manifest.browser_specific_settings.gecko.id = "iitc-beta@modos189.ru";
    manifest.browser_specific_settings.gecko.strict_min_version = "109.0";
    manifest.permissions.push("webRequestBlocking");
    manifest.permissions.push("scripting");
    manifest.background.page = "background.html";
  }
  if (browser === "safari") {
    delete manifest.content_security_policy;
  }
};

module.exports = {
  filenameHashing: false,
  productionSourceMap: false,
  pages: {
    background: {
      template: "public/browser-extension.html",
      entry: "src/background/background.js",
      title: "background",
    },
    popup: {
      template: "public/browser-extension.html",
      entry: "./src/popup/main.js",
      title: "IITC Button popup",
    },
    jsview: {
      template: "public/browser-extension.html",
      entry: "./src/jsview/main.js",
      title: "IITC Button view",
      filename: "jsview.html",
    },
    settings: {
      template: "public/browser-extension.html",
      entry: "./src/settings/main.js",
      title: "IITC Button choose file",
      filename: "settings.html",
    },
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        contentScripts: {
          entries: {
            "content-script": ["src/content-scripts/loader.js"],
          },
        },
      },
      manifestTransformer: (manifest) => {
        manifest_transformer(manifest);
        return manifest;
      },
      artifactFilename: ({ name, version, mode }) => {
        const browser =
          process.env.MANIFEST_VERSION === "3" ? process.env.BROWSER : "all";
        if (mode === "production") {
          return `${name}-v${version}-${browser}-MV${process.env.MANIFEST_VERSION}.zip`;
        }
        return `${name}-v${version}-${browser}-MV${process.env.MANIFEST_VERSION}-${mode}.zip`;
      },
    },
  },
  chainWebpack: (config) => {
    config.optimization.delete("splitChunks");
  },
  configureWebpack: {
    devtool: "cheap-module-source-map",
    optimization: {
      splitChunks: {
        cacheGroups: {
          default: false,
          vendors: false,
        },
      },
    },
  },
};
