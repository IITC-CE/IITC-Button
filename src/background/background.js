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
import { strToBase64 } from "@/strToBase64";
import {
  init_userscripts_api,
  is_iitc_enabled,
  is_userscripts_api_available,
} from "@/userscripts/utils";
import {
  inject_plugin_via_content_scripts,
  manage_userscripts_api,
} from "@/background/injector";

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
      if (IS_USERSCRIPTS_API && request.value === true) {
        await initUserscriptsApi();
      }
      break;
    case "popupWasOpened":
      if (IS_USERSCRIPTS_API) {
        await initUserscriptsApi();
      }
      break;
    case "xmlHttpRequestHandler":
      await xmlHttpRequestHandler(request.value);
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
      if (IS_USERSCRIPTS_API) {
        await createCheckUpdateAlarm();
      }
      break;
  }
});

// Execution in the context of an extension, to bypass CORS policy.
async function xmlHttpRequestHandler(data) {
  async function xmlResponse(tab_id, callback, response) {
    const detail_stringify = JSON.stringify({
      task_uuid: data.task_uuid,
      task_type: data.task_type,
      response: JSON.stringify(response),
    });

    const bridge_data = strToBase64(String(detail_stringify));

    let allTabs = [
      {
        id: data.tab_id,
      },
    ];
    if (IS_USERSCRIPTS_API) {
      allTabs = await browser.tabs.query({ active: true });
    }

    for (const tab of allTabs) {
      await browser.tabs.sendMessage(tab.id, {
        type: "xmlHttpRequestToCS",
        value: bridge_data,
      });
    }
  }

  try {
    const response = await fetch(data.url, {
      mode: "no-cors",
      method: data.method,
      headers: data.headers,
      body: data.method !== "GET" ? data.data : undefined,
      credentials: data.user && data.password ? "include" : "same-origin",
    });

    const text = await response.text();

    // Create a response object similar to the one in XMLHttpRequest
    const responseObject = {
      readyState: 4,
      responseHeaders: "Not directly accessible with fetch",
      responseText: text,
      status: response.status,
      statusText: response.statusText,
    };

    await xmlResponse(data.tab_id, data.onload, responseObject);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

async function initUserscriptsApi() {
  if (IS_SCRIPTING_API) return;

  let scripts = [];
  try {
    scripts = await chrome.userScripts.getScripts();
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

async function createCheckUpdateAlarm() {
  if (IS_SCRIPTING_API) return;

  const storage_intervals = await browser.storage.local.get([
    "channel",
    "release_update_check_interval",
    "beta_update_check_interval",
    "custom_update_check_interval",
    "external_update_check_interval",
  ]);
  const channel_interval =
    storage_intervals[storage_intervals["channel"]] | 604800;
  const external_interval = storage_intervals["external"] | 604800;

  let interval_seconds = Math.min(channel_interval, external_interval);
  if (interval_seconds < 30) {
    interval_seconds = 30;
  }
  await chrome.alarms.create("check-update-alarm", {
    periodInMinutes: interval_seconds / 60,
  });
}

if (IS_USERSCRIPTS_API) {
  browser.alarms.onAlarm.addListener(async () => {
    await manager.checkUpdates(false);
  });
}

self.addEventListener("activate", () => {
  initUserscriptsApi().then();
  createCheckUpdateAlarm().then();
});
