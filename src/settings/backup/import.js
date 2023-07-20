//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import JSZip from "jszip";
import Timeout from "await-timeout";
import deepmerge from "@bundled-es-modules/deepmerge";
import { backup_json_name } from "@/settings/backup/utils";
import { parseMeta } from "lib-iitc-manager";

export const getBackupDataFromZip = async file => {
  const backup = {
    external_plugins: {},
    data: {}
  };
  const zip = await JSZip.loadAsync(file);

  for (const zipName in zip.files) {
    const zipEntry = zip.files[zipName];
    if (!zipEntry.dir) {
      const filename = zipEntry.name;
      const filename_split = filename.split("/");

      if (filename === backup_json_name) {
        // import iitc-button.json
        backup.data = JSON.parse(await zip.file(filename).async("string"));
      } else if (
        filename_split.length > 1 &&
        ["release", "beta", "custom"].includes(filename_split[0])
      ) {
        // import external plugins
        const channel = filename_split[0];
        const plugin_filename = filename_split[1];
        if (!Object.hasOwn(backup.external_plugins, channel)) {
          backup.external_plugins[channel] = {};
        }
        backup.external_plugins[channel][plugin_filename] = await zip
          .file(filename)
          .async("string");
      }
    }
  }
  return backup;
};

export const importBackupIitcSettings = async backup => {
  const backup_obj = Object.assign({}, backup);
  const default_channel = await browser.storage.local
    .get(["channel"])
    .then(data => data.channel);

  await browser.storage.local.set(backup_obj);

  const set_channel = backup_obj.channel;
  if (set_channel !== default_channel) {
    await browser.runtime.sendMessage({
      type: "setChannel",
      value: set_channel
    });
  }
  await Timeout.set(1000);
};

export const importBackupPluginsSettings = async backup => {
  const all_storage = await browser.storage.local.get(null);

  const vMinRecords = {};
  Object.keys(all_storage).forEach(key => {
    if (key.startsWith("VMin")) {
      vMinRecords[key] = all_storage[key];
    }
  });

  const new_storage = deepmerge(vMinRecords, backup);
  await browser.storage.local.set(new_storage);
};

export const importBackupExternalPlugins = async backup => {
  const scripts = [];
  const default_channel = await browser.storage.local
    .get(["channel"])
    .then(data => data.channel);
  let current_channel = null;

  for (const channel of Object.keys(backup)) {
    await browser.runtime.sendMessage({
      type: "setChannel",
      value: channel
    });
    current_channel = channel;

    await Timeout.set(1000);

    for (const [filename, code] of Object.entries(backup[channel])) {
      const meta = parseMeta(code);
      meta["filename"] = filename;
      scripts.push({ meta: meta, code: code });
    }

    await browser.runtime.sendMessage({
      type: "addUserScripts",
      scripts: scripts
    });

    await Timeout.set(100);
  }

  if (current_channel !== default_channel) {
    await browser.runtime.sendMessage({
      type: "setChannel",
      value: default_channel
    });
  }
};
