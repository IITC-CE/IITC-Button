//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { getNiaTabsToInject, getPluginMatches } from "@/background/utils";
import { is_userscripts_api_available } from "@/userscripts/utils";
import { IS_LEGACY_API } from "@/userscripts/env";

export async function inject_plugin_via_content_scripts(plugin) {
  const tabs = await getNiaTabsToInject(plugin);
  for (let tab of Object.values(tabs)) {
    try {
      if (IS_LEGACY_API) {
        const inject = `
          document.dispatchEvent(new CustomEvent('IITCButtonInitJS', {
            detail: ${JSON.stringify({ plugin })}
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
          args: [{ plugin }],
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

  if (event === "remove") {
    const remove_ids = Object.keys(plugins);
    try {
      await browser.userScripts.unregister({ ids: remove_ids });
      return;
    } catch (e) {
      console.log("an error occurred while unregistering the plugin", e);
    }
  }

  let plugins_obj = [];
  for (let plugin of Object.values(plugins)) {
    plugins_obj.push({
      id: plugin.uid,
      matches: getPluginMatches(plugin),
      js: [{ code: plugin.code }],
      runAt: plugin.uid === "gm_api" ? "document_start" : "document_end",
      world: "MAIN",
    });
  }

  try {
    const registeredScripts = await browser.userScripts.getScripts();
    const registeredIds = registeredScripts.map((script) => script.id);

    const pluginsToAdd = plugins_obj.filter(
      (plugin) => !registeredIds.includes(plugin.id)
    );
    const pluginsToUpdate = plugins_obj.filter((plugin) =>
      registeredIds.includes(plugin.id)
    );

    try {
      await browser.userScripts.register(pluginsToAdd);
    } catch (e) {
      console.log("an error occurred while registering the plugin", e);
    }

    try {
      await browser.userScripts.update(pluginsToUpdate);
    } catch (e) {
      console.log("an error occurred while updating the plugin", e);
    }
  } catch (e) {
    console.log("an error occurred while handling the plugin event", e);
  }
}
