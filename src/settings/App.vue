<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="app">
    <Header :tab="tab" @setTab="setTab"></Header>
    <PageAddPlugin v-if="tab === 'add'"></PageAddPlugin>
    <PageBackup v-if="tab === 'backup'"></PageBackup>
  </div>
</template>

<script>
import { _ } from "@/i18n";
import Header from "./Header";
import PageAddPlugin from "./add/Main";
import PageBackup from "./backup/Main";

export default {
  name: "App",
  components: {
    Header,
    PageAddPlugin,
    PageBackup
  },
  data() {
    return {
      tab: "add"
    };
  },
  methods: {
    _: _,
    setTab(tab) {
      if (history.pushState) {
        history.pushState(null, null, "#" + tab);
      } else {
        location.hash = "#" + tab;
      }
      this.tab = tab;
    }
  },
  async mounted() {
    const tab = new URL(window.location.href).hash;
    if (tab.length > 0) {
      this.tab = tab.substring(1);
    }
  }
};
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
