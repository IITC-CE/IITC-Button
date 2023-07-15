//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
export function formatDate(date) {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return (
    year + "-" + month + "-" + day + "_" + hours + "." + minutes + "." + seconds
  );
}

function padZero(number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}

function getSubstringBeforeUnderscore(str) {
  const underscoreIndex = str.indexOf("_");
  if (underscoreIndex !== -1) {
    return str.substr(0, underscoreIndex);
  }
  return str;
}

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

export const filterStoragePluginsStatus = all_storage => {
  const plugins_status = {};
  const storage_keys = [
    "release_plugins_local",
    "beta_plugins_local",
    "custom_plugins_local",
    "release_plugins_user",
    "beta_plugins_user",
    "custom_plugins_user"
  ];

  for (const key in all_storage) {
    if (storage_keys.includes(key)) {
      plugins_status[key] = {};
      for (const plugin_uid in all_storage[key]) {
        plugins_status[key][plugin_uid] =
          all_storage[key][plugin_uid]["status"];
      }
    }
  }
  return plugins_status;
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
      const channel = getSubstringBeforeUnderscore(key);
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
