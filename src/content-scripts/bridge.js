//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import { inject } from "@/content-scripts/utils";

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

const xmlResponseBridge = async data => {
  async function xmlResponse(tab_id, callback, response) {
    const detail_stringify = JSON.stringify({
      task_uuid: data.task_uuid,
      task_type: data.task_type,
      response: JSON.stringify(response)
    });

    const injectedCode = `
      document.dispatchEvent(new CustomEvent('bridgeResponse', {
        detail: "${btoa(String(detail_stringify))}"
      }));
    `;

    inject(injectedCode);
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
    xmlResponse(data.tab_id, data.onload, response);
  };
  req.open(data.method, data.url, true, data.user, data.password);
  for (let [header_name, header_value] of Object.entries(data.headers)) {
    req.setRequestHeader(header_name, header_value);
  }

  req.send(data.data);
};

// Sends the entire plugin scoped storage to the page context
const getStorageBridge = async req => {
  const all_storage = await browser.storage.local.get(null);
  const plugin_storage = {};
  for (const key in all_storage) {
    if (key.startsWith(req.data_key)) {
      plugin_storage[key] = all_storage[key];
    }
  }
  const detail_stringify = JSON.stringify({
    task_uuid: req.task_uuid,
    task_type: req.task_type,
    response: JSON.stringify(plugin_storage)
  });

  const injectedCode = `
    document.dispatchEvent(new CustomEvent('bridgeResponse', {
      detail: "${btoa(String(detail_stringify))}"
    }));
  `;
  inject(injectedCode);
};

// Saves the value in the persistent storage in order to synchronize the data with the storage in the page context
const setValueBridge = async req => {
  const set_data = {};
  set_data[req.key] = req.value;
  await browser.storage.local.set(set_data);
};

// Deletes the value in the persistent storage in order to synchronize the data with the storage in the page context
const delValueBridge = async req => {
  await browser.storage.local.remove(req.key);
};
