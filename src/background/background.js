//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import { Manager } from "lib-iitc-manager";
import browser from "webextension-polyfill";
import {
  IS_LEGACY_API,
  IS_SCRIPTING_API,
  IS_USERSCRIPTS_API,
} from "@/userscripts/env";
import { _ } from "@/i18n";
import {
  onUpdatedListener,
  onRemovedListener,
  onRequestOpenIntel,
  onToggleIITC,
} from "./intel";
import "./requests";
import {
  init_userscripts_api,
  is_iitc_enabled,
  is_userscripts_api_available,
} from "@/userscripts/utils";
import {
  inject_plugin_via_content_scripts,
  manage_userscripts_api,
} from "@/background/injector";
import { xmlHttpRequestFallbackHandler } from "@/background/xhr-fallback";

const manager = new Manager({
  storage: browser.storage.local,
  message: (message, args) => {
    browser.runtime
      .sendMessage({
        type: "showMessage",
        message: _(message, args),
      })
      .then()
      .catch(() => {}); // If popup is closed, message goes nowhere and an error occurs. Ignore.
  },
  progressbar: (is_show) => {
    browser.runtime
      .sendMessage({
        type: "showProgressbar",
        value: is_show,
      })
      .then()
      .catch(() => {}); // If popup is closed, message goes nowhere and an error occurs. Ignore.
  },
  inject_plugin: async (plugin) => {
    if (IS_USERSCRIPTS_API) return;

    const iitc_status = await is_iitc_enabled();
    if (iitc_status === false) return;

    await inject_plugin_via_content_scripts(plugin, true);
  },
  plugin_event: async (data) => {
    if (IS_SCRIPTING_API) return;
    await manage_userscripts_api(data);
  },
  is_daemon: true,
});

manager.run().then();

if (IS_LEGACY_API || IS_SCRIPTING_API) {
  const { onUpdated, onRemoved } = browser.tabs;
  onUpdated.addListener((tabId, status, tab) =>
    onUpdatedListener(tabId, status, tab, manager)
  );
  onRemoved.addListener(onRemovedListener);
}

browser.runtime.onMessage.addListener(async (request) => {
  switch (request.type) {
    case "requestOpenIntel":
      await onRequestOpenIntel();
      break;
    case "toggleIITC":
      await onToggleIITC(request.value);
      if (request.value === true) {
        await initUserscriptsApi();
      }
      break;
    case "popupWasOpened":
      await initUserscriptsApi();
      break;
    case "XHRFallbackRequest":
      await xmlHttpRequestFallbackHandler(request.value);
      break;
    case "managePlugin":
      await manager.managePlugin(request.uid, request.action);
      break;
    case "setChannel":
      await manager.setChannel(request.value);
      break;
    case "safeUpdate":
      await manager.checkUpdates(false);
      break;
    case "forceFullUpdate":
      await manager.checkUpdates(true);
      break;
    case "addUserScripts":
      // TODO: The onMessage method should be able to return a value, but does not do so because of a bug.
      //  More info: https://github.com/mozilla/webextension-polyfill/issues/172
      browser.runtime
        .sendMessage({
          type: "resolveAddUserScripts",
          id: request.id,
          scripts: await manager.addUserScripts(request.scripts),
        })
        .then()
        .catch(() => {}); // If tab is closed, message goes nowhere and an error occurs. Ignore.
      break;
    case "getPluginInfo":
      browser.runtime
        .sendMessage({
          type: "resolveGetPluginInfo",
          info: await manager.getPluginInfo(request.uid),
        })
        .then()
        .catch(() => {}); // If tab is closed, message goes nowhere and an error occurs. Ignore.
      break;
    case "getBackupData":
      browser.runtime
        .sendMessage({
          type: "resolveGetBackupData",
          data: await manager.getBackupData(request.params),
        })
        .then()
        .catch(() => {}); // If tab is closed, message goes nowhere and an error occurs. Ignore.
      break;
    case "setBackupData":
      browser.runtime
        .sendMessage({
          type: "resolveSetBackupData",
          data: await manager.setBackupData(
            request.params,
            request.backup_data
          ),
        })
        .then()
        .catch(() => {}); // If tab is closed, message goes nowhere and an error occurs. Ignore.
      break;
    case "checkUserScriptsApiAvailable":
      browser.runtime
        .sendMessage({
          type: "resolveCheckUserScriptsApiAvailable",
          data: is_userscripts_api_available(),
        })
        .then()
        .catch(() => {}); // If tab is closed, message goes nowhere and an error occurs. Ignore.
      break;
    case "setCustomChannelUrl":
      await manager.setCustomChannelUrl(request.value);
      break;
    case "setUpdateCheckInterval":
      await manager.setUpdateCheckInterval(request.interval, request.channel);
      if (!IS_LEGACY_API) {
        await createCheckUpdateAlarm(true);
      }
      break;
  }
});

async function initUserscriptsApi() {
  if (!IS_USERSCRIPTS_API) return;

  let scripts = [];
  try {
    scripts = await browser.userScripts.getScripts();
    // eslint-disable-next-line no-empty
  } catch {}

  const is_gm_api_plugin_exist = scripts.some(
    (script) => script.id === "gm_api"
  );
  if (is_gm_api_plugin_exist) return;

  init_userscripts_api();
  const plugins_event = {
    event: "add",
    plugins: await manager.getEnabledPlugins(),
  };
  await manage_userscripts_api(plugins_event);
}

async function createCheckUpdateAlarm(need_to_update = false) {
  if (IS_LEGACY_API) return;

  const alarm_name = "check-update-alarm";
  if (!need_to_update) {
    const alarm = await browser.alarms.get(alarm_name);
    if (alarm) {
      return;
    }
  }

  const storage_intervals = await browser.storage.local.get([
    "channel",
    "release_update_check_interval",
    "beta_update_check_interval",
    "custom_update_check_interval",
    "external_update_check_interval",
  ]);
  const channel_interval_key = `${storage_intervals["channel"]}_update_check_interval`;
  const channel_interval = storage_intervals[channel_interval_key] || 604800;
  const external_interval =
    storage_intervals["external_update_check_interval"] || 604800;

  let interval_seconds = Math.min(channel_interval, external_interval);
  if (interval_seconds < 30) {
    interval_seconds = 30;
  }
  await browser.alarms.create(alarm_name, {
    periodInMinutes: interval_seconds / 60,
  });
}

if (!IS_LEGACY_API) {
  browser.alarms.onAlarm.addListener(async () => {
    await manager.checkUpdates(false);
  });
}

self.addEventListener("activate", () => {
  initUserscriptsApi().then();
});

createCheckUpdateAlarm().then();
