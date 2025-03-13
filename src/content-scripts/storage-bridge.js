//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { strToBase64 } from "@/strToBase64";
import { bridgeResponse } from "./bridge-manager";

/**
 * Handle storage-related requests
 */
export async function handleStorageRequest(task) {
  switch (task.task_type) {
    case "getStorage":
      await getStorageBridge(task);
      break;
    case "setValue":
      await setValueBridge(task);
      break;
    case "delValue":
      await deleteValueBridge(task);
      break;
  }
}

/**
 * Get all plugin storage data and send it to page context
 */
async function getStorageBridge(req) {
  try {
    const all_storage = await browser.storage.local.get(null);
    const plugins_storage = {};

    // Filter for plugin-related storage keys
    for (const key in all_storage) {
      if (key.startsWith("VMin")) {
        plugins_storage[key] = all_storage[key];
      }
    }

    const detail_stringify = JSON.stringify({
      task_type: req.task_type,
      response: JSON.stringify(plugins_storage),
    });

    const bridge_base64_data = strToBase64(String(detail_stringify));
    bridgeResponse(bridge_base64_data);
  } catch (error) {
    console.error("IITC Button Storage Bridge: Error getting storage", error);
  }
}

/**
 * Save value to extension storage
 */
export async function setValueBridge(req) {
  try {
    const set_data = {};
    set_data[req.key] = req.value;
    await browser.storage.local.set(set_data);
  } catch (error) {
    console.error("IITC Button Storage Bridge: Error setting value", error);
  }
}

/**
 * Delete value from extension storage
 */
export async function deleteValueBridge(req) {
  try {
    await browser.storage.local.remove(req.key);
  } catch (error) {
    console.error("IITC Button Storage Bridge: Error removing value", error);
  }
}
