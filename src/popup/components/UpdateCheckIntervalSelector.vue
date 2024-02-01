<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="uc__setting">
    <div class="uc__label-wrapper">
      <span class="uc__label"
        >{{ updateChannelsIntervals[channel]["name"] }}:</span
      >
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
          >{{ item.name }}</option
        >
      </template>
    </select>
  </div>
</template>

<script>
import { mixin } from "./mixins.js";

export default {
  name: "UpdateCheckIntervalSelector",
  props: {
    title: String,
    channel: String
  },
  data() {
    return {
      interval: 24 * 60 * 60
    };
  },
  mixins: [mixin],
  methods: {
    async saveUpdateInterval() {
      const key = this.channel + "_update_check_interval";
      const setData = {};
      setData[key] = this.interval;

      await browser.storage.local.set(setData);
      await browser.runtime.sendMessage({ type: "safeUpdate" });
      this.showMessage(this._("changesApplied"));
    }
  },
  async mounted() {
    const key = this.channel + "_update_check_interval";
    const data = await browser.storage.local.get(key);

    if (data[key]) {
      this.interval = parseInt(data[key]);
    }
  }
};
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
