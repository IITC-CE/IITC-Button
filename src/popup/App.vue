<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div id="app" :class="{ is_safari: is_safari }">
    <section class="section main-menu">
      <SectionMainMenu
        v-bind:categories="categories"
        v-bind:plugins_flat="plugins_flat"
        v-bind:iitc_core="iitc_core ?? undefined"
        @update-plugin="updatePlugin"
        @delete-plugin="deletePlugin"
      >
      </SectionMainMenu>
    </section>
    <Message></Message>
    <Alert></Alert>
  </div>
</template>

<script lang="ts">
import type { Plugin, PluginDict } from "lib-iitc-manager";
import type { PluginsView } from "lib-iitc-manager";
import SectionMainMenu from "./components/SectionMainMenu/SectionMainMenu.vue";

import Message from "./components/Message.vue";
import Alert from "./components/Alert.vue";

import * as data from "./data";
import browser from "webextension-polyfill";
import { emitter } from "@/popup/eventBus";

export default defineComponent({
  name: "App",
  data() {
    return {
      categories: {} as PluginsView["categories"],
      plugins: {} as PluginDict,
      plugins_flat: {} as PluginDict,
      category_name: "",
      iitc_core: null as Plugin | null,
      is_safari: this.detect_safari(),
    };
  },
  components: {
    SectionMainMenu,
    Message,
    Alert,
  },
  beforeCreate() {
    document.body.id = "main-menu";
  },
  async mounted() {
    await data.init(this);
    await data.onMessageListener(this);
    await browser.runtime.sendMessage({ type: "popupWasOpened" });
  },
  methods: {
    showMessage(msg: string) {
      emitter.emit("message", msg);
    },
    updatePlugin(updatedPlugin: Plugin) {
      this.plugins_flat[updatedPlugin.uid] = updatedPlugin;
    },
    deletePlugin(pluginUID: string) {
      delete this.plugins_flat[pluginUID];
    },
    detect_safari: function () {
      let userAgentString = navigator.userAgent;
      let chromeAgent = userAgentString.indexOf("Chrome") > -1;
      let safariAgent = userAgentString.indexOf("Safari") > -1;

      return safariAgent && !chromeAgent;
    },
  },
});
</script>

<style>
body {
  cursor: default;
  width: 100vw;
  height: 100vh;
  min-width: 350px;
  min-height: 520px;
  overflow: hidden;
  margin: 0;
  color: var(--on-surface);
  font-family: var(--font-ui);
  font-size: 12px;
  background: var(--surface);
}

.material-icons {
  font-size: 20px;
}

#app {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

object {
  pointer-events: none;
}

.section {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--surface);
  overflow: hidden;
}
</style>
