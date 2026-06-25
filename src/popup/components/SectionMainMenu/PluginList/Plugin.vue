<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div
    class="row"
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
    <div class="row__icon-wrap">
      <img class="row__icon" :src="getIcon" alt="" />
      <span
        v-if="plugin.override"
        class="row__badge row__badge--override"
      ></span>
      <span v-else-if="plugin.user" class="row__badge row__badge--user"></span>
    </div>
    <div class="row__info">
      <div class="row__name">{{ __("name", plugin) }}</div>
    </div>
    <span class="row__switch" @click.stop="managePlugin">
      <Switch :checked="isOn" :disabled="isCore"></Switch>
    </span>
  </div>
</template>

<script lang="ts">
import { type PropType } from "vue";
import { mixin } from "@/popup/components/mixins";
import Switch from "@/popup/components/Switch.vue";
import type { Plugin } from "lib-iitc-manager";

export default defineComponent({
  name: "ElementPlugin",
  components: { Switch },
  props: {
    plugin: {
      type: Object as PropType<Plugin>,
      required: true as const,
    },
  },
  emits: ["update-plugin"],
  data() {
    return {
      hasRecentStatusChange: false,
      statusChangeTimer: null as ReturnType<typeof setTimeout> | null,
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
            60000 -
            (Date.now() / 1000 - (this.plugin.statusChangedAt ?? 0)) * 1000;
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
    managePlugin: async function () {
      if (this.plugin.status === undefined) {
        this.showMessage(this.plugin.version ?? "");
        return;
      }

      const action = this.plugin.status === "on" ? "off" : "on";
      const updatedPlugin = { ...this.plugin, status: action };
      this.$emit("update-plugin", updatedPlugin);
    },
  },
  computed: {
    getIcon: function (): string {
      const icon = this.plugin["icon"];
      const icon64 = this.plugin["icon64"];
      return (
        (typeof icon === "string" && icon) ||
        (typeof icon64 === "string" && icon64) ||
        "/assets/icons/userscript-no-icon.svg"
      );
    },
    // Core has no status and cannot be toggled off from the list
    isCore: function (): boolean {
      return !this.plugin.status;
    },
    isOn: function (): boolean {
      return this.isCore || this.plugin.status === "on";
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
  beforeUnmount() {
    if (this.statusChangeTimer) {
      clearTimeout(this.statusChangeTimer);
    }
  },
});
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  position: relative;
  overflow: hidden;
  background: var(--surface-container);
}
.row:hover {
  background: oklch(from var(--surface-container) calc(l - 0.015) c h);
}
@media (prefers-color-scheme: dark) {
  .row:hover {
    background: var(--surface-container-high);
  }
}
/* Recent-change / recent-add accent stripe on the left edge */
.row::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  opacity: 0;
  background-color: var(--accent);
  transition: opacity 0.3s ease;
}
.row.recently-changed::before {
  opacity: 1;
  background-color: color-mix(
    in oklab,
    var(--accent) 50%,
    var(--surface-container)
  );
}
.row.recently-added::before {
  opacity: 1;
  background-color: color-mix(
    in oklab,
    var(--state-warning) 50%,
    var(--surface-container)
  );
}
.row__icon-wrap {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.row__icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.row__badge {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.row__badge--user {
  background: var(--badge-user);
}
.row__badge--override {
  background: var(--state-warning);
}
.row__info {
  flex: 1;
  min-width: 0;
}
.row__name {
  font-size: 12px;
  font-weight: 600;
  color: var(--on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row__switch {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  padding: 4px 2px 4px 8px;
  cursor: pointer;
}
</style>
