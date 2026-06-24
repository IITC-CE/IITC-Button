<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <select class="select" v-model="interval" v-on:change="saveInterval">
    <option v-for="o in intervals" :key="o.value" :value="o.value">
      {{ o.name }}
    </option>
  </select>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { t } from "@/i18n";

const INTERVALS = [
  { name: t("every5seconds"), value: "5" },
  { name: t("every6hours"), value: "21600" },
  { name: t("every12hours"), value: "43200" },
  { name: t("everyDay"), value: "86400" },
  { name: t("everyWeek"), value: "604800" },
];

export default defineComponent({
  name: "IntervalSelector",
  props: {
    channel: {
      type: String,
      required: true as const,
    },
  },
  data() {
    return {
      interval: "86400",
    };
  },
  computed: {
    // The 5-second option only makes sense against a local custom server.
    intervals() {
      return this.channel === "custom" ? INTERVALS : INTERVALS.slice(1);
    },
  },
  methods: {
    async saveInterval() {
      await browser.runtime.sendMessage({
        type: "setUpdateCheckInterval",
        interval: this.interval,
        channel: this.channel,
      });
    },
  },
  async mounted() {
    const interval = await browser.runtime.sendMessage({
      type: "getUpdateCheckInterval",
      channel: this.channel,
    });
    if (interval) this.interval = String(interval);
  },
});
</script>

<style scoped>
.select {
  padding: 7px 10px;
  background: var(--surface-container);
  border: 1px solid var(--outline-strong);
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface);
  cursor: pointer;
}
</style>
