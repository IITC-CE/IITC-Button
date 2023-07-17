//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import JSZip from "jszip";
import { backup_json_name, formatDate, saveAs } from "@/settings/backup/utils";

export const createBackupZip = async backup => {
  const zip = new JSZip();

  zip.file(backup_json_name, JSON.stringify(backup.data));

  for (const channel in backup.external_plugins) {
    for (const external_plugin_name in backup.external_plugins[channel]) {
      zip.file(
        `${channel}/${external_plugin_name}`,
        backup.external_plugins[channel][external_plugin_name]
      );
    }
  }

  const filename = "iitc-backup_" + formatDate(new Date()) + ".zip";
  zip.generateAsync({ type: "blob" }).then(function(content) {
    saveAs(content, filename);
  });
};

export const filterStorageIitcSettings = all_storage => {
  const iitc_settings = {};
  const storage_keys = [
    "channel",
    "network_host",
    "release_update_check_interval",
    "beta_update_check_interval",
    "custom_update_check_interval"
  ];

  for (const key in all_storage) {
    if (storage_keys.includes(key)) {
      iitc_settings[key] = all_storage[key];
    }
  }
  return iitc_settings;
};

export const filterStoragePluginsSettings = all_storage => {
  const plugins_storage = {};
  for (const key in all_storage) {
    if (key.startsWith("VMin")) {
      plugins_storage[key] = all_storage[key];
    }
  }
  return plugins_storage;
};

export const filterExternalPlugins = all_storage => {
  const external_plugins = {};
  const storage_keys = [
    "release_plugins_user",
    "beta_plugins_user",
    "custom_plugins_user"
  ];

  for (const key in all_storage) {
    if (storage_keys.includes(key)) {
      const channel = key.split("_")[0];
      external_plugins[channel] = {};
      for (const plugin_uid in all_storage[key]) {
        const plugin_filename = all_storage[key][plugin_uid]["filename"];
        external_plugins[channel][plugin_filename] =
          all_storage[key][plugin_uid]["code"];
      }
    }
  }
  return external_plugins;
};
