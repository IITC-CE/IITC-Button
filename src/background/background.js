//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import { Manager } from "lib-iitc-manager";
import { _ } from "@/i18n";
import { injectUserScript } from "./injector";
import {
  onUpdatedListener,
  onRemovedListener,
  onRequestOpenIntel,
  onToggleIITC
} from "./intel";
import "./requests";

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

const { onUpdated, onRemoved } = browser.tabs;
onUpdated.addListener((tabId, status, tab) =>
  onUpdatedListener(tabId, status, tab, manager)
);
onRemoved.addListener(onRemovedListener);

browser.runtime.onMessage.addListener(async request => {
  switch (request.type) {
    case "requestOpenIntel":
      await onRequestOpenIntel();
      break;
    case "toggleIITC":
      await onToggleIITC(request.value);
      break;
  }
});

browser.runtime.onMessage.addListener(async function(request) {
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
            scripts: await manager.addUserScripts(request.scripts)
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
            info: await manager.getPluginInfo(request.uid)
          })
          .then();
      } catch {
        // If tab is closed, message goes nowhere and an error occurs. Ignore.
      }
      break;
    case "setCustomChannelUrl":
      await manager.setCustomChannelUrl(request.value);
      break;
  }
});
