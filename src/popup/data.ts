//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { emitter } from "@/popup/eventBus";
import type { PluginsView, PluginDict, Plugin } from "lib-iitc-manager";
import type { FrontendMessage } from "@/types/messages";

// Minimal shape of the Vue component instance used by init/onMessageListener
interface PopupAppInstance {
  $data: PopupAppData;
  showMessage(msg: string): void;
}

interface PopupAppData {
  categories: PluginsView["categories"];
  plugins_flat: PluginDict;
  iitc_core: Plugin | null;
  plugins: PluginDict;
  category_name: string;
}

export async function init(self: PopupAppInstance): Promise<void> {
  const appData = self.$data;
  const view = await browser.runtime.sendMessage({ type: "getPluginsView" });
  setPluginsView(appData, (view as PluginsView) || {});
}

function setPluginsView(
  appData: PopupAppData,
  { plugins = {}, categories = {}, core = null }: Partial<PluginsView>,
): void {
  appData.categories = categories;
  appData.plugins_flat = plugins;
  appData.iitc_core = core ?? null;
  const category_name = appData.category_name;
  if (category_name !== "") {
    if (categories[category_name]) {
      appData.plugins = Object.entries(plugins).reduce(
        (category_plugins: PluginDict, [plugin_uid, plugin_obj]) => {
          if (plugin_obj.category === category_name) {
            category_plugins[plugin_uid] = plugin_obj;
          }
          return category_plugins;
        },
        {},
      );
    } else {
      appData.plugins = {};
    }
  }
}

export async function onMessageListener(self: PopupAppInstance): Promise<void> {
  const appData = self.$data;
  browser.runtime.onMessage.addListener(function (request: unknown) {
    const msg = request as FrontendMessage;
    switch (msg.type) {
      case "showProgressbar":
        emitter.emit("showProgressbar", msg.value);
        break;
      case "showMessage":
        self.showMessage(msg.message);
        break;
      case "pluginsViewChanged":
        setPluginsView(appData, msg);
        break;
    }
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1);
    });
  });
}
