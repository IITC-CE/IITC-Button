//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import { _, ajaxGet, clearWait, getUID, parseMeta, wait } from "../helpers";
import { on_extension_update } from "./extension";
import { injectUserScript } from "./injector";

let progress_interval_id = null;
let update_timeout_id = null;
let external_update_timeout_id = null;

let channel = "release";
const network_host = {
  release: "https://iitc.app/build/release",
  beta: "https://iitc.app/build/beta",
  test: "https://iitc.app/build/test",
  local: "http://localhost:8000"
};

export async function runExtension() {
  versionCheck();
}

async function versionCheck() {
  const currentVersion = browser.runtime.getManifest().version;
  const lastVersion = await browser.storage.local.get("lastversion").then(obj => obj["lastversion"]);

  if (lastVersion !== currentVersion) {
    if (lastVersion) {
      await on_extension_update(lastVersion);
    }
    await checkUpdates(true);
    await checkExternalUpdates(true);

    browser.storage.local.set({ lastversion: currentVersion });
  }
}

async function save(options) {
  const data = {};
  Object.keys(options).forEach(key => {
    if (
      [
        "iitc_version",
        "last_modified",
        "iitc_code",
        "categories",
        "plugins_flat",
        "plugins_local",
        "plugins_user"
      ].indexOf(key) !== -1
    ) {
      data[channel + "_" + key] = options[key];
    } else {
      data[key] = options[key];
    }
  });
  await browser.storage.local.set(data);
}

async function getUrl(url, variant, retry) {
  if (retry > 1) {
    let seconds = retry * retry;
    if (seconds > 60 * 60 * 24) seconds = 60 * 60 * 24;
    try {
      await browser.runtime.sendMessage({
        type: "showMessage",
        message: _("serverNotAvailableRetry", seconds.toString())
      });
    } catch {
      // If popup is closed, message goes nowhere and an error occurs. Ignore.
    }
    await wait(seconds);
  }

  clearInterval(progress_interval_id);
  progress_interval_id = setInterval(async () => {
    await showProgress(true);
  }, 300);
  try {
    const response = await ajaxGet(url, variant);
    if (response) {
      clearInterval(progress_interval_id);
      await showProgress(false);
    }
    return response;
  } catch {
    if (retry === undefined) {
      clearInterval(progress_interval_id);
      return null;
    }
    return getUrl(url, variant, retry + 1);
  }
}

async function showProgress(value) {
  try {
    await browser.runtime.sendMessage({
      type: "showProgressbar",
      value: value
    });
  } catch {
    // If popup is closed, message goes nowhere and an error occurs. Ignore.
  }
}

export async function checkUpdates(force) {
  const local = await browser.storage.local.get([
    "channel",
    "last_check_update",
    "local_server_host",
    "release_update_check_interval",
    "beta_update_check_interval",
    "test_update_check_interval",
    "local_update_check_interval",
    "release_last_modified",
    "beta_last_modified",
    "test_last_modified",
    "local_last_modified",
    "release_categories",
    "beta_categories",
    "test_categories",
    "local_categories",
    "release_plugins_flat",
    "beta_plugins_flat",
    "test_plugins_flat",
    "local_plugins_flat",
    "release_plugins_local",
    "beta_plugins_local",
    "test_plugins_local",
    "local_plugins_local",
    "release_plugins_user",
    "beta_plugins_user",
    "test_plugins_user",
    "local_plugins_user"
  ]);

  if (local.channel) channel = local.channel;
  if (local.local_server_host)
    network_host["local"] = `http://${local.local_server_host}`;

  let update_check_interval =
    local[channel + "_update_check_interval"] * 60 * 60;
  if (!update_check_interval) update_check_interval = 24 * 60 * 60;
  if (channel === "local") update_check_interval = 5; // check every 5 seconds

  if (
    local[channel + "_last_modified"] === undefined ||
    local.last_check_update === undefined
  ) {
    clearWait();
    clearTimeout(update_timeout_id);
    update_timeout_id = null;
    await downloadMeta(local, null);
  } else {
    const time_delta =
      Math.floor(Date.now() / 1000) -
      update_check_interval -
      local.last_check_update;
    if (time_delta >= 0 || force) {
      clearWait();
      clearTimeout(update_timeout_id);
      update_timeout_id = null;
      const last_modified = await getUrl(
        network_host[channel] + "/meta.json",
        "Last-Modified",
        true
      );
      if (last_modified !== local[channel + "_last_modified"] || force) {
        await downloadMeta(local, last_modified);
      }
    }
  }
  if (!update_timeout_id) {
    await save({
      last_check_update: Math.floor(Date.now() / 1000)
    });
    update_timeout_id = setTimeout(async () => {
      await checkUpdates();
    }, update_check_interval * 1000);
  }
}

