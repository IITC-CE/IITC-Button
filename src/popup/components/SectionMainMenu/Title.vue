<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="header">
    <ProgressBar></ProgressBar>
    <div
      class="header__brand"
      :title="t('titleDefault')"
      v-on:click.prevent="openIITC"
    >
      <img
        class="header__logo"
        src="/assets/images/IITC-black-horizontally.svg"
        alt="IITC"
      />
    </div>
    <ToggleIITC></ToggleIITC>
    <button
      class="header__btn"
      :title="t('addExternalPlugin')"
      v-on:click="openLink('/settings.html#add')"
    >
      <i class="material-icons">add</i>
    </button>
    <button
      class="header__btn"
      :title="t('settings')"
      v-on:click="openLink('/settings.html#options')"
    >
      <i class="material-icons">settings</i>
    </button>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { mixin } from "../mixins";
import ProgressBar from "@/components/ProgressBar.vue";
import ToggleIITC from "./ToggleIITC.vue";

export default defineComponent({
  name: "Title",
  mixins: [mixin],
  methods: {
    openIITC: async function () {
      await browser.runtime.sendMessage({ type: "requestOpenIntel" });
      window.close();
    },
  },
  components: { ProgressBar, ToggleIITC },
});
</script>

<style scoped>
.header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 50px;
  flex-shrink: 0;
  padding: 0 6px 0 12px;
  background: #0e0e0e;
}
.header__brand {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
  cursor: pointer;
}
.header__logo {
  height: 50px;
  width: auto;
}
.header__btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sidebar-on-surface);
  cursor: pointer;
  transition: background 0.1s linear;
}
.header__btn:hover {
  background: #222;
}
.header__btn .material-icons {
  font-size: 20px;
}
</style>
