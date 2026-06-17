<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="app">
    <Header :tab="tab" @setTab="setTab"></Header>
    <PageAddPlugin v-if="tab === 'add'"></PageAddPlugin>
    <PageBackup v-if="tab === 'backup'"></PageBackup>
    <PageDebug v-if="tab === 'debug'"></PageDebug>
  </div>
</template>

<script lang="ts">
import { t } from "@/i18n";
import Header from "./Header.vue";
import PageAddPlugin from "./add/Main.vue";
import PageBackup from "./backup/Main.vue";
import PageDebug from "./debug/Main.vue";

export default defineComponent({
  name: "App",
  components: {
    Header,
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
  background: #f0f0f0;
  margin: 0;
}
</style>

<style>
.app {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.page {
  display: flex;
  width: 100%;
  height: 100%;
  margin: 0;
  background: #2b2b2b;
  color: #222;
  font-size: 18px;
  overflow-y: auto;
}

.parent {
  width: 90%;
  max-width: 800px;
  margin: auto;
  padding: 50px 0;
}

@media (max-width: 1600px) {
  .app {
    flex-direction: column;
  }
}
</style>
