//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import { Manager } from "lib-iitc-manager";
import browser from "webextension-polyfill";
import { IS_SCRIPTING_API, IS_USERSCRIPTS_API } from "@/userscripts/env";
import { _ } from "@/i18n";
import { inject_gm_api, inject_plugin } from "@/userscripts/wrapper";
import {
  onUpdatedListener,
  onRemovedListener,
  onRequestOpenIntel,
  onToggleIITC,
} from "./intel";
import "./requests";
import { strToBase64 } from "@/strToBase64";
import {
  is_userscripts_api_available,
  is_iitc_enabled,
} from "@/userscripts/utils";

const manager = new Manager({
  storage: browser.storage.local,
  message: (message, args) => {
    try {
      browser.runtime
        .sendMessage({
          type: "showMessage",
          message: _(message, args),
        })
        .then();
    } catch {
      // If popup is closed, message goes nowhere and an error occurs. Ignore.
    }
  },
  progressbar: (is_show) => {
    try {
      browser.runtime
        .sendMessage({
          type: "showProgressbar",
          value: is_show,
        })
        .then();
    } catch {
      // If popup is closed, message goes nowhere and an error occurs. Ignore.
    }
    if (IS_USERSCRIPTS_API) {
      is_iitc_enabled().then((status) => {
        if (status) {
          init_userscripts_api();
          manager.inject().then();
        }
      });
    }
  },
  inject_plugin: async (plugin) => {
    await inject_plugin(plugin);
  },
  is_daemon: IS_USERSCRIPTS_API,
});

manager.run().then();

if (IS_SCRIPTING_API) {
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
      if (IS_USERSCRIPTS_API) {
        await manage_user_scripts_status(request.value);
      }
      await onToggleIITC(request.value);
      break;
    case "xmlHttpRequestHandler":
      await xmlHttpRequestHandler(request.value);
      break;
  }
});

browser.runtime.onMessage.addListener(async function (request) {
  switch (request.type) {
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
      try {
        browser.runtime
          .sendMessage({
            type: "resolveAddUserScripts",
            scripts: await manager.addUserScripts(request.scripts),
          })
          .then();
      } catch {
        // If tab is closed, message goes nowhere and an error occurs. Ignore.
      }
      break;
    case "getPluginInfo":
      try {
        browser.runtime
          .sendMessage({
            type: "resolveGetPluginInfo",
            info: await manager.getPluginInfo(request.uid),
          })
          .then();
      } catch {
        // If tab is closed, message goes nowhere and an error occurs. Ignore.
      }
      break;
    case "getBackupData":
      try {
        browser.runtime
          .sendMessage({
            type: "resolveGetBackupData",
            data: await manager.getBackupData(request.params),
          })
          .then();
      } catch {
        // If tab is closed, message goes nowhere and an error occurs. Ignore.
      }
      break;
    case "setBackupData":
      try {
        browser.runtime
          .sendMessage({
            type: "resolveSetBackupData",
            data: await manager.setBackupData(
              request.params,
              request.backup_data
            ),
          })
          .then();
      } catch {
        // If tab is closed, message goes nowhere and an error occurs. Ignore.
      }
      break;
    case "checkUserScriptsApiAvailable":
      try {
        browser.runtime
          .sendMessage({
            type: "resolveCheckUserScriptsApiAvailable",
            data: is_userscripts_api_available(),
          })
          .then();
      } catch {
        // If tab is closed, message goes nowhere and an error occurs. Ignore.
      }
      break;
    case "setCustomChannelUrl":
      await manager.setCustomChannelUrl(request.value);
      break;
    case "setUpdateCheckInterval":
      await manager.setUpdateCheckInterval(request.interval, request.channel);
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
    if (IS_USERSCRIPTS_API) {
      let allTabs = await browser.tabs.query({ status: "complete" });

      allTabs = allTabs.filter(function (tab) {
        return tab.status === "complete" && tab.url;
      });

      for (const tab of allTabs) {
        await browser.tabs.sendMessage(tab.id, {
          type: "xmlHttpRequestToCS",
          value: bridge_data,
        });
      }
    } else {
      const injectedCode = `
      document.dispatchEvent(new CustomEvent('bridgeResponse', {
        detail: "${bridge_data}"
      }));
    `;

      try {
        await browser.tabs.executeScript(data.tab_id, {
          code: injectedCode,
        });
      } catch (error) {
        console.error(
          `An error occurred while execute script: ${error.message}`
        );
      }
    }
  }

  try {
    const response = await fetch(data.url, {
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

const init_userscripts_api = () => {
  if (!is_userscripts_api_available) return;
  chrome.userScripts.configureWorld({
    csp: "script-src 'self' 'unsafe-inline'",
    messaging: true,
  });
  inject_gm_api();
};

async function manage_user_scripts_status(status) {
  if (status === true) {
    init_userscripts_api();
    manager.inject().then();
  } else {
    try {
      await chrome.userScripts.unregister();
    } catch (e) {
      console.log(e);
    }
  }
}
