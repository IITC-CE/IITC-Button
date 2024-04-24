//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { gm_api_for_plugin } from "@/userscripts/wrapper";
import { getNiaTabsToInject, getPluginMatches } from "@/background/utils";
import { is_userscripts_api_available } from "@/userscripts/utils";
import { IS_LEGACY_API } from "@/userscripts/env";

export async function inject_plugin_via_content_scripts(plugin, use_gm_api) {
  const tabs = await getNiaTabsToInject(plugin);
  for (let tab of Object.values(tabs)) {
    const pluginTab = { ...plugin };
    if (use_gm_api) {
      pluginTab.code = await gm_api_for_plugin(pluginTab, tab.id);
    }

    try {
      if (IS_LEGACY_API) {
        const inject = `
          document.dispatchEvent(new CustomEvent('IITCButtonInitJS', {
            detail: ${JSON.stringify({ plugin: pluginTab })}
          }));
        `;
        await browser.tabs.executeScript(tab.id, {
          code: inject,
          runAt: "document_end",
        });
      } else {
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: (pluginDetail) => {
            document.dispatchEvent(
              new CustomEvent("IITCButtonInitJS", {
                detail: pluginDetail,
              })
            );
          },
          args: [{ plugin: pluginTab }],
          injectImmediately: true,
        });
      }
    } catch (error) {
      console.error(
        `An error occurred while injecting script: ${error.message}`
      );
    }
  }
}

export async function manage_userscripts_api(plugins_event) {
  if (!is_userscripts_api_available()) return;

  const event = plugins_event.event;
  const plugins = plugins_event.plugins;
  const use_gm_api = plugins_event.use_gm_api !== false;

  if (event === "remove") {
    const remove_ids = Object.keys(plugins);
    try {
      await browser.userScripts.unregister({ ids: remove_ids });
    } catch (e) {
      console.log("an error occurred while unregistering the plugin", e);
    }
  }

  let plugins_obj = [];
  for (let plugin of Object.values(plugins)) {
    if (use_gm_api) {
      plugin.code = await gm_api_for_plugin(plugin, 0);
    }
    plugins_obj.push({
      id: plugin.uid,
      matches:
        plugin.uid === "gm_api" ? ["https://*/*"] : getPluginMatches(plugin),
      js: [{ code: plugin.code }],
      runAt: plugin.uid === "gm_api" ? "document_start" : "document_end",
      world: "MAIN",
    });
  }

  if (event === "add") {
    try {
      await browser.userScripts.register(plugins_obj);
    } catch (e) {
      console.log("an error occurred while registering the plugin", e);
    }
  } else if (event === "update") {
    try {
      await browser.userScripts.update(plugins_obj);
    } catch (e) {
      console.log("an error occurred while updating the plugin", e);
    }
  }
}
