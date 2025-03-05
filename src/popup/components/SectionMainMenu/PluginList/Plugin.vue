<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="element">
    <div
      class="plugin item-wrapper"
      :class="[
        plugin.status,
        {
          'recently-changed': hasRecentStatusChange && !isRecentlyAdded,
          'recently-added': isRecentlyAdded,
        },
      ]"
      :title="pluginDescription()"
      :data-uid="plugin.uid"
      v-if="plugin.uid"
    >
      <i
        class="plugin__action material-icons"
        @click="managePlugin"
        v-if="plugin.status"
        >{{ toggleIcon() }}
      </i>
      <i
        class="plugin__action disabled material-icons"
        @click="managePlugin"
        v-if="!plugin.status"
        >toggle_on
      </i>
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
    <div class="border"></div>
  </div>
</template>

<script>
import browser from "webextension-polyfill";
import { mixin } from "@/popup/components/mixins.js";
import { sanitizeFileName } from "lib-iitc-manager/src/helpers";

const saveJS = (function () {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, fileName) {
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
    plugin: Object,
    search_result_id: Number,
    search_results: Object,
  },
  data() {
    return {
      hasRecentStatusChange: false,
      statusChangeTimer: null,
    };
  },
  mixins: [mixin],
  watch: {
    "plugin.statusChangedAt": {
      immediate: true,
      handler() {
        // Clear any existing timer
        if (this.statusChangeTimer) {
          clearTimeout(this.statusChangeTimer);
          this.statusChangeTimer = null;
        }

        if (this.wasStatusChangedWithinLastMinute) {
          // Apply highlight
          this.hasRecentStatusChange = true;

          // Set timer to remove highlight after one minute
          const timeLeft =
            60000 - (Date.now() / 1000 - this.plugin.statusChangedAt) * 1000;
          const timeout = Math.max(0, Math.min(timeLeft, 60000));

          this.statusChangeTimer = setTimeout(() => {
            this.hasRecentStatusChange = false;
          }, timeout);
        } else {
          this.hasRecentStatusChange = false;
        }
      },
    },
  },
  methods: {
    pluginDescription: function () {
      return (
        (this.plugin["user"] ? `[v${this.plugin["version"]}] ` : "") +
        (this.plugin["category"] ? `[${this.plugin["category"]}] ` : "") +
        this.__("description", this.plugin)
      );
    },
    toggleIcon: function () {
      return `toggle_${this.plugin["status"]}`;
    },
    managePlugin: async function () {
      if (this.plugin.status === undefined) {
        this.showMessage(this.plugin.version);
        return;
      }

      const action = this.plugin.status === "on" ? "off" : "on";
      const updatedPlugin = { ...this.plugin, status: action };
      this.$emit("update-plugin", updatedPlugin);
    },
    deletePlugin: async function () {
      const uid = this.plugin.uid;

      if (this.plugin["override"] === true) {
        const updatedPlugin = {
          ...this.plugin,
          override: false,
          user: false,
          status: "off",
        };
        this.$emit("update-plugin", updatedPlugin);
      } else {
        this.$emit("delete-plugin", this.plugin.uid);
      }

      this.showMessage(this._("needRebootIntel"));
      await browser.runtime.sendMessage({
        type: "managePlugin",
        uid: uid,
        action: "delete",
      });
    },
    savePlugin: async function () {
      saveJS(
        this.plugin.code,
        this.plugin.filename || `${sanitizeFileName(this.plugin.name)}.user.js`
      );
    },
  },
  computed: {
    getIcon: function () {
      return (
        this.plugin["icon"] ||
        this.plugin["icon64"] ||
        "/assets/icons/24/userscript-no-icon.png"
      );
    },
    // Check if the plugin status was changed within the last minute
    wasStatusChangedWithinLastMinute: function () {
      if (!this.plugin.statusChangedAt) return false;

      const oneMinuteInSeconds = 60;
      const currentTime = Date.now() / 1000;
      const timeSinceChange = currentTime - this.plugin.statusChangedAt;

      return timeSinceChange <= oneMinuteInSeconds;
    },
    // Check if the plugin was added within the last hour
    isRecentlyAdded: function () {
      if (!this.plugin.addedAt) return false;

      const oneHourInSeconds = 60 * 60;
      const currentTime = Date.now() / 1000;
      const timeSinceAdded = currentTime - this.plugin.addedAt;

      return timeSinceAdded <= oneHourInSeconds;
    },
  },
  beforeDestroy() {
    if (this.statusChangeTimer) {
      clearTimeout(this.statusChangeTimer);
    }
  },
};
</script>

<style scoped>
.border {
  border-bottom: 1px solid var(--color-silver);
  width: calc(100% - 75px);
  margin-left: 75px;
}
.element:hover .border {
  border-bottom: 1px solid transparent;
}
.plugin {
  display: flex;
  cursor: pointer;
  padding: 5px 10px 4px 10px;
  margin-top: -1px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
  position: relative;
}
.plugin:hover,
.plugin:active,
.plugin:focus {
  background: var(--color-silver);
}
/* Base pseudo-element for all plugins */
.plugin::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  opacity: 0;
  background-color: var(--color-gray);
  transition: opacity 0.3s ease;
}
/* Active state for the status change indicator */
.plugin.recently-changed::before {
  opacity: 1;
}
/* Active state for the newly added indicator (green) */
.plugin.recently-added::before {
  opacity: 1;
  background-color: var(--color-yellow);
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
