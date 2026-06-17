// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE

import browser from "webextension-polyfill";
import type WebExt from "webextension-polyfill";
import { GM_API_UID } from "lib-iitc-manager";
import { getNiaTabsToInject } from "@/background/utils";
import { is_userscripts_api_available } from "@/userscripts/utils";
import type { Plugin, PluginEventData } from "lib-iitc-manager";

export async function inject_plugin_via_content_scripts(
  plugin: Plugin,
): Promise<void> {
  const tabs = await getNiaTabsToInject(plugin);
  for (const tab of Object.values(tabs)) {
    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id! },
        func: (pluginDetail) => {
          document.dispatchEvent(
            new CustomEvent("IITCButtonInitJS", {
              detail: pluginDetail,
            }),
          );
        },
        args: [{ plugin }],
        injectImmediately: true,
      });
    } catch (error) {
      console.error(
        `An error occurred while injecting script: ${(error as Error).message}`,
      );
    }
  }
}

export async function manage_userscripts_api(
  plugins_event: PluginEventData,
): Promise<void> {
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
      return;
    }
  }

  const plugins_obj: WebExt.UserScripts.RegisteredUserScript[] = [];
  for (const plugin of Object.values(plugins)) {
    const p = plugin as Plugin;
    plugins_obj.push({
      id: p.uid,
      matches: p.match ?? p.include ?? ["https://intel.ingress.com/*"],
      js: [{ code: p.code ?? "" }],
      runAt: p.uid === GM_API_UID ? "document_start" : "document_end",
      world: "MAIN",
    });
  }

  try {
    const registeredScripts = await browser.userScripts.getScripts();
    const registeredIds = registeredScripts.map((script) => script.id);

    const pluginsToAdd = plugins_obj.filter(
      (plugin) => !registeredIds.includes(plugin.id),
    );
    const pluginsToUpdate = plugins_obj.filter((plugin) =>
      registeredIds.includes(plugin.id),
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
