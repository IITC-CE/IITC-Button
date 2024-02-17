//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import {
  gm_api_for_plugin,
  is_userscripts_api_available,
} from "@/userscripts/wrapper";
import { getNiaTabsToInject, getPluginMatches } from "@/background/utils";

// TODO
// https://developer.chrome.com/docs/extensions/reference/api/userScripts#developer_mode_for_extension_users

export async function inject_plugin_via_content_scripts(plugin, use_gm_api) {
  const tabs = await getNiaTabsToInject(plugin);
  for (let tab of Object.values(tabs)) {
    if (use_gm_api) {
      plugin.code = await gm_api_for_plugin(plugin, tab.id);
    }

    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: (pluginDetail) => {
          document.dispatchEvent(
            new CustomEvent("IITCButtonInitJS", {
              detail: pluginDetail,
            })
          );
        },
        args: [{ plugin: plugin, tab_id: tab.id }],
        injectImmediately: true,
      });
    } catch (error) {
      console.error(
        `An error occurred while injecting script: ${error.message}`
      );
    }
  }
}

export async function inject_plugin_via_userscripts_api(plugin, use_gm_api) {
  if (!is_userscripts_api_available) return;

  if (use_gm_api) {
    plugin.code = await gm_api_for_plugin(plugin, 0);
  }

  let scripts = [];
  try {
    scripts = await chrome.userScripts.getScripts();
  } catch (e) {
    console.log(e);
    return;
  }
  const plugin_obj = [
    {
      id: plugin.uid,
      matches:
        plugin.uid === "gm_api" ? ["https://*/*"] : getPluginMatches(plugin),
      js: [{ code: plugin.code }],
      runAt: plugin.uid === "gm_api" ? "document_start" : "document_end",
      world: "MAIN",
    },
  ];

  const is_exist = scripts.some((script) => script.id === plugin.uid);
  if (!is_exist) {
    await chrome.userScripts.register(plugin_obj);
    return;
  }

  const exist_script = scripts.find((script) => script.id === plugin.uid);
  if (exist_script.js[0].code !== plugin_obj[0].js[0].code) {
    await chrome.userScripts.update(plugin_obj);
  }
}
