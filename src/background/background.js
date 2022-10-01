//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import { Manager } from "lib-iitc-manager";
import { _ } from "@/i18n";
import {
  onUpdatedListener,
  onRemovedListener,
  onRequestOpenIntel,
  onToggleIITC
} from "./intel";
import { injectUserScript } from "./injector";
import { onBeforeRequest } from "./requests";

const { onUpdated, onRemoved } = browser.tabs;
onUpdated.addListener(onUpdatedListener);
onRemoved.addListener(onRemovedListener);

const manager = new Manager({
  storage: browser.storage.local,
  message: (message, args) => {
    try {
      browser.runtime
        .sendMessage({
          type: "showMessage",
          message: _(message, args)
        })
        .then();
    } catch {
      // If popup is closed, message goes nowhere and an error occurs. Ignore.
    }
  },
  progressbar: is_show => {
    try {
      browser.runtime
        .sendMessage({
          type: "showProgressbar",
          value: is_show
        })
        .then();
    } catch {
      // If popup is closed, message goes nowhere and an error occurs. Ignore.
    }
  },
  inject_user_script: code => injectUserScript(code).then()
});

manager.run().then();

browser.runtime.onMessage.addListener(async request => {
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

// Seems unable to access browser.webRequest in Safari in non-persistent background
if (browser.webRequest) {
  browser.webRequest.onBeforeRequest.addListener(
    onBeforeRequest,
    {
      urls: [
        // 1. *:// comprises only http/https
        // 2. the API ignores #hash part
        // 3. Firefox: onBeforeRequest does not work with file:// or moz-extension://
        "*://*/*.user.js",
        "*://*/*.user.js?*",
        "file://*/*.user.js",
        "file://*/*.user.js?*"
      ],
      types: ["main_frame"]
    },
    ["blocking"]
  );
}

browser.runtime.onMessage.addListener(function(request) {
  switch (request.type) {
    case "managePlugin":
      manager.managePlugin(request.uid, request.action).then();
      break;
    case "safeUpdate":
      manager.checkUpdates(false).then();
      manager._checkExternalUpdates(false).then();
      break;
    case "forceFullUpdate":
      manager.checkUpdates(true).then();
      manager._checkExternalUpdates(true).then();
      break;
    case "addUserScripts":
      manager.addUserScripts(request.scripts).then();
      break;
  }
});

async function xmlHttpRequestHandler(data) {
  async function xmlResponse(tab_id, callback, response) {
    const injectedCode = `
    document.dispatchEvent(new CustomEvent('onXmlHttpRequestHandler', {
      detail: JSON.stringify({
        callback: "${String(callback)}",
        response: ${String(response)}
      })
    }));
  `;

    try {
      await browser.tabs.executeScript(data.tab_id, {
        code: injectedCode
      });
    } catch (error) {
      console.error(`An error occurred while execute script: ${error.message}`);
    }
  }

  const req = new XMLHttpRequest();
  req.onload = function() {
    const response = {
      readyState: this.readyState,
      responseHeaders: this.responseHeaders,
      responseText: this.responseText,
      status: this.status,
      statusText: this.statusText
    };
    xmlResponse(data.tab_id, data.onload, JSON.stringify(response));
  };
  req.open(data.method, data.url, true, data.user, data.password);
  req.send();
}
