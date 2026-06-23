<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="app">
    <Sidebar :tab="tab" @setTab="setTab"></Sidebar>
    <PageAddPlugin v-if="tab === 'add'"></PageAddPlugin>
    <PageBackup v-if="tab === 'backup'"></PageBackup>
    <PageDebug v-if="tab === 'debug'"></PageDebug>
  </div>
</template>

<script lang="ts">
import { t } from "@/i18n";
import Sidebar from "./Sidebar.vue";
import PageAddPlugin from "./add/Main.vue";
import PageBackup from "./backup/Main.vue";
import PageDebug from "./debug/Main.vue";

export default defineComponent({
  name: "App",
  components: {
    Sidebar,
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

@media (max-width: 900px) {
  .app {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}
</style>
