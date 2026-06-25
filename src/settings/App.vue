<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="app">
    <Sidebar :tab="tab" @setTab="setTab"></Sidebar>
    <main class="content">
      <ProgressBar></ProgressBar>
      <PageOptions v-if="tab === 'options'"></PageOptions>
      <PageAddPlugin v-if="tab === 'add'"></PageAddPlugin>
      <PageBackup v-if="tab === 'backup'"></PageBackup>
      <PageDebug v-if="tab === 'debug'"></PageDebug>
    </main>
  </div>
</template>

<script lang="ts">
import { t } from "@/i18n";
import Sidebar from "./Sidebar.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import PageOptions from "./options/Main.vue";
import PageAddPlugin from "./add/Main.vue";
import PageBackup from "./backup/Main.vue";
import PageDebug from "./debug/Main.vue";

export default defineComponent({
  name: "App",
  components: {
    Sidebar,
    ProgressBar,
    PageOptions,
    PageAddPlugin,
    PageBackup,
    PageDebug,
  },
  data() {
    return {
      tab: "add",
    };
  },
  methods: {
    t: t,
    setTab(tab: string) {
      if (history.pushState) {
        history.pushState(null, "", "#" + tab);
      } else {
        location.hash = "#" + tab;
      }
      this.tab = tab;
    },
  },
  async mounted() {
    const hash = new URL(window.location.href).hash;
    if (hash.length > 0) {
      this.tab = hash.substring(1);
    }
  },
});
</script>

<style>
body {
  background: var(--surface);
  margin: 0;
  font-family: var(--font-ui);
  color: var(--on-surface);
}

.app {
  display: flex;
  flex-direction: row;
  height: 100vh;
  overflow: hidden;
}

.content {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

@media (max-width: 900px) {
  .app {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}
</style>
