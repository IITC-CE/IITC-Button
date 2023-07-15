<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="page">
    <Header ref="header"></Header>
    <PageAddPlugin></PageAddPlugin>
  </div>
</template>

<script>
import { _ } from "@/i18n";
import Header from "./Header";
import PageAddPlugin from "./add/Main";

export default {
  name: "App",
  components: {
    Header,
    PageAddPlugin
  },
  data() {
    return {

    };
  },
  methods: {
    _: _
  },
  async mounted() {
    const tab = new URL(window.location.href).hash;
    console.log(tab);
  }
};
</script>

<style>
body {
  background: #f0f0f0;
  margin: 0;
}
</style>

<style scoped>
.page {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

@media (max-width: 1600px) {
  .page {
    flex-direction: column;
  }
}
</style>
