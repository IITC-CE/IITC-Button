<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <button
    class="master"
    :class="{ on: iitc_is_enabled }"
    :title="t('titleDefault')"
    v-on:click="toggle"
  >
    <Switch :checked="iitc_is_enabled"></Switch>
    <span class="master__label">{{ iitc_is_enabled ? "ON" : "OFF" }}</span>
  </button>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import Switch from "@/popup/components/Switch.vue";

export default defineComponent({
  name: "ToggleIITC",
  components: { Switch },
  data() {
    return {
      iitc_is_enabled: true,
    };
  },
  methods: {
    t: t,
    toggle: async function () {
      this.iitc_is_enabled = !this.iitc_is_enabled;
      await browser.runtime.sendMessage({
        type: "toggleIITC",
        value: this.iitc_is_enabled,
      });
    },
  },
  async mounted() {
    const data = await browser.storage.local.get("IITC_is_enabled");
    if (data.IITC_is_enabled === false) {
      this.iitc_is_enabled = false;
    }
  },
});
</script>

<style scoped>
.master {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px 4px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  --switch-off: rgba(255, 255, 255, 0.28);
  --switch-on: var(--sidebar-accent);
}
.master.on {
  background: oklch(from var(--sidebar-accent) l c h / 0.14);
  border-color: oklch(from var(--sidebar-accent) l c h / 0.4);
}
.master__label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}
.master.on .master__label {
  color: var(--sidebar-accent);
}
</style>
