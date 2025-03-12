//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { strToBase64 } from "@/strToBase64";

// Global iframe and initialization state
let xhrIframe = null;
let isInitialized = false;
let pendingRequests = [];
let messageListener = null;

// Retry tracking
let retryCount = 0;
const MAX_RETRIES = 3;

// Setup XHR bridge
export function setupXhrBridge() {
  // Prevent double initialization
  if (isInitialized) return;
  isInitialized = true;

  try {
    // Create and add iframe after DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createIframe);
    } else {
      createIframe();
    }
  } catch (error) {
    console.error("IITC Button XHR Bridge: initialization failed", error);
    isInitialized = false;
  }
}

// Create sandbox iframe
function createIframe() {
  try {
    // Don't create if already exists
    if (xhrIframe) return;

    // Add message listener before creating iframe
    if (messageListener) {
      window.removeEventListener("message", messageListener);
    }

    messageListener = function (event) {
      // Process response messages from iframe
      if (event.data && event.data.type === "xhr_response") {
        handleXhrResponseData(event.data);
      }
    };

    window.addEventListener("message", messageListener);

    // Create hidden iframe with sandbox for XHR
    xhrIframe = document.createElement("iframe");
    xhrIframe.sandbox = "allow-scripts allow-same-origin";
    xhrIframe.style.cssText =
      "display:none; position:absolute; width:0; height:0; border:0;";
    xhrIframe.src = browser.runtime.getURL("xhr-sandbox.html");

    // Add to DOM
    document.body.appendChild(xhrIframe);

    // Process pending requests when iframe loads
    xhrIframe.onload = function () {
      if (pendingRequests.length > 0) {
        pendingRequests.forEach((data) => sendXhrRequest(data));
        pendingRequests = [];
      }
    };
  } catch (error) {
    console.error("IITC Button XHR Bridge: failed to create iframe", error);
  }
}

// Process response data from iframe
function handleXhrResponseData(data) {
  try {
    const detail_stringify = JSON.stringify({
      task_uuid: data.uuid,
      task_type: "xmlHttpRequest",
      response: JSON.stringify(data.response),
    });

    const bridge_data = strToBase64(String(detail_stringify));

    // Send result in the same format as background would do
    window.dispatchEvent(
      new CustomEvent("bridgeResponse", {
        detail: bridge_data,
      })
    );
  } catch (error) {
    console.error("IITC Button XHR Bridge: error handling response", error);
  }
}

// Send XHR request through iframe
export function sendXhrRequest(data) {
  // Queue request if iframe not ready
  if (!xhrIframe || !xhrIframe.contentWindow) {
    pendingRequests.push(data);

    // Create iframe if it doesn't exist
    if (!xhrIframe) {
      createIframe();

      // Add retry logic for iframe problems
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => {
          if (pendingRequests.includes(data)) {
            sendXhrRequest(data);
          }
        }, 500 * retryCount);
      }
    }
    return;
  }

  retryCount = 0;

  try {
    // Send request to iframe
    xhrIframe.contentWindow.postMessage(
      {
        type: "xhr_request",
        uuid: data.task_uuid,
        method: data.method,
        url: data.url,
        headers: data.headers,
        data: data.data,
        user: data.user,
        password: data.password,
        overrideMimeType: data.overrideMimeType,
        timeout: data.timeout,
        withCredentials: data.withCredentials,
      },
      "*"
    );
  } catch (error) {
    console.error("IITC Button XHR Bridge: error sending request", error);
  }
}