async function downloadMeta(local, last_modified) {
  const response = await getUrl(
    network_host[channel] + "/meta.json",
    "parseJSON",
    true
  );
  if (!response) return;

  let plugins_flat = getPluginsFlat(response);
  const categories = getCategories(response);
  let plugins_local = local[channel + "_plugins_local"];
  const plugins_user = local[channel + "_plugins_user"];

  const p_iitc = async () => {
    const iitc_code = await getUrl(
      network_host[channel] + "/total-conversion-build.user.js"
    );
    if (iitc_code) {
      await save({
        iitc_code: iitc_code
      });
    }
  };

  const p_plugins = async () => {
    plugins_local = await updateLocalPlugins(plugins_flat, plugins_local);

    plugins_flat = rebuildingArrayCategoriesPlugins(
      categories,
      plugins_flat,
      plugins_local,
      plugins_user
    );
    await save({
      iitc_version: response["iitc_version"],
      last_modified: last_modified,
      categories: categories,
      plugins_flat: plugins_flat,
      plugins_local: plugins_local,
      plugins_user: plugins_user
    });
  };

  await Promise.all([p_iitc, p_plugins].map(fn => fn()));
}

function getCategories(data) {
  if (!("categories" in data)) return {};
  const categories = data["categories"];

  Object.keys(categories).forEach(cat => {
    if ("plugins" in categories[cat]) {
      delete categories[cat]["plugins"];
    }
  });

  return categories;
}

function getPluginsFlat(data) {
  if (!("categories" in data)) return {};
  const plugins = {};
  const categories = data["categories"];

  Object.keys(categories).forEach(cat => {
    if ("plugins" in categories[cat]) {
      Object.keys(categories[cat]["plugins"]).forEach(id => {
        const plugin = categories[cat]["plugins"][id];
        plugin["uid"] = getUID(plugin);
        plugin["status"] = "off";
        plugin["category"] = cat;
        plugins[plugin["uid"]] = plugin;
      });
    }
  });
  return plugins;
}

export async function checkExternalUpdates(force) {
  const local = await browser.storage.local.get([
    "channel",
    "last_check_external_update",
    "external_update_check_interval",
    "release_plugins_user",
    "beta_plugins_user",
    "test_plugins_user",
    "local_plugins_user"
  ]);

  if (local.channel) channel = local.channel;

  let update_check_interval = local["external_update_check_interval"] * 60 * 60;
  if (!update_check_interval) {
    update_check_interval = 24 * 60 * 60;
  }

  const time_delta =
    Math.floor(Date.now() / 1000) -
    update_check_interval -
    local.last_check_external_update;
  if (time_delta >= 0 || force) {
    clearTimeout(external_update_timeout_id);
    external_update_timeout_id = null;
    await updateExternalPlugins(local);
  }

  if (!external_update_timeout_id) {
    await save({
      last_check_external_update: Math.floor(Date.now() / 1000)
    });

    external_update_timeout_id = setTimeout(async () => {
      await checkUpdates();
    }, update_check_interval * 1000);
  }
}

async function updateExternalPlugins(local) {
  const plugins_user = local[channel + "_plugins_user"];
  if (plugins_user) {
    let exist_updates = false;
    const hash = `?${Date.now()}`;

    for (const uid of Object.keys(plugins_user)) {
      const plugin = plugins_user[uid];

      if (plugin["updateURL"] && plugin["downloadURL"]) {
        // download meta info
        const response_meta = await getUrl(plugin["updateURL"] + hash);
        if (response_meta) {
          let meta = parseMeta(response_meta);
          // if new version
          if (
            meta &&
            meta["version"] &&
            meta["version"] !== plugin["version"]
          ) {
            // download userscript
            let response_code = await getUrl(plugin["updateURL"] + hash);
            if (response_code) {
              exist_updates = true;
              plugins_user[uid] = meta;
              plugins_user[uid]["code"] = response_code;
            }
          }
        }
      }
    }

    if (exist_updates) {
      await save({
        plugins_user: plugins_user
      });
    }
  }
}

async function updateLocalPlugins(plugins_flat, plugins_local) {
  // If no plugins installed
  if (plugins_local === undefined) return {};

  // Iteration local plugins
  for (const uid of Object.keys(plugins_local)) {
    let filename = plugins_local[uid]["filename"];

    if (filename && plugins_flat[uid]) {
      let code = await getUrl(`${network_host[channel]}/plugins/${filename}`);
      if (code) plugins_local[uid]["code"] = code;
    } else {
      delete plugins_local[uid];
    }
  }

  return plugins_local;
}

