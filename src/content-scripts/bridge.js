//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import { inject } from "@/content-scripts/utils";
import { strToBase64 } from "@/strToBase64";

export async function bridgeAction(e) {
  const task = e.detail;

  switch (task.task_type) {
    case "xmlHttpRequest":
      await xmlResponseBridge(task);
      break;
    case "getStorage":
      await getStorageBridge(task);
      break;
    case "setValue":
      await setValueBridge(task);
      break;
    case "delValue":
      await delValueBridge(task);
      break;
    default:
      return;
  }
}

const xmlResponseBridge = async (data) => {
  browser.runtime
    .sendMessage({
      type: "xmlHttpRequestHandler",
      value: data,
    })
    .then();
};

// Sends the entire plugins scoped storage to the page context
const getStorageBridge = async (req) => {
  const all_storage = await browser.storage.local.get(null);
  const plugins_storage = {};
  for (const key in all_storage) {
    if (key.startsWith("VMin")) {
      plugins_storage[key] = all_storage[key];
    }
  }
  const detail_stringify = JSON.stringify({
    task_type: req.task_type,
    response: JSON.stringify(plugins_storage),
  });

  const injectedCode = `
    document.dispatchEvent(new CustomEvent('bridgeResponse', {
      detail: "${strToBase64(String(detail_stringify))}"
    }));
  `;
  inject(injectedCode);
};

// Saves the value in the persistent storage in order to synchronize the data with the storage in the page context
const setValueBridge = async (req) => {
  const set_data = {};
  set_data[req.key] = req.value;
  await browser.storage.local.set(set_data);
};

// Deletes the value in the persistent storage in order to synchronize the data with the storage in the page context
const delValueBridge = async (req) => {
  await browser.storage.local.remove(req.key);
};
