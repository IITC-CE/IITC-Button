//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { strToBase64 } from "lib-iitc-manager";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";

// Execution in the context of an extension, to bypass CORS policy.
export async function xmlHttpRequestFallbackHandler(data, sender) {
  async function xmlResponse(response) {
    const detail_stringify = JSON.stringify({
      task_uuid: data.task_uuid,
      task_type: data.task_type,
      response: JSON.stringify(response),
    });

    const bridge_data = strToBase64(String(detail_stringify));

    const tabId = sender?.tab?.id;
    if (IS_USERSCRIPTS_API) {
      const allTabs = await browser.tabs.query({ active: true });
      for (const tab of allTabs) {
        await browser.tabs.sendMessage(tab.id, {
          type: "XHRFallbackResponse",
          value: bridge_data,
        });
      }
    } else if (tabId) {
      await browser.tabs.sendMessage(tabId, {
        type: "XHRFallbackResponse",
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

    await xmlResponse(responseObject);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
