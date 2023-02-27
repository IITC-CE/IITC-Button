<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div
    class="plugin item-wrapper"
    :class="plugin.status"
    :title="pluginDescription()"
    :data-category="category_name"
    :data-uid="plugin.uid"
  >
    <i class="plugin__action material-icons" @click="managePlugin">{{
      toggleIcon()
    }}</i>
    <img
      class="plugin__icon"
      :src="getIcon"
      @click="managePlugin"
      v-if="getIcon"
    />
    <span class="plugin__text" @click="managePlugin">{{
      __("name", plugin)
    }}</span>
    <span v-if="plugin.override" class="plugin__user">{{
      _("badgeOverride")
    }}</span>
    <template v-if="plugin.user">
      <i
        v-if="plugin.supportURL"
        class="plugin__action___extra material-icons"
        @click="openLink(plugin.supportURL)"
        :title="[_('openSupport'), plugin.supportURL].join(' ')"
        >home</i
      >
      <i
        class="plugin__action___extra material-icons"
        @click="savePlugin"
        :title="_('pluginSave')"
        >save</i
      >
      <i
        class="plugin__action___extra plugin__action___extra-delete material-icons"
        @click="deletePlugin"
        :title="_('pluginDelete')"
        >delete</i
      >
    </template>
  </div>
</template>

<script>
import { mixin } from "./mixins.js";

const saveJS = (function() {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function(data, fileName) {
    const blob = new Blob([data], { type: "application/x-javascript" }),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
})();

export default {
  name: "ElementPlugin",
  props: {
    category_name: String,
    plugin: Object
  },
  mixins: [mixin],
  methods: {
    pluginDescription: function() {
      return (
        (this.plugin["user"] ? `[v${this.plugin["version"]}] ` : "") +
        this.__("description", this.plugin)
      );
    },
    toggleIcon: function() {
      return `toggle_${this.plugin["status"]}`;
    },
    managePlugin: async function() {
      let action = "";
      if (this.plugin.status === "user") {
        action = "delete";
        this.plugin.status = "off";
      } else {
        action = this.plugin.status === "on" ? "off" : "on";
        this.plugin.status = action;
      }
      this.showMessage(this._("needRebootIntel"));
      await browser.runtime.sendMessage({
        type: "managePlugin",
        uid: this.plugin.uid,
        category: this.category_name,
        action: action
      });
    },
    deletePlugin: async function() {
      const uid = this.plugin.uid;
      const cat = this.category_name;
      const plugins = this.$parent.$props.plugins;
      if (!plugins[uid]["override"]) delete plugins[uid];

      const count_plugins = Object.entries(plugins).reduce(
        (total, plugin_pair) => {
          const [, plugin_obj] = plugin_pair;
          if (plugin_obj["category"] === cat) total += 1;
          return total;
        },
        0
      );
      if (count_plugins <= 0) {
        this.back();
      }

      this.showMessage(this._("needRebootIntel"));
      await browser.runtime.sendMessage({
        type: "managePlugin",
        uid: uid,
        category: this.category_name,
        action: "delete"
      });
    },
    savePlugin: async function() {
      const data = await browser.storage.local.get([
        "channel",
        "release_plugins_user",
        "beta_plugins_user",
        "custom_plugins_user"
      ]);

      const channel = data.channel ? data.channel : "release";
      const uid = this.plugin.uid;
      const plugin = data[`${channel}_plugins_user`][uid];
      saveJS(plugin["code"], plugin["filename"]);
    }
  },
  computed: {
    getIcon: function() {
      return (
        this.plugin["icon"] ||
        this.plugin["icon64"] ||
        "/assets/icons/24/userscript-no-icon.png"
      );
    }
  }
};
</script>

<style scoped>
.plugin {
  display: flex;
  cursor: pointer;
  padding: 4px 10px 4px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--color-white);
}
.plugin:hover,
.plugin:active,
.plugin:focus {
  background: var(--color-silver);
}
.plugin__icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}
.plugin__text {
  flex: auto;
  line-height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.plugin__user {
  background: var(--color-olive);
  color: var(--color-white);
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.plugin__action {
  padding: 2px;
  margin-right: 8px;
}
.plugin__action___extra {
  background: #fff;
  border-radius: 3px;
  padding: 3px;
  margin-left: 8px;
  font-size: 18px;
}
.plugin.on .plugin__action {
  color: var(--state-on);
}
.plugin.off .plugin__action {
  color: var(--state-off2);
}
.plugin.user .plugin__action,
.plugin__action___extra {
  color: var(--color-black);
}
.plugin__action___extra:hover {
  color: #444;
}
.plugin.user:hover .plugin__action,
.plugin__action___extra-delete:hover {
  color: var(--state-off);
}
</style>
