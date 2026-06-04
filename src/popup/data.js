//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { emitter } from "@/popup/eventBus";

export async function init(self) {
  const appData = self.$data;
  const view = await browser.runtime.sendMessage({ type: "getPluginsView" });
  setPluginsView(appData, view || {});
}

function setPluginsView(
  appData,
  { plugins = {}, categories = {}, core = null },
) {
  appData.categories = categories;
  appData.plugins_flat = plugins;
  appData.iitc_core = core;
  const category_name = appData.category_name;
  if (category_name !== "") {
    if (categories[category_name]) {
      appData.plugins = Object.entries(plugins).reduce(
        (category_plugins, plugin_pair) => {
          const [plugin_uid, plugin_obj] = plugin_pair;
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

export async function onMessageListener(self) {
  const appData = self.$data;
  browser.runtime.onMessage.addListener(function (request) {
    switch (request.type) {
      case "showProgressbar":
        emitter.emit("showProgressbar", request.value);
        break;
      case "showMessage":
        self.showMessage(request.message);
        break;
      case "pluginsViewChanged":
        setPluginsView(appData, request);
        break;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1);
    });
  });
}
