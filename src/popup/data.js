//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
export async function init(self) {
  const appData = self.$data;
  const data = await browser.storage.local.get([
    "channel",
    "release_categories",
    "test_categories",
    "local_categories",
    "release_plugins_flat",
    "test_plugins_flat",
    "local_plugins_flat"
  ]);
  const channel = data.channel ? data.channel : "release";
  // initialize categories
  appData.categories = data[channel + "_categories"];
  // initialize all plugins
  appData.plugins_flat = data[channel + "_plugins_flat"];
}

export async function onChangedListener(self) {
  const appData = self.$data;
  browser.storage.onChanged.addListener(async function(changes) {
    const data = await browser.storage.local.get("channel");
    const channel = data.channel ? data.channel : "release";

    for (let key in changes) {
      const new_value = changes[key].newValue;

      if (key === channel + "_categories") {
        appData.categories = {};
        appData.categories = new_value;
      }

      if (key === channel + "_plugins_flat") {
        appData.plugins_flat = new_value;
        const category_name = appData.category_name;
        if (category_name !== "") {
          if (appData.categories[category_name]) {
            appData.plugins = Object.entries(new_value).reduce(
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
    }
  });
}

export async function onMessageListener(self) {
  browser.runtime.onMessage.addListener(function(request) {
    switch (request.type) {
      case "showProgressbar":
        self.$root.$emit("showProgressbar", request.value);
        break;
      case "showMessage":
        self.showMessage(request.message);
        break;
    }
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1);
    });
  });
}
