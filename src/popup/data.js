//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
export async function init(self) {
  const appData = self.$data;
  const data = await browser.storage.local.get([
    "channel",
    "release_categories",
    "beta_categories",
    "custom_categories",
    "release_plugins_flat",
    "beta_plugins_flat",
    "custom_plugins_flat",
    "release_iitc_core",
    "beta_iitc_core",
    "custom_iitc_core",
    "release_iitc_core_user",
    "beta_iitc_core_user",
    "custom_iitc_core_user",
  ]);
  const channel = data.channel ? data.channel : "release";
  // initialize categories
  appData.categories = data[channel + "_categories"];
  // initialize all plugins
  appData.plugins_flat = data[channel + "_plugins_flat"];
  // initialize iitc core
  setIitcCore(
    appData,
    data[channel + "_iitc_core"],
    data[channel + "_iitc_core_user"]
  );
}

function setCategories(appData, categories) {
  appData.categories = {};
  appData.categories = categories;
}

function setPlugins(appData, plugins_flat) {
  appData.plugins_flat = plugins_flat;
  const category_name = appData.category_name;
  if (category_name !== "") {
    if (appData.categories[category_name]) {
      appData.plugins = Object.entries(plugins_flat).reduce(
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
          channel + "_categories",
          channel + "_plugins_flat",
          channel + "_iitc_core",
          channel + "_iitc_core_user",
        ]);
        setCategories(appData, storage[channel + "_categories"]);
        setPlugins(appData, storage[channel + "_plugins_flat"]);
        setIitcCore(
          appData,
          storage[channel + "_iitc_core"],
          storage[channel + "_iitc_core_user"]
        );
      }

      if (key === channel + "_categories") {
        setCategories(appData, new_value);
      }

      if (key === channel + "_plugins_flat") {
        setPlugins(appData, new_value);
      }

      if (key === channel + "_iitc_core_user") {
        const storage = await browser.storage.local.get([
          channel + "_iitc_core",
        ]);
        setIitcCore(appData, storage[channel + "_iitc_core"], new_value);
      }
    }
  });
}

export async function onMessageListener(self) {
  browser.runtime.onMessage.addListener(function (request) {
    switch (request.type) {
      case "showProgressbar":
        self.$root.$emit("showProgressbar", request.value);
        break;
      case "showMessage":
        self.showMessage(request.message);
        break;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1);
    });
  });
}
