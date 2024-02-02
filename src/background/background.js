//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import { Manager } from "lib-iitc-manager";
import browser from "webextension-polyfill";
import { _ } from "@/i18n";
import { inject_plugin } from "./injector";
import {
  onUpdatedListener,
  onRemovedListener,
  onRequestOpenIntel,
  onToggleIITC,
} from "./intel";
import "./requests";
import { strToBase64 } from "@/strToBase64";

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
  },
  inject_plugin: (plugin) => inject_plugin(plugin).then(),
});

manager.run().then();

const { onUpdated, onRemoved } = browser.tabs;
onUpdated.addListener((tabId, status, tab) =>
  onUpdatedListener(tabId, status, tab, manager)
);
onRemoved.addListener(onRemovedListener);

browser.runtime.onMessage.addListener(async (request) => {
  switch (request.type) {
    case "requestOpenIntel":
      await onRequestOpenIntel();
      break;
    case "toggleIITC":
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

    const injectedCode = `
      document.dispatchEvent(new CustomEvent('bridgeResponse', {
        detail: "${strToBase64(String(detail_stringify))}"
      }));
    `;

    try {
      await browser.tabs.executeScript(data.tab_id, {
        code: injectedCode,
      });
    } catch (error) {
      console.error(`An error occurred while execute script: ${error.message}`);
    }
  }

  const req = new XMLHttpRequest();
  req.onload = function () {
    const response = {
      readyState: this.readyState,
      responseHeaders: this.responseHeaders,
      responseText: this.responseText,
      status: this.status,
      statusText: this.statusText,
    };
    xmlResponse(data.tab_id, data.onload, response);
  };
  req.open(data.method, data.url, true, data.user, data.password);
  for (let [header_name, header_value] of Object.entries(data.headers)) {
    req.setRequestHeader(header_name, header_value);
  }

  req.send(data.data);
}
