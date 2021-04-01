//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import { getUID } from "../helpers";
import { isSemVer } from "./issemver";

export async function on_extension_update(last_version) {
  const release_plugins = await browser.storage.local.get("release_plugins").then(obj => obj["release_plugins"]);

  if (release_plugins || isSemVer(last_version, "< 1.4.0")) {
    const local = await browser.storage.local.get([
      "release_plugins_local",
      "test_plugins_local",
      "local_plugins_local",
      "release_plugins_user",
      "test_plugins_user",
      "local_plugins_user"
    ]);

    for (let key of Object.keys(local)) {
      let new_plugins = {};

      for (let plugin of Object.values(local[key])) {
        const plugin_uid = getUID(plugin);
        plugin["uid"] = plugin_uid;

        if (!plugin["category"]) plugin["category"] = "Misc";

        new_plugins[plugin_uid] = plugin;
      }

      local[key] = new_plugins;
    }

    local["release_plugins"] = undefined;
    local["test_plugins"] = undefined;
    local["local_plugins"] = undefined;

    await browser.storage.local.set(local);
  }
}
