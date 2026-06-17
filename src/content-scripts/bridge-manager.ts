//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { sendXhrRequest } from "./xhr-bridge";
import { handleStorageRequest } from "./storage-bridge";
import { isRunContentScript } from "@/content-scripts/utils";
import type { BridgeTask, ContentScriptMessage } from "@/types/messages";

// Flag to prevent multiple initializations
let isInitialized = false;

export function setupBridges(): void {
  if (isInitialized) return;
  isInitialized = true;

  // Set up main event listener for bridge requests
  document.addEventListener("bridgeRequest", bridgeAction as EventListener);
}

// Process incoming bridge requests from page context
export function bridgeAction(e: CustomEvent<BridgeTask>): void {
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
      console.warn(
        "IITC Button: Unknown bridge request type",
        (task as { task_type: string }).task_type,
      );
      break;
  }
}

// Fallback XHR
if (isRunContentScript) {
  browser.runtime.onMessage.addListener(async (request: unknown) => {
    const msg = request as ContentScriptMessage;
    switch (msg.type) {
      case "XHRFallbackResponse":
        bridgeResponse(msg.value);
        break;
    }
  });
}

// Send response back to page context
export function bridgeResponse(data: string): void {
  dispatchEvent(
    new CustomEvent("bridgeResponse", {
      detail: data,
    }),
  );
}