export async function managePlugin(uid, category, action) {
  let local = await browser.storage.local.get([
    channel + "_plugins_flat",
    channel + "_plugins_local",
    channel + "_plugins_user"
  ]);

  let plugins_flat = local[channel + "_plugins_flat"];
  let plugins_local = local[channel + "_plugins_local"];
  let plugins_user = local[channel + "_plugins_user"];

  if (plugins_local === undefined) plugins_local = {};
  if (plugins_user === undefined) plugins_user = {};

  if (action === "on") {
    if (
      (plugins_flat[uid]["user"] === false &&
        plugins_local[uid] !== undefined) ||
      plugins_flat[uid]["user"] === true
    ) {
      plugins_flat[uid]["status"] = "on";
      if (plugins_flat[uid]["user"]) {
        plugins_user[uid]["status"] = "on";
      } else {
        plugins_local[uid]["status"] = "on";
      }

      await injectUserScript(
        plugins_flat[uid]["user"] === true
          ? plugins_user[uid]["code"]
          : plugins_local[uid]["code"]
      );

      await save({
        plugins_flat: plugins_flat,
        plugins_local: plugins_local,
        plugins_user: plugins_user
      });
    } else {
      let filename = plugins_flat[uid]["filename"];
      let response = await getUrl(
        `${network_host[channel]}/plugins/${filename}`
      );
      if (response) {
        plugins_flat[uid]["status"] = "on";
        plugins_local[uid] = plugins_flat[uid];
        plugins_local[uid]["code"] = response;

        await injectUserScript(plugins_local[uid]["code"]);

        await save({
          plugins_flat: plugins_flat,
          plugins_local: plugins_local
        });
      }
    }
  }
  if (action === "off") {
    plugins_flat[uid]["status"] = "off";
    if (plugins_flat[uid]["user"]) {
      plugins_user[uid]["status"] = "off";
    } else {
      plugins_local[uid]["status"] = "off";
    }

    await save({
      plugins_flat: plugins_flat,
      plugins_local: plugins_local,
      plugins_user: plugins_user
    });
  }
  if (action === "delete") {
    if (plugins_flat[uid]["override"]) {
      plugins_flat[uid]["override"] = false;
      plugins_flat[uid]["user"] = false;
      plugins_flat[uid]["status"] = "off";
    } else {
      delete plugins_flat[uid];
    }
    delete plugins_user[uid];

    await save({
      plugins_flat: plugins_flat,
      plugins_local: plugins_local,
      plugins_user: plugins_user
    });
  }
}

export async function addUserScripts(scripts) {
  let local = await browser.storage.local.get([
    channel + "_categories",
    channel + "_plugins_flat",
    channel + "_plugins_local",
    channel + "_plugins_user"
  ]);

  let categories = local[channel + "_categories"];
  let plugins_flat = local[channel + "_plugins_flat"];
  let plugins_local = local[channel + "_plugins_local"];
  let plugins_user = local[channel + "_plugins_user"];

  if (plugins_local === undefined) plugins_local = {};
  if (plugins_user === undefined) plugins_user = {};

  scripts.forEach(script => {
    let meta = script["meta"];
    const code = script["code"];
    const plugin_uid = getUID(meta);

    plugins_user[plugin_uid] = Object.assign(meta, {
      uid: plugin_uid,
      status: "on",
      code: code
    });

    if (plugin_uid in plugins_flat) {
      if (
        plugin_uid in plugins_local &&
        plugins_flat[plugin_uid]["status"] !== "off"
      ) {
        plugins_local[plugin_uid]["status"] = "off";
      }

      plugins_flat[plugin_uid]["status"] = "on";
      plugins_flat[plugin_uid]["code"] = code;
      plugins_flat[plugin_uid]["override"] = true;
    } else {
      plugins_flat[plugin_uid] = { ...plugins_user[plugin_uid] };

      let category = plugins_user[plugin_uid]["category"];
      if (category === undefined) {
        category = "Misc";
        plugins_user[plugin_uid]["category"] = category;
      }
      if (!(category in categories)) {
        categories[category] = {
          name: category,
          description: ""
        };
      }
    }
    plugins_flat[plugin_uid]["user"] = true;
  });

  await save({
    categories: categories,
    plugins_flat: plugins_flat,
    plugins_local: plugins_local,
    plugins_user: plugins_user
  });
}

function rebuildingArrayCategoriesPlugins(
  categories,
  raw_plugins,
  plugins_local,
  plugins_user
) {
  let data = {};
  if (plugins_local === undefined) plugins_local = {};
  if (plugins_user === undefined) plugins_user = {};

  if (raw_plugins["Obsolete"] !== undefined) delete raw_plugins["Obsolete"];
  if (raw_plugins["Deleted"] !== undefined) delete raw_plugins["Deleted"];
  data = { ...raw_plugins };

  // Build local plugins
  Object.keys(plugins_local).forEach(plugin_uid => {
    data[plugin_uid]["status"] = plugins_local[plugin_uid]["status"];
  });

  // Build External plugins
  if (Object.keys(plugins_user).length) {
    Object.keys(plugins_user).forEach(plugin_uid => {
      if (plugin_uid in data) {
        data[plugin_uid]["status"] = plugins_user[plugin_uid]["status"];
        data[plugin_uid]["code"] = plugins_user[plugin_uid]["code"];
        data[plugin_uid]["override"] = true;
      } else {
        data[plugin_uid] = plugins_user[plugin_uid];
      }
      data[plugin_uid]["user"] = true;
    });
  }

  return data;
}
