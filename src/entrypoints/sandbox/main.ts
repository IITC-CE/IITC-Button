// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE

import type { XhrIframeRequest, XhrResponseData } from "@/types/xhr";

// XHR handler for sandbox iframe
window.addEventListener("message", (event: MessageEvent) => {
  if (event.data && (event.data as XhrIframeRequest).type === "xhr_request") {
    const data = event.data as XhrIframeRequest;
    const req = new XMLHttpRequest();

    const sendResponse = (response: XhrResponseData): void => {
      try {
        window.parent.postMessage(
          {
            type: "xhr_response",
            uuid: data.uuid,
            response: response,
          },
          "*",
        );
      } catch (error) {
        console.error("IITC Button XHR Sandbox: error sending response", error);
      }
    };

    req.onload = function () {
      sendResponse({
        readyState: this.readyState,
        responseHeaders: this.getAllResponseHeaders(),
        responseText: this.responseText,
        status: this.status,
        statusText: this.statusText,
      });
    };

    req.onerror = function () {
      sendResponse({
        readyState: this.readyState,
        status: 0,
        statusText: "Error",
        responseText: "",
        responseHeaders: "",
      });
    };

    req.ontimeout = function () {
      sendResponse({
        readyState: this.readyState,
        status: 0,
        statusText: "Timeout",
        responseText: "",
        responseHeaders: "",
      });
    };

    try {
      req.open(data.method, data.url, true, data.user, data.password);

      if (data.headers) {
        for (const [name, value] of Object.entries(data.headers)) {
          req.setRequestHeader(name, value);
        }
      }

      if (data.overrideMimeType) req.overrideMimeType(data.overrideMimeType);
      if (data.timeout) req.timeout = data.timeout;
      if (data.withCredentials) req.withCredentials = true;

      req.send(data.data);
    } catch (error) {
      sendResponse({
        readyState: 0,
        status: 0,
        statusText: "Error: " + (error as Error).message,
        responseText: "",
        responseHeaders: "",
      });
    }
  }
});
