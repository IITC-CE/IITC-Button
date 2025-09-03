//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { sendXhrRequest } from "./xhr-bridge";
import { handleStorageRequest } from "./storage-bridge";
import { isRunContentScript } from "@/content-scripts/utils";

// Flag to prevent multiple initializations
let isInitialized = false;

/**
 * Initialize all communication bridges
 */
export function setupBridges() {
  if (isInitialized) return;
  isInitialized = true;

  // Set up main event listener for bridge requests
  document.addEventListener("bridgeRequest", bridgeAction);
}

/**
 * Process incoming bridge requests from page context
 */
export function bridgeAction(e) {
  const task = e.detail;

  switch (task.task_type) {
    case "xmlHttpRequest":
      sendXhrRequest(task);
      break;
    case "getStorage":
    case "setValue":
    case "delValue":
      handleStorageRequest(task).then();
      break;
    default:
      console.warn("IITC Button: Unknown bridge request type", task.task_type);
      break;
  }
}

// Fallback XHR
if (isRunContentScript) {
  browser.runtime.onMessage.addListener(async (request) => {
    switch (request.type) {
      case "XHRFallbackResponse":
        bridgeResponse(request.value);
        break;
    }
  });
}

/**
 * Send response back to page context
 */
export function bridgeResponse(data) {
  dispatchEvent(
    new CustomEvent("bridgeResponse", {
      detail: data,
    })
  );
}
