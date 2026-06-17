<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="uc__setting">
    <div class="uc__label-wrapper">
      <span class="uc__label">{{ channelLabel }}:</span>
    </div>
    <select
      class="uc__input"
      name="update-interval"
      v-model="interval"
      v-on:change="saveUpdateInterval"
    >
      <template v-for="(item, index) in updateIntervals">
        <option
          v-if="channel === 'custom' || index !== 0"
          v-bind:key="index"
          v-bind:value="item.value"
        >
          {{ item.name }}
        </option>
      </template>
    </select>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { mixin } from "./mixins";

export default defineComponent({
  name: "UpdateCheckIntervalSelector",
  props: {
    title: String,
    channel: {
      type: String,
      required: true as const,
    },
  },
  data() {
    return {
      interval: 24 * 60 * 60,
    };
  },
  mixins: [mixin],
  methods: {
    async saveUpdateInterval() {
      await browser.runtime.sendMessage({
        type: "setUpdateCheckInterval",
        interval: this.interval,
        channel: this.channel,
      });
      this.showMessage(this.t("changesApplied"));
    },
  },
  computed: {
    channelLabel(): string {
      const intervals = this.updateChannelsIntervals as Record<
        string,
        { name: string }
      >;
      return intervals[this.channel]?.name ?? "";
    },
  },
  async mounted() {
    const interval = await browser.runtime.sendMessage({
      type: "getUpdateCheckInterval",
      channel: this.channel,
    });
    if (interval) {
      this.interval = interval as number;
    }
  },
});
</script>

<style scoped>
.uc__input {
  width: 60%;
  height: 30px;
}
.uc__setting {
  flex: auto;
  padding: 2px 0 0 0;
  text-align: right;
}
.uc__label {
  padding-right: 5px;
  line-height: 11px;
  text-align: right;
}
.uc__label-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 40%;
  float: left;
  height: 30px;
}
</style>
