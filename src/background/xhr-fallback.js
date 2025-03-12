//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import { strToBase64 } from "@/strToBase64";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";

// Execution in the context of an extension, to bypass CORS policy.
export async function xmlHttpRequestFallbackHandler(data) {
  async function xmlResponse(tab_id, callback, response) {
    const detail_stringify = JSON.stringify({
      task_uuid: data.task_uuid,
      task_type: data.task_type,
      response: JSON.stringify(response),
    });

    const bridge_data = strToBase64(String(detail_stringify));

    let allTabs = [
      {
        id: data.tab_id,
      },
    ];
    if (IS_USERSCRIPTS_API) {
      allTabs = await browser.tabs.query({ active: true });
    }

    for (const tab of allTabs) {
      await browser.tabs.sendMessage(tab.id, {
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

    await xmlResponse(data.tab_id, data.onload, responseObject);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
