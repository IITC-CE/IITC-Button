//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";

export async function init(self) {
  const appData = self.$data;
  const [data, view] = await Promise.all([
    browser.storage.local.get([
      "channel",
      "release_iitc_core",
      "beta_iitc_core",
      "custom_iitc_core",
      "iitc_core_user",
    ]),
    browser.runtime.sendMessage({ type: "getPluginsView" }),
  ]);
  const channel = data.channel ? data.channel : "release";
  // initialize plugins and categories from library
  setPluginsView(appData, view || {});
  // initialize iitc core
  setIitcCore(appData, data[channel + "_iitc_core"], data["iitc_core_user"]);
}

function setPluginsView(appData, { plugins = {}, categories = {} }) {
  appData.categories = categories;
  appData.plugins_flat = plugins;
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
        {}
      );
    } else {
      appData.plugins = {};
    }
  }
}

function setIitcCore(appData, iitc_core, iitc_core_user) {
  let core = iitc_core;
  if (iitc_core_user && iitc_core_user.code) {
    core = iitc_core_user;
    core.override = true;
    core.user = true;
  }
  appData.iitc_core = core;
}

export async function onChangedListener(self) {
  const appData = self.$data;
  browser.storage.onChanged.addListener(async function (changes) {
    const data = await browser.storage.local.get("channel");
    const channel = data.channel ? data.channel : "release";

    for (let key in changes) {
      const new_value = changes[key].newValue;

      if (key === "channel") {
        const storage = await browser.storage.local.get([
          channel + "_iitc_core",
          "iitc_core_user",
        ]);
        setIitcCore(
          appData,
          storage[channel + "_iitc_core"],
          storage["iitc_core_user"]
        );
      }

      if (key === "iitc_core_user") {
        const storage = await browser.storage.local.get([
          channel + "_iitc_core",
        ]);
        setIitcCore(appData, storage[channel + "_iitc_core"], new_value);
      }
    }
  });
}

export async function onMessageListener(self) {
  const appData = self.$data;
  browser.runtime.onMessage.addListener(function (request) {
    switch (request.type) {
      case "showProgressbar":
        self.$root.$emit("showProgressbar", request.value);
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
