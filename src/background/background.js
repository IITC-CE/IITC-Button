//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import {
  onUpdatedListener,
  onRemovedListener,
  onRequestOpenIntel,
  onToggleIITC
} from "./intel";
import {
  addUserScripts,
  checkExternalUpdates,
  checkUpdates,
  managePlugin,
  runExtension
} from "./manager";
import { onBeforeRequest } from "./requests";

const { onUpdated, onRemoved } = browser.tabs;
onUpdated.addListener(onUpdatedListener);
onRemoved.addListener(onRemovedListener);

runExtension().then();

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

browser.runtime.onMessage.addListener(function(request) {
  switch (request.type) {
    case "managePlugin":
      managePlugin(request.uid, request.category, request.action).then();
      break;
    case "safeUpdate":
      checkUpdates(false).then();
      checkExternalUpdates(false).then();
      break;
    case "forceFullUpdate":
      checkUpdates(true).then();
      checkExternalUpdates(true).then();
      break;
    case "addUserScripts":
      addUserScripts(request.scripts).then();
      break;
  }
});
